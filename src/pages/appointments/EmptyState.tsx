import { JSX } from "solid-js";
import { actions } from "./appointmentStore";

export default function EmptyState(): JSX.Element {
  return (
    <div class="bg-white shadow-md rounded-lg p-8 text-center">
      <div class="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
        <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
      <p class="text-sm text-gray-500 mb-4">No appointments match your current filters.</p>
      <div class="flex justify-center space-x-4">
        <button
          onClick={() => window.location.href = '/new-appointment'}
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          New Appointment
        </button>
        <button
          onClick={() => {
            actions.setSearchQuery('');
            actions.setDateFilter('all');
            actions.setStatusFilter('all');
          }}
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
