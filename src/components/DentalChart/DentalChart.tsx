// src/components/DentalChart/DentalChart.tsx
import { Component, createSignal, createMemo, For, Show, onMount, onCleanup, createEffect } from 'solid-js';
import { createStore, reconcile, produce } from 'solid-js/store';
import type {
  Tooth, PatientInfo, HistoryEntry, SurfaceName, ConditionId, SurfaceCondition, Condition,
  TreatmentStatus, ChartViewFilter, DentitionMode, PeriodontalMeasurements, ConditionDetails, ToothPresence,
  SavedChartState
} from './types/dental.types'; // Adjusted path assuming types are up one level
import { initialCombinedTeethData } from './constants/initialData'; // Keep for default if needed, but primary init from props
import { conditionsList, getConditionById, getPermanentSuccessorId, getDeciduousPredecessorId } from './constants/conditions'; // Adjusted path

// Import Child Components
import { ToothDisplay } from './ToothDisplay';
import { AnnotationPanel } from './AnnotationPanel';
import { PatientInfoPanel } from './PatientInfoPanel';
import { HistoryLog } from './HistoryLog';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { PerioInputPanel } from './PerioInputPanal'; // Adjusted filename if needed
import { PerioSummaryTable } from './PerioSummaryTable';
import { Patient } from 'src/types/dental';

// Constants
// REMOVED: const LOCAL_STORAGE_KEY = 'solidDentalChartState_v2';
const STATE_VERSION = 2; // Keep version for potential data structure checks
const MAX_UNDO_STEPS = 20;

// Component props interface
interface DentalChartProps {
  ref?: (el: any) => void; // For exposing methods to parent components
  patientId: string; // Add patientId prop
  initialTeeth: Tooth[]; // Removed Readonly<>
  initialPatientInfo: Patient; // Patient info passed from parent
  initialHistory?: HistoryEntry[]; // Removed Readonly<>
  onSaveChart: (chartState: SavedChartState) => Promise<void> | void; // Callback to save state
}

