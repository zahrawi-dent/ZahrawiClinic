import { format, isThisMonth, isThisWeek, isToday, parseISO } from "date-fns";
import { createStore } from "solid-js/store";
import { Appointment, AppointmentStatus } from "src/types/appointments";

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
export type StatusFilter = 'all' | AppointmentStatus
//
type ViewMode = 'list' | 'calendar' | 'agenda';
type DateRange = { start: string; end: string };

type initialState = {
  searchQuery: string;
  dateFilter: DateFilter;
  statusFilter: StatusFilter;
  customDateRange: DateRange;
  viewMode: ViewMode;
  selectedAppointment: Appointment | null;
  showDetailsModal: boolean;
  // Other state properties
  appointments: Appointment[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const initialState: initialState = {
  // Initial State
  // UI State
  searchQuery: '',
  dateFilter: 'all',
  statusFilter: 'all',
  customDateRange: { start: '', end: '' },
  viewMode: 'list',
  selectedAppointment: null,
  showDetailsModal: false,
  // Other state properties


  // Data state
  appointments: [],
  isLoading: true,
  isError: false,
  error: null,
}

const [state, setState] = createStore<initialState>(initialState);



// Create actions to update the store
export const actions = {
  // Filter actions
  setSearchQuery: (query: string) => setState("searchQuery", query),
  setDateFilter: (filter: DateFilter) => setState("dateFilter", filter),
  setStatusFilter: (status: StatusFilter) => setState("statusFilter", status),
  setCustomDateRange: (range: DateRange) => setState("customDateRange", range),

  // View actions
  setViewMode: (mode: ViewMode) => setState("viewMode", mode),
  setShowDetailsModal: (show: boolean) => setState("showDetailsModal", show),

  // Appointment actions
  setAppointments: (appointments: Appointment[]) => setState("appointments", appointments),
  setLoading: (isLoading: boolean) => setState("isLoading", isLoading),
  setError: (error: Error) => setState({
    isError: !!error,
    error
  }),

  // Modal actions
  selectAppointment: (appointment: Appointment) => setState({
    selectedAppointment: appointment,
    showDetailsModal: true
  }),
  closeModal: () => setState("showDetailsModal", false),

  // Reset all filters
  resetFilters: () => setState({
    searchQuery: '',
    dateFilter: 'all',
    statusFilter: 'all',
    customDateRange: { start: '', end: '' }
  }),

  // Update appointment status
  updateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => {
    setState("appointments", (appointments): Appointment[] =>
      appointments.map((apt: Appointment) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );
  }
};

// Create derived state (like computed properties)
export const selectors = {
  // Filtered appointments based on current filters
  filteredAppointments: () => {
    if (!state.appointments.length) return [];

    let appointments = [...state.appointments];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      appointments = appointments.filter(apt => {
        const patientName = getPatientName(apt).toLowerCase();
        const type = apt.type?.toLowerCase() || '';
        const notes = apt.notes?.toLowerCase() || '';
        return patientName.includes(query) || type.includes(query) || notes.includes(query);
      });
    }

    // Apply date filter
    if (state.dateFilter !== 'all') {
      appointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.date);
        switch (state.dateFilter) {
          case 'today': return isToday(aptDate);
          case 'week': return isThisWeek(aptDate);
          case 'month': return isThisMonth(aptDate);
          case 'custom':
            if (state.customDateRange.start && state.customDateRange.end) {
              const start = parseISO(state.customDateRange.start);
              const end = parseISO(state.customDateRange.end);
              return aptDate >= start && aptDate <= end;
            }
            return true;
          default: return true;
        }
      });
    }

    // Apply status filter
    if (state.statusFilter !== 'all') {
      appointments = appointments.filter(apt => apt.status === state.statusFilter);
    }

    // Sort by date
    return appointments.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  // Appointments grouped by date for agenda view
  appointmentsByDate: () => {
    const grouped = {};
    selectors.filteredAppointments().forEach(apt => {
      const dateKey = format(parseISO(apt.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  },

  // Get appointments for a specific day (calendar view)
  getAppointmentsForDay: (dateStr: string) => {
    if (!state.appointments.length) return [];

    return state.appointments.filter(apt => {
      try {
        return format(parseISO(apt.date), 'yyyy-MM-dd') === dateStr;
      } catch (e) {
        return false;
      }
    });
  }
};

// Helper functions
function getPatientName(appointment: Appointment): string {
  const patient = appointment.expand?.patient;
  if (patient) {
    return `${patient.firstName} ${patient.lastName}`;
  }
  return 'Loading Patient...';
}

export { state as appointmentsStore, getPatientName };
