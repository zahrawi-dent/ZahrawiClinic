import { createSignal, For, JSX, Show } from 'solid-js'
import { Link, useNavigate } from '@tanstack/solid-router'
import DeletePatientDialog from '../pages/Patients/DeletePatientDialog'
import { dentalOps } from 'src/operations'
import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query'
export default function PatientDetails(props: { patientId: string }): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get query client instance

  const [activeTab, setActiveTab] = createSignal('profile');
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);

  // --- Queries ---

  // Query for Patient Details
  const patientDetailsQuery = useQuery(() => ({
    queryKey: ['patient-details', props.patientId],
    queryFn: async () => {
      const patient = await dentalOps.patients.getById(props.patientId);
      // Optional: Throw an error if patient not found to trigger isError state
      if (!patient) {
        throw new Error(`Patient with ID ${props.patientId} not found.`);
      }
      return patient;
    },
    // staleTime: 1000 * 60 * 5 // Optional: Keep data fresh for 5 minutes
  }));

  // Query for Appointments (enabled only when patient ID is available)
  const appointmentsQuery = useQuery(() => ({
    queryKey: ['patient-appointments', props.patientId],
    queryFn: () => dentalOps.patients.getWithAppointments(props.patientId),
    enabled: !!props.patientId // Fetch only when props.patientId is truthy
    // Or, if you only want to fetch after patient details are confirmed:
    // enabled: patientDetailsQuery.isSuccess && !!patientDetailsQuery.data
  }));
  // Query for Treatments
  const treatmentsQuery = useQuery(() => ({
    queryKey: ['patient-treatments', props.patientId],
    queryFn: () => dentalOps.treatments.getById(props.patientId),
    enabled: !!props.patientId
  }));

  // Query for Invoices
  const invoicesQuery = useQuery(() => ({
    queryKey: ['patient-invoices', props.patientId],
    // TODO: add invoices
    queryFn: () => dentalOps.invoices.getById(props.patientId),
    enabled: !!props.patientId
  }));

  // --- Mutation ---

  // Mutation for Deleting Patient
  const deletePatientMutation = useMutation(() => ({
    mutationFn: (patientId: string) => dentalOps.patients.delete(patientId),
    onSuccess: () => {
      // Invalidate queries that might be affected (e.g., a patient list query)
      queryClient.invalidateQueries({ queryKey: ['patients'] }).catch(() => { }); // Assuming you have a ['patients'] query elsewhere
      queryClient.removeQueries({ queryKey: ['patient-details', props.patientId] }); // Remove specific patient data
      queryClient.removeQueries({ queryKey: ['patient-appointments', props.patientId] });
      queryClient.removeQueries({ queryKey: ['patient-treatments', props.patientId] });
      queryClient.removeQueries({ queryKey: ['patient-invoices', props.patientId] });

      console.log('Patient deleted successfully, navigating...');
      navigate({ to: '/patients', replace: true }).catch(() => { })
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
      // TODO: Show user feedback (e.g., toast notification)
      setDeleteDialogOpen(false); // Close dialog on error too
    },
    onSettled: () => {
      // Runs on both success and error
      // setDeleteDialogOpen(false); // Can close dialog here if preferred
    }
  }));

  const handleDeleteConfirm = () => {
    deletePatientMutation.mutate(props.patientId);
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'treatments', label: 'Treatment History' },
    { id: 'billing', label: 'Billing' }
  ];

  return (
    <div>
      {/* --- Loading State --- */}
      <Show when={patientDetailsQuery.isLoading}>
        <div class="flex justify-center items-center h-64">
          <div class="text-center">
            <p class="text-gray-500">Loading patient data...</p>
            {/* Add a spinner here if desired */}
          </div>
        </div>
      </Show>

      {/* --- Error State --- */}
      <Show when={patientDetailsQuery.isError}>
        <div class="flex justify-center items-center h-64 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline"> Failed to load patient data: {patientDetailsQuery.error?.message || 'Unknown error'}</span>
        </div>
      </Show>

      {/* --- Success State --- */}
      <Show when={patientDetailsQuery.isSuccess && patientDetailsQuery.data}>
        {/* Use patientDetailsQuery.data directly */}
        {(patient) => ( // patient is now the resolved data
          <>
            {/* Patient Header */}
            <div class="bg-white shadow rounded-lg p-6 mb-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl text-indigo-800 font-bold">
                    {patient().firstName[0]}
                    {patient().lastName[0]}
                  </div>
                </div>
                <div class="ml-6">
                  <h1 class="text-2xl font-bold text-gray-900">
                    {patient().firstName} {patient().lastName}
                  </h1>
                  <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                      {/* Email Icon */}
                      {patient().email}
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                      {/* Phone Icon */}
                      {patient().phone}
                    </div>
                  </div>
                </div>
                <div class="ml-auto flex">
                  {/* TODO: pass the patient object instead of refetching it in EditPatient */}
                  <Link
                    to={`/patients/${props.patientId}/edit`}
                    class="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Patient
                  </Link>
                  <button
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deletePatientMutation.isPending} // Disable while deleting
                    class={`mr-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${deletePatientMutation.isPending ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {deletePatientMutation.isPending ? 'Deleting...' : 'Delete Patient'}
                  </button>
                  <Link
                    // Dental Chart Link
                    to={`/patients/${props.patientId}/dental-chart`}
                    class="mr-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                  >
                    Dental Chart
                  </Link>
                  <Link
                    // Pass patient data if needed, or just navigate
                    to={`/appointments/new`}
                    search={{
                      patientId: props.patientId,
                      patientName: `${patient().firstName} ${patient().lastName}`
                    }}
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    New Appointment
                  </Link>
                </div>
              </div>
            </div>

            {/* Delete Patient Confirmation Dialog */}
            <DeletePatientDialog
              isOpen={deleteDialogOpen()}
              onClose={() => !deletePatientMutation.isPending && setDeleteDialogOpen(false)} // Prevent closing while mutation is pending
              onConfirm={handleDeleteConfirm}
              patientName={`${patient().firstName} ${patient().lastName}`}
            />

            {/* Tabs */}
            <div class="mb-6">
              <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8">
                  <For each={tabs}>
                    {(tab) => (
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab() === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        {tab.label}
                      </button>
                    )}
                  </For>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div class="bg-white shadow rounded-lg p-6">
              {/* Profile Tab */}
              <Show when={activeTab() === 'profile'}>
                {/* Profile content using patient()... */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ... (Personal Info using patient()... ) ... */}

                  <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <div class="space-y-4">
                      <div>
                        <p class="text-sm font-medium text-gray-500">Full Name</p>
                        <p class="mt-1 text-sm text-gray-900">
                          {patient()?.firstName} {patient()?.lastName}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p class="mt-1 text-sm text-gray-900">
                          {new Date(patient().age).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Gender</p>
                        <p class="mt-1 text-sm text-gray-900">{patient()?.sex}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Phone</p>
                        <p class="mt-1 text-sm text-gray-900">{patient()?.phone}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Email</p>
                        <p class="mt-1 text-sm text-gray-900">{patient()?.email}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Address</p>
                        <p class="mt-1 text-sm text-gray-900">{patient()?.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* ... (Medical Info using patient()... ) ... */}

                  <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                    <div class="space-y-4">
                      <div>
                        <p class="text-sm font-medium text-gray-500">Insurance Provider</p>
                        {/* <p class="mt-1 text-sm text-gray-900">{patient().insurance || 'None'}</p> */}
                        <p class="mt-1 text-sm text-gray-900">{patient()?.insuranceProvider}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Allergies</p>
                        {/* <p class="mt-1 text-sm text-gray-900">{patient().allergies || 'None reported'}</p> */}
                        <p class="mt-1 text-sm text-gray-900">{patient()?.allergies}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Medical History</p>
                        {/* <p class="mt-1 text-sm text-gray-900">{patient().medicalConditions || 'None reported'}</p> */}
                        <p class="mt-1 text-sm text-gray-900">{patient()?.medicalHistory}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Notes</p>
                        {/* <p class="mt-1 text-sm text-gray-900">{patient().notes || 'No additional notes'}</p> */}
                        <p class="mt-1 text-sm text-gray-900">{patient()?.notes}</p>
                      </div>
                    </div>
                  </div>


                </div>
              </Show>



              {/* Appointments Tab */}
              <Show when={activeTab() === 'appointments'}>




                <div>
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                    {/* Link to new appointment page */}
                    <Link to={`/new-appointment?patientId=${patient().id}`} class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                      Schedule New
                    </Link>
                  </div>

                  <Show when={appointmentsQuery.isLoading}> <p>Loading appointments...</p> </Show>
                  <Show when={appointmentsQuery.isError}> <p class="text-red-600">Error loading appointments: {appointmentsQuery.error?.message}</p> </Show>
                  <Show when={appointmentsQuery.isSuccess && appointmentsQuery.data?.length === 0}>
                    <p>No appointments found for this patient.</p>
                  </Show>
                  <Show when={appointmentsQuery.isSuccess && appointmentsQuery.data && appointmentsQuery.data.length > 0}>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        {/* ... thead ... */}
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          {/* Use appointmentsQuery.data directly */}
                          <For each={appointmentsQuery.data}>
                            {(appointment) => (
                              <tr>
                                {/* ... appointment data ... */}
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(appointment.date).toLocaleString()}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.procedure}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.dentist.firstName} {appointment.dentist.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                  <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    {appointment.status}
                                  </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button> {/* TODO: Add Edit functionality */}
                                  <button class="text-red-600 hover:text-red-900">Cancel</button> {/* TODO: Add Cancel functionality */}
                                </td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Treatments Tab */}
              <Show when={activeTab() === 'treatments'}>
                <div>
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Treatment History</h3>
                    <button class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                      Add Treatment {/* TODO: Add Functionality */}
                    </button>
                  </div>
                  <Show when={treatmentsQuery.isLoading}> <p>Loading treatments...</p> </Show>
                  <Show when={treatmentsQuery.isError}> <p class="text-red-600">Error loading treatments: {treatmentsQuery.error?.message}</p> </Show>
                  <Show when={treatmentsQuery.isSuccess && treatmentsQuery.data?.length === 0}>
                    <p>No treatment history found for this patient.</p>
                  </Show>
                  <Show when={treatmentsQuery.isSuccess && treatmentsQuery.data && treatmentsQuery.data.length > 0}>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        {/* ... thead ... */}
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Procedure
                            </th>
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Doctor
                            </th>
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Notes
                            </th>
                            <th scope="col" class="relative px-6 py-3">
                              <span class="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <For each={treatmentsQuery.data}>
                            {(treatment) => (
                              <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(treatment.date).toLocaleDateString()}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {treatment.procedure}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {treatment.doctor}
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{treatment.notes}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button class="text-indigo-600 hover:text-indigo-900">
                                    {/* TODO add functionality*/}
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Billing Tab */}
              <Show when={activeTab() === 'billing'}>
                <div>
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Billing History</h3>
                    <button class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                      Create Invoice {/* TODO: Add Functionality */}
                    </button>
                  </div>
                  <Show when={invoicesQuery.isLoading}> <p>Loading invoices...</p> </Show>
                  <Show when={invoicesQuery.isError}> <p class="text-red-600">Error loading invoices: {invoicesQuery.error?.message}</p> </Show>
                  <Show when={invoicesQuery.isSuccess && invoicesQuery.data?.length === 0}>
                    <p>No billing history found for this patient.</p>
                  </Show>
                  <Show when={invoicesQuery.isSuccess && invoicesQuery.data && invoicesQuery.data.length > 0}>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        {/* ... thead ... */}

                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            {/* ... other headers ... */}
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Description
                            </th>
                            <th scope="col" class="relative px-6 py-3">
                              <span class="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <For each={invoicesQuery.data}>
                            {(invoice) => (
                              <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{invoice.id}</td>

                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(invoice.date).toLocaleDateString()}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${invoice.amount.toFixed(2)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                  <span
                                    class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'Paid'
                                      ? 'bg-green-100 text-green-800'
                                      : invoice.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                      }`}
                                  >
                                    {invoice.status}
                                  </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{invoice.description}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button class="text-indigo-600 hover:text-indigo-900 mr-3">View</button> {/* TODO: Add Functionality */}
                                  <button class="text-indigo-600 hover:text-indigo-900">Print</button> {/* TODO: Add Functionality */}
                                </td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </>
        )}
      </Show>
    </div >
  );

}
