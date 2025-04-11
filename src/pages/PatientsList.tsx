import { createSignal, createEffect, JSX, For, Show, onCleanup } from 'solid-js'
import { useNavigate } from '@tanstack/solid-router'
import { dentalOps } from 'src/operations'
import { useQuery } from '@tanstack/solid-query'
import { Link } from '@tanstack/solid-router'

export default function PatientsList(): JSX.Element {
  const [isSearchOpen, setIsSearchOpen] = createSignal(false)
  const [searchTerm, setSearchTerm] = createSignal('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = createSignal(''); // Value used for query
  const [selectedIndex, setSelectedIndex] = createSignal(-1)

  const navigate = useNavigate()

  let searchInputRef: HTMLInputElement | undefined;
  let searchTimeout: number | undefined;

  // --- Queries ---

  // Query for the main list of patients
  const patientsQuery = useQuery(() => ({
    queryKey: ['patients'], // Unique key for the full list
    queryFn: () => dentalOps.patients.getAll(),
  }));

  // Query for search results - depends on debouncedSearchTerm
  const searchQuery = useQuery(() => ({
    queryKey: ['patients', 'search', debouncedSearchTerm()], // Key includes the debounced term
    queryFn: () => dentalOps.patients.search(debouncedSearchTerm()),
    // Only run the query if debouncedSearchTerm has a non-empty value
    enabled: !!debouncedSearchTerm().trim(),
    // Keep previous data while loading new search results for smoother UX
    keepPreviousData: true, // Requires @tanstack/solid-query v5+
    // For v4, manage placeholder data manually if needed or accept flicker
    // placeholderData: [], // You could provide placeholder data
  }));



  // Update debounced term on input change (with debounce)
  const handleSearchInput = (value: string) => {
    setSearchTerm(value); // Update input value immediately
    setSelectedIndex(-1); // Reset selection

    if (searchTimeout) clearTimeout(searchTimeout);

    // Don't trigger debounce if empty (searchQuery 'enabled' handles API call)
    if (!value.trim()) {
      setDebouncedSearchTerm(''); // Clear debounced term immediately if input is cleared
      return;
    }

    searchTimeout = window.setTimeout(() => {
      // Set the debounced term, which will trigger the searchQuery
      setDebouncedSearchTerm(value);
    }, 300); // 300ms debounce delay
  };



  // Handle keyboard navigation in search results
  const handleKeyDown = (e: KeyboardEvent) => {
    // Use searchQuery data
    const results = searchQuery.data ?? [];

    if (results.length === 0 || !isSearchOpen()) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = selectedIndex();
        if (selected >= 0 && selected < results.length) {
          const patient = results[selected];
          navigateToPatient(String(patient.id));
        }
        break;
      case 'Escape': // Added direct escape handling here for the input
        e.preventDefault();
        closeSearch();
        break;
    }
  };



  // Global keyboard shortcut handling (Ctrl+K, Escape)
  createEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Close with Escape only if search is open and the input doesn't have focus
      // (handleKeyDown handles Escape when input is focused)
      else if (isSearchOpen() && e.key === 'Escape' && document.activeElement !== searchInputRef) {
        e.preventDefault();
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (searchTimeout) clearTimeout(searchTimeout); // Clear timeout on cleanup
    });
  });


  // Focus search input when opened
  createEffect(() => {
    if (isSearchOpen() && searchInputRef) {
      // Use requestAnimationFrame or small timeout for focus after render
      requestAnimationFrame(() => searchInputRef?.focus());
      // setTimeout(() => searchInputRef?.focus(), 50); // Alternative
    }
  });



  // Function to navigate to patient page
  const navigateToPatient = (patientId: string) => {
    closeSearch()
    navigate({ to: `/patients/${patientId}`, replace: true }).catch(() => { })
  }

  // Function to close search overlay and reset state
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setDebouncedSearchTerm(''); // Important to reset debounced term
    setSelectedIndex(-1);
    if (searchTimeout) clearTimeout(searchTimeout);
  };


  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Patients</h1>
        <div class="flex space-x-4">
          {/* Search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            class="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {/* Search Icon */}
            Search
            <span class="ml-2 text-xs text-gray-400">Ctrl+K</span>
          </button>
          <Link
            to="/register-patient"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Register New Patient
          </Link>
        </div>
      </div>

      {/* Patient List Display */}
      <Show when={patientsQuery.isLoading}>
        <div class="text-center p-10">Loading patients...</div>
      </Show>
      <Show when={patientsQuery.isError}>
        <div class="text-center p-10 text-red-600">Error loading patients: {patientsQuery.error?.message}</div>
      </Show>
      <Show when={patientsQuery.isSuccess && patientsQuery.data}>
        {(patientsData) => ( // patientsData is the resolved array
          <div class="bg-white shadow overflow-hidden rounded-md">
            <ul class="divide-y divide-gray-200">
              <Show when={patientsData().length === 0}>
                <li class="px-6 py-4 text-center text-gray-500">No patients found.</li>
              </Show>
              <For each={patientsData()}>
                {(patient) => (
                  <li>
                    <Link to={`/patients/${patient.id}`} class="block hover:bg-gray-50">
                      <div class="px-6 py-4 flex items-center">
                        {/* Patient list item content... */}
                        <div class="min-w-0 flex-1 flex items-center">
                          <div class="flex-shrink-0">
                            <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
                              {patient.firstName?.[0]?.toUpperCase() || ''}
                              {patient.lastName?.[0]?.toUpperCase() || ''}
                            </div>
                          </div>
                          <div class="min-w-0 flex-1 px-4">
                            <div>
                              <p class="text-sm font-medium text-indigo-600 truncate">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p class="mt-1 flex items-center text-sm text-gray-500">
                                <span class="truncate">{patient.email}</span>
                              </p>
                            </div>
                          </div>
                          <div class="hidden md:block">
                            <div>
                              <p class="text-sm text-gray-900">{patient.phone}</p>
                              <p class="mt-1 text-sm text-gray-500">
                                Last Visit:{' '}
                                {/* TODO: add visit history to patient and get last visist */}
                                {patient.updatedAt
                                  ? new Date(patient.updatedAt).toLocaleDateString()
                                  : 'N/A'} {/* Display N/A or similar if no date */}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Chevron Icon */}
                      </div>
                    </Link>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </Show>

      {/* Search Overlay */}
      <Show when={isSearchOpen()}>
        {/* Backdrop */}
        <div
          class="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeSearch}
          style={{ 'background-color': 'rgba(0, 0, 0, 0.3)' }}
        />
        {/* Search Modal */}
        <div class="fixed inset-x-0 top-0 z-50 mx-auto max-w-2xl mt-16 px-4">
          <div class="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div class="relative">
              {/* Search Icon */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search patients by name, phone or email..."
                value={searchTerm()} // Bind to immediate term
                onInput={(e) => handleSearchInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown} // Handles Enter, Arrows, Escape
                class="block w-full pl-10 pr-32 py-4 border-0 text-gray-900 placeholder-gray-500 focus:outline-none sm:text-sm" // Adjusted padding/font size
              />
              {/* Keyboard shortcut display */}
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div class="text-xs text-gray-400 hidden sm:flex gap-1"> {/* Hide on very small screens */}
                  <kbd class="kbd-sm">↑</kbd>
                  <kbd class="kbd-sm">↓</kbd>
                  <kbd class="kbd-sm">Enter</kbd>
                  <kbd class="kbd-sm">Esc</kbd>
                </div>
              </div>
            </div>
            {/* Divider */}
            <div class="border-t border-gray-200" />
            {/* Results area */}
            <div class="max-h-96 overflow-y-auto">
              {/* Use searchQuery states */}
              <Show when={searchQuery.isFetching}>
                <div class="py-12 text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                  <p class="mt-2 text-sm text-gray-500">Searching...</p>
                </div>
              </Show>
              <Show when={searchQuery.isError}>
                <div class="py-12 text-center text-red-500">
                  <p>Search failed: {searchQuery.error?.message}</p>
                </div>
              </Show>
              <Show when={searchQuery.isSuccess && debouncedSearchTerm().trim() && searchQuery.data?.length === 0}>
                <div class="py-12 text-center">
                  {/* No results Icon */}
                  <p class="mt-2 text-sm text-gray-500">No results found for "{debouncedSearchTerm()}"</p>
                </div>
              </Show>
              <Show when={searchQuery.isSuccess && searchQuery.data && searchQuery.data.length > 0}>
                {(resultsData) => (
                  <ul class="divide-y divide-gray-200">
                    <For each={resultsData()}>
                      {(patient, index) => (
                        <li>
                          <div
                            // Consider using <a> tag or role="button" for accessibility
                            class={`block hover:bg-gray-50 cursor-pointer ${index() === selectedIndex() ? 'bg-indigo-50' : ''}`}
                            onClick={() => navigateToPatient(patient.id)}
                            // Add ARIA roles/attributes if not using <a>
                            role="button"
                            tabIndex={0} // Make it focusable if needed, though input handles main interaction
                            onKeyPress={(e) => e.key === 'Enter' && navigateToPatient(patient.id)} // Basic keyboard activation
                          >
                            <div class="px-6 py-4 flex items-center">
                              {/* Result item content... */}
                              <div class="min-w-0 flex-1 flex items-center">
                                <div class="flex-shrink-0">
                                  <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-sm"> {/* Slightly smaller */}
                                    {patient.firstName?.[0]?.toUpperCase() || ''}
                                    {patient.lastName?.[0]?.toUpperCase() || ''}
                                  </div>
                                </div>
                                <div class="min-w-0 flex-1 px-4">
                                  <div>
                                    <p class={`text-sm font-medium ${index() === selectedIndex() ? 'text-indigo-700' : 'text-indigo-600'} truncate`}>
                                      {patient.firstName} {patient.lastName}
                                    </p>
                                    <p class="mt-1 flex items-center text-xs text-gray-500"> {/* Smaller text */}
                                      <span class="truncate">{patient.email}</span>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p class="text-sm text-gray-500 hidden sm:block">{patient.phone}</p> {/* Hide phone on small screens */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      )}
                    </For>
                  </ul>
                )}
              </Show>
              {/* Initial prompt when search is open but no term entered yet */}
              <Show when={!searchQuery.isFetching && !debouncedSearchTerm().trim()}>
                <div class="py-12 px-6 text-center text-gray-500 text-sm">
                  Start typing to search for patients.
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}


// Helper CSS for kbd tags (add to your global CSS or component style)
/*
.kbd-sm {
    display: inline-flex;
    align-items: center;
    padding: 0.1rem 0.4rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 600;
    color: #4b5563; // gray-600
    background-color: #f3f4f6; // gray-100
    border: 1px solid #d1d5db; // gray-300
    border-radius: 0.25rem; // rounded
}
*/
