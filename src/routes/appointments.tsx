import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, For, Show, JSX } from 'solid-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query'
import { dentalOps } from 'src/operations'
import { format, isToday, isThisWeek, isThisMonth, parseISO, addDays } from 'date-fns'

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})

// Status badge colors
const STATUS_COLORS = {
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  noshow: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  inprogress: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
}

// Type definitions
type Appointment = {
  id: string;
  dateTime: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'noshow' | 'inprogress';
  duration: number;
  notes?: string;
  patient: any;
  expand?: {
    patient?: any;
  };
}

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'noshow' | 'inprogress';
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
    queryFn: () => dentalOps.appointments.getAll,
    staleTime: 5 * 60 * 1000,
  }));

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: dentalOps.appointments.updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowDetailsModal(false);
    }
  });

  // Filter appointments based on search and filters
  const filteredAppointments = () => {
    let appointments = appointmentsQuery.data?.items || [];

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
        const aptDate = parseISO(apt.dateTime);
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
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  };

  // Group appointments by date for agenda view
  const appointmentsByDate = () => {
    const grouped = {};
    filteredAppointments().forEach(apt => {
      const dateKey = format(parseISO(apt.dateTime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  };

  // Helper function to get patient name from appointment object
  function getPatientName(appointment) {
    if (appointment.patient?.name) {
      return appointment.patient.name;
    } else if (appointment.expand?.patient?.name) {
      return appointment.expand.patient.name;
    } else if (appointment.patientName) {
      return appointment.patientName;
    }
    return "Unknown Patient";
  }

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
              <option value="scheduled">Scheduled</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="noshow">No Show</option>
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
              <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <For each={filteredAppointments()}>
                        {(appointment) => (
                          <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                  {getPatientInitials(getPatientName(appointment))}
                                </div>
                                <div class="ml-4">
                                  <div class="text-sm font-medium text-gray-900">{getPatientName(appointment)}</div>
                                  <div class="text-sm text-gray-500">
                                    {appointment.patient?.phone || appointment.expand?.patient?.phone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-900">{formatDate(appointment.dateTime)}</div>
                              <div class="text-sm text-gray-500">{formatTime(appointment.dateTime)}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 capitalize">
                                {appointment.type || 'General'}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[appointment.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[appointment.status]?.text || 'text-gray-800'} capitalize`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.duration || 30} min
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(appointment)}
                                class="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </Show>

            {/* Agenda View */}
            <Show when={viewMode() === 'agenda'}>
              <div class="space-y-6">
                <For each={Object.entries(appointmentsByDate())}>
                  {([dateStr, appointments]) => (
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                      <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          {formatDisplayDate(dateStr)}
                        </h3>
                      </div>
                      <ul class="divide-y divide-gray-200">
                        <For each={appointments as Appointment[]}>
                          {(appointment) => (
                            <li class="px-6 py-4 hover:bg-gray-50 transition-colors">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                  <div class={`flex-shrink-0 w-2 h-12 ${STATUS_COLORS[appointment.status]?.dot || 'bg-gray-300'} mr-4`}></div>
                                  <div>
                                    <p class="text-sm font-medium text-gray-900">{formatTime(appointment.dateTime)} - {formatEndTime(appointment.dateTime, appointment.duration || 30)}</p>
                                    <p class="text-md font-semibold text-gray-900">{getPatientName(appointment)}</p>
                                    <div class="flex items-center mt-1">
                                      <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize mr-2">
                                        {appointment.type || 'General'}
                                      </span>
                                      <span class={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[appointment.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[appointment.status]?.text || 'text-gray-800'} capitalize`}>
                                        {appointment.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div class="flex space-x-2">
                                  <button
                                    onClick={() => handleViewDetails(appointment)}
                                    class="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded"
                                  >
                                    Details
                                  </button>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div class="mt-2 ml-6 text-sm text-gray-500 border-l-2 border-gray-200 pl-4">
                                  {appointment.notes}
                                </div>
                              )}
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            {/* Calendar View */}
            <Show when={viewMode() === 'calendar'}>
              <div class="bg-white shadow-md rounded-lg p-4">
                <div class="mb-4 text-center">
                  <p class="text-lg font-medium text-gray-900">
                    Calendar view placeholder - Would integrate with a full calendar component
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    This would normally display a fully interactive calendar with appointment slots
                  </p>
                </div>
                <div class="grid grid-cols-7 gap-2 text-center mb-2">
                  <For each={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}>
                    {(day) => <div class="py-2 bg-gray-50 font-medium">{day}</div>}
                  </For>
                </div>
                <div class="grid grid-cols-7 gap-2 min-h-[400px]">
                  <For each={generateCalendarDays()}>
                    {(day) => (
                      <div class={`border rounded-md p-1 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} min-h-[80px]`}>
                        <div class={`text-right mb-1 ${day.isToday ? 'bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''}`}>
                          {day.day}
                        </div>
                        <div class="space-y-1">
                          <For each={getAppointmentsForDay(day.fullDate)}>
                            {(appt: Appointment) => (
                              <div
                                class={`text-xs p-1 rounded truncate cursor-pointer ${STATUS_COLORS[appt.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[appt.status]?.text || 'text-gray-800'}`}
                                onClick={() => handleViewDetails(appt)}
                              >
                                {formatTime(appt.dateTime)} - {getPatientName(appt)}
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
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
                          <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[appointment.status]?.bg} ${STATUS_COLORS[appointment.status]?.text} capitalize`}>
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
                                ? `${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} border-transparent`
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

// Helper formatting functions
function formatDate(dateTimeStr: string): string {
  try {
    return format(parseISO(dateTimeStr), 'EEE, MMM d, yyyy');
  } catch (e) {
    return 'Invalid date';
  }
}

function formatDisplayDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (isToday(date)) {
      return 'Today, ' + format(date, 'MMMM d, yyyy');
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow, ' + format(date, 'MMMM d, yyyy');
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  } catch (e) {
    return 'Invalid date';
  }
}

function formatTime(dateTimeStr: string): string {
  try {
    return format(parseISO(dateTimeStr), 'h:mm a');
  } catch (e) {
    return 'Invalid time';
  }
}

function formatEndTime(dateTimeStr: string, durationMinutes: number): string {
  try {
    const startTime = parseISO(dateTimeStr);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    return format(endTime, 'h:mm a');
  } catch (e) {
    return 'Invalid time';
  }
}

function getPatientInitials(name: string): string {
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

// Calendar helper functions
function generateCalendarDays() {
  // In a real implementation, this would generate the calendar days for the current month view
  // This is a simplified placeholder that shows a week
  const today = new Date();
  const days = [];

  // Start with the previous Sunday to create a full week
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay());

  // Generate 28 days (4 weeks) for demo purposes
  for (let i = 0; i < 28; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    days.push({
      day: currentDate.getDate(),
      fullDate: format(currentDate, 'yyyy-MM-dd'),
      isCurrentMonth: currentDate.getMonth() === today.getMonth(),
      isToday: isToday(currentDate)
    });
  }

  return days;
}

function getAppointmentsForDay(dateStr: string) {
  // This would filter appointments based on the date
  // For now, return a subset of appointments for demo purposes
  const appointments = appointmentsQuery.data?.items || [];
  return appointments.filter(apt => {
    try {
      return format(parseISO(apt.dateTime), 'yyyy-MM-dd') === dateStr;
    } catch (e) {
      return false;
    }
  });
}

// Export analytics components for potential reuse
export function AppointmentStats() {
  // Query for appointments stats
  const appointmentsStatsQuery = useQuery(() => ({
    queryKey: ['appointments', 'stats'],
    queryFn: dentalOps.appointments.fetchAppointmentsStats,
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
