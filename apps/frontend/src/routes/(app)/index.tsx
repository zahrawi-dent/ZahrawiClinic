import { createFileRoute } from '@tanstack/solid-router'
import { lazy, Suspense, Switch, Match, For } from 'solid-js'
import { useAuth } from '../../auth/AuthContext'
import { usePatients, useRealTimeSync } from '../../lib/useTanStackDB'

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




function Dashboard() {
  const { authState } = useAuth()
  const role = () => authState().role
  
  // Use the new TanStack DB hooks
  const patientsQuery = usePatients()
  
  // Set up real-time sync for all collections
  useRealTimeSync()

  console.log(patientsQuery.data)
  return (
    <div class="min-h-screen bg-slate-900 p-6 text-white">
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>

      {/* 4. RENDER THE UI */}
      <div class="mb-6 p-4 border border-slate-700 rounded-lg">
        <h2 class="text-xl mb-2">Live Patient List</h2>
        <For each={patientsQuery.data} fallback={<p class="text-gray-400">No patients found.</p>}>
          {(patient: any) => (
            <div class="text-sm text-gray-300 py-1">
              {patient.first_name} {patient.last_name}
            </div>
          )}
        </For>
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
