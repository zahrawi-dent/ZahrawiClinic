import { 
  type Component, 
  createSignal, 
  createMemo, 
  Show, 
  For, 
  Switch, 
  Match,
  onMount 
} from 'solid-js';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from '@tanstack/solid-router';

// ===== TYPES =====
interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedTreatments: number;
  revenue: number;
  newPatients: number;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  dentist: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

// ===== ICONS =====
const CalendarIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CurrencyDollarIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const ClockIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const PlusIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// ===== COMPONENTS =====
const StatCard = (props: { 
  title: string; 
  value: string | number; 
  icon: Component; 
  trend?: string; 
  trendType?: 'up' | 'down';
  color?: string;
}) => (
  <div class={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${props.color || ''}`}>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{props.title}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{props.value}</p>
        {props.trend && (
          <div class={`flex items-center mt-2 text-sm ${
            props.trendType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{props.trend}</span>
          </div>
        )}
      </div>
      <div class="text-gray-400">
        <props.icon />
      </div>
    </div>
  </div>
);

const QuickActionCard = (props: { 
  title: string; 
  description: string; 
  icon: Component; 
  onClick: () => void;
  color?: string;
}) => (
  <button
    onClick={props.onClick}
    class={`w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow ${props.color || ''}`}
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900">{props.title}</h3>
        <p class="text-sm text-gray-600 mt-1">{props.description}</p>
      </div>
      <div class="text-gray-400">
        <props.icon />
      </div>
    </div>
  </button>
);

const AppointmentCard = (props: { appointment: Appointment }) => (
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-gray-900">{props.appointment.patientName}</h4>
        <p class="text-sm text-gray-600">{props.appointment.type}</p>
        <p class="text-sm text-gray-500">{props.appointment.time}</p>
      </div>
      <div class={`px-2 py-1 rounded-full text-xs font-medium ${
        props.appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
        props.appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
        props.appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {props.appointment.status}
      </div>
    </div>
  </div>
);

const PatientCard = (props: { patient: Patient }) => (
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-gray-900">{props.patient.name}</h4>
        <p class="text-sm text-gray-600">{props.patient.email}</p>
        <p class="text-sm text-gray-500">Last visit: {props.patient.lastVisit}</p>
      </div>
      <div class={`px-2 py-1 rounded-full text-xs font-medium ${
        props.patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {props.patient.status}
      </div>
    </div>
  </div>
);

// ===== MOCK DATA =====
const mockStats: DashboardStats = {
  totalPatients: 1247,
  todayAppointments: 23,
  pendingAppointments: 8,
  completedTreatments: 156,
  revenue: 45600,
  newPatients: 12
};

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: 'P001',
    date: '2024-01-15',
    time: '09:00 AM',
    type: 'Dental Cleaning',
    status: 'scheduled',
    dentist: 'Dr. Smith'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: 'P002',
    date: '2024-01-15',
    time: '10:30 AM',
    type: 'Root Canal',
    status: 'in-progress',
    dentist: 'Dr. Johnson'
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    patientId: 'P003',
    date: '2024-01-15',
    time: '02:00 PM',
    type: 'Crown Placement',
    status: 'scheduled',
    dentist: 'Dr. Williams'
  }
];

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    lastVisit: '2024-01-12',
    status: 'active'
  }
];

