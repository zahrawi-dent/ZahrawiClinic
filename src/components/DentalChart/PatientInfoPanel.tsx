// src/components/DentalChart/PatientInfoPanel.tsx
import { Component, Accessor } from 'solid-js';
import { Patient } from 'src/types/dental';

interface PatientInfoPanelProps {
  patientInfo: Accessor<Patient>;
  onUpdatePatientInfo: (field: keyof Patient, value: string) => void;
}

export const PatientInfoPanel: Component<PatientInfoPanelProps> = (props) => {
  return (
    <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200 shadow-sm">
      <h2 class="text-lg font-semibold mb-3 text-blue-800">Patient Information</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700" for="patient-name">Name:</label>
          <input id="patient-name" type="text" value={props.patientInfo.name} onInput={e => props.onUpdatePatientInfo('name', e.currentTarget.value)} class="mt-1 w-full border-gray-300 rounded shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700" for="patient-id">Patient ID:</label>
          <input id="patient-id" type="text" value={props.patientInfo.id} onInput={e => props.onUpdatePatientInfo('id', e.currentTarget.value)} class="mt-1 w-full border-gray-300 rounded shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700" for="patient-dob">Date of Birth:</label>
          <input id="patient-dob" type="date" value={props.patientInfo.age} onInput={e => props.onUpdatePatientInfo('dob', e.currentTarget.value)} class="mt-1 w-full border-gray-300 rounded shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700" for="patient-last-visit">Last Visit:</label>
          <input id="patient-last-visit" type="date" value={props.patientInfo.lastVisit} onInput={e => props.onUpdatePatientInfo('lastVisit', e.currentTarget.value)} class="mt-1 w-full border-gray-300 rounded shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700" for="patient-next-appt">Next Appointment:</label>
          <input id="patient-next-appt" type="datetime-local" value={props.patientInfo.nextAppointment} onInput={e => props.onUpdatePatientInfo('nextAppointment', e.currentTarget.value)} class="mt-1 w-full border-gray-300 rounded shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );
};
