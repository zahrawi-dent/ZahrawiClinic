import { createCollection } from "@tanstack/solid-db"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { queryClient } from './queryClient'
import { pb } from './pocketbase'
import { Collections } from '../types/pocketbase-types'

// Simple collection factory without complex typing
function createPocketBaseCollection(collectionName: string, options?: {
  expand?: string
  sort?: string
  filter?: string
}) {
  return createCollection(
    queryCollectionOptions({
      queryKey: [collectionName],
      queryClient: queryClient,
      queryFn: async () => {
        try {
          const response = await pb.collection(collectionName).getFullList({
            expand: options?.expand,
            sort: options?.sort,
            filter: options?.filter,
          })
          return response
        } catch (error) {
          console.error(`Error fetching ${collectionName}:`, error)
          throw error
        }
      },
      getKey: (item: any) => item.id,

      // Mutation handlers
      onInsert: async ({ transaction }) => {
        try {
          const { modified: newItem } = transaction.mutations[0]
          await pb.collection(collectionName).create(newItem)
          return { refetch: false }
        } catch (error) {
          console.error(`Error inserting ${collectionName}:`, error)
          throw error
        }
      },

      onUpdate: async ({ transaction }) => {
        try {
          const { key, changes } = transaction.mutations[0]
          await pb.collection(collectionName).update(key, changes)
          return { refetch: false }
        } catch (error) {
          console.error(`Error updating ${collectionName}:`, error)
          throw error
        }
      },

      onDelete: async ({ transaction }) => {
        try {
          const { key } = transaction.mutations[0]
          await pb.collection(collectionName).delete(key)
          return { refetch: false }
        } catch (error) {
          console.error(`Error deleting ${collectionName}:`, error)
          throw error
        }
      }
    })
  )
}

// Create collections for all PocketBase collections
export const appointmentsCollection = createPocketBaseCollection(
  Collections.Appointments,
  { sort: '-start_time' }
)

export const clinicsCollection = createPocketBaseCollection(
  Collections.Clinics,
  { sort: 'clinic_name' }
)

export const dentalChartsCollection = createPocketBaseCollection(
  Collections.DentalCharts,
  { sort: '-created' }
)

export const organizationsCollection = createPocketBaseCollection(
  Collections.Organizations,
  { sort: 'organization_name' }
)

export const patientTransfersCollection = createPocketBaseCollection(
  Collections.PatientTransfers,
  { sort: '-transfer_date' }
)

export const patientsCollection = createPocketBaseCollection(
  Collections.Patients,
  { sort: 'last_name,first_name' }
)

export const staffMembersCollection = createPocketBaseCollection(
  Collections.StaffMembers,
  { sort: 'role' }
)

export const treatmentRecordsCollection = createPocketBaseCollection(
  Collections.TreatmentRecords,
  { sort: '-created' }
)

export const treatmentsCatalogCollection = createPocketBaseCollection(
  Collections.TreatmentsCatalog,
  { sort: 'name' }
)

export const usersCollection = createPocketBaseCollection(
  Collections.Users,
  { sort: 'name' }
)

// Real-time sync setup for all collections
export function setupRealTimeSync() {
  const collections = [
    { name: Collections.Appointments, collection: appointmentsCollection },
    { name: Collections.Clinics, collection: clinicsCollection },
    { name: Collections.DentalCharts, collection: dentalChartsCollection },
    { name: Collections.Organizations, collection: organizationsCollection },
    { name: Collections.PatientTransfers, collection: patientTransfersCollection },
    { name: Collections.Patients, collection: patientsCollection },
    { name: Collections.StaffMembers, collection: staffMembersCollection },
    { name: Collections.TreatmentRecords, collection: treatmentRecordsCollection },
    { name: Collections.TreatmentsCatalog, collection: treatmentsCatalogCollection },
    { name: Collections.Users, collection: usersCollection },
  ]

  const unsubscribers: (() => void)[] = []

  collections.forEach(({ name, collection }) => {
    pb.collection(name).subscribe('*', (event) => {
      switch (event.action) {
        case 'create':
          collection.utils.writeInsert(event.record)
          break
        case 'update':
          collection.utils.writeUpdate(event.record)
          break
        case 'delete':
          collection.utils.writeDelete(event.record.id)
          break
      }
    }).then((unsubscribe) => {
      unsubscribers.push(() => unsubscribe())
    })
  })

  // Return cleanup function
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
  }
}

// Export all collections for easy access
export const collections = {
  appointments: appointmentsCollection,
  clinics: clinicsCollection,
  dentalCharts: dentalChartsCollection,
  organizations: organizationsCollection,
  patientTransfers: patientTransfersCollection,
  patients: patientsCollection,
  staffMembers: staffMembersCollection,
  treatmentRecords: treatmentRecordsCollection,
  treatmentsCatalog: treatmentsCatalogCollection,
  users: usersCollection,
}
