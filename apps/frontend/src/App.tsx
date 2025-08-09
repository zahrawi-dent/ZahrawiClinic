import { AuthProvider } from './auth/AuthContext';
import { QueryClientProvider } from '@tanstack/solid-query';
import { queryClient } from './lib/queryClient';
import { ProtectedRoute } from './components/ProtectedRoute';
import { onMount } from 'solid-js';
import { useAuth } from './auth/AuthContext';
import { pb, PocketBaseContext } from './lib/pocketbase';
import { OrganizationsComponent } from './components/OrganizationsComponent';

const LoginForm = () => <div>Please log in to access this page.</div>;

function AppContent() {
  const { loginAsAdmin } = useAuth();

  onMount(async () => {
    // Only auto-login in development
    if (import.meta.env.DEV) {
      try {
        await loginAsAdmin("admin@zahrawiclinic.com", "changeme123");
      } catch (err) {
        console.error("Auto-login failed:", err);
      }
    }
  });

  return (
    <div class="min-h-screen bg-gray-50">
      <ProtectedRoute fallback={<LoginForm />}>
        <div class="container mx-auto p-4">
          <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
          <OrganizationsComponent />
        </div>
      </ProtectedRoute>
    </div>
  );
}

export default function App() {
  return (
    <PocketBaseContext.Provider value={pb}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </PocketBaseContext.Provider>
  );
}



