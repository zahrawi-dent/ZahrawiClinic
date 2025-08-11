// data/data-layer.ts
import { DATA_SOURCE } from '../config';
import * as pocketbase from '../optimistic/optimistic-hooks';
import * as localStorage from './localStorage';

type IDataLayer = typeof pocketbase;

let dataLayer: IDataLayer;

if (DATA_SOURCE === 'pocketbase') {
  console.log("Using PocketBase data source.");
  dataLayer = pocketbase;
} else {
  console.log("DEMO MODE: Using localStorage data source.");
  dataLayer = localStorage;
}

export const {
  useListQuery,
  useDetailQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useRealtimeSubscription,
  useOptimisticState, // Add new hook
  OptimisticDebugger, // Add new component
} = dataLayer;
