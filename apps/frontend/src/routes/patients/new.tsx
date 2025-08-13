import { createFileRoute } from '@tanstack/solid-router'
import { createForm } from '@tanstack/solid-form';
import { useNavigate } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useCreateMutation } from '../../data';
import { createSignal, Show } from 'solid-js';

export const Route = createFileRoute('/patients/new')({
  component: NewPatientPage,
})



function NewPatientPage() {
  const navigate = useNavigate();
  const createPatient = useCreateMutation(Collections.Patients);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const form = createForm(() => ({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address: '',
      dob: '',
      sex: 'male' as 'male' | 'female',
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await createPatient.mutateAsync({
          data: {
            first_name: value.first_name,
            last_name: value.last_name,
            phone: value.phone,
            email: value.email,
            address: value.address,
            dob: value.dob ? new Date(value.dob).toISOString() : new Date().toISOString(),
            sex: value.sex as any,
            primary_clinic: [],
          },
        } as any);
        navigate({ to: '/patients' });
      } finally {
        setIsSubmitting(false);
      }
    },
  }));

  return (
    <div class="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-100">New Patient</h1>
          <p class="text-gray-200">Create a patient profile to start tracking appointments and treatments</p>
        </div>
      </div>
      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        class="rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-1">First name</label>
            <form.Field name="first_name" validators={{ onChange: ({ value }) => (!value ? 'First name is required' : undefined) }}>
              {(field) => (
                <>
                  <input
                    name="first_name"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field().state.value || ''}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    onBlur={field().handleBlur}
                  />
                  <Show when={!!field().state.meta.errors?.length}>
                    <div class="mt-1 text-xs text-red-600">{field().state.meta.errors?.[0]}</div>
                  </Show>
                </>
              )}
            </form.Field>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-1">Last name</label>
            <form.Field name="last_name" validators={{ onChange: ({ value }) => (!value ? 'Last name is required' : undefined) }}>
              {(field) => (
                <>
                  <input
                    name="last_name"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field().state.value || ''}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    onBlur={field().handleBlur}
                  />
                  <Show when={!!field().state.meta.errors?.length}>
                    <div class="mt-1 text-xs text-red-600">{field().state.meta.errors?.[0]}</div>
                  </Show>
                </>
              )}
            </form.Field>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-1">Phone</label>
            <form.Field name="phone" validators={{ onChange: ({ value }) => (!value ? 'Phone is required' : undefined) }}>
              {(field) => (
                <>
                  <input
                    name="phone"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field().state.value || ''}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    onBlur={field().handleBlur}
                  />
                  <Show when={!!field().state.meta.errors?.length}>
                    <div class="mt-1 text-xs text-red-600">{field().state.meta.errors?.[0]}</div>
                  </Show>
                </>
              )}
            </form.Field>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-1">Email</label>
            <form.Field name="email" validators={{ onChange: ({ value }) => (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : undefined) }}>
              {(field) => (
                <>
                  <input
                    name="email"
                    type="email"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field().state.value || ''}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    onBlur={field().handleBlur}
                  />
                  <Show when={!!field().state.meta.errors?.length}>
                    <div class="mt-1 text-xs text-red-600">{field().state.meta.errors?.[0]}</div>
                  </Show>
                </>
              )}
            </form.Field>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-200 mb-1">Address</label>
            <form.Field name="address">
              {(field) => (
                <input
                  name="address"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field().state.value || ''}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                />
              )}
            </form.Field>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-1">Date of birth</label>
            <form.Field name="dob">
              {(field) => (
                <input
                  name="dob"
                  type="date"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field().state.value || ''}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                />
              )}
            </form.Field>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-1">Sex</label>
            <form.Field name="sex">
              {(field) => (
                <select
                  name="sex"
                  class="bg-slate-900 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field().state.value as any}
                  onInput={(e) => field().handleChange(e.currentTarget.value as any)}
                  onBlur={field().handleBlur}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              )}
            </form.Field>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-4">
          <button type="button" onClick={() => navigate({ to: '/patients' })} class="rounded-md border px-4 py-2 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting() || createPatient.isPending} class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting() || createPatient.isPending ? 'Saving…' : 'Save patient'}
          </button>
        </div>
      </form>
    </div>
  )
};