// interface QueryOptions {
//   page?: number;
//   perPage?: number;
//   filter?: string;
//   sort?: string;
// }
//
// // Create a centralized query key factory for consistency
// export const queryKeys = {
//   all: ['pocketbase'] as const,
//   collection: (collection: string) => [...queryKeys.all, collection] as const,
//   list: (collection: string, options: QueryOptions = {}) => [
//     ...queryKeys.collection(collection),
//     'list',
//     options.page ?? 1,
//     options.perPage ?? 50,
//     options.filter ?? '',
//     options.sort ?? '',
//   ] as const,
//   detail: (collection: string, id: string) => [...queryKeys.collection(collection), 'detail', id] as const,
// };
//
// // IMPROVEMENT 2: Enhanced query hook with better error handling and retry logic
// export function usePocketBaseQuery<T extends keyof CollectionResponses>(
//   collection: T,
//   options: QueryOptions = {}
// ) {
//   const pb = usePocketBase();
//
//   return useQuery(() => ({
//     queryKey: queryKeys.list(collection, options),
//     queryFn: async () => {
//       try {
//         const records = await pb.collection(collection).getList(
//           options.page ?? 1,
//           options.perPage ?? 50,
//           {
//             filter: options.filter,
//             sort: options.sort,
//             // Add expand if needed
//             // expand: options.expand 
//           }
//         );
//         return {
//           items: records.items as CollectionResponses[T][],
//           totalItems: records.totalItems,
//           totalPages: records.totalPages,
//           page: records.page,
//           perPage: records.perPage,
//         };
//       } catch (error) {
//         console.error(`Failed to fetch ${collection}:`, error);
//         throw error;
//       }
//     },
//     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
//     retry: (failureCount, error: any) => {
//       // Don't retry on 404s or auth errors
//       if (error?.status === 404 || error?.status === 401) return false;
//       return failureCount < 3;
//     },
//   }));
// }
//
// interface CreateMutationVariables<T extends keyof CollectionRecords> {
//   data: Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>;
// }
//
// interface UpdateMutationVariables<T extends keyof CollectionRecords> {
//   id: string;
//   data: Partial<Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>>;
// }
//
// interface DeleteMutationVariables {
//   id: string;
// }
// export function usePocketBaseCreate<T extends keyof CollectionRecords>(
//   collection: T,
//   queryOptions?: QueryOptions
// ) {
//   const pb = usePocketBase();
//   const queryClient = useQueryClient();
//   const listQueryKey = queryKeys.list(collection, queryOptions);
//
//   return useMutation(() => ({
//     mutationFn: async ({ data }: CreateMutationVariables<T>) => {
//       return await pb.collection(collection).create<CollectionResponses[T]>(data);
//     },
//
//     onMutate: async ({ data }) => {
//       await queryClient.cancelQueries({ queryKey: listQueryKey });
//       const previousData = queryClient.getQueryData(listQueryKey);
//
//       queryClient.setQueryData(listQueryKey, (old: any) => {
//         if (!old) return old;
//         const tempRecord = {
//           ...data,
//           id: `temp-${Date.now()}`,
//           created: new Date().toISOString(),
//           updated: new Date().toISOString(),
//         } as CollectionResponses[T];
//         return {
//           ...old,
//           items: [...(old.items || []), tempRecord],
//           totalItems: old.totalItems + 1,
//         };
//       });
//       return { previousData };
//     },
//
//     onError: (err, variables, context) => {
//       console.error("Create mutation failed:", err);
//       if (context?.previousData) {
//         queryClient.setQueryData(listQueryKey, context.previousData);
//       }
//     },
//
//     onSuccess: (data) => {
//       queryClient.setQueryData(listQueryKey, (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           items: old.items.map((item: any) =>
//             item.id.startsWith('temp-') ? data : item
//           ),
//         };
//       });
//     },
//
//     // REMOVED onSettled to prevent the race condition.
//     // The realtime hook will handle the invalidation.
//     // onSettled: () => {
//     //   queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
//     // },
//   }));
// }
//
// export function usePocketBaseUpdate<T extends keyof CollectionRecords>(
//   collection: T,
//   queryOptions?: QueryOptions
// ) {
//   const pb = usePocketBase();
//   const queryClient = useQueryClient();
//   const listQueryKey = queryKeys.list(collection, queryOptions);
//
//   return useMutation(() => ({
//     mutationFn: async ({ id, data }: UpdateMutationVariables<T>) => {
//       return await pb.collection(collection).update<CollectionResponses[T]>(id, data);
//     },
//
//     onMutate: async ({ id, data }) => {
//       await queryClient.cancelQueries({ queryKey: listQueryKey });
//
//       const previousData = queryClient.getQueryData(listQueryKey);
//
//       // Optimistic update
//       queryClient.setQueryData(listQueryKey, (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           items: old.items.map((item: any) =>
//             item.id === id ? { ...item, ...data, updated: new Date().toISOString() } : item
//           ),
//         };
//       });
//
//       return { previousData };
//     },
//
//     onError: (err, variables, context) => {
//       console.error("Update mutation failed:", err);
//       if (context?.previousData) {
//         queryClient.setQueryData(listQueryKey, context.previousData);
//       }
//     },
//
//     // onSettled: () => {
//     //   queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
//     // },
//   }));
// }
//
// export function usePocketBaseDelete<T extends keyof CollectionRecords>(
//   collection: T,
//   queryOptions?: QueryOptions
// ) {
//   const pb = usePocketBase();
//   const queryClient = useQueryClient();
//   const listQueryKey = queryKeys.list(collection, queryOptions);
//
//   return useMutation(() => ({
//     mutationFn: async ({ id }: DeleteMutationVariables) => {
//       await pb.collection(collection).delete(id);
//       return { id };
//     },
//
//     onMutate: async ({ id }) => {
//       await queryClient.cancelQueries({ queryKey: listQueryKey });
//
//       const previousData = queryClient.getQueryData(listQueryKey);
//
//       // Optimistic update
//       queryClient.setQueryData(listQueryKey, (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           items: old.items.filter((item: any) => item.id !== id),
//           totalItems: old.totalItems - 1,
//         };
//       });
//
//       return { previousData };
//     },
//
//     onError: (err, variables, context) => {
//       console.error("Delete mutation failed:", err);
//       if (context?.previousData) {
//         queryClient.setQueryData(listQueryKey, context.previousData);
//       }
//     },
//
//     // onSettled: () => {
//     //   queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
//     // },
//   }));
// }
//
//
// export function usePocketBaseRealtime<T extends keyof CollectionResponses>(
//   collection: T,
//   options?: {
//     enabled?: boolean;
//     recordId?: string; // For subscribing to specific records
//   }
// ) {
//   const pb = usePocketBase();
//   const queryClient = useQueryClient();
//   const [connectionStatus, setConnectionStatus] = createSignal<'connected' | 'disconnected' | 'error'>('disconnected');
//
//   createEffect(() => {
//     if (options?.enabled === false) return;
//
//     const subscriptionTarget = options?.recordId || '*';
//
//     const callback = (e: { action: string; record: any }) => {
//       console.log('Realtime event:', e.action, e.record);
//       setConnectionStatus('connected');
//
//       // More granular invalidation based on action
//       if (e.action === 'create' || e.action === 'delete') {
//         // Invalidate list queries
//         queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
//       } else if (e.action === 'update') {
//         // Update specific record in cache
//         queryClient.setQueryData(
//           queryKeys.detail(collection, e.record.id),
//           e.record
//         );
//         // Also invalidate list queries that might contain this record
//         queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
//       }
//     };
//
//     const errorCallback = (error: any) => {
//       console.error('Realtime connection error:', error);
//       setConnectionStatus('error');
//     };
//
//     // Subscribe with error handling
//     pb.collection(collection)
//       .subscribe(subscriptionTarget, callback)
//       .then(() => setConnectionStatus('connected'))
//       .catch(errorCallback);
//
//     onCleanup(() => {
//       pb.collection(collection)
//         .unsubscribe(subscriptionTarget)
//         .then(() => setConnectionStatus('disconnected'))
//         .catch((err) => {
//           console.error('Error unsubscribing:', err);
//           setConnectionStatus('error');
//         });
//     });
//   });
//
//   return { connectionStatus };
// }


