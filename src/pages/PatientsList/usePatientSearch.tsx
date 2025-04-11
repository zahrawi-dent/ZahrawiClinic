import { createSignal, createEffect, onCleanup } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';
import { Patient } from 'src/types/dental';

export function usePatientSearch() {
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = createSignal('');
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const navigate = useNavigate();

  let searchTimeout: number | undefined;

  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    setSelectedIndex(-1);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!value.trim()) {
      setDebouncedSearchTerm('');
      setSelectedIndex(-1);
      return;
    }
    searchTimeout = window.setTimeout(() => {
      setDebouncedSearchTerm(value);
      setSelectedIndex(-1);
    }, 300);
  };

  // This handler is specifically for the INPUT element (Arrows, Enter)
  const handleKeyDown = (e: KeyboardEvent, results: Patient[] | undefined | null) => {
    const currentResults = results ?? [];

    // Only handle navigation keys if results exist and modal is open
    if (!isSearchOpen()) return; // Added safety check

    switch (e.key) {
      case 'ArrowDown':
        if (currentResults.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % currentResults.length);
        }
        break;
      case 'ArrowUp':
        if (currentResults.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? currentResults.length - 1 : prev - 1
          );
        }
        break;
      case 'Enter': {
        e.preventDefault(); // Prevent default form submission if applicable
        const selected = selectedIndex();
        if (selected >= 0 && selected < currentResults.length) {
          const patientId = currentResults[selected]?.id;
          if (patientId) {
            navigateToPatient(String(patientId));
          }
        }
        break;
      }
      // REMOVE Escape from here - let the global handler manage it
      // case 'Escape':
      //  e.preventDefault();
      //  closeSearch();
      //  break;
    }
  };

  const closeSearch = () => {
    // Check if already closed to prevent potential multiple calls
    if (!isSearchOpen()) return;
    console.log("Closing search"); // Add log for debugging
    setIsSearchOpen(false);
    // Reset state *after* confirming closure
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedIndex(-1);
    if (searchTimeout) clearTimeout(searchTimeout);
  };


  // Global keyboard shortcut handling (Ctrl+K / Cmd+K AND Escape)
  createEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // --- Ctrl+K / Cmd+K to OPEN ---
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Prevent opening if already open maybe? Or just let it refocus.
        if (!isSearchOpen()) {
          setIsSearchOpen(true);
        }
        // Focus is handled in SearchOverlay's effect
      }
      // --- Escape to CLOSE (only when modal is open) ---
      else if (e.key === 'Escape' && isSearchOpen()) {
        console.log("Global Escape caught, closing search"); // Debug log
        e.preventDefault();
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    onCleanup(() => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (searchTimeout) clearTimeout(searchTimeout);
    });
  });


  const navigateToPatient = (patientId: string) => {
    closeSearch();
    navigate({ to: `/patients/${patientId}`, replace: true }).catch((err) => {
      console.error("Navigation failed:", err);
    });
  };

  createEffect(() => {
    debouncedSearchTerm();
    setSelectedIndex(-1);
  });


  return {
    isSearchOpen,
    setIsSearchOpen,
    searchTerm,
    debouncedSearchTerm,
    handleSearchInput,
    closeSearch,
    selectedIndex,
    navigateToPatient,
    handleKeyDown, // This still handles Arrows/Enter for the input
  };
}
