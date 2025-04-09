import { createSignal, For, Show } from 'solid-js';
import { useQuery } from '@tanstack/solid-query';
import { dentalOps } from 'src/operations';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subMonths,
  addMonths,
  parseISO,
  isEqual,
  isSameMonth,
  isToday
} from 'date-fns';

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

type CalendarProps = {
  onAppointmentClick?: (appointment: Appointment) => void;
};

export function AppointmentsCalendar(props: CalendarProps) {
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(new Date());

  // Query for all appointments - in a real app, we would filter by month range
  const appointmentsQuery = useQuery(() => ({
    queryKey: ['appointments', 'calendar', format(currentMonth(), 'yyyy-MM')],
    queryFn: () => dentalOps.appointments.fetchAppointmentsByMonth({
      year: currentMonth().getFullYear(),
      month: currentMonth().getMonth() + 1 // JavaScript months are 0-indexed
    }),
    staleTime: 5 * 60 * 1000,
  }));

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth(), 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth(), 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Generate the calendar days grid
  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth());
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }

    return rows;
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    if (!appointmentsQuery.data?.items) return [];

    const dayStr = format(day, 'yyyy-MM-dd');

    return appointmentsQuery.data.items.filter(apt => {
      try {
        return format(parseISO(apt.dateTime), 'yyyy-MM-dd') === dayStr;
      } catch (e) {
        return false;
      }
    });
  };

  // Format time from date string
  const formatTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'h:mm a');
    } catch (e) {
      return 'Invalid time';
    }
  };

  // Get patient name from appointment
  const getPatientName = (appointment) => {
    if (appointment.patient?.name) {
      return appointment.patient.name;
    } else if (appointment.expand?.patient?.name) {
      return appointment.expand.patient.name;
    } else if (appointment.patientName) {
      return appointment.patientName;
    }
    return "Unknown Patient";
  };

  // Get status color for appointment
  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      noshow: 'bg-yellow-100 text-yellow-800',
      inprogress: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">
          {format(currentMonth(), 'MMMM yyyy')}
        </h2>
        <div class="flex space-x-2">
          <button
            onClick={goToToday}
            class="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            class="p-1 rounded-md hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            class="p-1 rounded-md hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      <Show when={!appointmentsQuery.isLoading} fallback={
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading calendar...</p>
        </div>
      }>
        {/* Day Headers */}
        <div class="grid grid-cols-7 border-b border-gray-200">
          <For each={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}>
            {(day) => (
              <div class="py-2 text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            )}
          </For>
        </div>

        {/* Calendar Grid */}
        <div class="grid grid-cols-7 border-b border-gray-200">
          <For each={calendarDays()}>
            {(week) => (
              <For each={week}>
                {(day) => {
                  const dayAppts = getAppointmentsForDay(day);
                  const formattedDate = format(day, 'd');
                  const isSelectedMonth = isSameMonth(day, currentMonth());
                  const isSelectedDay = isEqual(day, selectedDate());
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      class={`min-h-[100px] p-1 border-r border-b border-gray-200 ${!isSelectedMonth ? 'bg-gray-50' : 'bg-white'
                        } ${isCurrentDay ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div class="flex justify-between items-center mb-1">
                        <div
                          class={`h-6 w-6 flex items-center justify-center text-sm rounded-full ${isSelectedDay
                            ? 'bg-indigo-600 text-white'
                            : isCurrentDay
                              ? 'bg-blue-100 text-blue-800'
                              : 'text-gray-700'
                            }`}
                        >
                          {formattedDate}
                        </div>
                        {dayAppts.length > 0 && (
                          <span class="text-xs font-medium bg-gray-100 text-gray-800 rounded-full px-1.5 py-0.5">
                            {dayAppts.length}
                          </span>
                        )}
                      </div>
                      <div class="space-y-1 overflow-y-auto max-h-[70px]">
                        <For each={dayAppts.slice(0, 3)}>
                          {(appt: Appointment) => (
                            <div
                              class={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(appt.status)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (props.onAppointmentClick) {
                                  props.onAppointmentClick(appt);
                                }
                              }}
                            >
                              {formatTime(appt.dateTime)} - {getPatientName(appt).split(' ')[0]}
                            </div>
                          )}
                        </For>
                        {dayAppts.length > 3 && (
                          <div class="text-xs text-center text-gray-500">
                            +{dayAppts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              </For>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

// Daily agenda component that complements the calendar view
export function DailyAgenda(props: { selectedDate: Date; onAppointmentClick?: (appointment: Appointment) => void }) {
  // Query for appointments on selected date
  const dailyAppointmentsQuery = useQuery(() => ({
    queryKey: ['appointments', 'day', format(props.selectedDate, 'yyyy-MM-dd')],
    queryFn: () => dentalOps.appointments.fetchAppointmentsByDay({
      date: format(props.selectedDate, 'yyyy-MM-dd')
    }),
    staleTime: 5 * 60 * 1000,
  }));

  // Format time from date string
  const formatTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'h:mm a');
    } catch (e) {
      return 'Invalid time';
    }
  };

  // Get end time based on start time and duration
  const formatEndTime = (dateTimeStr: string, durationMinutes: number) => {
    try {
      const startTime = parseISO(dateTimeStr);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      return format(endTime, 'h:mm a');
    } catch (e) {
      return 'Invalid time';
    }
  };

  // Get patient name from appointment
  const getPatientName = (appointment) => {
    if (appointment.patient?.name) {
      return appointment.patient.name;
    } else if (appointment.expand?.patient?.name) {
      return appointment.expand.patient.name;
    } else if (appointment.patientName) {
      return appointment.patientName;
    }
    return "Unknown Patient";
  };

  // Get status color for appointment
  const getStatusColor = (status) => {
    const colors = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
      noshow: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      inprogress: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    };
    return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' };
  };

  return (
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">
          {format(props.selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>

      <Show when={!dailyAppointmentsQuery.isLoading} fallback={
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      }>
        <Show when={dailyAppointmentsQuery.data?.items?.length > 0} fallback={
          <div class="p-8 text-center">
            <p class="text-gray-500">No appointments scheduled for this day.</p>
          </div>
        }>
          <ul class="divide-y divide-gray-200">
            <For each={dailyAppointmentsQuery.data?.items}>
              {(appointment) => {
                const statusColor = getStatusColor(appointment.status);

                return (
                  <li
                    class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (props.onAppointmentClick) {
                        props.onAppointmentClick(appointment);
                      }
                    }}
                  >
                    <div class="flex items-center">
                      <div class={`flex-shrink-0 w-1 h-12 ${statusColor.dot} mr-4`}></div>
                      <div class="flex-1">
                        <div class="flex justify-between">
                          <p class="text-sm font-medium text-gray-900">
                            {formatTime(appointment.dateTime)} - {formatEndTime(appointment.dateTime, appointment.duration || 30)}
                          </p>
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} capitalize`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p class="text-sm font-semibold text-gray-900 mt-1">{getPatientName(appointment)}</p>
                        <p class="text-xs text-gray-500 mt-1 capitalize">{appointment.type || 'General appointment'}</p>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div class="mt-2 ml-5 text-xs text-gray-500 border-l-2 border-gray-200 pl-3">
                        {appointment.notes.length > 100 ? `${appointment.notes.substring(0, 100)}...` : appointment.notes}
                      </div>
                    )}
                  </li>
                );
              }}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  );
}