// function OrganizationsComponent() {
//   const queryOptions = { page: 1, perPage: 50 };
//   const [isSubmitting, setIsSubmitting] = createSignal(false);
//
//   // Use the improved query hook
//   const orgsQuery = usePocketBaseQuery('organizations', queryOptions);
//
//   // Use separate mutation hooks
//   const createOrg = usePocketBaseCreate('organizations', queryOptions);
//   const deleteOrg = usePocketBaseDelete('organizations', queryOptions);
//
//   // Enhanced realtime with connection status
//   const { connectionStatus } = usePocketBaseRealtime('organizations');
//
//   const handleCreateSubmit = async (title: string) => {
//     if (!title.trim()) return;
//
//     setIsSubmitting(true);
//     try {
//       await createOrg.mutateAsync({
//         data: {
//           organization_name: title.trim(),
//           owners: ['8gkeijxmbjenf6y'], // Example data
//           address: '123 Main St',    // Example data
//         }
//       });
//     } catch (error) {
//       console.error('Failed to create organization:', error);
//       // Could add toast notification here
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this organization?')) {
//       deleteOrg.mutate({ id });
//     }
//   };
//
//   return (
//     <div class="p-4 border rounded-lg shadow-md">
//       <div class="flex justify-between items-center mb-4">
//         <h2 class="text-xl font-semibold">Organizations</h2>
//         <div class="flex items-center gap-2">
//           <div class={`w-2 h-2 rounded-full ${connectionStatus() === 'connected' ? 'bg-green-500' :
//             connectionStatus() === 'error' ? 'bg-red-500' : 'bg-yellow-500'
//             }`} title={`Realtime: ${connectionStatus()}`} />
//           <span class="text-sm text-gray-500">
//             {orgsQuery.data?.totalItems || 0} organizations
//           </span>
//         </div>
//       </div>
//
//       {/* Enhanced loading and error states */}
//       <Show when={orgsQuery.isLoading}>
//         <div class="animate-pulse">
//           <div class="h-4 bg-gray-200 rounded mb-2"></div>
//           <div class="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
//           <div class="h-4 bg-gray-200 rounded w-1/2"></div>
//         </div>
//       </Show>
//
//       <Show when={orgsQuery.isError}>
//         <div class="bg-red-50 border border-red-200 rounded p-4">
//           <p class="text-red-800">Error loading organizations: {orgsQuery.error?.message}</p>
//           <button
//             onClick={() => orgsQuery.refetch()}
//             class="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
//           >
//             Retry
//           </button>
//         </div>
//       </Show>
//
//       <Show when={orgsQuery.isSuccess && orgsQuery.data}>
//         <div class="space-y-2 mb-4">
//           <For each={orgsQuery.data!.items}>
//             {(org) => (
//               <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
//                 <div class="flex items-center gap-2">
//                   <span>{org.organization_name}</span>
//                   {org.id.startsWith('temp-') && (
//                     <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                       Saving...
//                     </span>
//                   )}
//                 </div>
//                 <Show when={!org.id.startsWith('temp-')}>
//                   <button
//                     onClick={() => handleDelete(org.id)}
//                     disabled={deleteOrg.isPending}
//                     class="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded disabled:opacity-50"
//                   >
//                     Delete
//                   </button>
//                 </Show>
//               </div>
//             )}
//           </For>
//         </div>
//       </Show>
//
//       {/* Enhanced form with better validation */}
//       <form
//         onSubmit={async (e) => {
//           e.preventDefault();
//           const form = e.currentTarget;
//           const formData = new FormData(form);
//           const title = (formData.get('title') as string)?.trim();
//
//           if (title) {
//             await handleCreateSubmit(title);
//             form.reset();
//           }
//         }}
//         class="flex gap-2"
//       >
//         <input
//           type="text"
//           name="title"
//           class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           placeholder="New Organization Name"
//           required
//           disabled={isSubmitting()}
//           minLength="1"
//           maxLength="100"
//         />
//         <button
//           type="submit"
//           disabled={isSubmitting() || createOrg.isPending}
//           class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//         >
//           {isSubmitting() || createOrg.isPending ? 'Creating...' : 'Create'}
//         </button>
//       </form>
//
//       {/* Show pagination if needed */}
//       <Show when={orgsQuery.data && orgsQuery.data.totalPages > 1}>
//         <div class="mt-4 text-sm text-gray-600">
//           Page {orgsQuery.data!.page} of {orgsQuery.data!.totalPages}
//         </div>
//       </Show>
//     </div>
//   );
// }

