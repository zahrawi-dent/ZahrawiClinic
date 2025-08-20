import { createFileRoute } from '@tanstack/solid-router'
import { Show, createSignal, createMemo } from 'solid-js';
import { createForm } from '@tanstack/solid-form';
import { Collections } from '../../types/pocketbase-types';
import type { AppointmentsResponse } from '../../types/pocketbase-types';
import { useAppointments, useCollectionSync, useCollections } from '../../lib/useTanStackDB';
import AppointmentCalendar from '../../components/AppointmentCalendar';
import { pb } from '../../lib/pocketbase';

export const Route = createFileRoute('/appointments/')({
  component: AppointmentsPage,
})



function AppointmentsPage() {
  // Set up real-time sync for appointments collection
  useCollectionSync(Collections.Appointments)
  
  // Use TanStack DB hooks
  const apptsQuery = useAppointments()
  const collections = useCollections()
  
  // Debug logging
  console.log('Appointments query:', apptsQuery)
  console.log('Appointments data:', apptsQuery.data)
  console.log('Appointments loading:', apptsQuery.isLoading())
  console.log('Appointments error:', apptsQuery.isError())
  
  const [formOpen, setFormOpen] = createSignal(false);
  const form = createForm(() => ({
    defaultValues: {
      start_time: '',
      end_time: '',
      reason: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await collections.appointments.insert({
          start_time: value.start_time ? new Date(value.start_time).toISOString() : new Date().toISOString(),
          end_time: value.end_time ? new Date(value.end_time).toISOString() : undefined,
          status: 'scheduled',
          notes: value.notes || '',
          reason: value.reason || '',
          patient: [],
          doctor: [],
          clinic: [],
        } as any)
        setFormOpen(false)
      } catch (error) {
        console.error('Error creating appointment:', error)
      }
    },
  }));

  // Transform PocketBase appointments to calendar format
  const calendarAppointments = createMemo(() => {
    const items = (apptsQuery.data ?? []) as AppointmentsResponse[];
    console.log('Calendar appointments items:', items)
    return items.map((apt) => ({
      id: apt.id,
      patientName: apt.patient?.[0] || 'Unknown Patient',
      patientId: apt.patient?.[0] || '',
      date: new Date(apt.start_time).toISOString().split('T')[0],
      time: new Date(apt.start_time).toTimeString().slice(0, 5),
      endTime: apt.end_time ? new Date(apt.end_time).toTimeString().slice(0, 5) : '',
      type: apt.reason || 'Appointment',
      status: apt.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
      dentist: apt.doctor?.[0] || 'Unknown Doctor',
      notes: apt.notes || '',
      priority: 'medium' as const,
      duration: apt.end_time ?
        Math.round((new Date(apt.end_time).getTime() - new Date(apt.start_time).getTime()) / (1000 * 60)) :
        60
    }));
  });

  const onCreate = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    try {
      await collections.appointments.insert({
        start_time: new Date(String(fd.get('start_time'))).toISOString(),
        end_time: new Date(String(fd.get('end_time'))).toISOString(),
        status: 'scheduled',
        notes: String(fd.get('notes') || ''),
        reason: String(fd.get('reason') || ''),
        patient: [],
        doctor: [],
        clinic: [],
      } as any);
      form.reset();
      setFormOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  };

  return (
    <div class="min-h-screen p-6">
      {/* Debug section */}
      <div class="mb-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold mb-2">Debug Info:</h3>
        <p>Loading: {apptsQuery.isLoading() ? 'Yes' : 'No'}</p>
        <p>Error: {apptsQuery.isError() ? 'Yes' : 'No'}</p>
        <p>Data length: {apptsQuery.data?.length ?? 0}</p>
        <button 
          onClick={() => {
            console.log('Testing PocketBase connection...')
            console.log('Auth state:', pb.authStore.isValid)
            console.log('Auth model:', pb.authStore.model)
            pb.collection('appointments').getFullList().then((data: any) => {
              console.log('PocketBase appointments:', data)
            }).catch((error: any) => {
              console.error('PocketBase error:', error)
            })
          }}
          class="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Test PocketBase Connection
        </button>
      </div>
      <Show when={apptsQuery.isLoading()}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-gray-200">Loading appointments…</div>
        </div>
      </Show>

      <Show when={apptsQuery.isError()}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-red-600">Failed to load appointments</div>
        </div>
      </Show>

      <Show when={apptsQuery.data} fallback={
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-gray-400">No appointments found</div>
        </div>
      }>
        <AppointmentCalendar appointments={calendarAppointments} />
      </Show>

      <Show when={formOpen()}>
        <div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" aria-hidden="true"></div>
          <div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">New appointment</h3>
              <button onClick={() => setFormOpen(false)} aria-label="Close" class="rounded border px-2 py-1">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              class="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div>
                <label class="block text-sm mb-1" for="start_time">Start time</label>
                <form.Field name="start_time" validators={{ onChange: ({ value }) => (!value ? 'Start time is required' : undefined) }}>
                  {(field) => (
                    <>
                      <input id="start_time" name="start_time" type="datetime-local" required class="w-full rounded border px-3 py-2"
                        value={field().state.value || ''}
                        onInput={(e) => field().handleChange(e.currentTarget.value)}
                        onBlur={field().handleBlur}
                      />
                    </>
                  )}
                </form.Field>
              </div>
              <div>
                <label class="block text-sm mb-1" for="end_time">End time</label>
                <form.Field name="end_time">
                  {(field) => (
                    <input id="end_time" name="end_time" type="datetime-local" class="w-full rounded border px-3 py-2"
                      value={field().state.value || ''}
                      onInput={(e) => field().handleChange(e.currentTarget.value)}
                      onBlur={field().handleBlur}
                    />
                  )}
                </form.Field>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm mb-1" for="reason">Reason</label>
                <form.Field name="reason">
                  {(field) => (
                    <input id="reason" name="reason" class="w-full rounded border px-3 py-2"
                      value={field().state.value || ''}
                      onInput={(e) => field().handleChange(e.currentTarget.value)}
                      onBlur={field().handleBlur}
                    />
                  )}
                </form.Field>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm mb-1" for="notes">Notes</label>
                <form.Field name="notes">
                  {(field) => (
                    <textarea id="notes" name="notes" class="w-full rounded border px-3 py-2" rows={3}
                      value={field().state.value || ''}
                      onInput={(e) => field().handleChange(e.currentTarget.value)}
                      onBlur={field().handleBlur}
                    />
                  )}
                </form.Field>
              </div>
              <div class="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setFormOpen(false)} class="rounded border px-3 py-2">Cancel</button>
                <button type="submit" class="rounded bg-indigo-600 px-3 py-2 text-white">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default AppointmentsPage;


