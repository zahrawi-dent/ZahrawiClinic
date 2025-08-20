import { useLiveQuery } from "@tanstack/solid-db"
import { createEffect, onCleanup, createSignal } from "solid-js"
import { setupCollectionSync, setupRecordSync, setupRealTimeSync, collections } from './tanstack-db'
import { Collections } from '../types/pocketbase-types'

// Type-safe collection access
export const useCollections = () => collections

// Custom hook for collection-specific real-time sync
export function useCollectionSync(collectionName: Collections) {
  createEffect(() => {
    const cleanup = setupCollectionSync(collectionName)
    onCleanup(cleanup)
  })
}

// Custom hook for record-specific real-time sync
export function useRecordSync(collectionName: Collections, recordId: () => string) {
  createEffect(() => {
    const id = recordId()
    if (!id) return
    
    const cleanup = setupRecordSync(collectionName, id)
    onCleanup(cleanup)
  })
}

// Legacy hook for backward compatibility (use sparingly)
export function useRealTimeSync() {
  console.warn('useRealTimeSync() is deprecated. Use useCollectionSync() for specific collections instead.')
  
  createEffect(() => {
    const cleanup = setupRealTimeSync()
    onCleanup(cleanup)
  })
}

// Type-safe hooks for each collection
export function usePatients() {
  return useLiveQuery((q) => q.from({ patients: collections.patients }))
}

export function useAppointments() {
  return useLiveQuery((q) => q.from({ appointments: collections.appointments }))
}

export function useClinics() {
  return useLiveQuery((q) => q.from({ clinics: collections.clinics }))
}

export function useOrganizations() {
  return useLiveQuery((q) => q.from({ organizations: collections.organizations }))
}

export function useStaffMembers() {
  return useLiveQuery((q) => q.from({ staff: collections.staffMembers }))
}

export function useTreatmentsCatalog() {
  return useLiveQuery((q) => q.from({ treatments: collections.treatmentsCatalog }))
}

export function useTreatmentRecords() {
  return useLiveQuery((q) => q.from({ records: collections.treatmentRecords }))
}

export function useDentalCharts() {
  return useLiveQuery((q) => q.from({ charts: collections.dentalCharts }))
}

export function usePatientTransfers() {
  return useLiveQuery((q) => q.from({ transfers: collections.patientTransfers }))
}

export function useUsers() {
  return useLiveQuery((q) => q.from({ users: collections.users }))
}

// Basic filtered queries - simplified for now
export function usePatientsByClinic(clinicId: () => string) {
  return useLiveQuery(
    (q) => q.from({ patients: collections.patients })
  )
}

export function useAppointmentsByDate(date: () => string) {
  return useLiveQuery(
    (q) => q.from({ appointments: collections.appointments })
  )
}

export function useAppointmentsByStatus(status: () => string) {
  return useLiveQuery(
    (q) => q.from({ appointments: collections.appointments })
  )
}

export function useStaffByRole(role: () => string) {
  return useLiveQuery(
    (q) => q.from({ staff: collections.staffMembers })
  )
}

export function useStaffByClinic(clinicId: () => string) {
  return useLiveQuery(
    (q) => q.from({ staff: collections.staffMembers })
  )
}

export function useActiveClinics() {
  return useLiveQuery(
    (q) => q.from({ clinics: collections.clinics })
  )
}

export function useTreatmentsByPriceRange(minPrice: () => number, maxPrice: () => number) {
  return useLiveQuery(
    (q) => q.from({ treatments: collections.treatmentsCatalog })
  )
}

// Basic statistics - simplified for now
export function useAppointmentStats() {
  return useLiveQuery((q) =>
    q.from({ appointments: collections.appointments })
  )
}

export function usePatientStats() {
  return useLiveQuery((q) =>
    q.from({ patients: collections.patients })
  )
}


