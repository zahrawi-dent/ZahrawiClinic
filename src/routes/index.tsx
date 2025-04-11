import { createFileRoute, Link } from '@tanstack/solid-router'
import { createSignal, For, JSX, Show } from 'solid-js'
import { useQuery } from '@tanstack/solid-query'
import { dentalOps } from 'src/operations'
import { Appointment, getAppointmentTypeColor, formatAppointmentDate, formatAppointmentTime } from 'src/types/appointments'
import ErrorMessage from '@components/ErrorMessage'
import LoadingSpinner from '@components/ui/LoadingSpinner'

export const Route = createFileRoute('/')({
  component: Index,
})

const getPatientName = (appointment: Appointment): string => {
  const patient = appointment.expand?.patient;
  if (patient) {
    return `${patient.firstName} ${patient.lastName}`;
  }
  return 'Loading Patient...';
};

function Index() {
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

      {/* Quick Actions */}
      <div class="bg-white rounded-lg shadow transition-all duration-300 hover:shadow-md mb-8">
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
                            <span class={`inline-block w-2 h-2 rounded-full mr-2 ${getAppointmentTypeColor(appointment.type).dot}`}></span>
                            <p class={`text-sm ${getAppointmentTypeColor(appointment.type).text} capitalize`}>{appointment.type || 'N/A'}</p>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-medium text-gray-900">
                            {formatAppointmentTime(appointment.date)}
                          </p>
                          <p class="text-sm text-gray-500">
                            {formatAppointmentDate(appointment.date)}
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

    </div>
  );
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



function EmptyState(props: { message: string }): JSX.Element {
  return (
    <div class="text-center py-10">
      <p class="text-gray-500">{props.message}</p>
      <p class="text-sm text-gray-400 mt-1">Items will appear here when available</p>
    </div>
  );
}

export default Index;
