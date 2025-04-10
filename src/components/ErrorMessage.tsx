import { JSX } from "solid-js";

export default function ErrorMessage(props: { error: any }): JSX.Element {
  console.error("Data fetching error:", props.error);
  return (
    <div class="text-center py-6 px-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
      <p class="font-medium">Error loading data</p>
      <p class="text-sm mt-1">Please try refreshing the page</p>
      <button
        class="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </div>
  );
}
