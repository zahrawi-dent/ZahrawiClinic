import type { Component } from 'solid-js';
import { For, Show, createSignal } from 'solid-js';
import { Collections } from '../../types/pocketbase-types';
import { useListQuery, useCreateMutation, useDeleteMutation, useUpdateMutation } from '../../data';

const PatientsListPage: Component = () => {
  const collection = Collections.Patients;
  const patientsQuery = useListQuery(collection, { perPage: 25, sort: '-created' });
  const createPatient = useCreateMutation(collection);
  const deletePatient = useDeleteMutation(collection);
  const updatePatient = useUpdateMutation(collection);

  const [formOpen, setFormOpen] = createSignal(false);

  const onCreate = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    await createPatient.mutateAsync({
      data: {
        first_name: String(data.get('first_name') || ''),
        last_name: String(data.get('last_name') || ''),
        phone: String(data.get('phone') || ''),
        email: String(data.get('email') || ''),
        address: String(data.get('address') || ''),
        dob: String(data.get('dob') || new Date().toISOString()),
        sex: String(data.get('sex') || 'male') as any,
        primary_clinic: [],
      },
    } as any);
    form.reset();
    setFormOpen(false);
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">Patients</h2>
          <p class="text-sm text-gray-600">Manage patient records.</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          class="rounded bg-indigo-600 px-3 py-2 text-white text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add patient
        </button>
      </div>

      <Show when={patientsQuery.isLoading}>
        <div>Loading patients…</div>
      </Show>
      <Show when={patientsQuery.isError}>
        <div class="text-red-600">Failed to load patients</div>
      </Show>

      <Show when={patientsQuery.data}>
        <div class="overflow-x-auto rounded border bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th class="text-left px-3 py-2">Name</th>
                <th class="text-left px-3 py-2">Phone</th>
                <th class="text-left px-3 py-2">Email</th>
                <th class="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={patientsQuery.data!.items} fallback={<tr><td class="px-3 py-2">No patients</td></tr>}>
                {(p) => (
                  <tr class="border-t">
                    <td class="px-3 py-2">{p.first_name} {p.last_name}</td>
                    <td class="px-3 py-2">{p.phone}</td>
                    <td class="px-3 py-2">{p.email}</td>
                    <td class="px-3 py-2 space-x-2">
                      <button
                        class="rounded border px-2 py-1 hover:bg-gray-50"
                        onClick={() => updatePatient.mutate({ id: p.id, data: { phone: p.phone } as any })}
                      >
                        Edit
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
      </Show>

      <Show when={formOpen()}>
        <div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" aria-hidden="true"></div>
          <div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Add patient</h3>
              <button
                onClick={() => setFormOpen(false)}
                aria-label="Close"
                class="rounded border px-2 py-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={onCreate} class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1" for="first_name">First name</label>
                <input id="first_name" name="first_name" required class="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm mb-1" for="last_name">Last name</label>
                <input id="last_name" name="last_name" required class="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm mb-1" for="phone">Phone</label>
                <input id="phone" name="phone" required class="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm mb-1" for="email">Email</label>
                <input id="email" name="email" type="email" class="w-full rounded border px-3 py-2" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm mb-1" for="address">Address</label>
                <input id="address" name="address" class="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm mb-1" for="dob">Date of birth</label>
                <input id="dob" name="dob" type="date" class="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm mb-1" for="sex">Sex</label>
                <select id="sex" name="sex" class="w-full rounded border px-3 py-2">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div class="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setFormOpen(false)} class="rounded border px-3 py-2">Cancel</button>
                <button type="submit" class="rounded bg-indigo-600 px-3 py-2 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default PatientsListPage;


