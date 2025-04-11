import { JSX } from "solid-js";
import { AppointmentStatus } from "src/types/appointments";
import { actions, appointmentsStore } from "./appointmentStore";

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type StatusFilter = 'all' | AppointmentStatus

export default function FilterSearch(): JSX.Element {


  return (

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Search */}
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search patients, types, or notes..."
          value={appointmentsStore.searchQuery}
          onInput={(e) => actions.setSearchQuery(e.target.value)}
          class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Date Filter */}
      <div class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">Date:</label>
        <select
          value={appointmentsStore.dateFilter}
          onChange={(e) => actions.setDateFilter(e.target.value as DateFilter)}
          class="form-select rounded-md border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {appointmentsStore.dateFilter === 'custom' && (
          <div class="flex space-x-2 mt-2 md:mt-0">
            <input
              type="date"
              value={appointmentsStore.customDateRange.start}
              onChange={(e) => actions.setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
              class="form-input rounded-md border-gray-300 py-1 text-sm"
            />
            <span class="text-gray-500">to</span>
            <input
              type="date"
              value={appointmentsStore.customDateRange.end}
              onChange={(e) => actions.setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
              class="form-input rounded-md border-gray-300 py-1 text-sm"
            />
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={appointmentsStore.statusFilter}
          onChange={(e) => actions.setStatusFilter(e.target.value as StatusFilter)}
          class="form-select rounded-md border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value={AppointmentStatus.Pending}>Pending</option>
          <option value={AppointmentStatus.Confirmed}>Confirmed</option>
          <option value={AppointmentStatus.Completed}>Completed</option>
          <option value={AppointmentStatus.Cancelled}>Cancelled</option>
          <option value={AppointmentStatus.NoShow}>No Show</option>
          <option value={AppointmentStatus.Rescheduled}>Rescheduled</option>
          <option value={AppointmentStatus.Waiting}>Waiting</option>
          <option value={AppointmentStatus.InProgress}>In Progress</option>
        </select>
      </div>
    </div>
  )
}

