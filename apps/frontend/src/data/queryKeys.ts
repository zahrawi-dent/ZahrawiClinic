import type { Collections } from '../types/pocketbase-types';

export interface QueryOptions {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
  // Add other PocketBase query options as needed
}

export const queryKeys = {
  // Base collection key
  collection: (collection: Collections) => [collection] as const,

  // List queries with options
  list: (collection: Collections, options: QueryOptions = {}) => [
    collection,
    'list',
    // Include all options that affect the query result
    {
      page: options.page ?? 1,
      perPage: options.perPage ?? 50,
      filter: options.filter || '',
      sort: options.sort || '',
      expand: options.expand || '',
    }
  ] as const,

  // Detail/single record queries
  detail: (collection: Collections, id: string) => [
    collection,
    'detail',
    id
  ] as const,

  // Specific query patterns for common use cases
  listAll: (collection: Collections) => [collection, 'list'] as const,
  listByFilter: (collection: Collections, filter: string) => [
    collection,
    'list',
    { filter }
  ] as const,

  // Search queries
  search: (collection: Collections, query: string, options: QueryOptions = {}) => [
    collection,
    'search',
    query,
    options
  ] as const,

  // Count queries (for pagination info)
  count: (collection: Collections, filter?: string) => [
    collection,
    'count',
    filter || ''
  ] as const,

  // Relationship queries
  related: (
    collection: Collections,
    id: string,
    relation: string,
    options: QueryOptions = {}
  ) => [
    collection,
    'related',
    id,
    relation,
    options
  ] as const,

  // Staff member specific queries
  staffMemberByUser: (userId: string | undefined) => ['staff_members', 'by_user', userId] as const,
  currentUserStaffMember: () => ['staff_members', 'current_user'] as const,
} as const;

// Type helpers for query key inference
export type QueryKey = ReturnType<typeof queryKeys[keyof typeof queryKeys]>;

// Utility function to invalidate all queries for a collection
export const getCollectionInvalidationPattern = (collection: Collections) => ({
  queryKey: queryKeys.collection(collection),
  exact: false, // This will match all queries starting with the collection name
});

// Utility function to get cache keys for debugging
export const getQueryKeyString = (key: QueryKey): string => {
  return JSON.stringify(key);
};
