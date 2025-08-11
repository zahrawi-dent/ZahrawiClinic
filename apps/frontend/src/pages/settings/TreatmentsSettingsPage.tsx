import type { Component } from 'solid-js';
import { For, createSignal, createMemo } from 'solid-js';

type Treatment = { id: string; name: string; default_price: number; description?: string };

const mockTreatments: Treatment[] = [
  { id: 't1', name: 'Cleaning', default_price: 50 },
  { id: 't2', name: 'Root Canal', default_price: 300 },
  { id: 't3', name: 'Crown', default_price: 450 },
];

const TreatmentsSettingsPage: Component = () => {
  const [search, setSearch] = createSignal('');
  const filtered = createMemo(() => {
    const term = search().trim().toLowerCase();
    if (!term) return mockTreatments;
    return mockTreatments.filter(t => t.name.toLowerCase().includes(term));
  });

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Treatments Catalog</h2>
        <button class="rounded bg-blue-600 px-3 py-2 text-white">New Treatment</button>
      </div>
      <div class="flex items-center gap-2">
        <input
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search treatments"
          class="w-64 rounded border px-3 py-2"
        />
      </div>
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-2 font-medium">Name</th>
              <th class="text-left px-4 py-2 font-medium">Default Price</th>
              <th class="text-left px-4 py-2 font-medium">Description</th>
              <th class="text-left px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <For each={filtered()} fallback={<tr><td class="px-4 py-3">No items</td></tr>}>
              {(t) => (
                <tr class="border-t">
                  <td class="px-4 py-3">{t.name}</td>
                  <td class="px-4 py-3">${t.default_price.toFixed(2)}</td>
                  <td class="px-4 py-3">{t.description || '-'}</td>
                  <td class="px-4 py-3 space-x-2">
                    <button class="rounded border px-2 py-1 hover:bg-gray-50">Edit</button>
                    <button class="rounded border px-2 py-1 text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TreatmentsSettingsPage;


