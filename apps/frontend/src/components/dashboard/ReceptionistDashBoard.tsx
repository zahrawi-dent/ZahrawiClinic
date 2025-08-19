import { useNavigate } from "@tanstack/solid-router";
import { For, type Component } from "solid-js";
import { ArrowRightIcon, CalendarIcon, ClockIcon, PlusIcon, UsersIcon } from "../icons";
import { StatCard } from "./StatCard";
import { mockAppointments, mockStats } from "./mockData";
import { QuickActionCard } from "./QuickActionCard";
import { AppointmentCard } from "./AppointmentCard";

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const quickActions: Array<{ title: string; description: string; icon: Component; onClick: () => void }> = [
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
        <h1 class="text-2xl font-bold text-gray-100">Receptionist Dashboard</h1>
        <p class="text-gray-200">Manage appointments and patient interactions</p>
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
        <h2 class="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h2>
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
          <h2 class="text-lg font-semibold text-gray-100">Today's Appointments</h2>
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
