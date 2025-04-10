import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, For, Show, JSX } from 'solid-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query'
import { dentalOps } from 'src/operations'
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { Appointment, AppointmentStatus, getAppointmentStatusColor } from 'src/types/appointments'
import { formatDate, formatTime } from 'src/utils/appointmetUtils'
import ListView from 'src/pages/appointments/ListView'
import AgendaView from 'src/pages/appointments/AgendaView'
import CalendarView from 'src/pages/appointments/CalendarView'

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type StatusFilter = 'all' | AppointmentStatus
type ViewMode = 'list' | 'calendar' | 'agenda';

function AppointmentsPage() {
  // State management
  const [searchQuery, setSearchQuery] = createSignal('');
  const [dateFilter, setDateFilter] = createSignal<DateFilter>('all');
  const [statusFilter, setStatusFilter] = createSignal<StatusFilter>('all');
  const [viewMode, setViewMode] = createSignal<ViewMode>('list');
  const [customDateRange, setCustomDateRange] = createSignal({ start: '', end: '' });
  const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = createSignal(false);

  const queryClient = useQueryClient();

  // Fetch appointments data
  const appointmentsQuery = useQuery(() => ({
    queryKey: ['appointments', 'all'],
    queryFn: () => dentalOps.appointments.getAll(),
    staleTime: 5 * 60 * 1000,
  }));

  function getAppointmentsForDay(dateStr: string) {
    if (!appointmentsQuery.data) return [];

    return appointmentsQuery.data.items.filter(apt => {
      try {
        return format(parseISO(apt.date), 'yyyy-MM-dd') === dateStr;
      } catch (e) {
        return false;
      }
    });
  }

  // Update appointment status mutation
  const updateStatusMutation = useMutation(() => ({
    mutationFn: (params: { id: string, status: AppointmentStatus }) =>
      dentalOps.appointments.updateAppointmentStatus(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowDetailsModal(false);
    }
  }));

  // Filter appointments based on search and filters
  const filteredAppointments = () => {
    if (!appointmentsQuery.data) return [];

    let appointments: Appointment[] = appointmentsQuery.data.items || [];

    // Apply search filter
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      appointments = appointments.filter(apt => {
        const patientName = getPatientName(apt).toLowerCase();
        const type = apt.type?.toLowerCase() || '';
        const notes = apt.notes?.toLowerCase() || '';
        return patientName.includes(query) || type.includes(query) || notes.includes(query);
      });
    }

    // Apply date filter
    if (dateFilter() !== 'all') {
      appointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.date);
        switch (dateFilter()) {
          case 'today': return isToday(aptDate);
          case 'week': return isThisWeek(aptDate);
          case 'month': return isThisMonth(aptDate);
          case 'custom':
            if (customDateRange().start && customDateRange().end) {
              const start = parseISO(customDateRange().start);
              const end = parseISO(customDateRange().end);
              return aptDate >= start && aptDate <= end;
            }
            return true;
          default: return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter() !== 'all') {
      appointments = appointments.filter(apt => apt.status === statusFilter());
    }

    // Sort by date (most recent first)
    return appointments.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Group appointments by date for agenda view
  const appointmentsByDate = () => {
    const grouped = {};
    filteredAppointments().forEach(apt => {
      const dateKey = format(parseISO(apt.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  };

  // Helper function to get patient name from appointment object
  const getPatientName = (appointment: Appointment): string => {
    const patient = appointment.expand?.patient;
    if (patient) {
      return `${patient.firstName} ${patient.lastName}`;
    }
    return 'Loading Patient...'; // Or fetch separately if needed, but expand is better
  };

  // Handler for opening appointment details
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Handler for updating appointment status
  const handleStatusUpdate = (appointmentId: string, newStatus: StatusFilter) => {
    if (newStatus !== 'all') {
      updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Appointments</h1>
        <button
          onClick={() => window.location.href = '/new-appointment'}
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Appointment
        </button>
      </div>

      {/* Filters and Search */}
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search patients, types, or notes..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.target.value)}
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date Filter */}
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Date:</label>
            <select
              value={dateFilter()}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              class="form-select rounded-md border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateFilter() === 'custom' && (
              <div class="flex space-x-2 mt-2 md:mt-0">
                <input
                  type="date"
                  value={customDateRange().start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  class="form-input rounded-md border-gray-300 py-1 text-sm"
                />
                <span class="text-gray-500">to</span>
                <input
                  type="date"
                  value={customDateRange().end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  class="form-input rounded-md border-gray-300 py-1 text-sm"
                />
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter()}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              class="form-select rounded-md border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value={AppointmentStatus.Pending}>Pending</option>
              <option value={AppointmentStatus.Confirmed}>Confirmed</option>
              <option value={AppointmentStatus.Completed}>Completed</option>
              <option value={AppointmentStatus.Cancelled}>Cancelled</option>
              <option value={AppointmentStatus.NoShow}>No Show</option>
              <option value={AppointmentStatus.Rescheduled}>Rescheduled</option>
              <option value={AppointmentStatus.Waiting}>Waiting</option>
              <option value={AppointmentStatus.InProgress}>In Progress</option>
            </select>
          </div>
        </div>

        {/* View Type Selector */}
        <div class="flex justify-between items-center pt-3 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            {appointmentsQuery.isLoading
              ? 'Loading appointments...'
              : `${filteredAppointments().length} appointments found`}
          </div>
          <div class="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              class={`px-4 py-2 text-sm font-medium rounded-l-md ${viewMode() === 'list'
                ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              class={`px-4 py-2 text-sm font-medium ${viewMode() === 'agenda'
                ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border-t border-b`}
            >
              Agenda
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              class={`px-4 py-2 text-sm font-medium rounded-r-md ${viewMode() === 'calendar'
                ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <Show when={!appointmentsQuery.isLoading} fallback={<LoadingState />}>
        <Show when={!appointmentsQuery.isError} fallback={<ErrorState error={appointmentsQuery.error} />}>
          <Show when={filteredAppointments().length > 0} fallback={<EmptyState />}>
            {/* List View */}
            <Show when={viewMode() === 'list'}>
              <ListView filteredAppointments={filteredAppointments} handleViewDetails={handleViewDetails} />
            </Show>

            {/* Agenda View */}
            <Show when={viewMode() === 'agenda'}>
              <AgendaView handleViewDetails={handleViewDetails} appointmentsByDate={appointmentsByDate} />
            </Show>

            {/* Calendar View */}
            <Show when={viewMode() === 'calendar'}>
              <CalendarView handleViewDetails={handleViewDetails} getAppointmentsForDay={getAppointmentsForDay} />
            </Show>
          </Show>
        </Show>
      </Show>

      {/* Appointment Details Modal */}
      <Show when={showDetailsModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 class="text-lg font-medium text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                class="text-gray-400 hover:text-gray-500"
              >
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="px-6 py-4">
              <Show when={selectedAppointment()}>
                {(appointment) => (
                  <>
                    <div class="flex items-center mb-4">
                      <div class="flex-shrink-0 h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-lg font-medium">
                        {getPatientInitials(getPatientName(appointment))}
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-medium text-gray-900">{getPatientName(appointment)}</h4>
                        <p class="text-sm text-gray-500">
                          {appointment.patient?.email || appointment.expand?.patient?.email || 'No email available'}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p class="text-sm font-medium text-gray-500">Date & Time</p>
                        <p class="mt-1">{formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Duration</p>
                        <p class="mt-1">{appointment.duration || 30} minutes</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Type</p>
                        <p class="mt-1 capitalize">{appointment.type || 'General'}</p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500">Status</p>
                        <p class="mt-1">
                          <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${getAppointmentStatusColor(appointment.status).bg} 
                            ${getAppointmentStatusColor(appointment.status).text} 
                            capitalize`}>
                            {appointment.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div class="mb-4">
                      <p class="text-sm font-medium text-gray-500 mb-1">Notes</p>
                      <p class="text-sm text-gray-700 border rounded-md p-3 bg-gray-50 min-h-[80px]">
                        {appointment.notes || 'No notes available for this appointment.'}
                      </p>
                    </div>

                    {/* Status Update */}
                    <div class="mb-4">
                      <p class="text-sm font-medium text-gray-500 mb-2">Update Status</p>
                      <div class="flex flex-wrap gap-2">
                        <For each={['scheduled', 'inprogress', 'completed', 'cancelled', 'noshow'] as const}>
                          {(status) => (
                            <button
                              class={`px-3 py-1 text-xs rounded-full border ${appointment.status === status
                                ? `${getAppointmentStatusColor(status).bg} ${getAppointmentStatusColor(status).text} border-transparent`
                                : 'border-gray-300 hover:bg-gray-50'
                                } capitalize`}
                              onClick={() => handleStatusUpdate(appointment.id, status)}
                              disabled={appointment.status === status || updateStatusMutation.isPending}
                            >
                              {status}
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </>
                )}
              </Show>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowDetailsModal(false)}
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <div class="space-x-2">
                <button
                  onClick={() => window.location.href = `/edit-appointment/${selectedAppointment()?.id}`}
                  class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

// Helper Components
function LoadingState(): JSX.Element {
  return (
    <div class="bg-white shadow-md rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Loading appointments...</p>
    </div>
  );
}

function ErrorState(props: { error: any }): JSX.Element {
  return (
    <div class="bg-white shadow-md rounded-lg p-8 text-center">
      <svg class="h-12 w-12 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Unable to load appointments</h3>
      <p class="text-sm text-gray-500 mb-4">There was an error retrieving the appointment data.</p>
      <button
        onClick={() => window.location.reload()}
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState(): JSX.Element {
  return (
    <div class="bg-white shadow-md rounded-lg p-8 text-center">
      <div class="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
        <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
      <p class="text-sm text-gray-500 mb-4">No appointments match your current filters.</p>
      <div class="flex justify-center space-x-4">
        <button
          onClick={() => window.location.href = '/new-appointment'}
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          New Appointment
        </button>
        <button
          onClick={() => {
            setSearchQuery('');
            setDateFilter('all');
            setStatusFilter('all');
          }}
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export function getPatientInitials(name: string): string {
  try {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  } catch (e) {
    return 'UN';
  }
}

// Export analytics components for potential reuse
export function AppointmentStats() {
  // Query for appointments stats
  const appointmentsStatsQuery = createQuery(() => ({
    queryKey: ['appointments', 'stats'],
    queryFn: () => dentalOps.appointments.fetchAppointmentsStats(),
    staleTime: 15 * 60 * 1000,
  }));

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Appointments"
        value={appointmentsStatsQuery.data?.total || 0}
        icon="📊"
        color="bg-indigo-500"
      />
      <StatCard
        title="Completed"
        value={appointmentsStatsQuery.data?.completed || 0}
        icon="✅"
        color="bg-green-500"
      />
      <StatCard
        title="Cancelled"
        value={appointmentsStatsQuery.data?.cancelled || 0}
        icon="❌"
        color="bg-red-500"
      />
      <StatCard
        title="No-Shows"
        value={appointmentsStatsQuery.data?.noShows || 0}
        icon="⚠️"
        color="bg-yellow-500"
      />
    </div>
  );
}

function StatCard(props: { title: string; value: number | string; icon?: string; color: string }): JSX.Element {
  return (
    <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300">
      <div class="p-5">
        <div class="flex items-center">
          <div
            class={`flex-shrink-0 h-12 w-12 rounded-full ${props.color} flex items-center justify-center`}
          >
            <span class="text-white text-xl">{props.icon || props.title.charAt(0)}</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 truncate">{props.title}</p>
            <p class="text-2xl font-semibold text-gray-900">{props.value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentsPage;




// import { createFileRoute } from '@tanstack/solid-router'
// import { createSignal, For, Show, JSX } from 'solid-js'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query'
// import { dentalOps } from 'src/operations'
// import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
// import { Appointment, AppointmentStatus, getAppointmentStatusColor } from 'src/types/appointments'
// import { formatDate, formatTime } from 'src/utils/appointmetUtils'
// import ListView from 'src/pages/appointments/ListView'
// import AgendaView from 'src/pages/appointments/AgendaView'
// import CalendarView from 'src/pages/appointments/CalendarView'
//
// export const Route = createFileRoute('/appointments')({
//   component: AppointmentsPage,
// })
//
//
//
// type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
// // type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'noshow' | 'inprogress';
// type StatusFilter = 'all' | AppointmentStatus
// type ViewMode = 'list' | 'calendar' | 'agenda';
//
// function AppointmentsPage() {
//   // State management
//   const [searchQuery, setSearchQuery] = createSignal('');
//   const [dateFilter, setDateFilter] = createSignal<DateFilter>('all');
//   const [statusFilter, setStatusFilter] = createSignal<StatusFilter>('all');
//   const [viewMode, setViewMode] = createSignal<ViewMode>('list');
//   const [customDateRange, setCustomDateRange] = createSignal({ start: '', end: '' });
//   const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);
//   const [showDetailsModal, setShowDetailsModal] = createSignal(false);
//
//   const queryClient = useQueryClient();
//
//   // Fetch appointments data
//   const appointmentsQuery = useQuery(() => ({
//     queryKey: ['appointments', 'all'],
//     queryFn: () => dentalOps.appointments.getAll(),
//     staleTime: 5 * 60 * 1000,
//   }));
//
//
//   function getAppointmentsForDay(dateStr: string) {
//     if (!appointmentsQuery.data) return [];
//
//     return appointmentsQuery.data.items.filter(apt => {
//       try {
//         return format(parseISO(apt.date), 'yyyy-MM-dd') === dateStr;
//       } catch (e) {
//         return false;
//       }
//     });
//   }
//
//   // Update appointment status mutation
//   const updateStatusMutation = useMutation({
//     mutationFn: dentalOps.appointments.updateAppointmentStatus,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['appointments'] });
//       setShowDetailsModal(false);
//     }
//   });
//
//   // Filter appointments based on search and filters
//   const filteredAppointments = () => {
//     let appointments: Appointment[] = appointmentsQuery.data.items || [];
//
//     // Apply search filter
//     if (searchQuery()) {
//       const query = searchQuery().toLowerCase();
//       appointments = appointments.filter(apt => {
//         const patientName = getPatientName(apt).toLowerCase();
//         const type = apt.type?.toLowerCase() || '';
//         const notes = apt.notes?.toLowerCase() || '';
//         return patientName.includes(query) || type.includes(query) || notes.includes(query);
//       });
//     }
//
//     // Apply date filter
//     if (dateFilter() !== 'all') {
//       appointments = appointments.filter(apt => {
//         const aptDate = parseISO(apt.date);
//         switch (dateFilter()) {
//           case 'today': return isToday(aptDate);
//           case 'week': return isThisWeek(aptDate);
//           case 'month': return isThisMonth(aptDate);
//           case 'custom':
//             if (customDateRange().start && customDateRange().end) {
//               const start = parseISO(customDateRange().start);
//               const end = parseISO(customDateRange().end);
//               return aptDate >= start && aptDate <= end;
//             }
//             return true;
//           default: return true;
//         }
//       });
//     }
//
//     // Apply status filter
//     if (statusFilter() !== 'all') {
//       appointments = appointments.filter(apt => apt.status === statusFilter());
//     }
//
//     // Sort by date (most recent first)
//     return appointments.sort((a, b) =>
//       new Date(a.date).getTime() - new Date(b.date).getTime()
//     );
//   };
//
//   // Group appointments by date for agenda view
//   const appointmentsByDate = () => {
//     const grouped = {};
//     filteredAppointments().forEach(apt => {
//       const dateKey = format(parseISO(apt.date), 'yyyy-MM-dd');
//       if (!grouped[dateKey]) grouped[dateKey] = [];
//       grouped[dateKey].push(apt);
//     });
//     return grouped;
//   };
//
//   // Helper function to get patient name from appointment object
//
//   const getPatientName = (appointment: Appointment): string => {
//     const patient = appointment.expand?.patient;
//     if (patient) {
//       return `${patient.firstName} ${patient.lastName}`;
//     }
//     return 'Loading Patient...'; // Or fetch separately if needed, but expand is better
//   };
//
//   // Handler for opening appointment details
//   const handleViewDetails = (appointment: Appointment) => {
//     setSelectedAppointment(appointment);
//     setShowDetailsModal(true);
//   };
//
//   // Handler for updating appointment status
//   const handleStatusUpdate = (appointmentId: string, newStatus: StatusFilter) => {
//     if (newStatus !== 'all') {
//       updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
//     }
//   };
//
//   return (
//     <div class="max-w-7xl mx-auto px-4 py-6">
//       <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Appointments</h1>
//         <button
//           onClick={() => window.location.href = '/new-appointment'}
//           class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//           </svg>
//           New Appointment
//         </button>
//       </div>
//
//       {/* Filters and Search */}
//       <div class="bg-white rounded-lg shadow-md p-4 mb-6">
//         <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           {/* Search */}
//           <div class="relative">
//             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
//               </svg>
//             </div>
//             <input
//               type="text"
//               placeholder="Search patients, types, or notes..."
//               value={searchQuery()}
//               onInput={(e) => setSearchQuery(e.target.value)}
//               class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//
//           {/* Date Filter */}
//           <div class="flex items-center space-x-2">
//             <label class="text-sm font-medium text-gray-700">Date:</label>
//             <select
//               value={dateFilter()}
//               onChange={(e) => setDateFilter(e.target.value as DateFilter)}
//               class="form-select rounded-md border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             >
//               <option value="all">All Dates</option>
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//               <option value="custom">Custom Range</option>
//             </select>
//
//             {dateFilter() === 'custom' && (
//               <div class="flex space-x-2 mt-2 md:mt-0">
//                 <input
//                   type="date"
//                   value={customDateRange().start}
//                   onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
//                   class="form-input rounded-md border-gray-300 py-1 text-sm"
//                 />
//                 <span class="text-gray-500">to</span>
//                 <input
//                   type="date"
//                   value={customDateRange().end}
//                   onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
//                   class="form-input rounded-md border-gray-300 py-1 text-sm"
//                 />
//               </div>
//             )}
//           </div>
//
//           {/* Status Filter */}
//           <div class="flex items-center space-x-2">
//             <label class="text-sm font-medium text-gray-700">Status:</label>
//             <select
//               value={statusFilter()}
//               onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
//               class="form-select rounded-md border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             >
//               {/* TODO: Loop through all statuses, add label to enum? */}
//               <option value="all">All Statuses</option>
//               <option value={AppointmentStatus.Pending}>Pending</option>
//               <option value={AppointmentStatus.Confirmed}>Confirmed</option>
//               <option value={AppointmentStatus.Completed}>Completed</option>
//               <option value={AppointmentStatus.Cancelled}>Cancelled</option>
//               <option value={AppointmentStatus.NoShow}>No Show</option>
//               <option value={AppointmentStatus.Rescheduled}>Rescheduled</option>
//               <option value={AppointmentStatus.Waiting}>Waiting</option>
//               <option value={AppointmentStatus.InProgress}>In Progress</option>
//             </select>
//           </div>
//         </div>
//
//         {/* View Type Selector */}
//         <div class="flex justify-between items-center pt-3 border-t border-gray-200">
//           <div class="text-sm text-gray-500">
//             {appointmentsQuery.isLoading
//               ? 'Loading appointments...'
//               : `${filteredAppointments().length} appointments found`}
//           </div>
//           <div class="inline-flex rounded-md shadow-sm">
//             <button
//               onClick={() => setViewMode('list')}
//               class={`px-4 py-2 text-sm font-medium rounded-l-md ${viewMode() === 'list'
//                 ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 } border`}
//             >
//               List
//             </button>
//             <button
//               onClick={() => setViewMode('agenda')}
//               class={`px-4 py-2 text-sm font-medium ${viewMode() === 'agenda'
//                 ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 } border-t border-b`}
//             >
//               Agenda
//             </button>
//             <button
//               onClick={() => setViewMode('calendar')}
//               class={`px-4 py-2 text-sm font-medium rounded-r-md ${viewMode() === 'calendar'
//                 ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 } border`}
//             >
//               Calendar
//             </button>
//           </div>
//         </div>
//       </div>
//
//       {/* Content Area */}
//       <Show when={!appointmentsQuery.isLoading} fallback={<LoadingState />}>
//         <Show when={!appointmentsQuery.isError} fallback={<ErrorState error={appointmentsQuery.error} />}>
//           <Show when={filteredAppointments().length > 0} fallback={<EmptyState />}>
//             {/* List View */}
//             <Show when={viewMode() === 'list'}>
//               <ListView filteredAppointments={filteredAppointments} handleViewDetails={handleViewDetails} />
//             </Show>
//
//             {/* Agenda View */}
//             <Show when={viewMode() === 'agenda'}>
//               <AgendaView handleViewDetails={handleViewDetails} appointmentsByDate={appointmentsByDate} />
//             </Show>
//
//             {/* Calendar View */}
//             <Show when={viewMode() === 'calendar'}>
//               <CalendarView handleViewDetails={handleViewDetails} getAppointmentsForDay={getAppointmentsForDay} />
//             </Show>
//           </Show>
//         </Show>
//       </Show>
//
//       {/* Appointment Details Modal */}
//       <Show when={showDetailsModal()}>
//         <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
//           <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
//             <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
//               <h3 class="text-lg font-medium text-gray-900">Appointment Details</h3>
//               <button
//                 onClick={() => setShowDetailsModal(false)}
//                 class="text-gray-400 hover:text-gray-500"
//               >
//                 <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <div class="px-6 py-4">
//               <Show when={selectedAppointment()}>
//                 {(appointment) => (
//                   <>
//                     <div class="flex items-center mb-4">
//                       <div class="flex-shrink-0 h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-lg font-medium">
//                         {getPatientInitials(getPatientName(appointment))}
//                       </div>
//                       <div class="ml-4">
//                         <h4 class="text-lg font-medium text-gray-900">{getPatientName(appointment)}</h4>
//                         <p class="text-sm text-gray-500">
//                           {appointment.patient?.email || appointment.expand?.patient?.email || 'No email available'}
//                         </p>
//                       </div>
//                     </div>
//
//                     <div class="grid grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <p class="text-sm font-medium text-gray-500">Date & Time</p>
//                         <p class="mt-1">{formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}</p>
//                       </div>
//                       <div>
//                         <p class="text-sm font-medium text-gray-500">Duration</p>
//                         <p class="mt-1">{appointment.duration || 30} minutes</p>
//                       </div>
//                       <div>
//                         <p class="text-sm font-medium text-gray-500">Type</p>
//                         <p class="mt-1 capitalize">{appointment.type || 'General'}</p>
//                       </div>
//                       <div>
//                         <p class="text-sm font-medium text-gray-500">Status</p>
//                         <p class="mt-1">
//                           <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
//                             ${getAppointmentStatusColor(appointment.status).bg} 
//                             ${getAppointmentStatusColor(appointment.status).text} 
//                             capitalize`}>
//                             {appointment.status}
//                           </span>
//                         </p>
//                       </div>
//                     </div>
//
//                     <div class="mb-4">
//                       <p class="text-sm font-medium text-gray-500 mb-1">Notes</p>
//                       <p class="text-sm text-gray-700 border rounded-md p-3 bg-gray-50 min-h-[80px]">
//                         {appointment.notes || 'No notes available for this appointment.'}
//                       </p>
//                     </div>
//
//                     {/* Status Update */}
//                     <div class="mb-4">
//                       <p class="text-sm font-medium text-gray-500 mb-2">Update Status</p>
//                       <div class="flex flex-wrap gap-2">
//                         <For each={['scheduled', 'inprogress', 'completed', 'cancelled', 'noshow'] as const}>
//                           {(status) => (
//                             <button
//                               class={`px-3 py-1 text-xs rounded-full border ${appointment.status === status
//                                 ? `${getAppointmentStatusColor(status).bg} ${getAppointmentStatusColor(status).text} border-transparent`
//                                 : 'border-gray-300 hover:bg-gray-50'
//                                 } capitalize`}
//                               onClick={() => handleStatusUpdate(appointment.id, status)}
//                               disabled={appointment.status === status || updateStatusMutation.isPending}
//                             >
//                               {status}
//                             </button>
//                           )}
//                         </For>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </Show>
//             </div>
//             <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
//               <button
//                 onClick={() => setShowDetailsModal(false)}
//                 class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
//               >
//                 Close
//               </button>
//               <div class="space-x-2">
//                 <button
//                   onClick={() => window.location.href = `/edit-appointment/${selectedAppointment()?.id}`}
//                   class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
//                 >
//                   Edit
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Show>
//     </div>
//   );
// }
//
// // Helper Components
// function LoadingState(): JSX.Element {
//   return (
//     <div class="bg-white shadow-md rounded-lg p-8 text-center">
//       <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//       <p class="text-gray-500">Loading appointments...</p>
//     </div>
//   );
// }
//
// function ErrorState(): JSX.Element {
//   return (
//     <div class="bg-white shadow-md rounded-lg p-8 text-center">
//       <svg class="h-12 w-12 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//       <h3 class="text-lg font-medium text-gray-900 mb-2">Unable to load appointments</h3>
//       <p class="text-sm text-gray-500 mb-4">There was an error retrieving the appointment data.</p>
//       <button
//         onClick={() => window.location.reload()}
//         class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//       >
//         Retry
//       </button>
//     </div>
//   );
//
// }
//
// function EmptyState(): JSX.Element {
//   return (
//     <div class="bg-white shadow-md rounded-lg p-8 text-center">
//       <div class="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
//         <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//         </svg>
//       </div>
//       <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
//       <p class="text-sm text-gray-500 mb-4">No appointments match your current filters.</p>
//       <div class="flex justify-center space-x-4">
//         <button
//           onClick={() => window.location.href = '/new-appointment'}
//           class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//         >
//           New Appointment
//         </button>
//         <button
//           onClick={() => {
//             setSearchQuery('');
//             setDateFilter('all');
//             setStatusFilter('all');
//           }}
//           class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//         >
//           Clear Filters
//         </button>
//       </div>
//     </div>
//   );
// }
//
//
// export function getPatientInitials(name: string): string {
//   try {
//     return name
//       .split(' ')
//       .map(part => part[0])
//       .join('')
//       .toUpperCase()
//       .substring(0, 2);
//   } catch (e) {
//     return 'UN';
//   }
// }
//
//
//
// // Export analytics components for potential reuse
// export function AppointmentStats() {
//   // Query for appointments stats
//   const appointmentsStatsQuery = useQuery(() => ({
//     queryKey: ['appointments', 'stats'],
//     queryFn: () => dentalOps.appointments.fetchAppointmentsStats(),
//     staleTime: 15 * 60 * 1000,
//   }));
//
//   return (
//     <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//       <StatCard
//         title="Total Appointments"
//         value={appointmentsStatsQuery.data?.total || 0}
//         icon="📊"
//         color="bg-indigo-500"
//       />
//       <StatCard
//         title="Completed"
//         value={appointmentsStatsQuery.data?.completed || 0}
//         icon="✅"
//         color="bg-green-500"
//       />
//       <StatCard
//         title="Cancelled"
//         value={appointmentsStatsQuery.data?.cancelled || 0}
//         icon="❌"
//         color="bg-red-500"
//       />
//       <StatCard
//         title="No-Shows"
//         value={appointmentsStatsQuery.data?.noShows || 0}
//         icon="⚠️"
//         color="bg-yellow-500"
//       />
//     </div>
//   );
// }
//
// function StatCard(props: { title: string; value: number | string; icon?: string; color: string }): JSX.Element {
//   return (
//     <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300">
//       <div class="p-5">
//         <div class="flex items-center">
//           <div
//             class={`flex-shrink-0 h-12 w-12 rounded-full ${props.color} flex items-center justify-center`}
//           >
//             <span class="text-white text-xl">{props.icon || props.title.charAt(0)}</span>
//           </div>
//           <div class="ml-4">
//             <p class="text-sm font-medium text-gray-500 truncate">{props.title}</p>
//             <p class="text-2xl font-semibold text-gray-900">{props.value}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// export default AppointmentsPage;






