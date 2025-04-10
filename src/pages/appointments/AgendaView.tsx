import { For } from "solid-js";
import { Appointment, getAppointmentStatusColor } from "src/types/appointments";
import { formatDisplayDate, formatEndTime, formatTime } from "src/utils/appointmetUtils";

export default function AgendaView(props: { handleViewDetails: (appointment: Appointment) => void, appointmentsByDate: () => Record<string, Appointment[]> }) {
  return (

    <div class="space-y-6">
      <For each={Object.entries(props.appointmentsByDate())}>
        {([dateStr, appointments]) => (
          <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">
                {formatDisplayDate(dateStr)}
              </h3>
            </div>
            <ul class="divide-y divide-gray-200">
              <For each={appointments}>
                {(appointment) => (
                  <li class="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class={`flex-shrink-0 w-2 h-12 ${getAppointmentStatusColor(appointment.status).dot || 'bg-gray-300'} mr-4`}></div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{formatTime(appointment.date)} - {formatEndTime(appointment.date, appointment.duration || 30)}</p>
                          <p class="text-md font-semibold text-gray-900">{appointment.expand?.patient.firstName + appointment.expand?.patient.lastName}</p>
                          <div class="flex items-center mt-1">
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize mr-2">
                              {appointment.type || 'General'}
                            </span>
                            <span class={`px-2 py-1 text-xs rounded-full ${getAppointmentStatusColor(appointment.status).bg || 'bg-gray-100'} ${getAppointmentStatusColor(
                              appointment.status
                            ).text || 'text-gray-800'} capitalize`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <button
                          onClick={() => props.handleViewDetails(appointment)}
                          class="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div class="mt-2 ml-6 text-sm text-gray-500 border-l-2 border-gray-200 pl-4">
                        {appointment.notes}
                      </div>
                    )}
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </div>
  )
}
