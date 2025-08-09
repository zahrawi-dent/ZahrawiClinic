import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, createEffect, onCleanup } from 'solid-js';
import { usePocketBase } from '../lib/pocketbase';
import { queryKeys, type QueryOptions } from '../data/queryKeys';
import { optimisticManager } from './optimistic-manager';
import type {
  Collections,
  CollectionResponses,
  CollectionRecords
} from '../types/pocketbase-types';
import type {
  OptimisticContext,
  OptimisticOperation
} from './optimistic-types';
import type { ListResult } from 'pocketbase';

// ========== QUERY HOOKS ==========

/**
 * Enhanced useListQuery with optimistic operation awareness
 */
export function useListQuery<T extends Collections>(
  collection: T,
  options: QueryOptions = {}
) {
  const pb = usePocketBase();

  return useQuery(() => ({
    queryKey: queryKeys.list(collection, options),
    queryFn: async () => {
      const records = await pb.collection(collection).getList<CollectionResponses[T]>(
        options.page ?? 1,
        options.perPage ?? 50,
        {
          filter: options.filter,
          sort: options.sort,
          expand: options.expand,
        }
      );
      return records;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes (cache time)
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    // Retry failed queries with exponential backoff
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.log(`[Query] Retrying ${collection} list query, attempt ${failureCount + 1}`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }));
}

/**
 * Generic hook to fetch a single record from a PocketBase collection
 */
export function useDetailQuery<T extends Collections>(
  collection: T,
  id: string,
  options: Omit<QueryOptions, 'page' | 'perPage'> = {}
) {
  const pb = usePocketBase();

  return useQuery(() => ({
    queryKey: queryKeys.detail(collection, id),
    queryFn: async () => {
      const record = await pb.collection(collection).getOne<CollectionResponses[T]>(id, {
        expand: options.expand,
      });
      return record;
    },
    enabled: !!id && id !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if record not found (404)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  }));
}

// ========== REALTIME SUBSCRIPTION ==========

/**
 * Enhanced realtime subscription with better error handling and cleanup
 */
export function useRealtimeSubscription(collection: Collections) {
  const pb = usePocketBase();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = createSignal(false);
  const [retryCount, setRetryCount] = createSignal(0);

  createEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let reconnectTimeout: number | null = null;

    const connect = async () => {
      try {
        console.log(`[Realtime] Connecting to ${collection}...`);

        const callback = (e: any) => {
          console.log(`[Realtime] Event received for ${collection}:`, e.action);

          // Handle different types of realtime events
          switch (e.action) {
            case 'create':
              console.log(`[Realtime] New record created in ${collection}`);
              queryClient.invalidateQueries({
                queryKey: queryKeys.collection(collection),
                exact: false
              });
              break;

            case 'update':
              console.log(`[Realtime] Record updated in ${collection}: ${e.record?.id}`);
              // Invalidate both list and detail queries
              queryClient.invalidateQueries({
                queryKey: queryKeys.collection(collection),
                exact: false
              });
              if (e.record?.id) {
                queryClient.invalidateQueries({
                  queryKey: queryKeys.detail(collection, e.record.id)
                });
              }
              break;

            case 'delete':
              console.log(`[Realtime] Record deleted from ${collection}: ${e.record?.id}`);

              // Remove from cache immediately
              if (e.record?.id) {
                queryClient.removeQueries({
                  queryKey: queryKeys.detail(collection, e.record.id)
                });
              }

              // Update list queries to remove deleted item
              queryClient.setQueriesData<ListResult<CollectionResponses[typeof collection]>>(
                { queryKey: queryKeys.collection(collection), exact: false },
                (old) => {
                  if (!old || !e.record?.id) return old;

                  return {
                    ...old,
                    totalItems: Math.max(0, old.totalItems - 1),
                    items: old.items.filter(item => item.id !== e.record.id)
                  };
                }
              );
              break;

            default:
              // Fallback: invalidate all queries for this collection
              queryClient.invalidateQueries({
                queryKey: queryKeys.collection(collection),
                exact: false
              });
          }
        };

        unsubscribe = await pb.collection(collection).subscribe('*', callback);
        setIsConnected(true);
        setRetryCount(0);

        console.log(`[Realtime] Successfully connected to ${collection}`);

      } catch (error) {
        console.error(`[Realtime] Failed to connect to ${collection}:`, error);
        setIsConnected(false);

        // Implement exponential backoff for reconnection
        const currentRetryCount = retryCount();
        if (currentRetryCount < 5) {
          const delay = Math.min(1000 * Math.pow(2, currentRetryCount), 30000);
          console.log(`[Realtime] Retrying connection to ${collection} in ${delay}ms...`);

          reconnectTimeout = window.setTimeout(() => {
            setRetryCount(prev => prev + 1);
            connect();
          }, delay);
        } else {
          console.error(`[Realtime] Max reconnection attempts reached for ${collection}`);
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup function
    onCleanup(() => {
      console.log(`[Realtime] Cleaning up subscription for ${collection}`);

      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error(`[Realtime] Error during unsubscribe for ${collection}:`, error);
        }
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      setIsConnected(false);
      setRetryCount(0);
    });
  });

  // Return connection status for debugging
  return {
    isConnected,
    retryCount,
  };
}

// Utility to generate temporary IDs
const generateTempId = (): string => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Utility to create optimistic record
const createOptimisticRecord = <T extends Collections>(
  collection: T,
  data: Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>,
  tempId?: string
): CollectionResponses[T] => {
  const id = tempId || generateTempId();
  const now = new Date().toISOString();

  return {
    ...data,
    id,
    created: now,
    updated: now,
    collectionId: `temp_${collection}`,
    collectionName: collection,
    expand: {},
  } as CollectionResponses[T];
};

// Create Mutation with Optimistic Updates
export function useCreateMutation<T extends Collections>(collection: T) {
  const pb = usePocketBase();
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = createSignal(0);

  return useMutation(() => ({
    mutationFn: async ({ data }: { data: Omit<CollectionRecords[T], 'id' | 'created' | 'updated'> }) => {
      return await pb.collection(collection).create<CollectionResponses[T]>(data);
    },

    onMutate: async (variables): Promise<OptimisticContext<CollectionResponses[T]>> => {
      const operationId = optimisticManager.generateOperationId();
      const tempId = generateTempId();

      // Create and register the operation
      const operation: OptimisticOperation = {
        id: operationId,
        type: 'create',
        collection,
        recordId: tempId,
        timestamp: Date.now(),
        data: variables.data,
        status: 'pending',
      };

      optimisticManager.addOperation(operation);

      // Check for conflicts
      if (optimisticManager.hasConflictingOperations(collection)) {
        optimisticManager.incrementConflictCount();
        console.warn(`[Optimistic] Potential conflict detected for collection: ${collection}`);
      }

      try {
        // 1. Cancel outgoing refetches to prevent race conditions
        await queryClient.cancelQueries({
          queryKey: queryKeys.collection(collection)
        });

        // 2. Create optimistic record
        const optimisticRecord = createOptimisticRecord(collection, variables.data, tempId);

        // 3. Store rollback functions
        const rollbackFunctions: (() => void)[] = [];

        // 4. Update all list queries optimistically
        queryClient.setQueriesData<ListResult<CollectionResponses[T]>>(
          { queryKey: queryKeys.collection(collection), exact: false },
          (old) => {
            if (!old) return old;

            const newItems = [...old.items];

            // Check if this record already exists (handle rapid clicks)
            const existingIndex = newItems.findIndex(item =>
              item.id === tempId ||
              (item.id.startsWith('temp_') && JSON.stringify(item) === JSON.stringify(optimisticRecord))
            );

            if (existingIndex === -1) {
              newItems.push(optimisticRecord);
            }

            const newData = {
              ...old,
              totalItems: existingIndex === -1 ? old.totalItems + 1 : old.totalItems,
              items: newItems,
            };

            // Store rollback function
            rollbackFunctions.push(() => {
              queryClient.setQueriesData(
                { queryKey: queryKeys.collection(collection), exact: false },
                old
              );
            });

            return newData;
          }
        );

        return {
          operationId,
          optimisticRecord,
          rollbackFunctions,
        };

      } catch (error) {
        console.error(`[Optimistic] Failed to apply optimistic update for ${collection}:`, error);
        optimisticManager.removeOperation(operationId);
        throw error;
      }
    },

    onError: (error, variables, context) => {
      console.error(`[Optimistic] Create mutation failed for ${collection}:`, error);

      if (context) {
        // Update operation status
        optimisticManager.updateOperationStatus(context.operationId, 'error');

        // Execute all rollback functions
        context.rollbackFunctions.forEach(rollback => {
          try {
            rollback();
          } catch (rollbackError) {
            console.error(`[Optimistic] Rollback failed:`, rollbackError);
          }
        });

        // Increment retry count and implement exponential backoff
        setRetryCount(prev => prev + 1);

        // Remove operation from queue after rollback
        setTimeout(() => {
          optimisticManager.removeOperation(context.operationId);
        }, 1000);
      }

      // Force refresh if too many errors
      if (retryCount() > 3) {
        console.warn(`[Optimistic] Too many retries, forcing refresh for ${collection}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
        setRetryCount(0);
      }
    },

    onSuccess: (newRecord, variables, context) => {
      if (context) {
        // Update operation status
        optimisticManager.updateOperationStatus(context.operationId, 'success');

        try {
          // Replace optimistic record with real server data
          queryClient.setQueriesData<ListResult<CollectionResponses[T]>>(
            { queryKey: queryKeys.collection(collection), exact: false },
            (old) => {
              if (!old) return old;

              return {
                ...old,
                items: old.items.map(item =>
                  item.id === context.optimisticRecord?.id ? newRecord : item
                ),
              };
            }
          );

          console.log(`[Optimistic] Successfully replaced optimistic record with server data for ${collection}`);
        } catch (error) {
          console.error(`[Optimistic] Failed to replace optimistic record:`, error);
          // Fallback: invalidate queries
          queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
        }

        // Clean up operation
        setTimeout(() => {
          optimisticManager.removeOperation(context.operationId);
        }, 1000);
      }

      // Reset retry count on success
      setRetryCount(0);
    },

    onSettled: () => {
      // Fallback: ensure data consistency
      // This runs after both success and error
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.collection(collection),
          exact: false
        });
      }, 2000);
    },
  }));
}

// Delete Mutation with Optimistic Updates
export function useDeleteMutation<T extends Collections>(collection: T) {
  const pb = usePocketBase();
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = createSignal(0);

  return useMutation(() => ({
    mutationFn: async ({ id }: { id: string }) => {
      await pb.collection(collection).delete(id);
      return { id };
    },

    onMutate: async (variables): Promise<OptimisticContext<CollectionResponses[T]>> => {
      const operationId = optimisticManager.generateOperationId();

      // Create and register the operation
      const operation: OptimisticOperation = {
        id: operationId,
        type: 'delete',
        collection,
        recordId: variables.id,
        timestamp: Date.now(),
        status: 'pending',
      };

      optimisticManager.addOperation(operation);

      // Check for conflicts (e.g., trying to delete a record being updated)
      if (optimisticManager.hasConflictingOperations(collection, variables.id)) {
        optimisticManager.incrementConflictCount();
        console.warn(`[Optimistic] Conflict detected: trying to delete ${variables.id} while other operations are pending`);

        // Delay this operation slightly to let other operations complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKeys.collection(collection)
        });

        // Store original data for rollback
        const previousDataMap = new Map<any[], ListResult<CollectionResponses[T]>>();
        const rollbackFunctions: (() => void)[] = [];

        // Update all list queries optimistically
        queryClient.setQueriesData<ListResult<CollectionResponses[T]>>(
          { queryKey: queryKeys.collection(collection), exact: false },
          (old) => {
            if (!old) return old;

            // Find the exact query for rollback
            const currentQuery = queryClient.getQueryCache().find({
              queryKey: queryKeys.collection(collection),
              predicate: (query) => query.state.data === old,
            });

            if (currentQuery) {
              const queryKey = [...currentQuery.queryKey];
              previousDataMap.set(queryKey, old);

              // Store rollback function
              rollbackFunctions.push(() => {
                queryClient.setQueryData(queryKey, old);
              });
            }

            // Create new data without the deleted item
            const filteredItems = old.items.filter(item => item.id !== variables.id);

            return {
              ...old,
              totalItems: Math.max(0, old.totalItems - 1),
              items: filteredItems,
            };
          }
        );

        return {
          operationId,
          previousData: previousDataMap,
          rollbackFunctions,
        };

      } catch (error) {
        console.error(`[Optimistic] Failed to apply optimistic delete for ${collection}:`, error);
        optimisticManager.removeOperation(operationId);
        throw error;
      }
    },

    onError: (error, variables, context) => {
      console.error(`[Optimistic] Delete mutation failed for ${collection}:`, error);

      if (context) {
        // Update operation status
        optimisticManager.updateOperationStatus(context.operationId, 'error');

        // Execute rollback functions
        context.rollbackFunctions.forEach(rollback => {
          try {
            rollback();
          } catch (rollbackError) {
            console.error(`[Optimistic] Delete rollback failed:`, rollbackError);
          }
        });

        setRetryCount(prev => prev + 1);

        // Clean up operation
        setTimeout(() => {
          optimisticManager.removeOperation(context.operationId);
        }, 1000);
      }

      // Force refresh if too many errors
      if (retryCount() > 3) {
        console.warn(`[Optimistic] Too many delete retries, forcing refresh for ${collection}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
        setRetryCount(0);
      }
    },

    onSuccess: (result, variables, context) => {
      if (context) {
        // Update operation status
        optimisticManager.updateOperationStatus(context.operationId, 'success');

        console.log(`[Optimistic] Delete successful for ${collection}:${variables.id}`);

        // Clean up operation
        setTimeout(() => {
          optimisticManager.removeOperation(context.operationId);
        }, 1000);
      }

      setRetryCount(0);
    },

    onSettled: () => {
      // Ensure consistency after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.collection(collection),
          exact: false
        });
      }, 2000);
    },
  }));
}

