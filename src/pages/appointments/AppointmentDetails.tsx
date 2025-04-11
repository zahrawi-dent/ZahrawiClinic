import { For, Show } from "solid-js";
import { getPatientInitials } from "src/utils/appointmetUtils";
import { Appointment, AppointmentStatus, getAppointmentStatusColor } from "src/types/appointments";
import { formatDate, formatTime } from "src/utils/appointmetUtils";
import { actions } from "./appointmentStore";

export default function AppointmentDetails(props: {
  appointment: Appointment
  closeModal: () => void
  onStatusUpdate: (appointmentId: string, newStatus: string) => void
  updating: boolean

}) {


  const appt = props.appointment

  return (

    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 class="text-lg font-medium text-gray-900">Appointment Details</h3>
          <button
            onClick={() => actions.setShowDetailsModal(false)}
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="px-6 py-4">
          <Show when={appt}>
            <>
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0 h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-lg font-medium">
                  {getPatientInitials(appt.expand?.patient.firstName + appt.expand?.patient.lastName)}
                </div>
                <div class="ml-4">
                  <h4 class="text-lg font-medium text-gray-900">{appt.expand?.patient.firstName + ' ' + appt.expand?.patient.lastName}</h4>
                  <p class="text-sm text-gray-500">
                    {appt.expand?.patient?.email || 'No email available'}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Date & Time</p>
                  <p class="mt-1">{formatDate(appt.date)} at {formatTime(appt.date)}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Duration</p>
                  <p class="mt-1">{appt.duration || 30} minutes</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Type</p>
                  <p class="mt-1 capitalize">{appt.type || 'General'}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <p class="mt-1">
                    <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${getAppointmentStatusColor(appt.status).bg} 
                            ${getAppointmentStatusColor(appt.status).text} 
                            capitalize`}>
                      {appt.status}
                    </span>
                  </p>
                </div>
              </div>

              <div class="mb-4">
                <p class="text-sm font-medium text-gray-500 mb-1">Notes</p>
                <p class="text-sm text-gray-700 border rounded-md p-3 bg-gray-50 min-h-[80px]">
                  {appt.notes || 'No notes available for this appointment.'}
                </p>
              </div>

              {/* Status Update */}
              <div class="mb-4">
                <p class="text-sm font-medium text-gray-500 mb-2">Update Status</p>
                <div class="flex flex-wrap gap-2">
                  <For each={Object.values(AppointmentStatus) as string[]}>
                    {(status) => (
                      <button
                        class={`px-3 py-1 text-xs rounded-full border ${appt.status.valueOf() === status
                          ? `${getAppointmentStatusColor(appt.status).bg} ${getAppointmentStatusColor(appt.status).text} border-transparent`
                          : 'border-gray-300 hover:bg-gray-50'
                          } capitalize`}
                        onClick={() => props.onStatusUpdate(appt.id, status)}
                        disabled={props.updating}
                      >
                        {status}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </>
          </Show>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => actions.setShowDetailsModal(false)}
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <div class="space-x-2">
            <button
              // TODO: use tanstack router
              onClick={() => window.location.href = `/edit-appointment/${appt?.id}`}
              class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
// Memoize derived data for clarity and potential performance (though simple here)
