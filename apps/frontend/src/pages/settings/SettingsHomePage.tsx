import type { Component } from 'solid-js';

const SettingsHomePage: Component = () => {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Organization</h2>
        <p class="text-sm text-gray-600">Name, address, owners</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Clinics</h2>
        <p class="text-sm text-gray-600">Manage locations and rooms/chairs</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Treatments</h2>
        <p class="text-sm text-gray-600">Catalog and pricing</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Templates</h2>
        <p class="text-sm text-gray-600">Notes, reminders, documents</p>
      </div>
    </div>
  );
};

export default SettingsHomePage;


