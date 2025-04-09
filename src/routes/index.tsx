import { createFileRoute, Link } from '@tanstack/solid-router'
import { createSignal, For, JSX, Show } from 'solid-js'
import { useQuery } from '@tanstack/solid-query'
import { dentalOps } from 'src/operations'
import { Appointment } from 'src/types'

export const Route = createFileRoute('/')({
  component: Index,
})

const getPatientName = (appointment: Appointment): string => {
  const patient = appointment.expand?.patient;
  if (patient) {
    return `${patient.firstName} ${patient.lastName}`;
  }
  return 'Loading Patient...'; // Or fetch separately if needed, but expand is better
};

function Index() {
  // Query for recent appointments
  const recentAppointmentsQuery = useQuery(() => ({
    queryKey: ['appointments', 'recent', 5],
    queryFn: dentalOps.appointments.fetchRecentAppointments,
    staleTime: 5 * 60 * 1000,
  }))

  const appointmentsTodayQuery = useQuery(() => ({
    queryKey: ['appointments', 'count', 'today'],
    queryFn: dentalOps.appointments.fetchAppointmentsTodayCount,
    staleTime: 15 * 60 * 1000,
  }))

  const newPatientsThisWeekQuery = useQuery(() => ({
    queryKey: ['patients', 'new', 'week'],
    queryFn: dentalOps.appointments.fetchNewPatientsThisWeekCount,
    staleTime: 60 * 60 * 1000,
  }))

  // Mocked/Static Stats with proper signal usage
  const [pendingPayments] = createSignal(8);
  const [todaysRevenue] = createSignal(2850);

  return (
    <div class="px-4 py-6 max-w-7xl mx-auto transition-all duration-300">
      <h1 class="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Appointments Today"
          value={appointmentsTodayQuery.isLoading ? '...' : (appointmentsTodayQuery.data ?? 0).toString()}
          color="bg-blue-500"
          icon="📅"
          isLoading={appointmentsTodayQuery.isLoading}
        />
        <StatCard
          title="New Patients This Week"
          value={newPatientsThisWeekQuery.isLoading ? '...' : (newPatientsThisWeekQuery.data ?? 0).toString()}
          color="bg-green-500"
          icon="👤"
          isLoading={newPatientsThisWeekQuery.isLoading}
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments().toString()}
          color="bg-yellow-500"
          icon="💰"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${todaysRevenue().toLocaleString()}`}
          color="bg-purple-500"
          icon="📈"
        />
      </div>

      {/* Recent Appointments */}
      <div class="bg-white rounded-lg shadow mb-8 transition-all duration-300 hover:shadow-md">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Recent Appointments</h2>
          <Link
            href="/appointments"
            class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All
          </Link>
        </div>
        <div class="p-4 sm:p-6 min-h-[250px]">
          <Show when={!recentAppointmentsQuery.isLoading} fallback={<LoadingSpinner />}>
            <Show when={!recentAppointmentsQuery.isError} fallback={<ErrorMessage error={recentAppointmentsQuery.error} />}>
              <Show when={recentAppointmentsQuery.data?.items && recentAppointmentsQuery.data.items.length > 0}
                fallback={<EmptyState message="No recent appointments found" />}
              >
                <ul class="divide-y divide-gray-200">
                  <For each={recentAppointmentsQuery.data?.items}>
                    {(appointment) => (
                      <li class="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-gray-50 px-2 rounded transition-colors">
                        <div>
                          <p class="font-medium text-gray-900">{getPatientName(appointment)}</p>
                          <div class="flex items-center">
                            <span class={`inline-block w-2 h-2 rounded-full mr-2 ${getAppointmentTypeColor(appointment.type)}`}></span>
                            <p class="text-sm text-gray-500 capitalize">{appointment.type || 'N/A'}</p>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-medium text-gray-900">
                            {formatAppointmentTime(appointment.dateTime)}
                          </p>
                          <p class="text-sm text-gray-500">
                            {formatAppointmentDate(appointment.dateTime)}
                          </p>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </Show>
          </Show>
        </div>
      </div>

      {/* Quick Actions */}
      <div class="bg-white rounded-lg shadow transition-all duration-300 hover:shadow-md">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div class="p-4 sm:p-6">
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <ActionButton
              to="/new-appointment"
              label="New Appointment"
              bgColor="bg-indigo-600"
              hoverColor="bg-indigo-700"
              icon="📝"
            />
            <ActionButton
              to="/register-patient"
              label="Register Patient"
              bgColor="bg-green-600"
              hoverColor="bg-green-700"
              icon="👥"
            />
            <ActionButton
              to="/invoices/new"
              label="Create Invoice"
              bgColor="bg-blue-600"
              hoverColor="bg-blue-700"
              icon="📄"
              preload={false}
            />
            <ActionButton
              to="/schedule"
              label="View Schedule"
              bgColor="bg-purple-600"
              hoverColor="bg-purple-700"
              icon="🗓️"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for formatting dates and appointment status
function formatAppointmentTime(dateTimeStr) {
  try {
    return new Date(dateTimeStr).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Invalid time';
  }
}

function formatAppointmentDate(dateTimeStr) {
  try {
    return new Date(dateTimeStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
}

function getAppointmentTypeColor(type) {
  switch (type?.toLowerCase()) {
    case 'checkup': return 'bg-green-500';
    case 'cleaning': return 'bg-blue-500';
    case 'emergency': return 'bg-red-500';
    case 'procedure': return 'bg-purple-500';
    case 'consultation': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
}

// Improved components with better styling and features
function StatCard(props: {
  title: string;
  value: string;
  color: string;
  icon?: string;
  isLoading?: boolean
}): JSX.Element {
  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow duration-300">
      <div class="p-5">
        <div class="flex items-center">
          <div
            class={`flex-shrink-0 h-12 w-12 rounded-md ${props.color} flex items-center justify-center`}
          >
            <span class="text-white text-xl">{props.icon || props.title.charAt(0)}</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 truncate">{props.title}</p>
            <p class="text-2xl font-semibold text-gray-900">
              {props.isLoading ?
                <span class="animate-pulse inline-block w-12 h-6 bg-gray-200 rounded"></span> :
                props.value
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// New component for action buttons to avoid repetition
function ActionButton(props: {
  to: string;
  label: string;
  bgColor: string;
  hoverColor: string;
  icon?: string;
  preload?: boolean;
}): JSX.Element {
  return (
    <Link
      to={props.to}
      preload={props.preload}
      class={`flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${props.bgColor} hover:${props.hoverColor} transition-colors duration-200`}
    >
      {props.icon && <span class="mr-2">{props.icon}</span>}
      {props.label}
    </Link>
  );
}

function LoadingSpinner(): JSX.Element {
  return (
    <div class="flex justify-center items-center h-full py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-indigo-600"></div>
    </div>
  );
}

function ErrorMessage(props: { error: any }): JSX.Element {
  console.error("Data fetching error:", props.error);
  return (
    <div class="text-center py-6 px-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
      <p class="font-medium">Error loading data</p>
      <p class="text-sm mt-1">Please try refreshing the page</p>
      <button
        class="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </div>
  );
}

function EmptyState(props: { message: string }): JSX.Element {
  return (
    <div class="text-center py-10">
      <p class="text-gray-500">{props.message}</p>
      <p class="text-sm text-gray-400 mt-1">Items will appear here when available</p>
    </div>
  );
}

export default Index;





// import { createFileRoute, Link } from '@tanstack/solid-router'
// import { createSignal, For, JSX, Show } from 'solid-js'
// import { useQuery } from '@tanstack/solid-query'
// import { dentalOps } from 'src/operations'
//
// export const Route = createFileRoute('/')({
//   component: Index,
// })
//
// function Index() {
//   // Query for recent appointments
//
//   const recentAppointmentsQuery = useQuery(() => ({
//     queryKey: ['appointments', 'recent', 5], // Unique key for this query
//     queryFn: dentalOps.appointments.fetchRecentAppointments,
//     staleTime: 5 * 60 * 1000, // Refetch after 5 minutes of inactivity (optional)
//   }))
//
//   const appointmentsTodayQuery = useQuery(() => ({
//     queryKey: ['appointments', 'count', 'today'],
//     queryFn: dentalOps.appointments.fetchAppointmentsTodayCount,
//     staleTime: 15 * 60 * 1000, // Refetch less often (optional)
//   }))
//
//   const newPatientsThisWeekQuery = useQuery(() => ({
//     queryKey: ['appointments', 'count', 'today'],
//     queryFn: dentalOps.appointments.fetchNewPatientsThisWeekCount,
//     staleTime: 60 * 60 * 1000, // Refetch even less often (optional)
//
//   }))
//
//
//   // --- Mocked/Static Stats (Until real data sources exist) ---
//   const pendingPayments = createSignal(8); // Placeholder
//   const todaysRevenue = createSignal(2850); // Placeholder
//
//   return (
//     <div>
//       <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
//
//       {/* Stats */}
//       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Appointments Today"
//           value={appointmentsTodayQuery.isLoading ? '...' : (appointmentsTodayQuery.data ?? 0).toString()}
//           color="bg-blue-500"
//           isLoading={appointmentsTodayQuery.isLoading}
//         />
//         <StatCard
//           title="New Patients (This Week)"
//           value={newPatientsThisWeekQuery.isLoading ? '...' : (newPatientsThisWeekQuery.data ?? 0).toString()}
//           color="bg-green-500"
//           isLoading={newPatientsThisWeekQuery.isLoading}
//         />
//         {/* Keep these mocked for now, replace with useQuery when API/logic exists */}
//         <StatCard
//           title="Pending Payments"
//           value={pendingPayments()[0].toString()} // Access signal value
//           color="bg-yellow-500"
//         />
//         <StatCard
//           title="Today's Revenue"
//           value={`$${todaysRevenue()[0]}`} // Access signal value
//           color="bg-purple-500"
//         />
//       </div>
//
//       {/* Recent Appointments */}
//       <div class="bg-white rounded-lg shadow mb-8">
//         <div class="px-6 py-4 border-b border-gray-200">
//           <h2 class="text-lg font-medium text-gray-900">Recent Appointments</h2>
//         </div>
//         <div class="p-6 min-h-[200px]"> {/* Added min-height for loading state */}
//           <Show when={!recentAppointmentsQuery.isLoading} fallback={<LoadingSpinner />}>
//             <Show when={!recentAppointmentsQuery.isError} fallback={<ErrorMessage error={recentAppointmentsQuery.error} />}>
//               <Show when={recentAppointmentsQuery.data?.items && recentAppointmentsQuery.data.items.length > 0}
//                 fallback={<p class="text-gray-500">No recent appointments found.</p>}
//               >
//                 <ul class="divide-y divide-gray-200">
//                   <For each={recentAppointmentsQuery.data?.items}>
//                     {(appointment) => (
//                       <li class="py-4 flex justify-between items-center">
//                         <div>
//                           {/* Use expanded data for patient name */}
//                           <p class="font-medium text-gray-900">{getPatientName(appointment)}</p>
//                           {/* Use 'type' field from PocketBase */}
//                           <p class="text-sm text-gray-500 capitalize">{appointment.type || 'N/A'}</p>
//                         </div>
//                         <div class="text-right">
//                           {/* Format dateTime from PocketBase */}
//                           <p class="text-sm font-medium text-gray-900">
//                             {new Date(appointment.dateTime).toLocaleTimeString([], {
//                               hour: 'numeric', // Use 'numeric' or '2-digit'
//                               minute: '2-digit',
//                               // timeZone: 'your-local-timezone' // Optional: Specify timezone if needed
//                             })}
//                           </p>
//                           <p class="text-sm text-gray-500">
//                             {new Date(appointment.dateTime).toLocaleDateString()}
//                           </p>
//                         </div>
//                       </li>
//                     )}
//                   </For>
//                 </ul>
//               </Show>
//             </Show>
//           </Show>
//         </div>
//       </div>
//
//       {/* Quick Actions (No changes needed here) */}
//       <div class="bg-white rounded-lg shadow">
//         {/* ... Quick Actions content ... */}
//         <div class="px-6 py-4 border-b border-gray-200">
//           <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
//         </div>
//         <div class="p-6">
//           <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Link
//               to="/new-appointment"
//               class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//             >
//               New Appointment
//             </Link>
//             <Link
//               to="/register-patient" // Ensure this route exists
//               class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
//             >
//               Register Patient
//             </Link>
//             {/* Add other links as needed, ensure routes exist */}
//             <Link
//               to="/invoices/new" // Example route
//               preload={false} // Tanstack Router: maybe don't preload forms
//               class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
//             >
//               Create Invoice
//             </Link>
//             <Link
//               to="/schedule" // Example route
//               class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
//             >
//               View Schedule
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// // Updated StatCard to show loading state
// function StatCard(props: { title: string; value: string; color: string; isLoading?: boolean }): JSX.Element {
//   return (
//     <div class="bg-white rounded-lg shadow">
//       <div class="p-5">
//         <div class="flex items-center">
//           <div
//             class={`flex-shrink-0 h-10 w-10 rounded-md ${props.color} flex items-center justify-center`}
//           >
//             {/* Simple icon placeholder, replace with actual icons if desired */}
//             <span class="text-white text-xl font-bold">{props.title.charAt(0)}</span>
//           </div>
//           <div class="ml-4">
//             <p class="text-sm font-medium text-gray-500 truncate">{props.title}</p>
//             <p class="text-2xl font-semibold text-gray-900">
//               {props.isLoading ? <span class="animate-pulse">...</span> : props.value}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// function LoadingSpinner(): JSX.Element {
//   return (
//     <div class="flex justify-center items-center h-full">
//       <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//     </div>
//   );
// }
//
// function ErrorMessage(props: { error: any }): JSX.Element {
//   console.error("Data fetching error:", props.error); // Log error details
//   return (
//     <div class="text-center py-4 px-2 text-red-600 bg-red-100 border border-red-400 rounded">
//       <p>Error loading data.</p>
//       {/* Optionally display simple error message, avoid showing raw error objects to users */}
//       {/* <p class="text-sm">{props.error?.message || 'Please try again later.'}</p> */}
//     </div>
//   );
// }
// const [stats, setStats] = createSignal({
//   appointmentsToday: 0,
//   newPatients: 0,
//   pendingPayments: 0,
//   revenue: 0
// })



// const [recentAppointments, setRecentAppointments] = createSignal<Appointment[]>([])

// onMount(async () => {
//   // In a real app, these would be separate API calls
//   setStats({
//     appointmentsToday: 12,
//     newPatients: 3,
//     pendingPayments: 8,
//     revenue: 2850
//   })
//
//   const appointments: Appointment[] = await mockApi.getAllAppointments()
//   setRecentAppointments(appointments.slice(0, 5))
// })

// return (
//   <div>
//     <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
//
//     {/* Stats */}
//     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//       <StatCard
//         title="Appointments Today"
//         value={stats().appointmentsToday.toString()}
//         color="bg-blue-500"
//       />
//       <StatCard
//         title="New Patients (This Week)"
//         value={stats().newPatients.toString()}
//         color="bg-green-500"
//       />
//       <StatCard
//         title="Pending Payments"
//         value={stats().pendingPayments.toString()}
//         color="bg-yellow-500"
//       />
//       <StatCard title="Today's Revenue" value={`$${stats().revenue}`} color="bg-purple-500" />
//     </div>
//
//     {/* Recent Appointments */}
//     <div class="bg-white rounded-lg shadow mb-8">
//       <div class="px-6 py-4 border-b border-gray-200">
//         <h2 class="text-lg font-medium text-gray-900">Recent Appointments</h2>
//       </div>
//       <div class="p-6">
//         <ul class="divide-y divide-gray-200">
//           <For each={recentAppointments()}>
//             {(appointment) => (
//               <li class="py-4 flex justify-between">
//                 <div>
//                   <p class="font-medium text-gray-900">{appointment.patientName}</p>
//                   <p class="text-sm text-gray-500">{appointment.procedure}</p>
//                 </div>
//                 <div class="text-right">
//                   <p class="text-sm font-medium text-gray-900">
//                     {new Date(appointment.time).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </p>
//                   <p class="text-sm text-gray-500">
//                     {new Date(appointment.time).toLocaleDateString()}
//                   </p>
//                 </div>
//               </li>
//             )}
//           </For>
//         </ul>
//       </div>
//     </div>
//
//     {/* Quick Actions */}
//     <div class="bg-white rounded-lg shadow">
//       <div class="px-6 py-4 border-b border-gray-200">
//         <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
//       </div>
//       <div class="p-6">
//         <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Link
//             to="/new-appointment"
//             class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//           >
//             New Appointment
//           </Link>
//           <Link
//             to="register-patient"
//             class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
//           >
//             Register Patient
//           </Link>
//
//           <Link
//             to="create-invoice"
//             class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
//           >
//             Create Invoice
//           </Link>
//
//           <Link
//             to="view-schedule"
//             class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
//           >
//             View Schedule
//           </Link>
//         </div>
//       </div>
//     </div>
//   </div>
// )


// function StatCard(props: { title: string; value: string; color: string }): JSX.Element {
//   return (
//     <div class="bg-white rounded-lg shadow">
//       <div class="p-5">
//         <div class="flex items-center">
//           <div
//             class={`flex-shrink-0 h-10 w-10 rounded-md ${props.color} flex items-center justify-center`}
//           >
//             <span class="text-white text-xl font-bold">+</span>
//           </div>
//           <div class="ml-4">
//             <p class="text-sm font-medium text-gray-500">{props.title}</p>
//             <p class="text-2xl font-semibold text-gray-900">{props.value}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

