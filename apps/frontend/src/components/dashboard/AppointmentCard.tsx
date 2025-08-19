import type { Appointment } from "./types";

export const AppointmentCard = (props: { appointment: Appointment }) => (
  <div class="rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-gray-100">{props.appointment.patientName}</h4>
        <p class="text-sm text-gray-200">{props.appointment.type}</p>
        <p class="text-sm text-gray-200">{props.appointment.time}</p>
      </div>
      <div class={`px-2 py-1 rounded-full text-xs font-medium ${props.appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
        props.appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
          props.appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
        }`}>
        {props.appointment.status}
      </div>
    </div>
  </div>
);
