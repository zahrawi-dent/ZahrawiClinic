import type { Component } from 'solid-js';
import { For, Show, createSignal } from 'solid-js';
import { Collections } from '../../types/pocketbase-types';
import { useListQuery, useCreateMutation, useDeleteMutation } from '../../data';

const AppointmentsPage: Component = () => {
  const collection = Collections.Appointments;
  const apptsQuery = useListQuery(collection, { perPage: 50, sort: 'start_time' });
  const createAppt = useCreateMutation(collection);
  const deleteAppt = useDeleteMutation(collection);
  const [formOpen, setFormOpen] = createSignal(false);

  const onCreate = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    await createAppt.mutateAsync({
      data: {
        start_time: new Date(String(fd.get('start_time'))).toISOString(),
        end_time: new Date(String(fd.get('end_time'))).toISOString(),
        status: 'scheduled' as any,
        notes: String(fd.get('notes') || ''),
        reason: String(fd.get('reason') || ''),
        patient: [],
        doctor: [],
        clinic: [],
      },
    } as any);
    form.reset();
    setFormOpen(false);
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">Appointments</h2>
          <p class="text-sm text-gray-600">Schedule and track appointments.</p>
        </div>
        <button onClick={() => setFormOpen(true)} class="rounded bg-indigo-600 px-3 py-2 text-white text-sm hover:bg-indigo-700">New appointment</button>
      </div>

      <Show when={apptsQuery.isLoading}>
        <div>Loading appointments…</div>
      </Show>
      <Show when={apptsQuery.isError}>
        <div class="text-red-600">Failed to load appointments</div>
      </Show>

      <Show when={apptsQuery.data}>
        <div class="overflow-x-auto rounded border bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th class="text-left px-3 py-2">Start</th>
                <th class="text-left px-3 py-2">End</th>
                <th class="text-left px-3 py-2">Status</th>
                <th class="text-left px-3 py-2">Reason</th>
                <th class="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={apptsQuery.data!.items} fallback={<tr><td class="px-3 py-2">No appointments</td></tr>}>
                {(a) => (
                  <tr class="border-t">
                    <td class="px-3 py-2">{new Date(a.start_time).toLocaleString()}</td>
                    <td class="px-3 py-2">{a.end_time ? new Date(a.end_time).toLocaleString() : '-'}</td>
                    <td class="px-3 py-2 capitalize">{a.status}</td>
                    <td class="px-3 py-2">{a.reason}</td>
                    <td class="px-3 py-2">
                      <button class="rounded border px-2 py-1 text-red-600 hover:bg-red-50" onClick={() => deleteAppt.mutate({ id: a.id })}>Delete</button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      <Show when={formOpen()}>
        <div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" aria-hidden="true"></div>
          <div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">New appointment</h3>
              <button onClick={() => setFormOpen(false)} aria-label="Close" class="rounded border px-2 py-1">✕</button>
            </div>
            <form onSubmit={onCreate} class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1" for="start_time">Start time</label>
                <input id="start_time" name="start_time" type="datetime-local" required class="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm mb-1" for="end_time">End time</label>
                <input id="end_time" name="end_time" type="datetime-local" class="w-full rounded border px-3 py-2" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm mb-1" for="reason">Reason</label>
                <input id="reason" name="reason" class="w-full rounded border px-3 py-2" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm mb-1" for="notes">Notes</label>
                <textarea id="notes" name="notes" class="w-full rounded border px-3 py-2" rows={3} />
              </div>
              <div class="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setFormOpen(false)} class="rounded border px-3 py-2">Cancel</button>
                <button type="submit" class="rounded bg-indigo-600 px-3 py-2 text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default AppointmentsPage;


