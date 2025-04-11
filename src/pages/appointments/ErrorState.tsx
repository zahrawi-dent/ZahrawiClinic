import { JSX } from "solid-js";

export default function ErrorState(): JSX.Element {
  return (
    <div class="bg-white shadow-md rounded-lg p-8 text-center">
      <svg class="h-12 w-12 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Unable to load appointments</h3>
      <p class="text-sm text-gray-500 mb-4">There was an error retrieving the appointment data.</p>
      <button
        onClick={() => window.location.reload()}
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Retry
      </button>
    </div>
  );
}
