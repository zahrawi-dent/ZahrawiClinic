import type { Component } from 'solid-js';
import { For, Show, createSignal, createMemo } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useListQuery, useDeleteMutation } from '../../data';

const SearchIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const PatientsListPage: Component = () => {
  const navigate = useNavigate();
  const collection = Collections.Patients;
  const patientsQuery = useListQuery(collection, { perPage: 50, sort: 'last_name,first_name' });
  const deletePatient = useDeleteMutation(collection);

  const [search, setSearch] = createSignal('');

  const filteredPatients = createMemo(() => {
    const items = patientsQuery.data?.items ?? [];
    const term = search().trim().toLowerCase();
    if (!term) return items;
    return items.filter(p => {
      const name = `${p.first_name} ${p.last_name}`.toLowerCase();
      return (
        name.includes(term) ||
        (p.email || '').toLowerCase().includes(term) ||
        (p.phone || '').toLowerCase().includes(term)
      );
    });
  });

  return (
    <div class="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Patients</h2>
          <p class="text-gray-600">Manage patient records</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search by name, phone, email"
              class="w-72 rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => navigate({ to: '/patients/new' })}
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700"
          >
            <PlusIcon />
            <span>New patient</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <Show when={patientsQuery.isLoading}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-gray-600">Loading patients…</div>
        </div>
      </Show>

      <Show when={patientsQuery.isError}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-red-600">Failed to load patients</div>
        </div>
      </Show>

      <Show when={patientsQuery.data}>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div class="text-sm text-gray-600">
              Showing {filteredPatients().length} of {patientsQuery.data!.totalItems} patients
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-2 font-medium">Name</th>
                  <th class="text-left px-4 py-2 font-medium">Phone</th>
                  <th class="text-left px-4 py-2 font-medium">Email</th>
                  <th class="text-left px-4 py-2 font-medium">DOB</th>
                  <th class="text-left px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <For each={filteredPatients()} fallback={<tr><td class="px-4 py-3">No patients</td></tr>}>
                  {(p) => (
                    <tr class="border-t hover:bg-gray-50">
                      <td class="px-4 py-3">
                        <button
                          class="text-blue-600 hover:underline"
                          onClick={() => navigate({ to: `/patients/${p.id}` })}
                        >
                          {p.first_name} {p.last_name}
                        </button>
                      </td>
                      <td class="px-4 py-3">{p.phone}</td>
                      <td class="px-4 py-3">{p.email || '-'}</td>
                      <td class="px-4 py-3">{new Date(p.dob).toLocaleDateString()}</td>
                      <td class="px-4 py-3 space-x-2">
                        <button
                          class="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                          onClick={() => deletePatient.mutate({ id: p.id })}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default PatientsListPage;


