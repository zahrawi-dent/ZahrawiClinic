import { 
  type Component, 
  createSignal, 
  createMemo, 
  For, 
  Show, 
  onMount,
  createEffect 
} from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

// ===== TYPES =====
interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  dentist: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  duration: number; // in minutes
}

interface CalendarView {
  type: 'daily' | 'weekly' | 'monthly';
  label: string;
  icon: Component;
}

// ===== ICONS =====
const CalendarIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const PlusIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const UserIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// ===== MOCK DATA =====
const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: 'P001',
    date: '2024-01-15',
    time: '09:00',
    endTime: '10:00',
    type: 'Dental Cleaning',
    status: 'scheduled',
    dentist: 'Dr. Smith',
    notes: 'Regular cleaning, patient prefers morning appointments',
    priority: 'medium',
    duration: 60
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: 'P002',
    date: '2024-01-15',
    time: '10:30',
    endTime: '12:00',
    type: 'Root Canal',
    status: 'scheduled',
    dentist: 'Dr. Johnson',
    notes: 'Follow-up from previous consultation',
    priority: 'high',
    duration: 90
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    patientId: 'P003',
    date: '2024-01-15',
    time: '14:00',
    endTime: '15:30',
    type: 'Crown Placement',
    status: 'scheduled',
    dentist: 'Dr. Williams',
    notes: 'Final crown placement',
    priority: 'medium',
    duration: 90
  },
  {
    id: '4',
    patientName: 'David Wilson',
    patientId: 'P004',
    date: '2024-01-16',
    time: '08:00',
    endTime: '09:00',
    type: 'Emergency',
    status: 'scheduled',
    dentist: 'Dr. Smith',
    notes: 'Severe toothache, urgent care needed',
    priority: 'high',
    duration: 60
  },
  {
    id: '5',
    patientName: 'Lisa Brown',
    patientId: 'P005',
    date: '2024-01-16',
    time: '11:00',
    endTime: '12:00',
    type: 'Consultation',
    status: 'scheduled',
    dentist: 'Dr. Johnson',
    notes: 'New patient consultation',
    priority: 'low',
    duration: 60
  },
  {
    id: '6',
    patientName: 'Robert Taylor',
    patientId: 'P006',
    date: '2024-01-17',
    time: '13:00',
    endTime: '14:30',
    type: 'Wisdom Tooth Extraction',
    status: 'scheduled',
    dentist: 'Dr. Williams',
    notes: 'Surgical extraction required',
    priority: 'high',
    duration: 90
  }
];

// ===== UTILITY FUNCTIONS =====
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const getTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const getWeekDays = (startDate: Date) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  // Add previous month's days
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false });
  }
  
  // Add current month's days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({ date, isCurrentMonth: true });
  }
  
  // Add next month's days
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({ date, isCurrentMonth: false });
  }
  
  return days;
};

