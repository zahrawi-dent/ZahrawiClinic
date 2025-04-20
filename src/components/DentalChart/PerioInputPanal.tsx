// src/components/DentalChart/PerioInputPanel.tsx
import { Component, createSignal, createEffect, Index, JSX, Accessor, For } from 'solid-js';
import type { Tooth, PeriodontalMeasurements } from './types/dental.types'; // Adjusted path if needed

interface PerioInputPanelProps {
  selectedTooth: Accessor<Tooth | null | undefined>;
  onSave: (toothId: number, perioData: PeriodontalMeasurements) => void;
  onClose: () => void;
}

// Order for display/input rows: MB, B, DB | ML, L, DL
const SITE_INDICES_ORDERED = [0, 1, 2, 5, 4, 3]; // Buccal (0-2), Lingual (5,4,3 maps to M,L,D)
const SITE_LABELS_BUCCAL = ['MB', 'B', 'DB'];
const SITE_LABELS_LINGUAL = ['ML', 'L', 'DL'];

export const PerioInputPanel: Component<PerioInputPanelProps> = (props) => {
  // Local state for the input values - initialized empty or based on tooth
  const [pd, setPd] = createSignal<(string)[]>(Array(6).fill(''));
  const [rec, setRec] = createSignal<(string)[]>(Array(6).fill(''));
  const [bop, setBop] = createSignal<(boolean)[]>(Array(6).fill(false));
  // Add signals for other metrics (Furcation, Suppuration) if needed

  // Refs for input focusing: [metric][site] -> element
  // metric indices: 0=PD, 1=REC, 2=BOP checkbox wrapper/input
  const inputRefs: (HTMLInputElement | HTMLDivElement | null)[][] = [[], [], []];

  // Load data when selected tooth changes
  createEffect(() => {
    const tooth = props.selectedTooth();
    const perio = tooth?.periodontal;
    console.log(`PerioInputPanel: Effect triggered for tooth ${tooth?.id}. Current perio:`, JSON.stringify(perio));

    // Reset local state from tooth data, converting numbers/nulls to strings/booleans for inputs
    setPd(perio?.pocketDepth?.map(v => v === null || v === undefined ? '' : String(v)) ?? Array(6).fill(''));
    setRec(perio?.recession?.map(v => v === null || v === undefined ? '' : String(v)) ?? Array(6).fill(''));
    setBop(perio?.bleedingOnProbing?.map(v => v === null ? false : v) ?? Array(6).fill(false)); // Default checkbox to false if null
    // Reset other metrics if added

    // Auto-focus the first input when panel opens/tooth changes
    const firstInput = inputRefs[0]?.[SITE_INDICES_ORDERED[0]]; // Focus MB PD input
    if (firstInput instanceof HTMLInputElement) {
      setTimeout(() => { // Timeout helps ensure element is ready after render
        firstInput.focus();
        firstInput.select();
      }, 0);
    }
  });

  // Handle changes in numeric inputs (PD, REC)
  const handleInputChange = (
    metricSetter: typeof setPd | typeof setRec,
    index: number, // The actual site index (0-5)
    value: string
  ) => {
    // Allow only numbers, limit length, handle empty string
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);
    metricSetter(prev => {
      const newState = [...prev];
      newState[index] = numericValue;
      return newState;
    });
  };

  // Handle changes in BOP checkboxes
  const handleBopChange = (index: number, checked: boolean) => {
    setBop(prev => {
      const newState = [...prev];
      newState[index] = checked;
      return newState;
    });
    // Optionally move focus after checking/unchecking BOP
    focusNextInput(2, index, false); // Try moving right after BOP change
  };

  // Save the entered data
  const handleSave = () => {
    const toothId = props.selectedTooth()?.id;
    if (!toothId) return;

    // Helper to safely parse string to number or null
    const parseNumericInput = (val: string | null): number | null => {
      if (val === null || val.trim() === '') return null;
      const num = parseInt(val, 10);
      return isNaN(num) ? null : num;
    };

    // Convert local string/boolean state back to PeriodontalMeasurements format
    const saveData: PeriodontalMeasurements = {
      pocketDepth: pd().map(parseNumericInput),
      recession: rec().map(parseNumericInput),
      bleedingOnProbing: bop().map(v => v === null ? null : v), // Keep null if was null, else boolean
    };

    console.log("PerioInputPanel: Saving data for tooth", toothId, saveData);
    props.onSave(toothId, saveData);
    // Consider closing or moving to next tooth after save? For now, keep open.
    // props.onClose();
  };

  // --- Keyboard Navigation ---
  const focusNextInput = (metricIndex: number, siteIndexInOrder: number, reverse: boolean = false) => {
    const numMetrics = inputRefs.length; // Number of input rows (PD, REC, BOP)
    const numSites = SITE_INDICES_ORDERED.length; // Always 6

    let nextSiteOrderIndex = siteIndexInOrder + (reverse ? -1 : 1);
    let nextMetricIndex = metricIndex;

    if (nextSiteOrderIndex < 0) {
      nextSiteOrderIndex = numSites - 1;
      nextMetricIndex = (metricIndex - 1 + numMetrics) % numMetrics;
    } else if (nextSiteOrderIndex >= numSites) {
      nextSiteOrderIndex = 0;
      nextMetricIndex = (metricIndex + 1) % numMetrics;
    }

    const actualSiteIndex = SITE_INDICES_ORDERED[nextSiteOrderIndex]; // Map order index back to 0-5
    const targetElement = inputRefs[nextMetricIndex]?.[actualSiteIndex];

    if (targetElement instanceof HTMLElement) { // Check if it's an HTML element
      targetElement.focus();
      if (targetElement instanceof HTMLInputElement && targetElement.type !== 'checkbox') {
        targetElement.select(); // Select text in input fields
      }
    }
  };


  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    const target = e.target as HTMLElement; // Element that received the keydown
    const dataset = target.dataset;
    const metricIndex = parseInt(dataset.metricIndex || '-1', 10);
    const siteIndex = parseInt(dataset.siteIndex || '-1', 10); // Actual site index (0-5)

    // Find the display order index for the current site
    const siteIndexInOrder = SITE_INDICES_ORDERED.indexOf(siteIndex);

    if (isNaN(metricIndex) || isNaN(siteIndex) || siteIndexInOrder === -1) return; // Exit if not from a valid input/checkbox

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusNextInput(metricIndex, siteIndexInOrder, false);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusNextInput(metricIndex, siteIndexInOrder, true);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextMetricDown = (metricIndex + 1) % inputRefs.length;
        const targetDown = inputRefs[nextMetricDown]?.[siteIndex];
        if (targetDown instanceof HTMLElement) {
          targetDown.focus();
          if (targetDown instanceof HTMLInputElement && targetDown.type !== 'checkbox') targetDown.select();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const nextMetricUp = (metricIndex - 1 + inputRefs.length) % inputRefs.length;
        const targetUp = inputRefs[nextMetricUp]?.[siteIndex];
        if (targetUp instanceof HTMLElement) {
          targetUp.focus();
          if (targetUp instanceof HTMLInputElement && targetUp.type !== 'checkbox') targetUp.select();
        }
        break;
      case ' ': // Space bar toggles BOP checkbox
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
          // Default space behavior is fine
        } else if (metricIndex === 2) { // If focused on BOP div, toggle checkbox
          const checkbox = inputRefs[metricIndex]?.[siteIndex] as HTMLInputElement | null;
          if (checkbox) {
            e.preventDefault();
            checkbox.checked = !checkbox.checked;
            handleBopChange(siteIndex, checkbox.checked);
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        handleSave();
        break;
      case 'Escape':
        e.preventDefault();
        props.onClose();
        break;
      // Allow number input
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        if (target instanceof HTMLInputElement && target.type === 'number') {
          // Allow default behavior - might need refinement if selection isn't cleared
          // Optionally clear input before new digit: e.currentTarget.value = '';
        }
        break;
      case 'Backspace':
      case 'Delete':
        if (target instanceof HTMLInputElement && target.type === 'number') {
          // Allow default behavior
        }
        break;
      default:
        // Prevent other keys in number inputs if needed
        if (target instanceof HTMLInputElement && target.type === 'number' && !e.ctrlKey && !e.metaKey && e.key.length === 1) {
          // e.preventDefault(); // Maybe too restrictive? Test needed.
        }
        break;
    }
  };

  // Helper to assign refs correctly based on actual site index (0-5)
  const setInputRef = (metricIndex: number, siteIndex: number, el: HTMLInputElement | HTMLDivElement | null) => {
    if (!inputRefs[metricIndex]) inputRefs[metricIndex] = Array(6).fill(null);
    if (el) {
      inputRefs[metricIndex][siteIndex] = el;
    }
  }

  return (
    // Fixed position panel at the bottom
    <div class="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 p-3 rounded-t-lg shadow-2xl z-40 w-full max-w-md">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold text-gray-800">
          Perio Charting - Tooth {props.selectedTooth()?.name}
        </h3>
        <button onClick={props.onClose} title="Close Perio Panel (Esc)" class="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
      </div>

      {/* Input Grid - Listen for keydown events */}
      <div class="space-y-2 text-sm" onKeyDown={handleKeyDown}>
        {/* Header Row - Uses SITE_INDICES_ORDERED for display order */}
        <div class="grid grid-cols-7 gap-1 items-center font-medium text-center">
          <div class="text-left pl-1">Metric</div>
          {/* Buccal Labels */}
          <For each={SITE_LABELS_BUCCAL}>{(label) => <div>{label}</div>}</For>
          {/* Lingual Labels */}
          <For each={SITE_LABELS_LINGUAL}>{(label) => <div>{label}</div>}</For>
        </div>

        {/* Pocket Depth Row */}
        <div class="grid grid-cols-7 gap-1 items-center">
          <div class="font-medium pl-1">PD</div>
          <Index each={SITE_INDICES_ORDERED}>
            {(actualSiteIndexAccessor, i) => {
              const actualSiteIndex = actualSiteIndexAccessor();
              return (
                <input
                  type="number" // Use number input for semantics, handle string state
                  min="0" max="20" step="1"
                  ref={el => setInputRef(0, actualSiteIndex, el)}
                  data-metric-index="0"
                  data-site-index={actualSiteIndex} // Store actual index (0-5)
                  value={pd()[actualSiteIndex] ?? ''}
                  onInput={(e) => handleInputChange(setPd, actualSiteIndex, e.currentTarget.value)}
                  class="w-full text-center border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              );
            }}
          </Index>
        </div>

        {/* Recession Row */}
        <div class="grid grid-cols-7 gap-1 items-center">
          <div class="font-medium pl-1">REC</div>
          <Index each={SITE_INDICES_ORDERED}>
            {(actualSiteIndexAccessor, i) => {
              const actualSiteIndex = actualSiteIndexAccessor();
              return (
                <input
                  type="number" min="0" max="20" step="1"
                  ref={el => setInputRef(1, actualSiteIndex, el)}
                  data-metric-index="1"
                  data-site-index={actualSiteIndex}
                  value={rec()[actualSiteIndex] ?? ''}
                  onInput={(e) => handleInputChange(setRec, actualSiteIndex, e.currentTarget.value)}
                  class="w-full text-center border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              );
            }}
          </Index>
        </div>

        {/* BOP Row */}
        <div class="grid grid-cols-7 gap-1 items-center h-6">
          <div class="font-medium pl-1">BOP</div>
          <Index each={SITE_INDICES_ORDERED}>
            {(actualSiteIndexAccessor, i) => {
              const actualSiteIndex = actualSiteIndexAccessor();
              return (
                // Wrap checkbox for better focus handling if needed and attach ref here
                <div class="flex justify-center items-center h-full"
                  ref={el => setInputRef(2, actualSiteIndex, el)} // Ref on div for arrow key nav
                  tabIndex={-1} // Make div focusable programmatically if needed, but not via tab
                  data-metric-index="2"
                  data-site-index={actualSiteIndex}
                >
                  <input
                    type="checkbox"
                    // Removed ref from checkbox itself to avoid complexity
                    checked={bop()[actualSiteIndex] ?? false}
                    onChange={(e) => handleBopChange(actualSiteIndex, e.currentTarget.checked)}
                    class="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    tabIndex={-1} // Prevent tabbing directly to checkbox
                  />
                </div>
              );
            }}
          </Index>
        </div>
        {/* Add rows for Furcation, Suppuration etc. here */}
      </div>

      {/* Action Buttons */}
      <div class="mt-3 pt-3 border-t flex justify-end gap-3">
        <button onClick={props.onClose} class="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} class="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save Perio</button>
      </div>
    </div>
  );
};