// Update Mutation with Optimistic Updates
export function useUpdateMutation<T extends Collections>(collection: T) {
  const pb = usePocketBase();
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = createSignal(0);

  return useMutation(() => ({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>>
    }) => {
      return await pb.collection(collection).update<CollectionResponses[T]>(id, data);
    },

    onMutate: async (variables): Promise<OptimisticContext<CollectionResponses[T]>> => {
      const operationId = optimisticManager.generateOperationId();

      // Create and register the operation
      const operation: OptimisticOperation = {
        id: operationId,
        type: 'update',
        collection,
        recordId: variables.id,
        timestamp: Date.now(),
        data: variables.data,
        status: 'pending',
      };

      optimisticManager.addOperation(operation);

      // Check for conflicts
      if (optimisticManager.hasConflictingOperations(collection, variables.id)) {
        optimisticManager.incrementConflictCount();
        console.warn(`[Optimistic] Update conflict detected for ${collection}:${variables.id}`);

        // Get pending operations for this record
        const pendingOps = optimisticManager.getPendingOperations(collection)
          .filter(op => op.recordId === variables.id);

        if (pendingOps.length > 1) {
          // Merge operations if possible
          console.log(`[Optimistic] Merging ${pendingOps.length} operations for ${variables.id}`);
        }
      }

      try {
        await queryClient.cancelQueries({
          queryKey: queryKeys.collection(collection)
        });

        const rollbackFunctions: (() => void)[] = [];
        const previousDataMap = new Map<any[], ListResult<CollectionResponses[T]>>();
        let previousDetail: CollectionResponses[T] | undefined;

        // Update list queries
        queryClient.setQueriesData<ListResult<CollectionResponses[T]>>(
          { queryKey: queryKeys.collection(collection), exact: false },
          (old) => {
            if (!old) return old;

            // Store original data for rollback
            const currentQuery = queryClient.getQueryCache().find({
              queryKey: queryKeys.collection(collection),
              predicate: (query) => query.state.data === old,
            });

            if (currentQuery) {
              const queryKey = [...currentQuery.queryKey];
              previousDataMap.set(queryKey, old);

              rollbackFunctions.push(() => {
                queryClient.setQueryData(queryKey, old);
              });
            }

            // Apply optimistic update
            return {
              ...old,
              items: old.items.map(item =>
                item.id === variables.id
                  ? {
                    ...item,
                    ...variables.data,
                    updated: new Date().toISOString()
                  }
                  : item
              ),
            };
          }
        );

        // Update detail query if it exists
        const detailQueryKey = queryKeys.detail(collection, variables.id);
        previousDetail = queryClient.getQueryData<CollectionResponses[T]>(detailQueryKey);

        if (previousDetail) {
          const updatedDetail = {
            ...previousDetail,
            ...variables.data,
            updated: new Date().toISOString()
          };

          queryClient.setQueryData(detailQueryKey, updatedDetail);

          rollbackFunctions.push(() => {
            queryClient.setQueryData(detailQueryKey, previousDetail);
          });
        }

        return {
          operationId,
          previousData: previousDataMap,
          previousDetail,
          rollbackFunctions,
        };

      } catch (error) {
        console.error(`[Optimistic] Failed to apply optimistic update for ${collection}:`, error);
        optimisticManager.removeOperation(operationId);
        throw error;
      }
    },

    onError: (error, variables, context) => {
      console.error(`[Optimistic] Update mutation failed for ${collection}:`, error);

      if (context) {
        optimisticManager.updateOperationStatus(context.operationId, 'error');

        // Execute rollback functions
        context.rollbackFunctions.forEach(rollback => {
          try {
            rollback();
          } catch (rollbackError) {
            console.error(`[Optimistic] Update rollback failed:`, rollbackError);
          }
        });

        setRetryCount(prev => prev + 1);

        setTimeout(() => {
          optimisticManager.removeOperation(context.operationId);
        }, 1000);
      }

      if (retryCount() > 3) {
        console.warn(`[Optimistic] Too many update retries, forcing refresh for ${collection}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
        setRetryCount(0);
      }
    },

    onSuccess: (updatedRecord, variables, context) => {
      if (context) {
        optimisticManager.updateOperationStatus(context.operationId, 'success');

        try {
          // Replace optimistic data with server response
          queryClient.setQueriesData<ListResult<CollectionResponses[T]>>(
            { queryKey: queryKeys.collection(collection), exact: false },
            (old) => {
              if (!old) return old;

              return {
                ...old,
                items: old.items.map(item =>
                  item.id === variables.id ? updatedRecord : item
                ),
              };
            }
          );

          // Update detail query
          const detailQueryKey = queryKeys.detail(collection, variables.id);
          queryClient.setQueryData(detailQueryKey, updatedRecord);

          console.log(`[Optimistic] Update successful for ${collection}:${variables.id}`);
        } catch (error) {
          console.error(`[Optimistic] Failed to apply server response:`, error);
          queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
        }

        setTimeout(() => {
          optimisticManager.removeOperation(context.operationId);
        }, 1000);
      }

      setRetryCount(0);
    },

    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.collection(collection),
          exact: false
        });
      }, 2000);
    },
  }));
}

// Hook to monitor optimistic operations state
export function useOptimisticState() {
  const state = optimisticManager.getState();

  return {
    pendingOperations: () => Array.from(state.queue.operations.values()),
    conflictCount: state.conflictCount,
    isProcessing: () => state.queue.isProcessing,
    hasPendingOperations: () => state.queue.operations.size > 0,
    getPendingForCollection: (collection: Collections) =>
      optimisticManager.getPendingOperations(collection),
  };
}

// Component to display optimistic operation status (for debugging)
export function OptimisticDebugger() {
  const { pendingOperations, conflictCount, hasPendingOperations } = useOptimisticState();

  return (
    <div class="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-sm">
      <div class="font-bold mb-2">Optimistic Operations</div>
      <div>Pending: {pendingOperations().length}</div>
      <div>Conflicts: {conflictCount}</div>
      {hasPendingOperations() && (
        <div class="mt-2 space-y-1">
          {pendingOperations().slice(0, 3).map(op => (
            <div class={`text-xs p-1 rounded ${op.status === 'pending' ? 'bg-yellow-600' :
              op.status === 'error' ? 'bg-red-600' : 'bg-green-600'
              }`}>
              {op.type} {op.collection} ({op.status})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
