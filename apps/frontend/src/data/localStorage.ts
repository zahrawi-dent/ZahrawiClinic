// data/localStorage.ts - Complete implementation
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query';
import { createSignal } from 'solid-js';
import { Collections, type CollectionResponses, type CollectionRecords } from '../types/pocketbase-types';
import { queryKeys, type QueryOptions } from './queryKeys';

// --- Helper Functions ---

function getCollectionFromStorage<T extends Collections>(collection: T): CollectionResponses[T][] {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(`pb_mock_${collection}`);
    return data ? JSON.parse(data) : [];
  } catch {
    console.warn(`[DEMO] localStorage parse failed for ${collection}`);
    return [];
  }
}

function setCollectionInStorage<T extends Collections>(collection: T, data: CollectionResponses[T][]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`pb_mock_${collection}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`[DEMO] Failed to write data for ${collection}:`, err);
  }
}

function generateMockId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createMockRecord<T extends Collections>(
  collection: T,
  data: Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>
): CollectionResponses[T] {
  const now = new Date().toISOString();

  return {
    ...data,
    id: generateMockId(),
    created: now,
    updated: now,
    collectionId: `local_${collection}`,
    collectionName: collection,
    expand: {},
  } as CollectionResponses[T];
}

// Simulate network delay for more realistic demo
const simulateDelay = (ms: number = 100 + Math.random() * 200) =>
  new Promise(resolve => setTimeout(resolve, ms));

// ========== MOCK HOOKS ==========

export function useListQuery<T extends Collections>(
  collection: T,
  options: QueryOptions = {}
) {
  return useQuery(() => ({
    queryKey: queryKeys.list(collection, options),
    queryFn: async () => {
      console.log(`[DEMO] Fetching ${collection} list from localStorage`);
      await simulateDelay();

      let items = getCollectionFromStorage(collection);

      // Apply basic filtering if provided
      if (options.filter) {
        console.log(`[DEMO] Applying filter to ${collection}: ${options.filter}`);
        // Basic filter implementation (you can enhance this)
        // For now, just log that filtering would happen
      }

      // Apply sorting if provided  
      if (options.sort) {
        console.log(`[DEMO] Applying sort to ${collection}: ${options.sort}`);
        // Basic sorting implementation
        const sortField = options.sort.replace(/^[-+]/, '');
        const isDesc = options.sort.startsWith('-');

        items = [...items].sort((a, b) => {
          const aVal = (a as any)[sortField];
          const bVal = (b as any)[sortField];

          if (aVal < bVal) return isDesc ? 1 : -1;
          if (aVal > bVal) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const page = options.page ?? 1;
      const perPage = options.perPage ?? 50;
      const startIdx = (page - 1) * perPage;
      const endIdx = startIdx + perPage;
      const paginatedItems = items.slice(startIdx, endIdx);

      return {
        page,
        perPage,
        totalPages: Math.ceil(items.length / perPage),
        totalItems: items.length,
        items: paginatedItems,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
  }));
}

export function useDetailQuery<T extends Collections>(
  collection: T,
  id: string,
  options: Omit<QueryOptions, 'page' | 'perPage'> = {}
) {
  return useQuery(() => ({
    queryKey: queryKeys.detail(collection, id),
    queryFn: async () => {
      console.log(`[DEMO] Fetching ${collection} detail for ${id} from localStorage`);
      await simulateDelay();

      const items = getCollectionFromStorage(collection);
      const item = items.find(item => item.id === id);

      if (!item) {
        throw new Error(`[DEMO] Record not found: ${id}`);
      }

      return item;
    },
    enabled: !!id && id !== '',
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  }));
}

export function useCreateMutation<T extends Collections>(collection: T) {
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: async ({ data }: { data: Omit<CollectionRecords[T], 'id' | 'created' | 'updated'> }) => {
      console.log(`[DEMO] Creating record in ${collection}`);
      await simulateDelay(200);

      const items = getCollectionFromStorage(collection);
      const newRecord = createMockRecord(collection, data);
      const newItems = [...items, newRecord];

      setCollectionInStorage(collection, newItems);
      return newRecord;
    },
    onSuccess: () => {
      console.log(`[DEMO] Create successful, invalidating ${collection} queries`);
      queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
    },
    onError: (error) => {
      console.error(`[DEMO] Create failed for ${collection}:`, error);
    },
  }));
}

export function useUpdateMutation<T extends Collections>(collection: T) {
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>>
    }) => {
      console.log(`[DEMO] Updating ${id} in ${collection}`);
      await simulateDelay(150);

      const items = getCollectionFromStorage(collection);
      const updatedItems = items.map(item =>
        item.id === id
          ? { ...item, ...data, updated: new Date().toISOString() }
          : item
      );

      const updatedRecord = updatedItems.find(item => item.id === id);
      if (!updatedRecord) {
        throw new Error(`[DEMO] Record not found for update: ${id}`);
      }

      setCollectionInStorage(collection, updatedItems);
      return updatedRecord;
    },
    onSuccess: (data) => {
      console.log(`[DEMO] Update successful for ${collection}:${data?.id}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(collection, data.id) });
      }
    },
    onError: (error) => {
      console.error(`[DEMO] Update failed for ${collection}:`, error);
    },
  }));
}

