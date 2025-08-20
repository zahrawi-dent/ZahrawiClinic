# TanStack DB Implementation for Zahrawi Clinic

This document describes the improved TanStack DB implementation for the Zahrawi Clinic application, providing type-safe, real-time data management with PocketBase integration.

## Overview

The new implementation provides:
- **Type-safe collections** for all PocketBase collections
- **Real-time synchronization** with automatic updates
- **Optimistic updates** for better UX
- **Comprehensive error handling**
- **Easy-to-use hooks** for data access
- **Mutation utilities** for CRUD operations

## Architecture

### Core Files

1. **`src/lib/tanstack-db.ts`** - Main collection definitions and setup
2. **`src/lib/useTanStackDB.ts`** - Custom hooks for data access
3. **`src/components/TanStackDBExample.tsx`** - Example component demonstrating usage

### Collections

All PocketBase collections are automatically configured:

- `appointmentsCollection` - Appointment management
- `clinicsCollection` - Clinic information
- `dentalChartsCollection` - Dental chart records
- `organizationsCollection` - Organization data
- `patientTransfersCollection` - Patient transfer records
- `patientsCollection` - Patient records
- `staffMembersCollection` - Staff member data
- `treatmentRecordsCollection` - Treatment history
- `treatmentsCatalogCollection` - Available treatments
- `usersCollection` - User accounts

## Usage

### Basic Data Access

```tsx
import { usePatients, useAppointments, useRealTimeSync } from '../lib/useTanStackDB'

function MyComponent() {
  // Set up real-time sync
  useRealTimeSync()
  
  // Access data with reactive queries
  const patientsQuery = usePatients()
  const appointmentsQuery = useAppointments()
  
  return (
    <div>
      <h2>Patients ({patientsQuery.data.length})</h2>
      <For each={patientsQuery.data}>
        {(patient) => <div>{patient.first_name} {patient.last_name}</div>}
      </For>
    </div>
  )
}
```

### Mutations

```tsx
import { useCollections } from '../lib/useTanStackDB'

function PatientForm() {
  const collections = useCollections()
  
  const addPatient = async () => {
    try {
      await collections.patients.insert({
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        dob: '1990-01-01',
        sex: 'male',
        primary_clinic: ['clinic-id']
      })
      console.log('Patient added successfully')
    } catch (error) {
      console.error('Error adding patient:', error)
    }
  }
  
  const updatePatient = async (id: string) => {
    await collections.patients.update(id, (draft) => {
      draft.first_name = 'Updated Name'
    })
  }
  
  const deletePatient = async (id: string) => {
    await collections.patients.delete(id)
  }
}
```

### Query States

Each query provides reactive state information:

```tsx
const patientsQuery = usePatients()

// Check loading state
if (patientsQuery.isLoading) return <div>Loading...</div>

// Check if data is ready
if (patientsQuery.isReady) {
  console.log('Data is available:', patientsQuery.data)
}

// Check for errors
if (patientsQuery.isError) {
  console.error('Query error:', patientsQuery.status)
}
```

## Features

### 1. Type Safety

All collections are fully typed with TypeScript:

```tsx
import type { PatientsRecord, AppointmentsRecord } from '../types/pocketbase-types'

// Collections are typed with their respective record types
const patients: PatientsRecord[] = patientsQuery.data
const appointments: AppointmentsRecord[] = appointmentsQuery.data
```

### 2. Real-time Synchronization

Automatic real-time updates from PocketBase:

```tsx
// Set up once in your app
useRealTimeSync()

// All collections automatically sync with server changes
// No manual subscription management needed
```

### 3. Optimistic Updates

Immediate UI updates with automatic rollback on errors:

```tsx
// Update is immediately reflected in UI
await collections.patients.update(id, (draft) => {
  draft.first_name = 'New Name'
})

// If server update fails, changes are automatically rolled back
```

### 4. Error Handling

Comprehensive error handling with automatic retries:

```tsx
try {
  await collections.patients.insert(newPatient)
} catch (error) {
  // Handle specific error types
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof NetworkError) {
    // Handle network errors
  }
}
```

### 5. Query Utilities

Pre-built utility functions for common operations:

