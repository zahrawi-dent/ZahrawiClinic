import { For } from "solid-js";
import { getPatientInitials } from "src/utils/appointmetUtils";
import { getAppointmentStatusColor, getAppointmentTypeColor } from "src/types/appointments";
import { formatDate, formatTime } from "src/utils/appointmetUtils";
import { actions, selectors } from "./appointmentStore";

export default function ListView() {

  return <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <For each={selectors.filteredAppointments()}>
            {(appointment) => (
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      {getPatientInitials(appointment.expand?.patient.firstName + appointment.expand?.patient.lastName)}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{appointment.expand?.patient.firstName + appointment.expand?.patient.lastName}</div>
                      <div class="text-sm text-gray-500">
                        {appointment.patient?.phone || appointment.expand?.patient?.phone || 'No phone'}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                  <div class="text-sm text-gray-500">{formatTime(appointment.date)}</div>
                </td>

                {/* <td class="px-6 py-4 whitespace-nowrap"> */}
                {/*   <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 capitalize"> */}
                {/*     {appointment.type || 'General'} */}
                {/*   </span> */}
                {/* </td> */}

                {/* change type styles based on AppointmentType */}
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${getAppointmentTypeColor(appointment.type).bg || 'bg-gray-100'}
                                  ${getAppointmentTypeColor(appointment.type).text || 'text-gray-800'}
                                  capitalize`}
                  >
                    {appointment.type || 'General'}
                  </span>
                </td>


                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${getAppointmentStatusColor(appointment.status).bg || 'bg-gray-100'}
                                  ${getAppointmentStatusColor(appointment.status).text || 'text-gray-800'}
                                  capitalize`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appointment.duration || 30} min
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => actions.selectAppointment(appointment)}
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Details
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  </div>
}
