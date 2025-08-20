import { useNavigate } from "@tanstack/solid-router";
import { For, type Component, createMemo } from "solid-js";
import { ArrowRightIcon, CalendarIcon, ClockIcon, PlusIcon, UsersIcon } from "../icons";
import { StatCard } from "./StatCard";
import { QuickActionCard } from "./QuickActionCard";
import { AppointmentCard } from "./AppointmentCard";
import { usePatients, useAppointments, useCollectionSync } from "../../lib/useTanStackDB";
import { Collections } from "../../types/pocketbase-types";

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  // Set up real-time sync for collections we need
  useCollectionSync(Collections.Patients)
  useCollectionSync(Collections.Appointments)

  // Use real data instead of mock data
  const patientsQuery = usePatients()
  const appointmentsQuery = useAppointments()

  // Calculate real stats
  const stats = createMemo(() => {
    const patients = patientsQuery.data || []
    const appointments = appointmentsQuery.data || []
    
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter(a => 
      a.start_time?.startsWith(today)
    )
    
    const pendingAppointments = appointments.filter(a => 
      a.status === 'scheduled' || a.status === 'pending'
    )

    return {
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingAppointments.length,
      totalPatients: patients.length,
      newPatients: patients.filter(p => {
        const createdDate = new Date(p.created).toISOString().split('T')[0]
        return createdDate === today
      }).length
    }
  })

  // Get today's appointments for display
  const todayAppointments = createMemo(() => {
    const appointments = appointmentsQuery.data || []
    const today = new Date().toISOString().split('T')[0]
    return appointments
      .filter(a => a.start_time?.startsWith(today))
      .slice(0, 6) // Show only first 6 appointments
  })

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
          value={stats().todayAppointments}
          icon={CalendarIcon}
          trend={`${stats().todayAppointments} scheduled`}
          trendType="up"
        />
        <StatCard
          title="Pending Appointments"
          value={stats().pendingAppointments}
          icon={ClockIcon}
          trend={`${stats().pendingAppointments} need confirmation`}
          trendType="down"
        />
        <StatCard
          title="Total Patients"
          value={stats().totalPatients}
          icon={UsersIcon}
          trend={`${stats().newPatients} new today`}
          trendType="up"
        />
        <StatCard
          title="New Patients"
          value={stats().newPatients}
          icon={UsersIcon}
          trend={`${stats().newPatients} registered today`}
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
          <For each={todayAppointments()} fallback={<p class="text-gray-400">No appointments scheduled for today.</p>}>
            {(appointment: any) => (
              <AppointmentCard appointment={appointment} />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
