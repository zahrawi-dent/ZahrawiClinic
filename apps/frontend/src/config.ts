// This file controls the application's data source.
// Change this value to 'localStorage' to use the mock demo data.
// Change it back to 'pocketbase' to use the live backend.

export const DATA_SOURCE: 'pocketbase' | 'localStorage' =
  import.meta.env.VITE_DATA_SOURCE === 'localStorage' ? 'localStorage' : 'pocketbase';
