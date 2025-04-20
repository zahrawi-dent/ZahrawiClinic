// src/components/DentalChart/AnnotationPanel.tsx
import { Component, For, Show, Index, Accessor, Setter, createMemo, createSignal } from 'solid-js'; // Added createMemo
import type { Tooth, Condition, SurfaceName, ConditionId, SurfaceCondition, TreatmentStatus, ConditionDetails, ToothPresence, ChartViewFilter } from '../types/dental.types';
import { conditionsList, getConditionById } from './constants/conditions';


interface AnnotationPanelProps {
  selectedTooth: Tooth | null | undefined;
  isMultiSelectActive: Accessor<boolean>;
  selectedSurfaceName: SurfaceName | null;
  availableConditions: Readonly<Condition[]>;
  selectedConditionId: Accessor<ConditionId | ''>;
  setSelectedConditionId: Setter<ConditionId | ''>;
  annotationText: Accessor<string>;
  setAnnotationText: Setter<string>;
  onAddAnnotation: (status: TreatmentStatus, details?: ConditionDetails) => void;
  onRemoveAnnotation: (toothId: number, annotationId: number, surfaceName?: SurfaceName) => void;
  onClose: () => void; // This prop is used for the backdrop and X button
  onSetPresence: (toothId: number, presence: ToothPresence) => void; // New prop
  viewFilter: ChartViewFilter;
}

