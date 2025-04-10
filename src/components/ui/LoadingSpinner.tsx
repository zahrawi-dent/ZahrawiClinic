import { JSX } from "solid-js";

export default function LoadingSpinner(): JSX.Element {
  return (
    <div class="flex justify-center items-center h-full py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-indigo-600"></div>
    </div>
  );
}
