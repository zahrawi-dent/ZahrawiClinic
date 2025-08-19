import { useNavigate } from "@tanstack/solid-router";
import { For, type Component } from "solid-js";
import { ArrowRightIcon, CalendarIcon, CheckCircleIcon, ClockIcon, UsersIcon } from "../icons";
import { StatCard } from "./StatCard";
import { mockPatients, mockStats } from "./mockData";
import { QuickActionCard } from "./QuickActionCard";
import { PatientCard } from "./PatientCard";

export const DentistDashboard = () => {
  const navigate = useNavigate();

  const quickActions: Array<{ title: string; description: string; icon: Component; onClick: () => void }> = [
    {
      title: 'Patient Records',
      description: 'Access patient treatment history',
      icon: UsersIcon,
      onClick: () => navigate({ to: '/patients' })
    },
    // Placeholder for future route
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
        <h1 class="text-2xl font-bold text-gray-100">Dentist Dashboard</h1>
        <p class="text-gray-200">Patient care and treatment management</p>
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

      {/* Recent Patients */}
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-100">Recent Patients</h2>
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
