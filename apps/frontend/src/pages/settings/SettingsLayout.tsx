import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { Outlet } from '@tanstack/solid-router';

const nav = [
  { label: 'General', href: '/settings' },
  { label: 'Organization', href: '/settings/organization' },
  { label: 'Clinics', href: '/settings/clinics' },
  { label: 'Treatments', href: '/settings/treatments' },
];

const SettingsLayout: Component = () => {
  return (
    <div class="min-h-screen bg-gray-50 p-6 space-y-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600">Manage your organization, clinics, and catalog</p>
      </div>

      <div class="bg-white rounded-lg border border-gray-200">
        <div class="flex flex-wrap gap-1 p-2 border-b border-gray-200">
          <For each={nav}>
            {(item) => (
              <a
                href={item.href}
                class="px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-gray-700"
              >
                {item.label}
              </a>
            )}
          </For>
        </div>
        <div class="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;