```tsx
import { dbUtils } from '../lib/useTanStackDB'

// Get patients by clinic
const clinicPatients = dbUtils.getPatientsByClinic(clinicId)

// Get appointments by date
const dateAppointments = dbUtils.getAppointmentsByDate(date)

// Get staff by role
const dentists = dbUtils.getStaffByRole('dentist')
```

## Configuration

### Collection Options

Each collection can be configured with options:

```tsx
export const patientsCollection = createPocketBaseCollection<PatientsRecord, PatientsResponse>(
  Collections.Patients,
  { 
    sort: 'last_name,first_name',
    expand: 'primary_clinic',
    filter: 'is_active = true'
  }
)
```

### Real-time Sync Setup

The real-time sync is automatically configured for all collections:

```tsx
// In your main app component
useRealTimeSync()

// This sets up subscriptions for all collections:
// - appointments
// - clinics
// - dental_charts
// - organizations
// - patient_transfers
// - patients
// - staff_members
// - treatment_records
// - treatments_catalog
// - users
```

## Migration from Old Implementation

### Before (Old Implementation)

```tsx
// Old way - manual collection setup
const patientsCollection = createCollection(
  queryCollectionOptions<PatientsRecord, Error, PatientsRecord[], string, PatientInput>({
    queryKey: ["patients"],
    queryClient: queryClient,
    queryFn: async () => pb.collection('patients').getFullList(),
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newPatient } = transaction.mutations[0]
      await pb.collection('patients').create(newPatient)
      return { refetch: false }
    },
    // ... more manual configuration
  })
)

// Manual real-time sync setup
createEffect(() => {
  const unsubscribe = pb.collection('patients').subscribe('*', (event) => {
    // Manual event handling
  })
  onCleanup(() => unsubscribe())
})
```

### After (New Implementation)

```tsx
// New way - automatic setup
import { usePatients, useRealTimeSync } from '../lib/useTanStackDB'

function MyComponent() {
  useRealTimeSync() // Automatic setup for all collections
  const patientsQuery = usePatients() // Pre-configured hook
  
  return (
    <For each={patientsQuery.data}>
      {(patient) => <div>{patient.first_name}</div>}
    </For>
  )
}
```

## Best Practices

### 1. Component Structure

```tsx
function PatientList() {
  // Set up real-time sync at the top level
  useRealTimeSync()
  
  // Use specific hooks for data
  const patientsQuery = usePatients()
  const collections = useCollections()
  
  // Handle loading states
  if (patientsQuery.isLoading) return <LoadingSpinner />
  
  return (
    <div>
      <For each={patientsQuery.data}>
        {(patient) => <PatientCard patient={patient} />}
      </For>
    </div>
  )
}
```

### 2. Error Handling

```tsx
const addPatient = async (patientData: PatientInput) => {
  try {
    await collections.patients.insert(patientData)
    showSuccessMessage('Patient added successfully')
  } catch (error) {
    console.error('Failed to add patient:', error)
    showErrorMessage('Failed to add patient. Please try again.')
  }
}
```

### 3. Performance Optimization

```tsx
// Use specific queries instead of loading all data
const activePatients = usePatientsByClinic(clinicId)
const todayAppointments = useAppointmentsByDate(today)

// Avoid unnecessary re-renders by using proper dependencies
const filteredPatients = createMemo(() => 
  patientsQuery.data.filter(p => p.is_active)
)
```

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure you're importing the correct types from `pocketbase-types.ts`

2. **Real-time Not Working**: Make sure `useRealTimeSync()` is called in your component

3. **Mutations Failing**: Check that your PocketBase permissions are configured correctly

4. **Performance Issues**: Use specific queries instead of loading all data

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=tanstack-db
```

This will log all database operations and real-time events.

## Future Enhancements

1. **Advanced Filtering**: Add more sophisticated query builders
2. **Caching Strategies**: Implement intelligent caching
3. **Offline Support**: Add offline-first capabilities
4. **Batch Operations**: Support for bulk operations
5. **Query Optimization**: Automatic query optimization

## Contributing

When adding new features:

1. Update the collection definitions in `tanstack-db.ts`
2. Add corresponding hooks in `useTanStackDB.ts`
3. Update the example component
4. Add tests for new functionality
5. Update this documentation

## Support

For issues or questions:

1. Check the TanStack DB documentation
2. Review the example component
3. Check the browser console for error messages
4. Verify PocketBase configuration
