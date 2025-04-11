import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, createSignal, Match, Show, Switch } from 'solid-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query'
import { dentalOps } from 'src/operations'
import { Appointment } from 'src/types/appointments'
import ListView from 'src/pages/appointments/ListView'
import AgendaView from 'src/pages/appointments/AgendaView'
import CalendarView from 'src/pages/appointments/CalendarView'
import AppointmentDetails from 'src/pages/appointments/AppointmentDetails'
import ErrorState from 'src/pages/appointments/ErrorState'
import EmptyState from 'src/pages/appointments/EmptyState'
import AppointmentStats from 'src/pages/appointments/AppointmentStatus'
import LoadingState from 'src/pages/appointments/LoadingState'
import FilterSearch from 'src/pages/appointments/FilterSearch'
import ViewTypeSelector from 'src/pages/appointments/ViewTypeSelector'
import { actions, appointmentsStore as appointmentsStore, selectors, StatusFilter } from 'src/pages/appointments/appointmentStore'

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})


function AppointmentsPage() {
  // const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);
  // const [showDetailsModal, setShowDetailsModal] = createSignal(false);

  const queryClient = useQueryClient();


  // Fetch appointments data
  const appointmentsQuery = useQuery(() => ({
    queryKey: ['appointments', 'all'],
    queryFn: () => dentalOps.appointments.getAll(),
    staleTime: 5 * 60 * 1000,
  }));

  // Update appointment status mutation
  const updateStatusMutation = useMutation(() => ({
    mutationFn: (params: { id: string, status: StatusFilter }) => dentalOps.appointments.updateAppointmentStatus(params.id, params.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      actions.closeModal();
    }
  }));


  // Sync query results with store
  createEffect(() => {
    if (appointmentsQuery.data) {
      actions.setAppointments(appointmentsQuery.data.items || []);
      actions.setLoading(false);
    }

    if (appointmentsQuery.isError) {
      actions.setError(appointmentsQuery.error);
    }
  });

  // Handler for updating appointment status
  const handleStatusUpdate = (appointmentId: string, newStatus: StatusFilter) => {
    if (newStatus !== 'all') {
      updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
    }
  };




  // Handler for opening appointment details
  const handleViewDetails = (appointment: Appointment) => {
    actions.selectAppointment(appointment);
    actions.setShowDetailsModal(true);
  };

  return (
    <div class="max-w-7xl mx-auto px-4 py-6">
      <AppointmentStats />

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Appointments
        </h1>
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

      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <FilterSearch />
        <ViewTypeSelector appointmentsQuery={appointmentsQuery} />
      </div>

      <Show when={!appointmentsStore.isLoading} fallback={<LoadingState />}>
        <Show when={!appointmentsStore.isError} fallback={<ErrorState error={appointmentsStore.error} />}>
          <Show when={selectors.filteredAppointments().length > 0} fallback={<EmptyState />}>
            <Switch>
              <Match when={appointmentsStore.viewMode === 'list'}>
                <ListView />
              </Match>
              <Match when={appointmentsStore.viewMode === 'agenda'}>
                <AgendaView />
              </Match>
              <Match when={appointmentsStore.viewMode === 'calendar'}>
                <CalendarView />
              </Match>
            </Switch>
          </Show>
        </Show>
      </Show>

      <Show when={appointmentsStore.showDetailsModal}>
        <AppointmentDetails
          appointment={appointmentsStore.selectedAppointment}
          closeModal={actions.closeModal}
          onStatusUpdate={handleStatusUpdate}
          updating={updateStatusMutation.isLoading}
        />
      </Show>
    </div>
  );

  return (
    <div class="max-w-7xl mx-auto px-4 py-6">
      <AppointmentStats />
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
        <FilterSearch />

        {/* View Type Selector */}
        <ViewTypeSelector filteredAppointments={selectors.filteredAppointments} appointmentsQuery={appointmentsQuery} />
      </div>

      {/* Content Area */}
      <Show when={!appointmentsQuery.isLoading} fallback={<LoadingState />}>
        <Show when={!appointmentsQuery.isError} fallback={<ErrorState error={appointmentsQuery.error} />}>
          <Show when={selectors.filteredAppointments.length > 0} fallback={<EmptyState setSearchQuery={actions.setSearchQuery} setDateFilter={actions.setDateFilter} setStatusFilter={actions.setStatusFilter} />}>
            {/* List View */}
            <Show when={appointmentsStore.viewMode === 'list'}>
              <ListView filteredAppointments={selectors.filteredAppointments} handleViewDetails={handleViewDetails} />
            </Show>

            {/* Agenda View */}
            <Show when={appointmentsStore.viewMode === 'agenda'}>
              <AgendaView handleViewDetails={handleViewDetails} appointmentsByDate={selectors.appointmentsByDate} />
            </Show>

            {/* Calendar View */}
            <Show when={appointmentsStore.viewMode === 'calendar'}>
              <CalendarView handleViewDetails={handleViewDetails} getAppointmentsForDay={selectors.getAppointmentsForDay} />
            </Show>
          </Show>
        </Show>
      </Show>

      {/* Appointment Details Modal */}

      <Show when={appointmentsStore.showDetailsModal}>
        {/* <AppointmentDetails selectedAppointment={appointmentsStore.selectedAppointment} setShowDetailsModal={setShowDetailsModal} handleStatusUpdate={handleStatusUpdate} updateStatusMutation={updateStatusMutation} /> */}
        <AppointmentDetails handleStatusUpdate={handleStatusUpdate} updateStatusMutation={updateStatusMutation} />
      </Show>
    </div>
  );
}


export default AppointmentsPage;