// ===== COMPONENTS =====
const AppointmentCard = (props: { 
  appointment: Appointment; 
  onClick: () => void;
  isCompact?: boolean;
}) => {
  const getStatusColor = () => {
    switch (props.appointment.status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = () => {
    switch (props.appointment.priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  if (props.isCompact) {
    return (
      <button
        onClick={props.onClick}
        class={`w-full p-2 text-left bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${getPriorityColor()}`}
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{props.appointment.patientName}</p>
            <p class="text-sm text-gray-600 truncate">{props.appointment.type}</p>
            <p class="text-xs text-gray-500">{formatTime(props.appointment.time)}</p>
          </div>
          <div class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {props.appointment.status}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={props.onClick}
      class={`w-full p-3 text-left bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${getPriorityColor()}`}
    >
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-gray-900">{props.appointment.patientName}</h4>
          <div class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {props.appointment.status}
          </div>
        </div>
        
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <StethoscopeIcon />
            <span>{props.appointment.type}</span>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon />
            <span>{props.appointment.dentist}</span>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <ClockIcon />
            <span>{formatTime(props.appointment.time)} - {formatTime(props.appointment.endTime)}</span>
          </div>
        </div>
        
        {props.appointment.notes && (
          <p class="text-xs text-gray-500 truncate">{props.appointment.notes}</p>
        )}
      </div>
    </button>
  );
};

const DailyView = (props: { 
  date: Date; 
  appointments: Appointment[]; 
  onAppointmentClick: (appointment: Appointment) => void;
}) => {
  const timeSlots = getTimeSlots();
  const dayAppointments = createMemo(() => 
    props.appointments.filter(apt => 
      apt.date === props.date.toISOString().split('T')[0]
    )
  );

  const getAppointmentsForTimeSlot = (timeSlot: string) => {
    return dayAppointments().filter(apt => apt.time === timeSlot);
  };

  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {props.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
      </div>
      
      <div class="overflow-y-auto max-h-96">
        <div class="grid grid-cols-1 gap-2 p-4">
          <For each={timeSlots}>
            {(timeSlot) => {
              const appointments = getAppointmentsForTimeSlot(timeSlot);
              return (
                <div class="border-b border-gray-100 pb-2 last:border-b-0">
                  <div class="flex items-start gap-4">
                    <div class="w-16 flex-shrink-0 pt-2">
                      <span class="text-sm font-medium text-gray-600">{formatTime(timeSlot)}</span>
                    </div>
                    <div class="flex-1 space-y-2">
                      <For each={appointments}>
                        {(appointment) => (
                          <AppointmentCard
                            appointment={appointment}
                            onClick={() => props.onAppointmentClick(appointment)}
                          />
                        )}
                      </For>
                      {appointments.length === 0 && (
                        <div class="h-12 flex items-center justify-center text-gray-400 text-sm">
                          No appointments
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

const WeeklyView = (props: { 
  startDate: Date; 
  appointments: Appointment[]; 
  onAppointmentClick: (appointment: Appointment) => void;
}) => {
  const weekDays = getWeekDays(props.startDate);
  
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return props.appointments.filter(apt => apt.date === dateStr);
  };

  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>
      </div>
      
      <div class="grid grid-cols-7 gap-1 p-4">
        <For each={weekDays}>
          {(day, index) => {
            const appointments = getAppointmentsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div class={`min-h-32 p-2 ${isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} rounded-lg`}>
                <div class="text-center mb-2">
                  <div class={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div class={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
                
                <div class="space-y-1">
                  <For each={appointments.slice(0, 3)}>
                    {(appointment) => (
                      <AppointmentCard
                        appointment={appointment}
                        onClick={() => props.onAppointmentClick(appointment)}
                        isCompact={true}
                      />
                    )}
                  </For>
                  
                  {appointments.length > 3 && (
                    <div class="text-xs text-gray-500 text-center">
                      +{appointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

const MonthlyView = (props: { 
  year: number; 
  month: number; 
  appointments: Appointment[]; 
  onAppointmentClick: (appointment: Appointment) => void;
}) => {
  const monthDays = getMonthDays(props.year, props.month);
  const monthName = new Date(props.year, props.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return props.appointments.filter(apt => apt.date === dateStr);
  };

  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">{monthName}</h3>
      </div>
      
      <div class="p-4">
        <div class="grid grid-cols-7 gap-1">
          {/* Day headers */}
          <For each={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}>
            {(day) => (
              <div class="text-center p-2 text-sm font-medium text-gray-600">
                {day}
              </div>
            )}
          </For>
          
          {/* Calendar days */}
          <For each={monthDays}>
            {(dayData) => {
              const appointments = getAppointmentsForDate(dayData.date);
              const isToday = dayData.date.toDateString() === new Date().toDateString();
              
              return (
                <div class={`min-h-24 p-1 ${isToday ? 'bg-blue-50 border border-blue-200' : ''} ${!dayData.isCurrentMonth ? 'bg-gray-100' : 'bg-white'} rounded-lg`}>
                  <div class="text-right mb-1">
                    <span class={`text-sm ${isToday ? 'text-blue-600 font-bold' : dayData.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                      {dayData.date.getDate()}
                    </span>
                  </div>
                  
                  <div class="space-y-1">
                    <For each={appointments.slice(0, 2)}>
                      {(appointment) => (
                        <div
                          onClick={() => props.onAppointmentClick(appointment)}
                          class="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors truncate"
                        >
                          {appointment.patientName}
                        </div>
                      )}
                    </For>
                    
                    {appointments.length > 2 && (
                      <div class="text-xs text-gray-500 text-center">
                        +{appointments.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
interface AppointmentCalendarProps {
  appointments?: Appointment[];
  class?: string;
}

const AppointmentCalendar: Component<AppointmentCalendarProps> = (props) => {
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = createSignal<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = createSignal(new Date());
  const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);

  const appointments = createMemo(() => props.appointments || mockAppointments);

  const views: CalendarView[] = [
    { type: 'daily', label: 'Daily', icon: ClockIcon },
    { type: 'weekly', label: 'Weekly', icon: CalendarIcon },
    { type: 'monthly', label: 'Monthly', icon: CalendarIcon }
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate());
    
    switch (currentView()) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    navigate({ to: `/appointments/${appointment.id}` });
  };

  const handleNewAppointment = () => {
    navigate({ to: '/appointments/new' });
  };

  const getCurrentPeriodLabel = () => {
    switch (currentView()) {
      case 'daily':
        return currentDate().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'weekly':
        const weekStart = new Date(currentDate());
        weekStart.setDate(currentDate().getDate() - currentDate().getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'monthly':
        return currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div class={`space-y-6 ${props.class || ''}`}>
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
          <p class="text-gray-600">Manage and view patient appointments</p>
        </div>
        
        <button
          onClick={handleNewAppointment}
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Controls */}
      <div class="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center gap-4">
          {/* View Toggle */}
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <For each={views}>
              {(view) => (
                <button
                  onClick={() => setCurrentView(view.type)}
                  class={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView() === view.type
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <view.icon />
                  <span>{view.label}</span>
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="flex items-center gap-4">
          {/* Date Navigation */}
          <div class="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            
            <div class="text-center">
              <div class="text-lg font-semibold text-gray-900">{getCurrentPeriodLabel()}</div>
            </div>
            
            <button
              onClick={() => navigateDate('next')}
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <Show when={currentView() === 'daily'}>
        <DailyView
          date={currentDate()}
          appointments={appointments()}
          onAppointmentClick={handleAppointmentClick}
        />
      </Show>

      <Show when={currentView() === 'weekly'}>
        <WeeklyView
          startDate={(() => {
            const date = new Date(currentDate());
            date.setDate(currentDate().getDate() - currentDate().getDay());
            return date;
          })()}
          appointments={appointments()}
          onAppointmentClick={handleAppointmentClick}
        />
      </Show>

      <Show when={currentView() === 'monthly'}>
        <MonthlyView
          year={currentDate().getFullYear()}
          month={currentDate().getMonth()}
          appointments={appointments()}
          onAppointmentClick={handleAppointmentClick}
        />
      </Show>

      {/* Quick Stats */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p class="text-2xl font-bold text-gray-900">
                {appointments().filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
            <CalendarIcon />
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-yellow-600">
                {appointments().filter(apt => apt.status === 'scheduled').length}
              </p>
            </div>
            <ClockIcon />
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">In Progress</p>
              <p class="text-2xl font-bold text-blue-600">
                {appointments().filter(apt => apt.status === 'in-progress').length}
              </p>
            </div>
            <ClockIcon />
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-green-600">
                {appointments().filter(apt => apt.status === 'completed').length}
              </p>
            </div>
            <CalendarIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
