import { QueryClient } from '@tanstack/solid-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 30,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      /**
      * 'online'(default ): Pauses mutations when offline.
       * 'always': Always tries to run the mutation.If offline, it will fail immediately.
       * 'offlineFirst': For more complex PWA scenarios.
       */
      networkMode: 'always',
    },
  },
});
