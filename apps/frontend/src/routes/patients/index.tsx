import { createFileRoute } from '@tanstack/solid-router'
import { For, Show, createSignal, createMemo } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useListQuery, useDeleteMutation } from '../../data';
import { useRealtimeSubscription } from '../../optimistic/optimistic-hooks';

export const Route = createFileRoute('/patients/')({
  component: PatientsListPage,
})



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

function PatientsListPage() {
  const navigate = useNavigate();
  const collection = Collections.Patients;
  const patientsQuery = useListQuery(collection, { perPage: 50, sort: 'last_name,first_name' });
  const deletePatient = useDeleteMutation(collection);

  const [search, setSearch] = createSignal('');
  const [sexFilter, setSexFilter] = createSignal<'all' | 'male' | 'female'>('all');
  const [sortBy, setSortBy] = createSignal<'name_asc' | 'name_desc' | 'dob_desc' | 'dob_asc'>('name_asc');
  const [view, setView] = createSignal<'table' | 'grid'>('table');

  // Live updates
  useRealtimeSubscription(Collections.Patients);

  const getInitials = (first: string, last: string) => {
    const a = (first || '').trim()[0] || '';
    const b = (last || '').trim()[0] || '';
    return (a + b).toUpperCase();
  };

  const getAge = (dob: string | undefined) => {
    if (!dob) return '-';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return isNaN(age) ? '-' : `${age}`;
  };

  const filteredPatients = createMemo(() => {
    let items = patientsQuery.data?.items ?? [];

    // Search
    const term = search().trim().toLowerCase();
    if (term) {
      items = items.filter(p => {
        const name = `${p.first_name} ${p.last_name}`.toLowerCase();
        return (
          name.includes(term) ||
          (p.email || '').toLowerCase().includes(term) ||
          (p.phone || '').toLowerCase().includes(term)
        );
      });
    }

    // Sex filter
    const sf = sexFilter();
    if (sf !== 'all') items = items.filter(p => p.sex === sf);

    // Sorting
    const sort = sortBy();
    items = [...items].sort((a, b) => {
      const nameA = `${a.last_name} ${a.first_name}`.toLocaleLowerCase();
      const nameB = `${b.last_name} ${b.first_name}`.toLocaleLowerCase();
      switch (sort) {
        case 'name_asc':
          return nameA.localeCompare(nameB);
        case 'name_desc':
          return nameB.localeCompare(nameA);
        case 'dob_desc':
          return new Date(b.dob).getTime() - new Date(a.dob).getTime();
        case 'dob_asc':
          return new Date(a.dob).getTime() - new Date(b.dob).getTime();
      }
    });

    return items;
  });

  const maleCount = createMemo(() => (patientsQuery.data?.items || []).filter(p => p.sex === 'male').length);
  const femaleCount = createMemo(() => (patientsQuery.data?.items || []).filter(p => p.sex === 'female').length);

  return (
    <div class="min-h-screen p-6 space-y-6">
      {/* Hero Header */}
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-100">Patients</h2>
            <p class="text-gray-200">Search, filter, and manage your patient directory</p>
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
                class="w-72 rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Quick Stats */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="text-sm text-gray-200">Total patients</div>
            <div class="mt-1 text-2xl font-bold text-gray-100">{patientsQuery.data?.totalItems ?? 0}</div>
          </div>
          <div class="rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="text-sm text-gray-200">Male</div>
            <div class="mt-1 text-2xl font-bold text-blue-600">{maleCount()}</div>
          </div>
          <div class="rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="text-sm text-gray-100">Female</div>
            <div class="mt-1 text-2xl font-bold text-pink-600">{femaleCount()}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div class="rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            class={`px-3 py-1.5 rounded-full text-sm ${sexFilter() === 'all' ? 'bg-slate-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setSexFilter('all')}
          >All</button>
          <button
            class={`px-3 py-1.5 rounded-full text-sm ${sexFilter() === 'male' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            onClick={() => setSexFilter('male')}
          >Male</button>
          <button
            class={`px-3 py-1.5 rounded-full text-sm ${sexFilter() === 'female' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}
            onClick={() => setSexFilter('female')}
          >Female</button>
        </div>
        <div class="flex items-center gap-3">
          <select
            value={sortBy()}
            onInput={(e) => setSortBy(e.currentTarget.value as any)}
            class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
            <option value="dob_desc">DOB (newest)</option>
            <option value="dob_asc">DOB (oldest)</option>
          </select>
          <div class="inline-flex items-center rounded-md border border-gray-200 overflow-hidden">
            <button
              class={`px-3 py-1.5 text-sm ${view() === 'table' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setView('table')}
            >Table</button>
            <button
              class={`px-3 py-1.5 text-sm ${view() === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setView('grid')}
            >Grid</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Show when={patientsQuery.isLoading}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-gray-200">Loading patients…</div>
        </div>
      </Show>

      <Show when={patientsQuery.isError}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-red-600">Failed to load patients</div>
        </div>
      </Show>

      <Show when={patientsQuery.data}>
        <Show when={view() === 'table'}>
          <div class="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div class="text-sm text-gray-200">
                Showing {filteredPatients().length} of {patientsQuery.data!.totalItems} patients
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="text-gray-200">
                  <tr>
                    <th class="text-left px-4 py-2 font-medium">Patient</th>
                    <th class="text-left px-4 py-2 font-medium">Phone</th>
                    <th class="text-left px-4 py-2 font-medium">Email</th>
                    <th class="text-left px-4 py-2 font-medium">DOB</th>
                    <th class="text-left px-4 py-2 font-medium">Age</th>
                    <th class="text-left px-4 py-2 font-medium">Sex</th>
                    <th class="text-left px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={filteredPatients()} fallback={<tr><td class="px-4 py-3">No patients</td></tr>}>
                    {(p) => (
                      <tr class="border-t hover:bg-slate-800">
                        <td class="px-4 py-3">
                          <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                              {getInitials(p.first_name, p.last_name)}
                            </div>
                            <button
                              class="text-blue-600 hover:underline text-left"
                              onClick={() => navigate({ to: `/patients/${p.id}` })}
                            >
                              <div class="font-medium">{p.first_name} {p.last_name}</div>
                              <div class="text-xs text-gray-500">ID: {p.id}</div>
                            </button>
                          </div>
                        </td>
                        <td class="px-4 py-3">{p.phone}</td>
                        <td class="px-4 py-3">{p.email || '-'}</td>
                        <td class="px-4 py-3">{new Date(p.dob).toLocaleDateString()}</td>
                        <td class="px-4 py-3">{getAge(p.dob)}</td>
                        <td class="px-4 py-3">
                          <span class={`px-2 py-1 rounded-full text-xs font-medium ${p.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                            {p.sex}
                          </span>
                        </td>
                        <td class="px-4 py-3 space-x-2">
                          <button
                            class="rounded border px-2 py-1 hover:bg-gray-50"
                            onClick={() => navigate({ to: `/patients/${p.id}` })}
                          >
                            View
                          </button>
                          <button
                            class="rounded border px-2 py-1 hover:bg-gray-50"
                            onClick={() => navigate({ to: `/appointments/new?patient=${p.id}` })}
                          >
                            Schedule
                          </button>
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

        <Show when={view() === 'grid'}>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={filteredPatients()} fallback={<div class="text-gray-500">No patients</div>}>
              {(p) => (
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div class="flex items-start gap-3">
                    <div class={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold ${p.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {getInitials(p.first_name, p.last_name)}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <div class="truncate">
                          <div class="font-semibold text-gray-900 truncate">{p.first_name} {p.last_name}</div>
                          <div class="text-xs text-gray-500 truncate">{p.email || '-'}</div>
                        </div>
                        <span class="text-xs text-gray-500">{getAge(p.dob)} yrs</span>
                      </div>
                      <div class="mt-2 text-sm text-gray-700">{p.phone}</div>
                      <div class="mt-3 flex items-center gap-2">
                        <button
                          class="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                          onClick={() => navigate({ to: `/patients/${p.id}` })}
                        >View</button>
                        <button
                          class="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                          onClick={() => navigate({ to: `/appointments/new?patient=${p.id}` })}
                        >Schedule</button>
                        <button
                          class="px-3 py-1.5 rounded-md border text-sm text-red-600 hover:bg-red-50"
                          onClick={() => deletePatient.mutate({ id: p.id })}
                        >Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default PatientsListPage;