export const DentalChart: Component<DentalChartProps> = (props) => {
  // --- State ---
  // Initialize from props, createStore clones, signal needs manual copy
  const [teethStore, setTeethStore] = createStore<Tooth[]>(props.initialTeeth || initialCombinedTeethData);
  const [patientInfo, setPatientInfo] = createSignal<Patient>(props.initialPatientInfo);
  const [historyLog, setHistoryLog] = createSignal<HistoryEntry[]>([...(props.initialHistory || [])]); // Create copy

  // UI / Interaction State
  const [selectedToothId, setSelectedToothId] = createSignal<number | null>(null);
  const [multiSelectedToothIds, setMultiSelectedToothIds] = createSignal<number[]>([]);
  const [selectedSurfaceName, setSelectedSurfaceName] = createSignal<SurfaceName | null>(null);
  const [annotationText, setAnnotationText] = createSignal('');
  const [showAnnotationPanel, setShowAnnotationPanel] = createSignal(false);
  const [selectedConditionId, setSelectedConditionId] = createSignal<ConditionId | ''>(conditionsList[0]?.id ?? '');
  const [showHistory, setShowHistory] = createSignal(false);
  const [showPatientInfo, setShowPatientInfo] = createSignal(false);
  const [exportFormat, setExportFormat] = createSignal<'json' | 'pdf' | 'png'>('json');
  const [viewFilter, setViewFilter] = createSignal<ChartViewFilter>('all');
  const [dentitionMode, setDentitionMode] = createSignal<DentitionMode>('permanent');
  const [isPerioMode, setIsPerioMode] = createSignal(false);
  const [showPerioPanel, setShowPerioPanel] = createSignal(false);
  const [armedCondition, setArmedCondition] = createSignal<ConditionId | null>(null);

  // *** Visibility State for Perio Displays ***
  const [showPerioVisuals, setShowPerioVisuals] = createSignal(true); // Default ON
  const [showPerioSummary, setShowPerioSummary] = createSignal(false); // Default OFF

  // Undo/Redo State
  const [undoStack, setUndoStack] = createSignal<string[]>([]);
  const [redoStack, setRedoStack] = createSignal<string[]>([]);

  // Effect to re-initialize state if props change (e.g., switching patients)
  createEffect(() => {
    console.log("DentalChart: Initial props changed, re-initializing state for patient:", props.patientId);
    // Use reconcile to efficiently update the store if the array reference changes
    setTeethStore(reconcile(props.initialTeeth || initialCombinedTeethData));
    setPatientInfo(props.initialPatientInfo);
    setHistoryLog([...(props.initialHistory || [])]); // Create copy
    // Reset internal UI state related to selection etc.
    setSelectedToothId(null);
    setMultiSelectedToothIds([]);
    setSelectedSurfaceName(null);
    setShowAnnotationPanel(false);
    setShowPerioPanel(false);
    setArmedCondition(null);
    // Reset undo/redo stacks when data reloads
    setUndoStack([]);
    setRedoStack([]);
    // Optionally reset view modes or keep them based on preference
    // setDentitionMode('permanent');
    // setViewFilter('all');
    // setShowPerioVisuals(true);
    // setShowPerioSummary(false);
  });

  // --- Memos / Derived State ---
  const selectedTooth = createMemo(() => {
    const id = selectedToothId();
    return id ? teethStore.find(t => t.id === id) : undefined;
  });
  const isMultiSelectActive = createMemo(() => multiSelectedToothIds().length > 0);
  const availableConditions = createMemo((): Readonly<Condition[]> => {
    const surfaceSelected = selectedSurfaceName(); // Get the value directly
    const isRootSelected = surfaceSelected === 'root'; // Specific check for 'root'
    return conditionsList.filter(c => {
      // Simplified logic: check if surface is selected or not first
      if (surfaceSelected && surfaceSelected !== 'root') { // Specific surface selected (not root)
        return c.appliesTo === 'both' || c.appliesTo === 'surface';
      } else if (isRootSelected) { // Root selected
        return c.appliesTo === 'both' || c.appliesTo === 'root' || c.appliesTo === 'whole'; // Root conditions might apply to whole tooth too
      } else { // No surface selected (whole tooth implied)
        return c.appliesTo === 'both' || c.appliesTo === 'whole';
      }
    });
  });
  createMemo(() => { // auto-select condition
    const available = availableConditions(); if (!available.some(c => c.id === selectedConditionId())) { setSelectedConditionId(available[0]?.id || ''); }
  });
  const teethToDisplay = createMemo((): Readonly<Tooth[]> => { // mixed dentition logic
    const mode = dentitionMode(); const allTeeth = teethStore;
    if (mode === 'permanent') return allTeeth.filter(t => !t.isDeciduous && t.presence !== 'missing');
    if (mode === 'deciduous') return allTeeth.filter(t => t.isDeciduous && t.presence !== 'missing');
    const teethMap = new Map(allTeeth.map(t => [t.id, t])); const teethToShow: Tooth[] = []; const includedIds = new Set<number>();
    for (const tooth of allTeeth) {
      if (includedIds.has(tooth.id) || tooth.presence === 'missing') continue;
      if (tooth.isDeciduous) {
        const successorId = getPermanentSuccessorId(tooth.id); const successor = successorId ? teethMap.get(successorId) : null;
        if ((tooth.presence !== 'missing')) { if (!successor || successor.presence === 'missing') { teethToShow.push(tooth); includedIds.add(tooth.id); } }
      } else { if (tooth.presence !== 'missing') { teethToShow.push(tooth); includedIds.add(tooth.id); const pId = getDeciduousPredecessorId(tooth.id); if (pId) includedIds.add(pId); } }
    } return teethToShow.filter((t, i, self) => i === self.findIndex(x => x.id === t.id) && t.presence !== 'missing');
  });
  const upperTeeth = createMemo(() => teethToDisplay().filter(t => t.quadrant === 1 || t.quadrant === 2 || t.quadrant === 5 || t.quadrant === 6).sort((a, b) => { const g = (q: number) => (q === 5 ? 1 : q === 6 ? 2 : q); const qA = g(a.quadrant), qB = g(b.quadrant); if (qA !== qB) return qA - qB; return (qA === 1) ? b.id - a.id : a.id - b.id; }));
  const lowerTeeth = createMemo(() => teethToDisplay().filter(t => t.quadrant === 3 || t.quadrant === 4 || t.quadrant === 7 || t.quadrant === 8).sort((a, b) => { const g = (q: number) => (q === 8 ? 4 : q === 7 ? 3 : q); const qA = g(a.quadrant), qB = g(b.quadrant); if (qA !== qB) return b.quadrant - a.quadrant; return (qA === 4) ? b.id - a.id : a.id - b.id; }));

  // --- State Update Wrapper ---
  const updateTeethState = (updater: (draftTeeth: Tooth[]) => void) => {
    const currentState = JSON.stringify(teethStore);
    setUndoStack(prev => { const s = [currentState, ...prev]; if (s.length > MAX_UNDO_STEPS) s.pop(); return s; });
    setRedoStack([]);
    setTeethStore(produce(updater)); // Use produce
  };

  // --- Event Handlers ---
  const handleToothClick = (toothId: number, event: MouseEvent) => {
    const currentArmedCondition = armedCondition();
    if (currentArmedCondition) { applyQuickCondition(toothId, null, currentArmedCondition); setArmedCondition(null); }
    else if (isPerioMode()) { setSelectedToothId(toothId); setMultiSelectedToothIds([]); setSelectedSurfaceName(null); setShowAnnotationPanel(false); setShowPerioPanel(true); }
    else {
      const currentMultiSelected = multiSelectedToothIds();
      if (event.ctrlKey || event.metaKey) { setSelectedToothId(toothId); if (currentMultiSelected.includes(toothId)) setMultiSelectedToothIds(p => p.filter(id => id !== toothId)); else setMultiSelectedToothIds(p => [...p, toothId]); }
      else { setSelectedToothId(toothId); setMultiSelectedToothIds([]); setSelectedSurfaceName(null); setShowPerioPanel(false); setShowAnnotationPanel(true); }
      if (!(event.ctrlKey || event.metaKey) || multiSelectedToothIds().length <= 1) setShowAnnotationPanel(true);
    }
  };
  const handleSurfaceClick = (toothId: number, surfaceName: SurfaceName, event: MouseEvent) => {
    event.stopPropagation(); const currentArmedCondition = armedCondition();
    if (currentArmedCondition) { const info = getConditionById(currentArmedCondition); if (info?.appliesTo === 'surface' || info?.appliesTo === 'both') { applyQuickCondition(toothId, surfaceName, currentArmedCondition); setArmedCondition(null); } else alert(`Quick Action '${info?.name}' not for surfaces.`); }
    else if (isPerioMode()) return;
    else { setSelectedToothId(toothId); setSelectedSurfaceName(surfaceName); setMultiSelectedToothIds([]); setShowPerioPanel(false); setShowAnnotationPanel(true); }
  };
  const closeAnnotationPanel = () => { setShowAnnotationPanel(false); setAnnotationText(''); };
  const closePerioPanel = () => { setShowPerioPanel(false); setSelectedToothId(null); }; // Clear selection on close
  const addLogEntry = (text: string) => {
    const newEntry: HistoryEntry = { id: Date.now(), timestamp: new Date().toISOString(), text };
    setHistoryLog(p => [newEntry, ...p]);
    // Note: History is now managed internally after init. Saving will capture the current log.
  };
  const applyQuickCondition = (toothId: number, surfaceName: SurfaceName | null, conditionId: ConditionId) => {
    const info = getConditionById(conditionId); if (!info) return; const status: TreatmentStatus = 'planned'; const condData: SurfaceCondition = { id: Date.now(), text: '(Quick)', type: conditionId, color: info.color, timestamp: new Date().toISOString(), status: status, details: {} };
    let applied = false;
    updateTeethState(draft => { const t = draft.find(x => x.id === toothId); if (!t || t.presence === 'missing') return; if (surfaceName && (info.appliesTo === 'surface' || info.appliesTo === 'both')) { if (surfaceName in t.surfaces && t.surfaces[surfaceName]) { t.surfaces[surfaceName]!.conditions.push(condData); applied = true; } } else if (!surfaceName && (info.appliesTo === 'whole' || info.appliesTo === 'both' || info.appliesTo === 'root')) { if (t.presence !== 'unerupted' || info.appliesTo === 'root') { t.conditions.push(condData); applied = true; } } });
    if (applied) addLogEntry(`Quick Applied ${info.name} (${status}) to ${surfaceName ? `surface ${surfaceName} of ` : ''}tooth ${toothId}.`); else addLogEntry(`Quick Apply failed for ${info.name} on tooth ${toothId}...`);
  };
  const handleAddAnnotation = (status: TreatmentStatus, details?: ConditionDetails) => {
    const surf = selectedSurfaceName(); const condId = selectedConditionId(); const notes = annotationText().trim(); if (!condId) return; const info = getConditionById(condId); if (!info) return; const targets = isMultiSelectActive() ? multiSelectedToothIds() : (selectedToothId() ? [selectedToothId()!] : []); if (targets.length === 0) return;
    let successCount = 0;
    updateTeethState(draft => { targets.forEach(tId => { const tIdx = draft.findIndex(t => t.id === tId); if (tIdx === -1) return; const tooth = draft[tIdx]; if (tooth.presence === 'missing') return; const data: SurfaceCondition = { id: Date.now() + tId, text: notes, type: condId, color: info.color, timestamp: new Date().toISOString(), status: status, details: details }; let applied = false; if (surf && (info.appliesTo === 'surface' || info.appliesTo === 'both')) { if (surf in tooth.surfaces && tooth.surfaces[surf]) { tooth.surfaces[surf]!.conditions.push(data); applied = true; } } else if (!surf && (info.appliesTo === 'whole' || info.appliesTo === 'both' || info.appliesTo === 'root')) { if (tooth.presence !== 'unerupted' || info.appliesTo === 'root') { tooth.conditions.push(data); applied = true; } } if (applied) successCount++; }); });
    if (successCount > 0) { addLogEntry(`Added ${info.name} (${status}) to ${successCount} ${successCount > 1 ? 'teeth' : 'tooth'}...`); closeAnnotationPanel(); setMultiSelectedToothIds([]); setSelectedToothId(null); setSelectedSurfaceName(null); } else alert(`Condition '${info.name}' could not be applied...`);
  };
  const handleRemoveAnnotation = (toothId: number, annotationId: number, surfaceName?: SurfaceName) => {
    let logMsg = `Remove failed: ${toothId}`; let found = false; let condName = 'Condition';
    updateTeethState(draft => { const tIdx = draft.findIndex(t => t.id === toothId); if (tIdx === -1) return; const tooth = draft[tIdx]; if (surfaceName) { const surf = tooth.surfaces[surfaceName]; if (surf) { const cIdx = surf.conditions.findIndex(c => c.id === annotationId); if (cIdx > -1) { const rem = surf.conditions[cIdx]; condName = getConditionById(rem?.type)?.name || 'Cond'; surf.conditions.splice(cIdx, 1); found = true; logMsg = `Removed ${condName} from surf ${surfaceName} of ${toothId}.`; } } } else { const cIdx = tooth.conditions.findIndex(c => c.id === annotationId); if (cIdx > -1) { const rem = tooth.conditions[cIdx]; condName = getConditionById(rem?.type)?.name || 'Cond'; tooth.conditions.splice(cIdx, 1); found = true; logMsg = `Removed ${condName} from whole tooth ${toothId}.`; } } });
    if (found) addLogEntry(logMsg); else console.warn(logMsg);
  };
  const handleSetPresence = (toothId: number, presence: ToothPresence) => {
    updateTeethState(draft => { const tooth = draft.find(t => t.id === toothId); if (tooth) { tooth.presence = presence; if (presence === 'missing') { tooth.conditions = []; tooth.periodontal = undefined; Object.values(tooth.surfaces).forEach(s => s && (s.conditions = [])); } } }); addLogEntry(`Set presence of tooth ${toothId} to ${presence}.`);
  };
  const handleSetPerioData = (toothId: number, perioData: PeriodontalMeasurements) => {
    console.log("DentalChart: handleSetPerioData called for tooth", toothId, perioData);
    updateTeethState(draftTeeth => {
      const toothIndex = draftTeeth.findIndex(t => t.id === toothId); // Find index
      if (toothIndex === -1) {
        console.error(`DentalChart: Could not find tooth ${toothId} in draft state.`);
        return; // Exit if tooth not found
      }

      const originalTooth = draftTeeth[toothIndex]; // Get the original tooth from draft

      if (originalTooth.presence === 'missing') {
        console.warn(`DentalChart: Attempted to set perio data for missing tooth ${toothId}`);
        return; // Don't update missing teeth
      }

      // Create the updated periodontal data structure
      const currentPerio = originalTooth.periodontal ?? {};
      const ensureArray = (arr: any[] | undefined | null): (any | null)[] => Array.isArray(arr) && arr.length === 6 ? arr : Array(6).fill(null);
      const newPerioData = {
        pocketDepth: perioData.pocketDepth ?? ensureArray(currentPerio.pocketDepth),
        bleedingOnProbing: perioData.bleedingOnProbing ?? ensureArray(currentPerio.bleedingOnProbing),
        recession: perioData.recession ?? ensureArray(currentPerio.recession),
      };

      console.log("DentalChart: New perio data object:", JSON.stringify(newPerioData));

      // **** Replace the entire tooth object in the draft array ****
      // This guarantees a new object reference for the tooth prop
      draftTeeth[toothIndex] = {
        ...originalTooth,       // Copy all existing properties
        periodontal: newPerioData // Assign the new/updated periodontal data
      };

      console.log("DentalChart: Tooth object replaced in draft for ID:", toothId);
    });
    addLogEntry(`Updated perio data for tooth ${toothId}.`);
  };

  const handleUpdatePatientInfo = (field: keyof PatientInfo, value: string) => setPatientInfo(p => ({ ...p, [field]: value }));
  // --- Export Chart Handler ---
  const handleExportChart = () => {
    const format = exportFormat();
    let message = `Exporting dental chart as ${format.toUpperCase()}...`;
    let success = false;

    try {
      if (format === 'json') {
        // Package the full state consistent with save/load format
        const stateToExport: SavedChartState = {
          version: STATE_VERSION,
          patientInfo: patientInfo(), // Current internal patient info
          teeth: JSON.parse(JSON.stringify(teethStore)) as Tooth[], // Use deep clone of current teethStore
          history: historyLog(), // Current internal history log
          // Include view state as before
          dentitionMode: dentitionMode(),
          viewFilter: viewFilter(),
          showPerioVisuals: showPerioVisuals(),
          showPerioSummary: showPerioSummary()
        };
        const jsonString = JSON.stringify(stateToExport, null, 2); // Pretty print
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const patientName = patientInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'dental_chart';
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `${patientName}_${dateStr}_v${STATE_VERSION}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message = `Chart successfully exported as ${format.toUpperCase()}.`;
        success = true;
      } else {
        // Placeholder for PDF/PNG which require libraries
        message = `Exporting as ${format.toUpperCase()} requires integration with libraries like jsPDF/html2canvas. Only JSON export is implemented.`;
        alert(message);
        // Log data for potential manual use with external tools
        console.log("Chart Data for Export:", {
          patientInfo: patientInfo(),
          teeth: JSON.parse(JSON.stringify(teethStore)) as Tooth[], // Log clean data
          history: historyLog()
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      message = `Failed to export chart as ${format.toUpperCase()}. See console for details.`;
      alert(message);
    }

    addLogEntry(success ? `Chart exported as ${format.toUpperCase()}.` : `Export attempt as ${format.toUpperCase()} (${success ? 'success' : 'failed/partial'}).`);
  };

  // --- Clear All Annotations Handler ---
  const handleClearAllAnnotations = () => {
    if (confirm("Are you sure you want to clear ALL annotations, perio data, AND presence overrides? This cannot be undone.")) {
      updateTeethState(draftTeeth => {
        // Reset each tooth to a base state, preserving only essential info
        draftTeeth.forEach((tooth, index) => {
          // Recreate a clean tooth object to avoid lingering references
          draftTeeth[index] = {
            id: tooth.id,
            name: tooth.name,
            quadrant: tooth.quadrant,
            isDeciduous: tooth.isDeciduous,
            type: tooth.type,
            presence: undefined, // Reset presence to default (present)
            conditions: [],      // Clear conditions
            surfaces: {          // Reset surfaces
              mesial: { conditions: [] },
              distal: { conditions: [] },
              buccal: { conditions: [] },
              lingual: { conditions: [] },
              // Conditionally add occlusal/incisal based on type
              ...(tooth.type === 'molar' || tooth.type === 'premolar' ? { occlusal: { conditions: [] } } : {}),
              ...(tooth.type === 'incisor' || tooth.type === 'canine' ? { incisal: { conditions: [] } } : {}),
              // Keep root surface if it existed, but clear conditions
              ...(tooth.surfaces.root ? { root: { conditions: [] } } : {})
            },
            periodontal: undefined // Clear perio data
          };
        });
      });
      addLogEntry("Cleared all annotations, perio, and presence overrides.");
      closeAnnotationPanel(); // Close panels if open
      closePerioPanel();
    }
  };
  // --- Undo Handler ---
  const handleUndo = () => {
    const history = undoStack();
    if (history.length === 0) {
      console.log("Undo stack empty.");
      return; // Nothing to undo
    }

    const currentState = JSON.stringify(teethStore); // Capture current state *before* undoing
    const previousStateStr = history[0];             // Get the state to restore
    const remainingHistory = history.slice(1);       // Update the undo stack

    try {
      const previousState: Tooth[] = JSON.parse(previousStateStr) as Tooth[];
      setRedoStack(prev => [currentState, ...prev]); // Push the current state onto redo stack
      setUndoStack(remainingHistory);                // Set the new undo stack
      setTeethStore(reconcile(previousState));       // Apply the previous state efficiently
      addLogEntry("Performed Undo.");
    } catch (e) {
      console.error("Failed to parse or apply undo state:", e);
      // Potentially remove corrupted state?
      // setUndoStack(remainingHistory); // Optionally proceed even if parsing failed
      alert("Error during Undo operation. State might be inconsistent.");
    }
  };


  // --- Redo Handler ---
  const handleRedo = () => {
    const history = redoStack();
    if (history.length === 0) {
      console.log("Redo stack empty.");
      return; // Nothing to redo
    }

    const currentState = JSON.stringify(teethStore); // Capture current state *before* redoing
    const nextStateStr = history[0];                 // Get the state to restore
    const remainingHistory = history.slice(1);       // Update the redo stack

    try {
      const nextState: Tooth[] = JSON.parse(nextStateStr) as Tooth[];
      setUndoStack(prev => [currentState, ...prev]); // Push the current state back onto undo stack
      setRedoStack(remainingHistory);                // Set the new redo stack
      setTeethStore(reconcile(nextState));           // Apply the next state efficiently
      addLogEntry("Performed Redo.");
    } catch (e) {
      console.error("Failed to parse or apply redo state:", e);
      alert("Error during Redo operation. State might be inconsistent.");
    }
  };

  // --- NEW Save Handler (using prop) ---
  const handleSaveChanges = async () => {
    const chartStateToSave: SavedChartState = {
      version: STATE_VERSION,
      patientInfo: patientInfo(), // Current internal patient info state
      teeth: JSON.parse(JSON.stringify(teethStore)) as Tooth[], // Deep clone of current teeth data
      history: historyLog(), // Current internal history log
      // Also save relevant view/UI state if desired
      dentitionMode: dentitionMode(),
      viewFilter: viewFilter(),
      showPerioVisuals: showPerioVisuals(),
      showPerioSummary: showPerioSummary(),
    };
    try {
      // Call the callback prop provided by the parent component
      await props.onSaveChart(chartStateToSave);
      addLogEntry("Chart changes saved successfully.");
      alert("Chart Saved!");
    } catch (error) {
      console.error("Failed to save chart via onSaveChart callback:", error);
      addLogEntry("Attempted to save chart, but an error occurred.");
      alert("Error saving chart. See console for details.");
    }
  };

  // --- Keyboard Shortcuts ---
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z') { event.preventDefault(); handleUndo(); }
      else if (event.key === 'y') { event.preventDefault(); handleRedo(); }
      // REMOVED Ctrl+S for localStorage save
      // else if (event.key === 's') { event.preventDefault(); saveChart(); }
    }
    if (event.key === 'Escape') {
      if (armedCondition()) setArmedCondition(null);
      else if (showPerioPanel()) closePerioPanel();
      else if (showAnnotationPanel()) closeAnnotationPanel();
      else { setSelectedToothId(null); setMultiSelectedToothIds([]); }
    }
  };
  onMount(() => { document.addEventListener('keydown', handleKeyDown); });
  onCleanup(() => { document.removeEventListener('keydown', handleKeyDown); });


  // --- Render ---
  return (
    <div class="p-4 md:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
      {/* --- Header & Enhanced Controls --- */}
      <div class="flex flex-wrap justify-between items-start mb-4 gap-4 pb-4 border-b">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Clinical Dental Chart</h1>
        <div class="flex flex-col items-end gap-2">
          {/* Top Row: Core Actions */}
          <div class="flex gap-2 flex-wrap items-center">
            {/* MODIFIED Save Button */}
            <button onClick={handleSaveChanges} title="Save Changes to Server" class="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow-sm">Save Changes</button>
            {/* REMOVED Load Button */}
            {/* <button onClick={loadChart} title="Load Chart" class="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm shadow-sm">Load</button> */}
            <button onClick={handleUndo} title="Undo (Ctrl+Z)" disabled={undoStack().length === 0} class="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Undo</button>
            <button onClick={handleRedo} title="Redo (Ctrl+Y)" disabled={redoStack().length === 0} class="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Redo</button>
            <div class="flex items-center gap-1 bg-white border border-gray-300 rounded shadow-sm">
              <select value={exportFormat()} onChange={e => setExportFormat(e.currentTarget.value as 'json' | 'pdf' | 'png')} class="border-r border-gray-300 rounded-l px-2 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                <option value="json">Export JSON</option><option value="pdf">Export PDF</option><option value="png">Export PNG</option>
              </select>
              <button onClick={handleExportChart} title="Export Chart Data" class="px-3 py-1.5 bg-green-500 text-white rounded-r hover:bg-green-600 text-sm">Export</button>
            </div>
            <button onClick={handleClearAllAnnotations} title="Clear All Data (Resets Chart)" class="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm shadow-sm">Clear All</button>
          </div>
          {/* Second Row: View/Mode Controls */}
          <div class="flex gap-3 flex-wrap items-center">
            <button onClick={() => setShowPatientInfo(!showPatientInfo())} title="Show/Hide Patient Info" class="text-sm text-blue-600 hover:underline">Patient Info</button>
            <button onClick={() => setShowHistory(!showHistory())} title="Show/Hide History Log" class="text-sm text-blue-600 hover:underline">History</button>
            {/* View Filter */}
            <div class="flex items-center gap-1">
              <label for="view-filter" class="text-sm font-medium">View:</label>
              <select id="view-filter" value={viewFilter()} onChange={e => setViewFilter(e.currentTarget.value as ChartViewFilter)} class="text-sm border-gray-300 rounded shadow-sm p-1 focus:border-blue-500 focus:ring-blue-500">
                <option value="all">All</option> <option value="existing">Existing</option> <option value="planned">Planned</option> <option value="completed">Completed</option>
              </select>
            </div>
            {/* Dentition Mode */}
            <div class="flex items-center gap-1">
              <label for="dentition-mode" class="text-sm font-medium">Dentition:</label>
              <select id="dentition-mode" value={dentitionMode()} onChange={e => setDentitionMode(e.currentTarget.value as DentitionMode)} class="text-sm border-gray-300 rounded shadow-sm p-1 focus:border-blue-500 focus:ring-blue-500">
                <option value="permanent">Permanent</option> <option value="deciduous">Deciduous</option> <option value="mixed">Mixed</option>
              </select>
            </div>
            {/* Perio Input Mode Toggle */}
            <button onClick={() => setIsPerioMode(!isPerioMode())} title="Toggle Periodontal Charting Mode" class={`px-2 py-1 rounded text-sm shadow-sm ${isPerioMode() ? 'bg-pink-600 text-white' : 'bg-pink-200 text-pink-800'}`}>
              Perio Input: {isPerioMode() ? 'ON' : 'OFF'}
            </button>
            {/* --- Perio View Toggles --- */}
            <label class="flex items-center space-x-1 cursor-pointer text-sm" title="Show/Hide perio details around each tooth">
              <input
                type="checkbox"
                checked={showPerioVisuals()}
                onChange={(e) => setShowPerioVisuals(e.currentTarget.checked)}
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>On-Tooth Perio</span>
            </label>
            <button
              onClick={() => setShowPerioSummary(!showPerioSummary())}
              title="Show/Hide Full Periodontal Summary Table"
              class={`px-2 py-1 rounded text-sm shadow-sm ${showPerioSummary() ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-800'}`}
            >
              Perio Summary: {showPerioSummary() ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </div>
      </div>

      {/* --- Quick Actions Toolbar --- */}
      <QuickActionsToolbar
        actionIds={['caries', 'filling-composite', 'extraction', 'crown-zirconia', 'sealant', 'root-canal']}
        armedCondition={armedCondition}
        onArmCondition={setArmedCondition}
      />

      {/* --- Main Content Area --- */}
      <Show when={showPatientInfo()}>
        {/* Pass the signal accessor and setter */}
        <PatientInfoPanel patientInfo={patientInfo} onUpdatePatientInfo={handleUpdatePatientInfo} />
      </Show>

      {/* --- Main Tooth Chart Display --- */}
      {/*<div class="bg-white p-4 rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6 ">*/}
      <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6 py-6"> {/* REMOVED overflow-hidden, ADDED py-6 */}
        {/* Upper Jaw */}
        <div class="flex justify-center items-end mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div class="flex space-x-0.5">
            <For each={upperTeeth()}>
              {tooth => (
                <ToothDisplay
                  tooth={tooth}
                  isSelected={selectedToothId() === tooth.id}
                  isMultiSelected={isMultiSelectActive() && multiSelectedToothIds().includes(tooth.id)}
                  selectedSurfaceName={selectedToothId() === tooth.id ? selectedSurfaceName() : null}
                  viewFilter={viewFilter()}
                  showPerioVisuals={showPerioVisuals()} // **** Pass prop ****
                  onToothClick={handleToothClick}
                  onSurfaceClick={handleSurfaceClick}
                />
              )}
            </For>
          </div>
        </div>
        <hr class="border-t-2 border-gray-300 my-4" />
        {/* Lower Jaw */}
        <div class="flex justify-center items-start mt-8 overflow-x-auto pt-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div class="flex space-x-0.5">
            <For each={lowerTeeth()}>
              {tooth => (
                <ToothDisplay
                  tooth={tooth}
                  isSelected={selectedToothId() === tooth.id}
                  isMultiSelected={isMultiSelectActive() && multiSelectedToothIds().includes(tooth.id)}
                  selectedSurfaceName={selectedToothId() === tooth.id ? selectedSurfaceName() : null}
                  viewFilter={viewFilter()}
                  showPerioVisuals={showPerioVisuals()} // **** Pass prop ****
                  onToothClick={handleToothClick}
                  onSurfaceClick={handleSurfaceClick}
                />
              )}
            </For>
          </div>
        </div>
      </div>

      {/* --- Full Periodontal Summary Table (Conditional) --- */}
      <Show when={showPerioSummary()}>
        <PerioSummaryTable
          upperTeeth={upperTeeth} // Pass reactive lists
          lowerTeeth={lowerTeeth}
        />
      </Show>

      {/* --- Modals / Other Panels --- */}
      <Show when={showAnnotationPanel()}>
        <AnnotationPanel
          selectedTooth={selectedTooth()}
          selectedSurfaceName={selectedSurfaceName()}
          isMultiSelectActive={isMultiSelectActive}
          availableConditions={availableConditions()}
          selectedConditionId={selectedConditionId}
          setSelectedConditionId={setSelectedConditionId}
          annotationText={annotationText}
          setAnnotationText={setAnnotationText}
          onAddAnnotation={handleAddAnnotation}
          onRemoveAnnotation={handleRemoveAnnotation}
          onSetPresence={handleSetPresence}
          onClose={closeAnnotationPanel}
          viewFilter={viewFilter()}
        />
      </Show>
      <Show when={showPerioPanel() && selectedTooth()}>
        <PerioInputPanel
          selectedTooth={selectedTooth} // Pass accessor
          onSave={handleSetPerioData}
          onClose={closePerioPanel}
        />
      </Show>
      <Show when={showHistory()}> <HistoryLog historyLog={historyLog} /> </Show>
    </div >
  );
};