// ===== ROLE-BASED DASHBOARDS =====
const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'New Appointment',
      description: 'Schedule a new patient appointment',
      icon: PlusIcon,
      onClick: () => navigate({ to: '/appointments/new' })
    },
    {
      title: 'Patient Registration',
      description: 'Register a new patient',
      icon: UsersIcon,
      onClick: () => navigate({ to: '/patients/new' })
    },
    {
      title: 'Today\'s Schedule',
      description: 'View today\'s appointments',
      icon: CalendarIcon,
      onClick: () => navigate({ to: '/appointments' })
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
        <p class="text-gray-600">Manage appointments and patient interactions</p>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={mockStats.todayAppointments}
          icon={CalendarIcon}
          trend="+12% from yesterday"
          trendType="up"
        />
        <StatCard
          title="Pending Appointments"
          value={mockStats.pendingAppointments}
          icon={ClockIcon}
          trend="3 need confirmation"
          trendType="down"
        />
        <StatCard
          title="Total Patients"
          value={mockStats.totalPatients}
          icon={UsersIcon}
          trend="+5 this week"
          trendType="up"
        />
        <StatCard
          title="New Patients"
          value={mockStats.newPatients}
          icon={UsersIcon}
          trend="+2 today"
          trendType="up"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <For each={quickActions}>
            {(action) => (
              <QuickActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
              />
            )}
          </For>
        </div>
      </div>

      {/* Today's Appointments */}
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Today's Appointments</h2>
          <button
            onClick={() => navigate({ to: '/appointments' })}
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all
            <ArrowRightIcon />
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={mockAppointments}>
            {(appointment) => (
              <AppointmentCard appointment={appointment} />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

const DentistDashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Patient Records',
      description: 'Access patient treatment history',
      icon: UsersIcon,
      onClick: () => navigate({ to: '/patients' })
    },
    {
      title: 'Treatment Plans',
      description: 'Create and manage treatment plans',
      icon: CheckCircleIcon,
      onClick: () => navigate({ to: '/treatments' })
    },
    {
      title: 'Schedule',
      description: 'View your appointment schedule',
      icon: CalendarIcon,
      onClick: () => navigate({ to: '/appointments' })
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dentist Dashboard</h1>
        <p class="text-gray-600">Patient care and treatment management</p>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Patients"
          value={8}
          icon={UsersIcon}
          trend="2 completed"
          trendType="up"
        />
        <StatCard
          title="Completed Treatments"
          value={mockStats.completedTreatments}
          icon={CheckCircleIcon}
          trend="+15 this month"
          trendType="up"
        />
        <StatCard
          title="Pending Treatments"
          value={5}
          icon={ClockIcon}
          trend="2 urgent"
          trendType="down"
        />
        <StatCard
          title="Patient Satisfaction"
          value="4.8/5"
          icon={CheckCircleIcon}
          trend="+0.2 this month"
          trendType="up"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <For each={quickActions}>
            {(action) => (
              <QuickActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
              />
            )}
          </For>
        </div>
      </div>

      {/* Recent Patients */}
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Recent Patients</h2>
          <button
            onClick={() => navigate({ to: '/patients' })}
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all
            <ArrowRightIcon />
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={mockPatients}>
            {(patient) => (
              <PatientCard patient={patient} />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

const AdministratorDashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage staff accounts and permissions',
      icon: UsersIcon,
      onClick: () => navigate({ to: '/admin/users' })
    },
    {
      title: 'Clinic Settings',
      description: 'Configure clinic information and settings',
      icon: CheckCircleIcon,
      onClick: () => navigate({ to: '/admin/clinics' })
    },
    {
      title: 'System Reports',
      description: 'Generate and view system reports',
      icon: CurrencyDollarIcon,
      onClick: () => navigate({ to: '/admin/reports' })
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
        <p class="text-gray-600">System administration and user management</p>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={24}
          icon={UsersIcon}
          trend="+2 this month"
          trendType="up"
        />
        <StatCard
          title="Active Clinics"
          value={3}
          icon={CheckCircleIcon}
          trend="All operational"
          trendType="up"
        />
        <StatCard
          title="System Health"
          value="98%"
          icon={CheckCircleIcon}
          trend="Excellent"
          trendType="up"
        />
        <StatCard
          title="Recent Alerts"
          value={2}
          icon={ExclamationIcon}
          trend="1 critical"
          trendType="down"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <For each={quickActions}>
            {(action) => (
              <QuickActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
              />
            )}
          </For>
        </div>
      </div>

      {/* System Overview */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Recent Activity</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div>• New user registration: Dr. Sarah Wilson</div>
              <div>• System backup completed successfully</div>
              <div>• Clinic settings updated</div>
            </div>
          </div>
          <div>
            <h3 class="font-medium text-gray-900 mb-2">System Status</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span>Database</span>
                <span class="text-green-600">✓ Online</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Backup Service</span>
                <span class="text-green-600">✓ Active</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Email Service</span>
                <span class="text-green-600">✓ Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Financial Reports',
      description: 'View revenue and financial analytics',
      icon: CurrencyDollarIcon,
      onClick: () => navigate({ to: '/admin/reports/financial' })
    },
    {
      title: 'Staff Performance',
      description: 'Monitor staff productivity and performance',
      icon: UsersIcon,
      onClick: () => navigate({ to: '/admin/reports/performance' })
    },
    {
      title: 'Patient Analytics',
      description: 'Analyze patient trends and satisfaction',
      icon: CheckCircleIcon,
      onClick: () => navigate({ to: '/admin/reports/patients' })
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p class="text-gray-600">Business analytics and performance insights</p>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${mockStats.revenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend="+8.5% from last month"
          trendType="up"
        />
        <StatCard
          title="Patient Satisfaction"
          value="4.7/5"
          icon={CheckCircleIcon}
          trend="+0.3 this month"
          trendType="up"
        />
        <StatCard
          title="Staff Productivity"
          value="94%"
          icon={UsersIcon}
          trend="+2% this week"
          trendType="up"
        />
        <StatCard
          title="Treatment Success Rate"
          value="96%"
          icon={CheckCircleIcon}
          trend="+1% this month"
          trendType="up"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <For each={quickActions}>
            {(action) => (
              <QuickActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
              />
            )}
          </For>
        </div>
      </div>

      {/* Performance Overview */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">This Month</span>
              <span class="font-medium">$45,600</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Last Month</span>
              <span class="font-medium">$42,100</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Growth</span>
              <span class="text-green-600 font-medium">+8.5%</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Average Patient Wait Time</span>
              <span class="font-medium">12 min</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Treatment Completion Rate</span>
              <span class="font-medium">96%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Staff Utilization</span>
              <span class="font-medium">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN DASHBOARD COMPONENT =====
const Dashboard: Component = () => {
  const { authState } = useAuth();
  
  const userRole = createMemo(() => {
    const auth = authState();
    return auth.role;
  });

  const getDashboardComponent = () => {
    const role = userRole();
    
    switch (role) {
      case 'receptionist':
        return ReceptionistDashboard;
      case 'dentist':
        return DentistDashboard;
      case 'administrator':
        return AdministratorDashboard;
      case 'manager':
        return ManagerDashboard;
      case 'admin':
        // Legacy admin role - show administrator dashboard
        return AdministratorDashboard;
      case 'user':
        // Legacy user role - show receptionist dashboard
        return ReceptionistDashboard;
      default:
        return ReceptionistDashboard;
    }
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <DashboardComponent />
    </div>
  );
};

export default Dashboard;

