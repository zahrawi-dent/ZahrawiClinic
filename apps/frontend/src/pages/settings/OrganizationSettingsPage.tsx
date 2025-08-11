import type { Component } from 'solid-js';
import { createForm } from '@tanstack/solid-form';

const OrganizationSettingsPage: Component = () => {
  const form = createForm(() => ({
    defaultValues: {
      organization_name: '',
      address: '',
      phone: '',
    },
    onSubmit: async () => {
      // TODO: Save via API
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Organization name</label>
        <form.Field name="organization_name" validators={{ onChange: ({ value }) => (!value ? 'Required' : undefined) }}>
          {(field) => (
            <input
              class="w-full rounded border px-3 py-2"
              value={field().state.value || ''}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
            />
          )}
        </form.Field>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <form.Field name="phone">
          {(field) => (
            <input
              class="w-full rounded border px-3 py-2"
              value={field().state.value || ''}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
            />
          )}
        </form.Field>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <form.Field name="address">
          {(field) => (
            <textarea
              class="w-full rounded border px-3 py-2"
              rows={3}
              value={field().state.value || ''}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
            />
          )}
        </form.Field>
      </div>
      <div class="md:col-span-2 flex justify-end">
        <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white">Save</button>
      </div>
    </form>
  );
};

export default OrganizationSettingsPage;


