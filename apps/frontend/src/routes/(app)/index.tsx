import { createFileRoute } from '@tanstack/solid-router'
import { lazy, Suspense, Switch, Match, For, createEffect, Show, onCleanup } from 'solid-js'
import { useAuth } from '../../auth/AuthContext'
import { useLiveQuery, createCollection } from "@tanstack/solid-db"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { queryClient } from '../../lib/queryClient'
import { pb } from '../../lib/pocketbase'
import type { PatientsRecord, PatientsResponse } from '../../types/pocketbase-types'

const ReceptionistDashboard = lazy(() =>
  import('../../components/dashboard/ReceptionistDashBoard').then(m => ({ default: m.ReceptionistDashboard }))
)
const DentistDashboard = lazy(() =>
  import('../../components/dashboard/DentistDashboard').then(m => ({ default: m.DentistDashboard }))
)
const AdministratorDashboard = lazy(() =>
  import('../../components/dashboard/AdministratorDashboard').then(m => ({ default: m.AdministratorDashboard }))
)
const ManagerDashboard = lazy(() =>
  import('../../components/dashboard/ManagerDashboard').then(m => ({ default: m.ManagerDashboard }))
)

export const Route = createFileRoute('/(app)/')({
  component: Dashboard,
})


type PatientInput = Omit<PatientsRecord, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName' | 'expand'>;

// 1. DEFINE THE COLLECTION
// This collection handles the initial data load and sends local mutations to PocketBase.
const patientsCollection = createCollection(
  // We specify the full record type and the input type for inserts.
  queryCollectionOptions<PatientsRecord, Error, PatientsRecord[], string, PatientInput>({
    queryKey: ["patients"],
    queryClient: queryClient,
    queryFn: async () => pb.collection('patients').getFullList(),
    getKey: (item) => item.id,

    // --- MUTATION HANDLERS ---
    // These functions send changes to the server.
    // We return `{ refetch: false }` to prevent TanStack Query from refetching the
    // entire list, as we will rely on the real-time subscription for updates.

    onInsert: async ({ transaction }) => {
      const { modified: newPatient } = transaction.mutations[0]
      await pb.collection('patients').create(newPatient)
      return { refetch: false }
    },
    onUpdate: async ({ transaction }) => {
      const { key, changes } = transaction.mutations[0]
      // `key` is the item's ID, `changes` contains only the updated fields.
      await pb.collection('patients').update(key, changes)
      return { refetch: false }
    },
    onDelete: async ({ transaction }) => {
      const { key } = transaction.mutations[0]
      await pb.collection('patients').delete(key)
      return { refetch: false }
    }
  })
)

function Dashboard() {
  const { authState } = useAuth()
  const role = () => authState().role
  // const { data: patients } = useLiveQuery((q) => q.from({ patients: patientsCollection }))
  // 2. USE LIVE QUERY
  // This hook provides a reactive `data` array that updates automatically.
  const query = useLiveQuery(() => ({
    query: (q) => q.from({ patients: patientsCollection })
  }))

  // / 3. SET UP REAL-TIME SYNC
  // This effect subscribes to server-side changes and updates our local collection.
  createEffect(() => {
    let unsubscribe = () => { }

    async function setupSubscription() {
      unsubscribe = await pb.collection('patients').subscribe<PatientsResponse>('*', (event) => {
        // Use the "direct write" API to update the collection with server data.
        // This bypasses the optimistic layer and is the correct way to sync server state.
        switch (event.action) {
          case 'create':
            patientsCollection.utils.writeInsert(event.record)
            break
          case 'update':
            // writeUpdate will merge the changes with the existing record
            patientsCollection.utils.writeUpdate(event.record)
            break
          case 'delete':
            patientsCollection.utils.writeDelete(event.record.id)
            break
        }
      })
    }

    setupSubscription()

    // Clean up the subscription when the component is unmounted
    onCleanup(() => unsubscribe())
  })

  console.log(query.data)
  return (
    <div class="min-h-screen bg-slate-900 p-6 text-white">
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>

      {/* 4. RENDER THE UI */}
      <div class="mb-6 p-4 border border-slate-700 rounded-lg">
        <h2 class="text-xl mb-2">Live Patient List</h2>
        {/* <Show when={!query.isLoading} fallback={<p class="text-gray-400">Loading patients...</p>}> */}
        <For each={query.data} fallback={<p class="text-gray-400">No patients found.</p>}>
          {(patient) => (
            <div class="text-sm text-gray-300 py-1">
              {patient.first_name} {patient.last_name}
            </div>
          )}
        </For>
        {/* </Show> */}
      </div>

      <Suspense fallback={<div class="text-lg">Loading dashboard...</div>}>
        <Switch fallback={<ReceptionistDashboard />}>
          <Match when={role() === 'receptionist'}><ReceptionistDashboard /></Match>
          <Match when={role() === 'dentist'}><DentistDashboard /></Match>
          <Match when={role() === 'manager'}><ManagerDashboard /></Match>
          <Match when={role() === 'admin'}><AdministratorDashboard /></Match>
        </Switch>
      </Suspense>
    </div>
  )
}
