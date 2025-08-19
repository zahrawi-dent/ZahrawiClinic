import { useNavigate } from "@tanstack/solid-router";
import { For, type Component } from "solid-js";
import { StatCard } from "./StatCard";
import { mockStats } from "./mockData";
import { CheckCircleIcon, CurrencyDollarIcon, UsersIcon } from "../icons";
import { QuickActionCard } from "./QuickActionCard";

export const ManagerDashboard = () => {
  const navigate = useNavigate();

  const quickActions: Array<{ title: string; description: string; icon: Component; onClick: () => void }> = [
    // Removed links to non-existent admin report routes to satisfy type constraints
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-gray-100">Manager Dashboard</h1>
        <p class="text-gray-200">Business analytics and performance insights</p>
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
        <h2 class="text-lg font-semibold text-gray-200 mb-4">Quick Actions</h2>
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
        <div class="rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-100 mb-4">Revenue Trends</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-200">This Month</span>
              <span class="font-medium">$45,600</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-200">Last Month</span>
              <span class="font-medium">$42,100</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-200">Growth</span>
              <span class="text-green-600 font-medium">+8.5%</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-100 mb-4">Key Metrics</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-200">Average Patient Wait Time</span>
              <span class="font-medium">12 min</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-200">Treatment Completion Rate</span>
              <span class="font-medium">96%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-200">Staff Utilization</span>
              <span class="font-medium">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