export function useDeleteMutation<T extends Collections>(collection: T) {
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: async ({ id }: { id: string }) => {
      console.log(`[DEMO] Deleting ${id} from ${collection}`);
      await simulateDelay(100);

      let items = getCollectionFromStorage(collection);
      const originalLength = items.length;

      items = items.filter(item => item.id !== id);

      if (items.length === originalLength) {
        throw new Error(`[DEMO] Record not found for deletion: ${id}`);
      }

      setCollectionInStorage(collection, items);
      return { id };
    },
    onSuccess: (data) => {
      console.log(`[DEMO] Delete successful for ${collection}:${data.id}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.collection(collection) });
      // Remove the specific record from cache
      queryClient.removeQueries({ queryKey: queryKeys.detail(collection, data.id) });
    },
    onError: (error) => {
      console.error(`[DEMO] Delete failed for ${collection}:`, error);
    },
  }));
}

// Mock realtime subscription - does nothing but logs
export function useRealtimeSubscription(collection: Collections) {
  const [isConnected] = createSignal(true); // Always "connected" in demo mode
  const [retryCount] = createSignal(0);

  console.log(`[DEMO] Mock real-time subscription active for ${collection}`);

  // In a real demo, you could listen to localStorage changes across tabs:
  // window.addEventListener('storage', (e) => {
  //   if (e.key === `pb_mock_${collection}`) {
  //     // Handle cross-tab updates
  //   }
  // });

  return {
    isConnected,
    retryCount,
  };
}

// Record-level realtime subscription (mock)
export function useRealtimeRecordSubscription(_collection: Collections, _id: string | undefined) {
  // no-op in demo mode
}

// Mock optimistic state hook
export function useOptimisticState() {
  return {
    pendingOperations: () => [],
    conflictCount: () => 0,
    isProcessing: () => false,
    hasPendingOperations: () => false,
    getPendingForCollection: () => [],
  };
}

// Debugger placeholder (mock)
export function OptimisticDebugger() {
  return null as any;
}

// Utility functions for seeding demo data
export function seedDemoData<T extends Collections>(
  collection: T,
  data: Omit<CollectionRecords[T], 'id' | 'created' | 'updated'>[]
) {
  console.log(`[DEMO] Seeding ${data.length} records for ${collection}`);

  const records = data.map(item => createMockRecord(collection, item));
  setCollectionInStorage(collection, records);

  return records;
}

export function clearDemoData(collection?: Collections) {
  if (collection) {
    console.log(`[DEMO] Clearing data for ${collection}`);
    localStorage.removeItem(`pb_mock_${collection}`);
  } else {
    console.log(`[DEMO] Clearing all demo data`);
    Object.keys(localStorage)
      .filter(key => key.startsWith('pb_mock_'))
      .forEach(key => localStorage.removeItem(key));
  }
}

export function getDemoDataStats() {
  const stats: Record<string, number> = {};

  Object.values(Collections).forEach(collection => {
    const data = getCollectionFromStorage(collection);
    stats[collection] = data.length;
  });

  return stats;
}
