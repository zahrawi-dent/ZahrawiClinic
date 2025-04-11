// PatientsList.tsx - Main component
import { For, JSX, Show } from 'solid-js'
import { dentalOps } from 'src/operations'
import { useQuery } from '@tanstack/solid-query'
import SearchOverlay from './SearchOverlay'
import PatientListItem from './PatientListItem'
import { usePatientSearch } from './usePatientSearch'
import { Link } from '@tanstack/solid-router'

export default function PatientsList(): JSX.Element {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchTerm,
    debouncedSearchTerm,
    handleSearchInput,
    closeSearch,
    selectedIndex,
    navigateToPatient,
    handleKeyDown
  } = usePatientSearch();

  // Query for the main list of patients
  const patientsQuery = useQuery(() => ({
    queryKey: ['patients'],
    queryFn: () => dentalOps.patients.getAll(),
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  }));

  // Query for search results - depends on debouncedSearchTerm
  const searchQuery = useQuery(() => ({
    queryKey: ['patients', 'search', debouncedSearchTerm()],
    queryFn: () => dentalOps.patients.search(debouncedSearchTerm()),
    enabled: !!debouncedSearchTerm().trim(),
    keepPreviousData: true,
  }));

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Patients</h1>
        <div class="flex space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            class="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
        {(patientsData) => (
          <div class="bg-white shadow overflow-hidden rounded-md">
            <ul class="divide-y divide-gray-200">
              <Show when={patientsData().length === 0}>
                <li class="px-6 py-4 text-center text-gray-500">No patients found.</li>
              </Show>
              <For each={patientsData()}>
                {(patient) => (
                  <PatientListItem patient={patient} />
                )}
              </For>
            </ul>
          </div>
        )}
      </Show>

      {/* Search Overlay Component */}
      <SearchOverlay
        isOpen={isSearchOpen()}
        searchTerm={searchTerm()}
        handleSearchInput={handleSearchInput}
        handleKeyDown={handleKeyDown}
        closeSearch={closeSearch}
        searchQuery={searchQuery}
        debouncedSearchTerm={debouncedSearchTerm()}
        selectedIndex={selectedIndex()}
        navigateToPatient={navigateToPatient}
      />
    </div>
  );
}
