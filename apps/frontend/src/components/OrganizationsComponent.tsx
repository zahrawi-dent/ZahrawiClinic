import { For, Show } from 'solid-js';
import { Collections } from '../types/pocketbase-types';

// Import the generic hooks from our data layer's public entry point!
import {
  useListQuery,
  useCreateMutation,
  useDeleteMutation,
  useRealtimeSubscription
} from '../data';

export function OrganizationsComponent() {
  const collection = Collections.Organizations; // Use the enum for type safety!

  // Use the generic hooks by passing the collection name
  const orgsQuery = useListQuery(collection);
  const createOrg = useCreateMutation(collection);
  const deleteOrg = useDeleteMutation(collection);

  // The realtime hook also just needs the collection name
  useRealtimeSubscription(collection);

  const handleCreateSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const title = (formData.get('title') as string)?.trim();

    if (title) {
      try {
        await createOrg.mutateAsync({
          data: {
            organization_name: title,
            owners: ['8gkeijxmbjenf6y'], // Example user ID
            address: '123 Main St',
          }
        });
        form.reset();
      } catch (error) {
        console.error('Failed to create organization:', error);
        alert('Creation failed. See console for details.');
      }
    }
  };

  return (
    <div class="p-4 border rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold mb-4">Organizations</h2>

      <Show when={orgsQuery.isLoading}>
        <p>Loading...</p>
      </Show>

      <Show when={orgsQuery.isError}>
        <div class="text-red-500 p-4 border border-red-300 rounded">
          <p>Error loading organizations: {orgsQuery.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => orgsQuery.refetch()}
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </Show>

      <Show when={orgsQuery.isSuccess && orgsQuery.data}>
        <div class="space-y-2 mb-4">
          <For each={orgsQuery.data!.items} fallback={<p>No organizations found.</p>}>
            {(org) => (
              <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                <span>{org.organization_name}</span>
                <button
                  onClick={() => deleteOrg.mutate({ id: org.id })}
                  disabled={deleteOrg.isPending && deleteOrg.variables?.id === org.id}
                  class="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>

      <form onSubmit={handleCreateSubmit} class="flex gap-2">
        <input
          type="text"
          name="title"
          class="flex-1 border rounded px-3 py-2"
          placeholder="New Organization Name"
          required
          disabled={createOrg.isPending}
        />
        <button
          type="submit"
          disabled={createOrg.isPending}
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {createOrg.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
