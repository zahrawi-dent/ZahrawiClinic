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
  useRealTimeSync,
  useCollections
} from '../lib/useTanStackDB'

export function TanStackDBExample() {
  // Set up real-time sync for all collections
  useRealTimeSync()
  
  // Get all collections
  const collections = useCollections()
  
  // Use all the hooks
  const patientsQuery = usePatients()
  const appointmentsQuery = useAppointments()
  const clinicsQuery = useClinics()
  const organizationsQuery = useOrganizations()
  const staffQuery = useStaffMembers()
  const treatmentsQuery = useTreatmentsCatalog()
  const treatmentRecordsQuery = useTreatmentRecords()
  const dentalChartsQuery = useDentalCharts()
  const patientTransfersQuery = usePatientTransfers()
  const usersQuery = useUsers()
  
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
      } as any)
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
      <h1 class="text-3xl font-bold text-gray-900">TanStack DB Example</h1>
      
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
        
        <Show when={!patientsQuery.isLoading} fallback={<p>Loading patients...</p>}>
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
        <Show when={!appointmentsQuery.isLoading} fallback={<p>Loading appointments...</p>}>
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
        <Show when={!clinicsQuery.isLoading} fallback={<p>Loading clinics...</p>}>
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

      {/* Organizations */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Organizations</h2>
        <Show when={!organizationsQuery.isLoading} fallback={<p>Loading organizations...</p>}>
          <div class="grid gap-4">
            <For each={organizationsQuery.data} fallback={<p>No organizations found.</p>}>
              {(org: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">{org.organization_name}</h3>
                  <p class="text-sm text-gray-600">{org.address}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Staff Members */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Staff Members</h2>
        <Show when={!staffQuery.isLoading} fallback={<p>Loading staff...</p>}>
          <div class="grid gap-4">
            <For each={staffQuery.data} fallback={<p>No staff found.</p>}>
              {(staff: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">Staff #{staff.id}</h3>
                  <p class="text-sm text-gray-600">Role: {staff.role}</p>
                  <p class="text-sm text-gray-600">Active: {staff.is_active ? 'Yes' : 'No'}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Treatments Catalog */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Treatments Catalog</h2>
        <Show when={!treatmentsQuery.isLoading} fallback={<p>Loading treatments...</p>}>
          <div class="grid gap-4">
            <For each={treatmentsQuery.data} fallback={<p>No treatments found.</p>}>
              {(treatment: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">{treatment.name}</h3>
                  <p class="text-sm text-gray-600">{treatment.description}</p>
                  <p class="text-sm text-gray-600">Price: ${treatment.default_price}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Treatment Records */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Treatment Records</h2>
        <Show when={!treatmentRecordsQuery.isLoading} fallback={<p>Loading treatment records...</p>}>
          <div class="grid gap-4">
            <For each={treatmentRecordsQuery.data} fallback={<p>No treatment records found.</p>}>
              {(record: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">Treatment Record #{record.id}</h3>
                  <p class="text-sm text-gray-600">Price: ${record.price_charged}</p>
                  <p class="text-sm text-gray-600">Notes: {record.clinical_notes}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Dental Charts */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Dental Charts</h2>
        <Show when={!dentalChartsQuery.isLoading} fallback={<p>Loading dental charts...</p>}>
          <div class="grid gap-4">
            <For each={dentalChartsQuery.data} fallback={<p>No dental charts found.</p>}>
              {(chart: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">Dental Chart #{chart.id}</h3>
                  <p class="text-sm text-gray-600">Type: {chart.chart_type}</p>
                  <p class="text-sm text-gray-600">Dentition: {chart.dentition}</p>
                  <p class="text-sm text-gray-600">Notation: {chart.notation_system}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Patient Transfers */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Patient Transfers</h2>
        <Show when={!patientTransfersQuery.isLoading} fallback={<p>Loading patient transfers...</p>}>
          <div class="grid gap-4">
            <For each={patientTransfersQuery.data} fallback={<p>No patient transfers found.</p>}>
              {(transfer: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">Transfer #{transfer.id}</h3>
                  <p class="text-sm text-gray-600">Date: {transfer.transfer_date}</p>
                  <p class="text-sm text-gray-600">Reason: {transfer.reason}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Users */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Users</h2>
        <Show when={!usersQuery.isLoading} fallback={<p>Loading users...</p>}>
          <div class="grid gap-4">
            <For each={usersQuery.data} fallback={<p>No users found.</p>}>
              {(user: any) => (
                <div class="p-4 border border-gray-200 rounded">
                  <h3 class="font-medium">{user.name || user.email}</h3>
                  <p class="text-sm text-gray-600">{user.email}</p>
                  <p class="text-sm text-gray-600">Verified: {user.verified ? 'Yes' : 'No'}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Status Information */}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Query Status</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Patients:</strong> {patientsQuery.isLoading() ? 'Loading' : patientsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Appointments:</strong> {appointmentsQuery.isLoading() ? 'Loading' : appointmentsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Clinics:</strong> {clinicsQuery.isLoading() ? 'Loading' : clinicsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Organizations:</strong> {organizationsQuery.isLoading() ? 'Loading' : organizationsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Staff:</strong> {staffQuery.isLoading() ? 'Loading' : staffQuery.isReady() ? 'Ready' : 'Error'}</p>
          </div>
          <div>
            <p><strong>Treatments:</strong> {treatmentsQuery.isLoading() ? 'Loading' : treatmentsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Treatment Records:</strong> {treatmentRecordsQuery.isLoading() ? 'Loading' : treatmentRecordsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Dental Charts:</strong> {dentalChartsQuery.isLoading() ? 'Loading' : dentalChartsQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Patient Transfers:</strong> {patientTransfersQuery.isLoading() ? 'Loading' : patientTransfersQuery.isReady() ? 'Ready' : 'Error'}</p>
            <p><strong>Users:</strong> {usersQuery.isLoading() ? 'Loading' : usersQuery.isReady() ? 'Ready' : 'Error'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
