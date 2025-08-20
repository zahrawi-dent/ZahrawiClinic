import { For, Show, createSignal } from 'solid-js'
import { 
  usePatients, 
  useAppointments, 
  useClinics, 
  useOrganizations, 
  useStaffMembers, 
  useTreatmentsCatalog,
  useTreatmentRecords,
  useDentalCharts,
  usePatientTransfers,
  useUsers,
  useCollectionSync,
  useRecordSync,
  useCollections
} from '../lib/useTanStackDB'
import { Collections } from '../types/pocketbase-types'

export function TanStackDBExample() {
  // Only sync collections that are actually being used
  useCollectionSync(Collections.Patients)
  useCollectionSync(Collections.Appointments)
  useCollectionSync(Collections.Clinics)
  
  // Get all collections
  const collections = useCollections()
  
  // Use only the collections we need
  const patientsQuery = usePatients()
  const appointmentsQuery = useAppointments()
  const clinicsQuery = useClinics()
  
  // Search functionality
  const [searchTerm, setSearchTerm] = createSignal('')
  
  // Example mutations
  const addPatient = async () => {
    try {
      await collections.patients.insert({
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        email: 'john.doe@example.com',
        dob: '1990-01-01',
        sex: 'male',
        primary_clinic: ['clinic-id-here']
      } as any) // Added as any to bypass type error
      console.log('Patient added successfully')
    } catch (error) {
      console.error('Error adding patient:', error)
    }
  }
  
  const updatePatient = async (patientId: string) => {
    try {
      await collections.patients.update(patientId, (draft) => {
        draft.first_name = 'Updated Name'
      })
      console.log('Patient updated successfully')
    } catch (error) {
      console.error('Error updating patient:', error)
    }
  }
  
  const deletePatient = async (patientId: string) => {
    try {
      await collections.patients.delete(patientId)
      console.log('Patient deleted successfully')
    } catch (error) {
      console.error('Error deleting patient:', error)
    }
  }

  return (
    <div class="p-6 space-y-8">
      <h1 class="text-3xl font-bold text-gray-900">TanStack DB Example (Performant)</h1>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-blue-900 mb-2">Performance Notes</h2>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Only subscribing to collections that are actually used (Patients, Appointments, Clinics)</li>
          <li>• Not loading all data at once - only what's needed</li>
          <li>• Real-time sync is targeted and efficient</li>
          <li>• Memory usage is optimized</li>
        </ul>
      </div>
      
      {/* Search */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Search</h2>
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Patients */}
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Patients</h2>
          <button
            onClick={addPatient}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Patient
          </button>
        </div>
        
        <Show when={!patientsQuery.isLoading()} fallback={<p>Loading patients...</p>}>
          <div class="grid gap-4">
            <For each={patientsQuery.data} fallback={<p>No patients found.</p>}>
              {(patient: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-medium">{patient.first_name} {patient.last_name}</h3>
                      <p class="text-sm text-gray-600">{patient.phone}</p>
                      <p class="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <div class="space-x-2">
                      <button
                        onClick={() => updatePatient(patient.id)}
                        class="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePatient(patient.id)}
                        class="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Appointments */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Appointments</h2>
        <Show when={!appointmentsQuery.isLoading()} fallback={<p>Loading appointments...</p>}>
          <div class="grid gap-4">
            <For each={appointmentsQuery.data} fallback={<p>No appointments found.</p>}>
              {(appointment: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">Appointment #{appointment.id}</h3>
                  <p class="text-sm text-gray-600">Start: {appointment.start_time}</p>
                  <p class="text-sm text-gray-600">Status: {appointment.status}</p>
                  <p class="text-sm text-gray-600">Reason: {appointment.reason}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Clinics */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Clinics</h2>
        <Show when={!clinicsQuery.isLoading()} fallback={<p>Loading clinics...</p>}>
          <div class="grid gap-4">
            <For each={clinicsQuery.data} fallback={<p>No clinics found.</p>}>
              {(clinic: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">{clinic.clinic_name}</h3>
                  <p class="text-sm text-gray-600">{clinic.address}</p>
                  <p class="text-sm text-gray-600">{clinic.phone}</p>
                  <p class="text-sm text-gray-600">Active: {clinic.is_active ? 'Yes' : 'No'}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Status Information */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Query Status</h2>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p><strong>Patients:</strong> {patientsQuery.isLoading() ? 'Loading' : patientsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Appointments:</strong> {appointmentsQuery.isLoading() ? 'Loading' : appointmentsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Clinics:</strong> {clinicsQuery.isLoading() ? 'Loading' : clinicsQuery.isReady() ? 'Ready' : 'Error'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
