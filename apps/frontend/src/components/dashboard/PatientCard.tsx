import type { Patient } from "./types";

export const PatientCard = (props: { patient: Patient }) => (
  <div class="rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-gray-100">{props.patient.name}</h4>
        <p class="text-sm text-gray-200">{props.patient.email}</p>
        <p class="text-sm text-gray-200">Last visit: {props.patient.lastVisit}</p>
      </div>
      <div class={`px-2 py-1 rounded-full text-xs font-medium ${props.patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
        {props.patient.status}
      </div>
    </div>
  </div>
);
