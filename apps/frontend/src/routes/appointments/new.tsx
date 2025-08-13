import { createFileRoute } from '@tanstack/solid-router'
import { useNavigate } from '@tanstack/solid-router';
import { createForm } from '@tanstack/solid-form';
import { Collections } from '../../types/pocketbase-types';
import { useCreateMutation } from '../../data';
import { createSignal } from 'solid-js';

export const Route = createFileRoute('/appointments/new')({
  component: NewAppointmentPage,
})



function NewAppointmentPage() {
  const navigate = useNavigate();
  const createAppt = useCreateMutation(Collections.Appointments);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const form = createForm(() => ({
    defaultValues: {
      start_time: '',
      end_time: '',
      reason: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await createAppt.mutateAsync({
          data: {
            start_time: value.start_time ? new Date(value.start_time).toISOString() : new Date().toISOString(),
            end_time: value.end_time ? new Date(value.end_time).toISOString() : undefined,
            status: 'scheduled' as any,
            notes: value.notes || '',
            reason: value.reason || '',
            patient: [],
            doctor: [],
            clinic: [],
          },
        } as any);
        navigate({ to: '/appointments' });
      } finally {
        setIsSubmitting(false);
      }
    },
  }));

  return (
    <div class="min-h-screen p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-100">New Appointment</h1>
          <p class="text-gray-200">Create and schedule a new appointment</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        class="rounded-lg shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
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
          <button type="button" onClick={() => navigate({ to: '/appointments' })} class="rounded border px-3 py-2">Cancel</button>
          <button type="submit" class="rounded bg-indigo-600 px-3 py-2 text-white" disabled={isSubmitting() || createAppt.isPending}>
            {isSubmitting() || createAppt.isPending ? 'Creating…' : 'Create appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};