export const AnnotationPanel: Component<AnnotationPanelProps> = (props) => {


  // --- Local State for Inputs ---
  const [selectedStatus, setSelectedStatus] = createSignal<TreatmentStatus>('existing');
  const [materialText, setMaterialText] = createSignal('');
  const [shadeText, setShadeText] = createSignal('');
  const [canalsText, setCanalsText] = createSignal('');
  const [endoFillMaterialText, setEndoFillMaterialText] = createSignal('');
  const [apexStatus, setApexStatus] = createSignal<'sealed' | 'open' | 'lesion' | 'resorption' | ''>('');
  // Bridge Linking State (Simple text input for IDs for now)
  const [linkedIdsText, setLinkedIdsText] = createSignal('');
  // General Details State
  const [procCodeText, setProcCodeText] = createSignal('');
  const [currentPresence, setCurrentPresence] = createSignal<ToothPresence>('present'); // Local state for presence radio

  // Update local presence state when the selected tooth changes or its presence updates
  // Reset form on tooth change
  createMemo(() => {
    const presence = props.selectedTooth?.presence ?? 'present'; // Default to 'present' if undefined
    setCurrentPresence(presence);

    // Reset form details on tooth change
    // Reset only if NOT in multi-select mode to preserve choices
    if (!props.isMultiSelectActive()) {
      setSelectedStatus('existing');
      setMaterialText('');
      setShadeText('');
      setCanalsText('');
      setEndoFillMaterialText('');
      setApexStatus('');
      setLinkedIdsText('');
      setProcCodeText('');
      // Keep annotationText persistent until add/close
    }
  });


  // ... allToothConditions, filteredConditionsForDisplay memos ...
  const allToothConditions = createMemo((): ({ surface?: SurfaceName, condition: SurfaceCondition }[]) => { /* ... */
    if (!props.selectedTooth) return [];
    const whole = props.selectedTooth.conditions.map(c => ({ condition: c }));
    const surfaceConds = Object.entries(props.selectedTooth.surfaces)
      .filter(([_, surface]) => surface !== undefined)
      .flatMap(([name, surface]) =>
        surface!.conditions.map(c => ({ surface: name as SurfaceName, condition: c }))
      );

    // Optional: Sort conditions if needed, e.g., by timestamp
    // return [...whole, ...surfaceConds].sort((a, b) => Date.parse(b.condition.timestamp) - Date.parse(a.condition.timestamp));
    return [...whole, ...surfaceConds];
  });
  const filteredConditionsForDisplay = createMemo(() => { /* ... */
    const all = allToothConditions();
    if (props.viewFilter === 'all') return all;
    return all.filter(item => item.condition.status === props.viewFilter);
  });

  // --- Show Logic for Detail Fields ---
  const isEndoCondition = createMemo(() => props.selectedConditionId() === 'root-canal');
  const isBridgeCondition = createMemo(() => ['bridge-pontic', 'bridge-abutment'].includes(props.selectedConditionId()));

  // ... showMaterialInput, showShadeInput memos ...
  const showMaterialInput = createMemo(() => { /* ... */ });
  const showShadeInput = createMemo(() => { /* ... */ });


  // --- Handlers ---

  const handleAddClick = () => {
    const details: ConditionDetails = {};
    if (materialText()) details.material = materialText();
    if (shadeText()) details.shade = shadeText();
    if (procCodeText()) details.procedureCode = procCodeText();
    // Add Endo Details
    if (isEndoCondition()) {
      if (canalsText()) details.canalsFilled = canalsText(); // Store as string for flexibility
      if (endoFillMaterialText()) details.fillMaterial = endoFillMaterialText();
      if (apexStatus()) details.apexStatus = apexStatus();
    }
    // Add Bridge Link Details (parse simple comma-separated list)
    if (isBridgeCondition() && linkedIdsText()) {
      details.linkedToothIds = linkedIdsText().split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id !== props.selectedTooth?.id); // Basic parsing
      // Could add bridgeId logic here if needed
    }

    props.onAddAnnotation(selectedStatus(), Object.keys(details).length > 0 ? details : undefined);
  };

  // Handler for setting presence
  const handlePresenceChange = (presence: ToothPresence) => {
    if (props.selectedTooth) {
      props.onSetPresence(props.selectedTooth.id, presence);
      setCurrentPresence(presence); // Update local state immediately for radio button feedback
    }
  };

  return (
    <Show when={props.selectedTooth || props.isMultiSelectActive()}>
      {(tooth) => (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm" onClick={props.onClose}>
          <div class="bg-white p-5 md:p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div class="flex justify-between items-center mb-4 pb-3 border-b">
              {/* ... Header content ... */}
              <h3 class="text-xl font-semibold">
                <Show when={!props.isMultiSelectActive() && tooth()}>
                  Tooth {tooth()!.name}
                  <Show when={props.selectedSurfaceName}>
                    {name => <span class="text-gray-600 font-normal"> (Surface: {name()})</span>}
                  </Show>
                  <span class="text-sm text-gray-500 ml-2">({tooth()!.type}{tooth()!.isDeciduous ? ', Deciduous' : ''})</span>
                </Show>
                <Show when={props.isMultiSelectActive()}>
                  Applying to Multiple Teeth
                </Show>
              </h3>
              <button onClick={props.onClose} /* ... */ >×</button>
            </div>


            {/* --- Presence Control Section (Show only in single select mode) --- */}
            <Show when={!props.isMultiSelectActive() && tooth()}>
              <div class="border rounded p-3 mb-4 bg-indigo-50 border-indigo-200 shadow-sm">
                <h4 class="text-md font-semibold mb-2 text-indigo-800">Set Tooth Presence</h4>
                <div class="flex gap-4 justify-around">
                  {/* ... Radio buttons for presence ... */}
                  <For each={['present', 'missing', 'unerupted'] as ToothPresence[]}>
                    {presence => (
                      <label class="flex items-center space-x-1 cursor-pointer">
                        <input type="radio" name={`presence-${tooth()!.id}`} value={presence} checked={currentPresence() === presence} onChange={() => handlePresenceChange(presence)} /* ... */ />
                        <span class="text-sm capitalize">{presence}</span>
                      </label>
                    )}
                  </For>
                </div>
              </div>
            </Show>


            {/* --- Add Condition Section --- */}
            <div class="border rounded p-4 mb-4 bg-gray-50 shadow-sm space-y-3">
              <h4 class="text-md font-semibold">Add / Edit Condition</h4>
              {/* ... Condition Type Select ... */}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for={`condition-type-select-${tooth().id}`}>Condition Type {props.selectedSurfaceName ? '(Surface)' : '(Whole Tooth)'}</label>
                <select /* ... */
                  id={`condition-type-select-${tooth().id}`}
                  value={props.selectedConditionId()}
                  onInput={(e) => props.setSelectedConditionId(e.currentTarget.value as ConditionId)}
                  class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm disabled:bg-gray-200"
                  disabled={props.availableConditions.length === 0}
                >
                  <Show when={props.availableConditions.length > 0} fallback={<option disabled>No applicable conditions</option>}>
                    <For each={props.availableConditions}>
                      {condition => (<option value={condition.id}>{condition.name} ({condition.abbr})</option>)}
                    </For>
                  </Show>
                </select>
              </div>
              {/* Status Radio Buttons */}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div class="flex gap-4">
                  <For each={['existing', 'planned', 'completed', 'referred'] as TreatmentStatus[]}>
                    {status => (
                      <label class="flex items-center space-x-1 cursor-pointer">
                        <input type="radio" name={`status-${tooth().id}`} value={status} checked={selectedStatus() === status} onChange={() => setSelectedStatus(status)} class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                        <span class="text-sm capitalize">{status}</span>
                      </label>
                    )}
                  </For>
                </div>
              </div>
              {/* Optional Detail Fields */}
              <Show when={showMaterialInput()}> {/* ... Material input ... */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1" for={`material-${tooth().id}`}>Material</label>
                  <input id={`material-${tooth().id}`} type="text" value={materialText()} onInput={e => setMaterialText(e.currentTarget.value)} placeholder="e.g., Composite A2, Zirconia" class="w-full border-gray-300 rounded-md shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </Show>
              <Show when={showShadeInput()}> {/* ... Shade input ... */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1" for={`shade-${tooth().id}`}>Shade</label>
                  <input id={`shade-${tooth().id}`} type="text" value={shadeText()} onInput={e => setShadeText(e.currentTarget.value)} placeholder="e.g., A2, B1" class="w-full border-gray-300 rounded-md shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </Show>

              {/* Endo Details */}
              <Show when={isEndoCondition()}>
                <fieldset class="border border-gray-300 p-2 rounded mt-2">
                  <legend class="text-sm font-medium px-1 text-gray-600">Endo Details</legend>
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-700" for={`endo-canals-${tooth()?.id}`}>Canals Filled</label>
                      <input id={`endo-canals-${tooth()?.id}`} type="text" value={canalsText()} onInput={e => setCanalsText(e.currentTarget.value)} placeholder="e.g., 3, MB/DB/P" class="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700" for={`endo-fill-${tooth()?.id}`}>Fill Material</label>
                      <input id={`endo-fill-${tooth()?.id}`} type="text" value={endoFillMaterialText()} onInput={e => setEndoFillMaterialText(e.currentTarget.value)} placeholder="e.g., Gutta Percha" class="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700" for={`endo-apex-${tooth()?.id}`}>Apex Status</label>
                      <select id={`endo-apex-${tooth()?.id}`} value={apexStatus()} onChange={e => setApexStatus(e.currentTarget.value as any)} class="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm">
                        <option value="">Unknown</option>
                        <option value="sealed">Sealed</option>
                        <option value="open">Open</option>
                        <option value="lesion">Lesion Present</option>
                        <option value="resorption">Resorption</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              </Show>
              {/* Bridge Linking */}
              <Show when={isBridgeCondition() && !props.isMultiSelectActive()}> {/* Show only in single select for linking */}
                <fieldset class="border border-gray-300 p-2 rounded mt-2">
                  <legend class="text-sm font-medium px-1 text-gray-600">Bridge Linking</legend>
                  <div>
                    <label class="block text-xs font-medium text-gray-700" for={`bridge-links-${tooth()?.id}`}>Linked Tooth IDs</label>
                    <input id={`bridge-links-${tooth()?.id}`} type="text" value={linkedIdsText()} onInput={e => setLinkedIdsText(e.currentTarget.value)} placeholder="e.g., 14, 16 (comma-separated)" class="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm" />
                    <p class="text-xs text-gray-500 mt-1">Enter IDs of other teeth in this bridge.</p>
                  </div>
                  {/* Could add Bridge ID input here if needed */}
                </fieldset>
              </Show>
              <div> {/* ... Procedure Code input ... */}
                <label class="block text-sm font-medium text-gray-700 mb-1" for={`proc-code-${tooth().id}`}>Procedure Code (Optional)</label>
                <input id={`proc-code-${tooth().id}`} type="text" value={procCodeText()} onInput={e => setProcCodeText(e.currentTarget.value)} placeholder="e.g., D2330" class="w-full border-gray-300 rounded-md shadow-sm p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              {/* Notes Textarea */}
              <div> {/* ... Notes Textarea ... */}
                <label class="block text-sm font-medium text-gray-700 mb-1" for={`condition-notes-${tooth().id}`}>Notes</label>
                <textarea id={`condition-notes-${tooth().id}`} /* ... */
                  value={props.annotationText()}
                  onInput={(e) => props.setAnnotationText(e.currentTarget.value)}
                  class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
                  rows="2"
                  placeholder="Add details..."
                ></textarea>
              </div>
              {/* Add Button */}
              <button onClick={handleAddClick} /* ... */
                disabled={!props.selectedConditionId()}
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >Add Condition</button>
            </div>

            {/* Existing Conditions List */}
            <div class="mt-4">
              {/* ... Existing conditions list rendering  ... */}
              <h4 class="text-md font-semibold mb-2">
                Existing Conditions for Tooth {tooth().name}
                <span class="text-sm font-normal text-gray-500"> (View: {props.viewFilter})</span>
              </h4>
              <Show
                when={filteredConditionsForDisplay().length > 0}
                fallback={<p class="text-sm text-gray-500 italic px-1 py-2">No conditions recorded{props.viewFilter !== 'all' ? ` with status '${props.viewFilter}'` : ''}.</p>}
              >
                <ul class="divide-y divide-gray-200 border rounded overflow-hidden shadow-sm">
                  <Index each={filteredConditionsForDisplay()}>
                    {(item) => { /* ... list item rendering ... */
                      const conditionInfo = getConditionById(item().condition.type);
                      const cond = item().condition;
                      return (
                        <li class="p-2 flex justify-between items-start bg-white hover:bg-gray-50/50">
                          <div class="flex items-start flex-grow mr-2">
                            <span class={`w-3 h-3 rounded-full ${cond.color} mr-2 mt-1 flex-shrink-0 ring-1 ring-black/10`}></span>
                            <div class="flex-grow">
                              <span class="font-medium text-sm">
                                {conditionInfo?.name || cond.type}
                                <Show when={item().surface}>
                                  {s => <span class="text-xs text-gray-500 font-normal"> ({s()})</span>}
                                </Show>
                                <span class={`ml-1 text-xs font-semibold px-1 py-0.5 rounded ${ /* Status badge style */
                                  cond.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                                    cond.status === 'completed' ? 'bg-green-100 text-green-700' :
                                      cond.status === 'referred' ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                                  }`}>
                                  {cond.status}
                                </span>
                              </span>
                              <Show when={cond.details}>
                                {details => ( /* Details display */
                                  <div class="text-xs text-gray-500 mt-0.5 space-x-2">
                                    {details().material && <span>Mat: {details().material}</span>}
                                    {details().shade && <span>Shd: {details().shade}</span>}
                                    {details().procedureCode && <span>Code: {details().procedureCode}</span>}
                                  </div>
                                )}
                              </Show>
                              <Show when={cond.text}>
                                <p class="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap break-words">Notes: {cond.text}</p>
                              </Show>
                            </div>
                          </div>
                          <button
                            onClick={() => props.onRemoveAnnotation(tooth().id, cond.id, item().surface)}
                            title="Remove this condition"
                            class="text-red-500 hover:text-red-700 text-xs ml-2 px-1.5 py-0.5 border border-transparent hover:border-red-300 rounded flex-shrink-0"
                          >Remove</button>
                        </li>
                      );
                    }}
                  </Index>
                </ul>
              </Show>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
};

