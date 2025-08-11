import type { Component } from 'solid-js';
import { For } from 'solid-js';

const mockClinics = [
  { id: '1', clinic_name: 'Downtown Clinic', phone: '555-0101', address: '123 Main St' },
  { id: '2', clinic_name: 'Uptown Clinic', phone: '555-0202', address: '456 Oak Ave' },
];

const ClinicsSettingsPage: Component = () => {
  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Clinics</h2>
        <button class="rounded bg-blue-600 px-3 py-2 text-white">New Clinic</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <For each={mockClinics}>
          {(c) => (
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="font-medium text-gray-900">{c.clinic_name}</div>
              <div class="text-sm text-gray-600">{c.address}</div>
              <div class="text-sm text-gray-600">{c.phone}</div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default ClinicsSettingsPage;


