// utils/optimistic-manager.ts
import { createStore } from 'solid-js/store';
import { createSignal } from 'solid-js';
import type { OptimisticOperation, MutationQueue } from './optimistic-types';
import type { Collections } from '../types/pocketbase-types';

class OptimisticManager {
  private operationQueue: MutationQueue;
  private setOperationQueue: any;
  private conflictCount: () => number;
  private setConflictCount: (value: number | ((prev: number) => number)) => void;

  constructor() {
    // Initialize store
    const [queue, setQueue] = createStore<MutationQueue>({
      operations: new Map(),
      isProcessing: false,
    });

    this.operationQueue = queue;
    this.setOperationQueue = setQueue;

    // Initialize signals
    const [count, setCount] = createSignal(0);
    this.conflictCount = count;
    this.setConflictCount = setCount;
  }

  // Generate unique operation ID
  generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add operation to queue
  addOperation(operation: OptimisticOperation): void {
    this.setOperationQueue('operations', (prev: Map<string, OptimisticOperation>) => {
      const newMap = new Map(prev);
      newMap.set(operation.id, operation);
      return newMap;
    });
  }

  // Remove operation from queue
  removeOperation(operationId: string): void {
    this.setOperationQueue('operations', (prev: Map<string, OptimisticOperation>) => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });
  }

  // Get operation by ID
  getOperation(operationId: string): OptimisticOperation | undefined {
    return this.operationQueue.operations.get(operationId);
  }

  // Check if there are conflicting operations
  hasConflictingOperations(collection: Collections, recordId?: string): boolean {
    const operations = Array.from(this.operationQueue.operations.values());

    return operations.some(op => {
      if (op.collection !== collection) return false;
      if (op.status !== 'pending') return false;

      // For delete operations, check if any operation targets the same record
      if (op.type === 'delete' && recordId && op.recordId === recordId) return true;

      // For create/update operations on the same record
      if (recordId && op.recordId === recordId && op.type !== 'create') return true;

      return false;
    });
  }

  // Get pending operations for collection
  getPendingOperations(collection: Collections): OptimisticOperation[] {
    return Array.from(this.operationQueue.operations.values())
      .filter(op => op.collection === collection && op.status === 'pending')
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Update operation status
  updateOperationStatus(operationId: string, status: OptimisticOperation['status']): void {
    const operation = this.getOperation(operationId);
    if (operation) {
      this.setOperationQueue('operations', (prev: Map<string, OptimisticOperation>) => {
        const newMap = new Map(prev);
        const existingOp = newMap.get(operationId);
        if (existingOp) {
          newMap.set(operationId, { ...existingOp, status });
        }
        return newMap;
      });
    }
  }

  // Clean up old operations
  cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    this.setOperationQueue('operations', (prev: Map<string, OptimisticOperation>) => {
      const newMap = new Map();
      for (const [id, op] of prev) {
        if (now - op.timestamp < maxAge) {
          newMap.set(id, op);
        }
      }
      return newMap;
    });
  }

  // Get current state
  getState() {
    return {
      queue: this.operationQueue,
      conflictCount: this.conflictCount(),
    };
  }

  // Increment conflict counter
  incrementConflictCount(): void {
    this.setConflictCount(prev => prev + 1);
  }
}

export const optimisticManager = new OptimisticManager();

// Clean up old operations every minute
setInterval(() => {
  optimisticManager.cleanup();
}, 60 * 1000);
