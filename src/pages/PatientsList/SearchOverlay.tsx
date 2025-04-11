import { JSX, createEffect, on } from 'solid-js'; // Import on
import { For, Show } from 'solid-js';
import SearchResultItem from './SearchResultItem';
import { UseQueryResult } from '@tanstack/solid-query';
import { Patient } from 'src/types/dental';

interface SearchOverlayProps {
  isOpen: boolean;
  searchTerm: string;
  handleSearchInput: (value: string) => void;
  // Update the type for handleKeyDown
  handleKeyDown: (e: KeyboardEvent, results: Patient[] | undefined | null) => void;
  closeSearch: () => void;
  searchQuery: UseQueryResult<Patient[], Error>;
  debouncedSearchTerm: string;
  selectedIndex: number;
  navigateToPatient: (id: string) => void;
}

export default function SearchOverlay(props: SearchOverlayProps): JSX.Element {
  let searchInputRef: HTMLInputElement | undefined;
  // Ref for the results list container for scrolling
  let resultsListRef: HTMLUListElement | undefined;

  // Focus search input when opened
  createEffect(() => {
    if (props.isOpen && searchInputRef) {
      // Use requestAnimationFrame to ensure the element is truly visible
      requestAnimationFrame(() => searchInputRef?.focus());
    }
  });

  // Scroll selected item into view
  createEffect(on(() => props.selectedIndex, (index) => {
    if (index < 0 || !resultsListRef) return;
    const selectedItem = resultsListRef.children[index] as HTMLLIElement | undefined;
    if (selectedItem) {
      selectedItem.scrollIntoView({
        block: 'nearest', // 'start', 'center', 'end', 'nearest'
        behavior: 'smooth' // Optional: 'auto' or 'smooth'
      });
    }
  }));


  return (
    <Show when={props.isOpen}>
      {/* Backdrop */}
      <div
        class="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
        onClick={props.closeSearch}
        style={{ 'background-color': 'rgba(0, 0, 0, 0.3)' }}
        aria-hidden="true" // Good for accessibility
      />
      {/* Search Modal */}
      <div
        class="fixed inset-x-0 top-0 z-50 mx-auto max-w-2xl mt-16 px-4"
        role="dialog" // Accessibility
        aria-modal="true" // Accessibility
        aria-labelledby="search-modal-title" // Add an ID to a title element if you have one
      >
        <div class="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"> {/* Added flex flex-col */}
          {/* Search Input */}
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search patients by name, phone or email..."
              value={props.searchTerm}
              onInput={(e) => props.handleSearchInput(e.currentTarget.value)}
              // Pass the results data to handleKeyDown here
              onKeyDown={(e) => props.handleKeyDown(e, props.searchQuery.data)}
              class="block w-full pl-10 pr-32 py-4 border-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm" // Removed focus:outline-none, use focus:ring-0 maybe
              aria-label="Search Patients" // Accessibility
              autocomplete="off" // Prevent browser autocomplete interfering
            />
            {/* Keyboard shortcut display */}
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div class="text-xs text-gray-400 hidden sm:flex gap-1">
                <kbd class="kbd kbd-xs">↑</kbd> {/* Use daisyui kbd classes if available, or style */}
                <kbd class="kbd kbd-xs">↓</kbd>
                <kbd class="kbd kbd-xs">Enter</kbd>
                <kbd class="kbd kbd-xs">Esc</kbd>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div class="border-t border-gray-200 flex-shrink-0" /> {/* Added flex-shrink-0 */}
          {/* Results area - Added flex-grow and overflow */}
          <div class="flex-grow overflow-y-auto max-h-96"> {/* Adjusted max-height as needed */}
            {/* Use searchQuery states */}
            <Show when={props.searchQuery.isFetching && props.debouncedSearchTerm.trim()}>
              <div class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                <p class="mt-2 text-sm text-gray-500">Searching...</p>
              </div>
            </Show>
            <Show when={props.searchQuery.isError}>
              <div class="py-12 text-center text-red-500">
                <p>Search failed: {props.searchQuery.error?.message}</p>
              </div>
            </Show>
            <Show when={props.searchQuery.isSuccess && props.debouncedSearchTerm.trim() && (!props.searchQuery.data || props.searchQuery.data.length === 0)}>
              <div class="py-12 text-center">
                <p class="mt-2 text-sm text-gray-500">No results found for "{props.debouncedSearchTerm}"</p>
              </div>
            </Show>
            <Show when={props.searchQuery.isSuccess && props.searchQuery.data && props.searchQuery.data.length > 0}>
              {/* Assign ref to the UL element */}
              <ul ref={resultsListRef} class="divide-y divide-gray-200">
                <For each={props.searchQuery.data}>
                  {(patient, index) => (
                    <SearchResultItem
                      patient={patient}
                      index={index()}
                      selectedIndex={props.selectedIndex}
                      onClick={props.navigateToPatient}
                      // Pass ID for potential use in scrolling later
                      id={`search-result-${index()}`}
                    />
                  )}
                </For>
              </ul>
            </Show>
            {/* Initial prompt when search is open but no term entered yet */}
            <Show when={!props.searchQuery.isFetching && !props.debouncedSearchTerm.trim() && !props.searchQuery.isError}>
              <div class="py-12 px-6 text-center text-gray-500 text-sm">
                Start typing to search for patients.
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}
