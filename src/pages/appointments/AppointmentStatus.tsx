import { useQuery } from "@tanstack/solid-query";
import { JSX } from "solid-js";
import { dentalOps } from "src/operations";

export default function AppointmentStats() {
  // Query for appointments stats
  const appointmentsStatsQuery = useQuery(() => ({
    queryKey: ['appointments', 'stats'],
    queryFn: () => dentalOps.appointments.fetchAppointmentsStats(),
    staleTime: 15 * 60 * 1000,
  }));

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Appointments"
        value={appointmentsStatsQuery.data?.total || 0}
        icon="📊"
        color="bg-indigo-500"
      />
      <StatCard
        title="Completed"
        value={appointmentsStatsQuery.data?.completed || 0}
        icon="✅"
        color="bg-green-500"
      />
      <StatCard
        title="Cancelled"
        value={appointmentsStatsQuery.data?.cancelled || 0}
        icon="❌"
        color="bg-red-500"
      />
      <StatCard
        title="No-Shows"
        value={appointmentsStatsQuery.data?.noShows || 0}
        icon="⚠️"
        color="bg-yellow-500"
      />
    </div>
  );
}

function StatCard(props: { title: string; value: number | string; icon?: string; color: string }): JSX.Element {
  return (
    <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300">
      <div class="p-5">
        <div class="flex items-center">
          <div
            class={`flex-shrink-0 h-12 w-12 rounded-full ${props.color} flex items-center justify-center`}
          >
            <span class="text-white text-xl">{props.icon || props.title.charAt(0)}</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 truncate">{props.title}</p>
            <p class="text-2xl font-semibold text-gray-900">{props.value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
