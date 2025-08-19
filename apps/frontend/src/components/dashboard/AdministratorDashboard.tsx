import { For, type Component } from "solid-js";
import { StatCard } from "./StatCard";
import { CheckCircleIcon, ExclamationIcon, UsersIcon } from "../icons";
import { QuickActionCard } from "./QuickActionCard";

export const AdministratorDashboard = () => {
  const quickActions: Array<{ title: string; description: string; icon: Component; onClick: () => void }> = [
    // Removed links to non-existent admin routes to satisfy type constraints
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-gray-100">Administrator Dashboard</h1>
        <p class="text-gray-200">System administration and user management</p>
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

      {/* System Overview */}
      <div class="rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-100 mb-4">System Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-200 mb-2">Recent Activity</h3>
            <div class="space-y-2 text-sm text-gray-200">
              <div>• New user registration: Dr. Sarah Wilson</div>
              <div>• System backup completed successfully</div>
              <div>• Clinic settings updated</div>
            </div>
          </div>
          <div>
            <h3 class="font-medium text-gray-200 mb-2">System Status</h3>
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
