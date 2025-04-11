import { JSX } from "solid-js";

export default function LoadingState(): JSX.Element {
  return (
    <div class="bg-white shadow-md rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Loading appointments...</p>
    </div>
  );
}
