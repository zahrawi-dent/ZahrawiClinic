import type { Component } from 'solid-js';
import { For, Show, createSignal, createMemo } from 'solid-js';
import { Collections } from '../../types/pocketbase-types';
import { useListQuery, useCreateMutation, useDeleteMutation } from '../../data';
import AppointmentCalendar from '../../components/AppointmentCalendar';

const AppointmentsPage: Component = () => {
  const collection = Collections.Appointments;
  const apptsQuery = useListQuery(collection, { perPage: 50, sort: 'start_time' });
  const createAppt = useCreateMutation(collection);
  const deleteAppt = useDeleteMutation(collection);
  const [formOpen, setFormOpen] = createSignal(false);

  // Transform PocketBase appointments to calendar format
  const calendarAppointments = createMemo(() => {
    if (!apptsQuery.data?.items) return [];
    
    return apptsQuery.data.items.map(apt => ({
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
    <div class="min-h-screen bg-gray-50 p-6">
      <Show when={apptsQuery.isLoading}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-gray-600">Loading appointments…</div>
        </div>
      </Show>
      
      <Show when={apptsQuery.isError}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-red-600">Failed to load appointments</div>
        </div>
      </Show>

      <Show when={apptsQuery.data}>
        <AppointmentCalendar appointments={calendarAppointments()} />
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


