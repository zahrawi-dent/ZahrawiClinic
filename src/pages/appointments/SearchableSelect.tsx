// src/components/SearchableSelect.jsx
import { createSignal, createMemo, For, Show, onCleanup, JSX, createEffect, on } from 'solid-js'; // Added createEffect, on

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  name: string;
  options: SearchableSelectOption[];
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  class?: string;
}

function SearchableSelect(props: SearchableSelectProps): JSX.Element {
  const [isOpen, setIsOpen] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1); // Track highlighted option index
  let containerRef: HTMLDivElement | undefined;
  let listRef: HTMLUListElement | undefined; // Ref for the dropdown list UL element

  const selectedLabel = createMemo(() => {
    const selectedOption = props.options.find(opt => opt.value === props.value);
    return selectedOption ? selectedOption.label : "";
  });

  const filteredOptions = createMemo(() => {
    const term = searchTerm().toLowerCase();
    if (!term || searchTerm() === selectedLabel()) { // Also show all if search is same as selected
      return props.options;
    }
    return props.options.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  });

  // Effect to reset highlight when filter results change
  createEffect(on(filteredOptions, () => {
    setHighlightedIndex(-1);
  }));

  // Function to scroll the highlighted item into view
  const scrollHighlightedIntoView = (index: number) => {
    if (listRef && index >= 0 && index < listRef.children.length) {
      const itemElement = listRef.children[index] as HTMLLIElement;
      if (itemElement) {
        itemElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  };

  const handleSelect = (option: SearchableSelectOption) => {
    if (props.disabled) return;
    props.onInput(option.value);
    setSearchTerm(""); // Clear search term only after selection via click/enter
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInput = (e: Event & { currentTarget: HTMLInputElement }) => {
    if (props.disabled) return;
    setSearchTerm(e.currentTarget.value);
    setHighlightedIndex(-1); // Reset highlight on manual typing
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (!props.disabled) {
      // Optionally clear search term on focus to allow easy re-searching
      // setSearchTerm("");
      setIsOpen(true);
    }
  }

  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    if (props.disabled) return;

    const optionsCount = filteredOptions().length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Prevent cursor move in input
        if (!isOpen()) {
          setIsOpen(true); // Open dropdown if closed
        }
        setHighlightedIndex(prev => {
          const nextIndex = prev >= optionsCount - 1 ? 0 : prev + 1;
          scrollHighlightedIntoView(nextIndex);
          return nextIndex;
        });
        break;

      case 'ArrowUp':
        e.preventDefault(); // Prevent cursor move in input
        if (!isOpen()) {
          setIsOpen(true);
        }
        setHighlightedIndex(prev => {
          const nextIndex = prev <= 0 ? optionsCount - 1 : prev - 1;
          scrollHighlightedIntoView(nextIndex);
          return nextIndex;
        });
        break;

      case 'Enter':
        e.preventDefault(); // Prevent form submission
        if (isOpen() && highlightedIndex() >= 0 && highlightedIndex() < optionsCount) {
          handleSelect(filteredOptions()[highlightedIndex()]);
        } else if (!isOpen() && props.value) {
          // Maybe re-open if closed? Or do nothing. Current: do nothing.
        } else {
          // Optional: If user typed something that *exactly* matches an option label, select it?
          // Requires more complex logic. Sticking to highlighted selection for now.
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Reset search term to selected label or empty if nothing selected
        setSearchTerm(selectedLabel());
        break;

      case 'Tab':
        // Allow tab to naturally move focus, close dropdown if open
        if (isOpen()) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm(selectedLabel());
        }
        break;
    }
  };

  // --- Click Outside Logic ---
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      if (isOpen()) { // Only act if dropdown was open
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Reset search term to reflect actual selection when clicking outside
        setSearchTerm(selectedLabel());
      }
    }
  };

  createEffect(() => {
    if (isOpen()) {
      document.addEventListener('mousedown', handleClickOutside);
      // When opening, if there's a value, set search term to it initially
      if (!searchTerm() && selectedLabel()) {
        //   setSearchTerm(selectedLabel()); // Decided against this, keep search term separate
      }
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    onCleanup(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });
  });
  // --- End Click Outside Logic ---


  return (
    <div class={`relative ${props.class ?? ''}`} ref={containerRef}>
      <input type="hidden" name={props.name} value={props.value} />

      <input
        type="text"
        id={props.id}
        value={searchTerm() || selectedLabel()} // Display search term, fallback to selected label
        onInput={handleInput}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown} // Add keydown handler
        placeholder={selectedLabel() || props.placeholder || 'Search or select...'}
        disabled={props.disabled}
        required={props.required && !props.value}
        class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
        autocomplete="off"
        // ARIA attributes for better accessibility (optional but recommended)
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen()}
        aria-autocomplete="list"
        aria-controls={isOpen() ? `${props.id}-listbox` : undefined} // Link to listbox
        aria-activedescendant={highlightedIndex() >= 0 ? `${props.id}-option-${highlightedIndex()}` : undefined} // Link to active option
      />

      <Show when={isOpen() && !props.disabled}>
        <ul
          ref={listRef} // Assign ref to the UL
          id={`${props.id}-listbox`} // ID for ARIA
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox" // ARIA role
        >
          <Show when={filteredOptions().length > 0} fallback={
            <li class="px-3 py-2 text-gray-500 italic" role="option" aria-selected="false">No matches found</li>
          }>
            <For each={filteredOptions()}>
              {(option, index) => (
                <li
                  id={`${props.id}-option-${index()}`} // ID for ARIA activedescendant
                  class={`px-3 py-2 cursor-pointer hover:bg-indigo-100
                    ${index() === highlightedIndex() ? 'bg-indigo-300' : ''}
                    ${option.value === props.value ? 'font-semibold bg-indigo-100' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                  // Mouse hover could optionally update highlight:
                  // onMouseEnter={() => setHighlightedIndex(index())}
                  role="option"
                  aria-selected={option.value === props.value || index() === highlightedIndex()}
                >
                  {option.label}
                </li>
              )}
            </For>
          </Show>
        </ul>
      </Show>
    </div>
  );
}

export default SearchableSelect;