// export function usePocketBaseMutation<T extends keyof CollectionRecords>(
//   collection: T,
//   action: 'create' | 'update' | 'delete'
// ) {
//   const pb = usePocketBase();
//   const queryClient = useQueryClient();
//
//   return useMutation(() => ({
//     // The mutation function now receives our MutationVariables object
//     mutationFn: async ({ data }: MutationVariables<T>) => {
//       if (action === 'create') {
//         // For create, we don't expect an ID in the input data
//         const { id, ...createData } = data;
//         return await pb.collection(collection).create<CollectionResponses[T]>(createData);
//       }
//       if (action === 'update' && data.id) {
//         return await pb.collection(collection).update<CollectionResponses[T]>(data.id, data);
//       }
//       if (action === 'delete' && data.id) {
//         await pb.collection(collection).delete(data.id);
//         // On delete, we return the original data so we have access to the ID for optimistic updates
//         return data as CollectionResponses[T];
//       }
//       throw new Error('Invalid mutation action or missing ID');
//     },
//
//     // 1. This runs before the mutationFn
//     onMutate: async (variables: MutationVariables<T>) => {
//       const { queryKey, data: newRecord } = variables;
//
//       // Cancel any outgoing refetches so they don't overwrite our optimistic update
//       await queryClient.cancelQueries({ queryKey });
//
//       // Snapshot the previous value
//       const previousData = queryClient.getQueryData<CollectionResponses[T][]>(queryKey);
//
//       // Optimistically update to the new value
//       if (previousData) {
//         queryClient.setQueryData<CollectionResponses[T][]>(queryKey, (old) => {
//           const oldData = old ?? [];
//           if (action === 'create') {
//             // For 'create', we add the new record to the end of the list.
//             // Note: This newRecord won't have a real ID from the DB yet.
//             return [...oldData, newRecord as CollectionResponses[T]];
//           }
//           if (action === 'update' && newRecord.id) {
//             // For 'update', we find the item and replace it.
//             return oldData.map((item) =>
//               item.id === newRecord.id ? { ...item, ...newRecord } : item
//             );
//           }
//           if (action === 'delete' && newRecord.id) {
//             // For 'delete', we filter out the item.
//             return oldData.filter((item) => item.id !== newRecord.id);
//           }
//           return oldData;
//         });
//       }
//
//       // Return a context object with the snapshotted value
//       return { previousData };
//     },
//
//     // 2. If the mutation fails, use the context returned from onMutate to roll back
//     onError: (err, variables, context) => {
//       console.error("Mutation failed:", err);
//       if (context?.previousData) {
//         queryClient.setQueryData(variables.queryKey, context.previousData);
//       }
//     },
//
//     // 3. Always refetch after error or success to ensure data is consistent
//     onSettled: (data, error, variables) => {
//       // Invalidate the specific query we were working with to get fresh server data
//       queryClient.invalidateQueries({ queryKey: variables.queryKey });
//       // You might also invalidate a broader key if other parts of the app depend on this data
//       // queryClient.invalidateQueries({ queryKey: [collection] });
//     },
//   }));
// }

// export function usePocketBaseRealtime<T extends keyof CollectionResponses>(
//   collection: T
// ) {
//   const pb = usePocketBase();
//   const queryClient = useQueryClient();
//
//   createEffect(() => {
//     const callback = (e: { action: string; record: any }) => {
//       console.log('Realtime event:', e.action, e.record);
//       // Invalidate the entire collection. TanStack Query will automatically
//       // refetch active queries, ensuring data is correct and respects
//       // pagination, filtering, and sorting.
//       queryClient.invalidateQueries({ queryKey: [collection] });
//     };
//
//     pb.collection(collection).subscribe('*', callback);
//
//     onCleanup(() => {
//       pb.collection(collection).unsubscribe('*').catch((err) => {
//         console.error('Error unsubscribing:', err);
//       });
//     });
//   });
// }
