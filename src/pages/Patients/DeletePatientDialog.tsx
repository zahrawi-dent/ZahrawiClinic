import { JSX, Show } from 'solid-js'
// DeletePatientDialog Component with backdrop blur and outside click handling
export default function DeletePatientDialog(props): JSX.Element {
  // Handler for backdrop clicks
  const handleBackdropClick = (e): void => {
    // Only close if clicking directly on the backdrop, not on the dialog content
    if (e.target === e.currentTarget) {
      props.onClose()
    }
  }

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete {props.patientName}'s record? This action cannot be
            undone.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              onClick={props.onClose}
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={props.onConfirm}
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Show>
  )
}

// The rest of the components remain the same as in the previous artifact
