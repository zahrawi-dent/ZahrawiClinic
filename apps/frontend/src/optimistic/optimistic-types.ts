import type { Collections, CollectionResponses, CollectionRecords } from '../types/pocketbase-types';

export interface OptimisticOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: Collections;
  recordId?: string;
  timestamp: number;
  data?: any;
  status: 'pending' | 'success' | 'error';
}

export interface OptimisticContext<T = any> {
  operationId: string;
  previousData?: T | Map<any[], any>;
  previousDetail?: T;
  optimisticRecord?: T;
  rollbackFunctions: (() => void)[];
}

export interface MutationQueue {
  operations: Map<string, OptimisticOperation>;
  isProcessing: boolean;
}
