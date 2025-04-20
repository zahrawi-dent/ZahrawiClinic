// src/components/DentalChart/ToothDisplay.tsx
import { Component, createMemo, For, Index, Show, JSX } from 'solid-js';
import type { Tooth, Surface, Condition, ConditionId, SurfaceName, TreatmentStatus, SurfaceCondition, PeriodontalMeasurements, ChartViewFilter, ToothPresence } from './types/dental.types';
import { conditionsList, getConditionById } from './constants/conditions';
import { PerioDisplay } from './PerioDisplay'; // Import the separate component

interface ToothDisplayProps {
  tooth: Tooth;
  isSelected: boolean;
  isMultiSelected: boolean;
  selectedSurfaceName: SurfaceName | null;
  viewFilter: ChartViewFilter;
  showPerioVisuals: boolean; // **** Accept prop ****
  onToothClick: (toothId: number, event: MouseEvent) => void;
  onSurfaceClick: (toothId: number, surfaceName: SurfaceName, event: MouseEvent) => void;
}

// --- Helper Functions for Styling ---
const getSurfaceStylingInfo = (surface: Surface | undefined | null, viewFilter: ChartViewFilter): { bgColorClass: string; statusStyleClass: string } => {
  if (!surface || surface.conditions.length === 0) { return { bgColorClass: 'bg-white hover:bg-blue-100', statusStyleClass: '' }; }
  const relevantCondition = surface.conditions.slice().reverse().find(c => viewFilter === 'all' || c.status === viewFilter);
  if (!relevantCondition) { return { bgColorClass: 'bg-white hover:bg-blue-100', statusStyleClass: '' }; }

  const conditionInfo = getConditionById(relevantCondition.type);
  let bgColor = conditionInfo ? `${conditionInfo.color} hover:brightness-110` : 'bg-white hover:bg-blue-100';
  let statusStyle = '';
  if (conditionInfo?.statusStyles) {
    const styles = conditionInfo.statusStyles;
    if (relevantCondition.status === 'planned' && styles.planned?.surfaceClass) statusStyle = styles.planned.surfaceClass;
    else if (relevantCondition.status === 'completed' && styles.completed?.surfaceClass) statusStyle = styles.completed.surfaceClass;
  }
  return { bgColorClass: bgColor, statusStyleClass: statusStyle };
};

const getWholeToothClasses = (tooth: Tooth, isSelected: boolean, isMultiSelected: boolean): string => {
  let baseClasses = 'relative flex flex-col items-center mx-0.5 cursor-pointer p-1 rounded transition-all duration-150 group';
  let stateClasses = ''; let primaryConditionAppliedStyle = false;

  if (tooth.presence === 'missing') return `${baseClasses} opacity-20 pointer-events-none border border-dashed border-gray-300`;
  if (tooth.presence === 'unerupted') { stateClasses += ' bg-sky-100 border border-dashed border-sky-400 opacity-80'; primaryConditionAppliedStyle = true; }

  if (!primaryConditionAppliedStyle && (tooth.presence === 'present' || tooth.presence === undefined)) {
    const primaryCondition = tooth.conditions.find(c => c.type === 'extraction' || c.type === 'bridge-pontic' || c.type === 'bridge-abutment' || c.type === 'implant' || c.type.startsWith('crown-') || c.type === 'fractured-tooth' || c.type === 'root-canal' || c.type === 'veneer' || c.type === 'impacted');
    if (primaryCondition) {
      const condInfo = getConditionById(primaryCondition.type);
      if (condInfo) {
        stateClasses += ` ${condInfo.color || ''} ${condInfo.wholeToothStyle || ''}`; primaryConditionAppliedStyle = true;
        const statusStyles = condInfo.statusStyles;
        if (primaryCondition.status === 'planned' && statusStyles?.planned?.toothClass) stateClasses += ` ${statusStyles.planned.toothClass}`;
        else if (primaryCondition.status === 'completed' && statusStyles?.completed?.toothClass) stateClasses += ` ${statusStyles.completed.toothClass}`;
      }
    }
    if (!primaryConditionAppliedStyle && tooth.conditions.length > 0) stateClasses += ' border border-gray-400';
    if (!primaryConditionAppliedStyle && tooth.conditions.length === 0) stateClasses += ' border border-transparent hover:border-gray-300';
  }

  if (isSelected) stateClasses += ' ring-2 ring-offset-1 ring-blue-500 z-20';
  else if (isMultiSelected) stateClasses += ' ring-1 ring-offset-1 ring-blue-300 z-10';
  if (tooth.isDeciduous) stateClasses += ' shadow-inner shadow-purple-200';
  return `${baseClasses} ${stateClasses}`;
};


// --- Component: ToothDisplay ---
export const ToothDisplay: Component<ToothDisplayProps> = (props) => {
  const containerClasses = createMemo(() => getWholeToothClasses(props.tooth, props.isSelected, props.isMultiSelected));
  const getIconData = createMemo(() => {
    const primaryVisualCondition = props.tooth.conditions.find(c => c.type === 'extraction' || c.type === 'fractured-tooth');
    if (primaryVisualCondition) { const info = getConditionById(primaryVisualCondition.type); if (info?.wholeToothIcon) { let colorClass = info.id === 'extraction' ? 'text-red-600 stroke-2' : 'text-black stroke-1'; return { path: info.wholeToothIcon, color: colorClass }; } }
    return { path: null, color: '' };
  });
  const surfaceNames = Object.keys(props.tooth.surfaces).filter(key => props.tooth.surfaces[key as SurfaceName] !== undefined) as SurfaceName[];
  const filteredConditions = createMemo(() => {
    const allConds = [...props.tooth.conditions, ...surfaceNames.flatMap(name => props.tooth.surfaces[name]?.conditions || [])];
    if (props.viewFilter === 'all') return allConds; return allConds.filter(c => c.status === props.viewFilter);
  });
  const tooltipContent = createMemo(() => {
    const conditions = filteredConditions(); if (conditions.length === 0) return `Tooth ${props.tooth.name} (${props.tooth.type})`;
    return conditions.map(c => { const info = getConditionById(c.type); const surfaceInfo = surfaceNames.find(sn => props.tooth.surfaces[sn]?.conditions.some(sc => sc.id === c.id)); return `${info?.name || c.type}${surfaceInfo ? ` (${surfaceInfo})` : ''} [${c.status}]${c.text ? `: ${c.text}` : ''}`; }).join('\n');
  });

  const isVisuallyPresent = createMemo(() => props.tooth.presence !== 'missing');
  const isUnerupted = createMemo(() => props.tooth.presence === 'unerupted');

  return (
    <div
      class={containerClasses()}
      classList={{ 'pointer-events-none': !isVisuallyPresent() }}
      onClick={(e) => isVisuallyPresent() && props.onToothClick(props.tooth.id, e)}
      title={tooltipContent()}
    >
      {/* Tooth Visual Representation */}
      {/*<div class={`relative w-10 h-10 border border-gray-400 bg-gray-100 mb-1 ${isUnerupted() ? 'bg-sky-100 border-sky-400' : ''}`}>*/}
      <div class={`relative overflow-visible w-10 h-10 border border-gray-400 bg-gray-100 mb-1 ${isUnerupted() ? 'bg-sky-100 border-sky-400' : ''}`}>
        {/* Render surfaces */}
        <Show when={isVisuallyPresent() && !isUnerupted()}>
          <For each={surfaceNames}>
            {(surfaceName) => {
              const surfaceData = props.tooth.surfaces[surfaceName];
              const styling = createMemo(() => getSurfaceStylingInfo(surfaceData, props.viewFilter));
              const getLayoutClass = () => {
                const type = props.tooth.type;
                const molarLayout = { occlusal: 'absolute w-1/2 h-1/2 top-1/4 left-1/4 z-10', mesial: 'absolute w-1/2 h-1/4 top-0 left-1/4', distal: 'absolute w-1/2 h-1/4 bottom-0 left-1/4', buccal: 'absolute w-1/4 h-1/2 top-1/4 right-0', lingual: 'absolute w-1/4 h-1/2 top-1/4 left-0', root: 'hidden' };
                const anteriorLayout = { incisal: 'absolute w-full h-1/3 top-0 left-0', buccal: 'absolute w-full h-2/3 bottom-0 left-0 z-5', mesial: 'absolute w-1/4 h-2/3 bottom-0 left-0', distal: 'absolute w-1/4 h-2/3 bottom-0 right-0', lingual: 'absolute w-1/2 h-2/3 bottom-0 left-1/4 opacity-50', root: 'hidden' };
                if ((type === 'molar' || type === 'premolar') && surfaceName in molarLayout) return molarLayout[surfaceName as keyof typeof molarLayout];
                if ((type === 'incisor' || type === 'canine') && surfaceName in anteriorLayout) return anteriorLayout[surfaceName as keyof typeof anteriorLayout];
                return 'hidden';
              };
              const isSurfaceSelected = () => props.isSelected && props.selectedSurfaceName === surfaceName;
              return (<div class={`${getLayoutClass()} border border-gray-300 transition-colors duration-150 ${styling().bgColorClass} ${styling().statusStyleClass} ${isSurfaceSelected() ? 'ring-2 ring-inset ring-red-500' : ''}`} onClick={(e) => props.onSurfaceClick(props.tooth.id, surfaceName, e)} />);
            }}
          </For>
        </Show>

        <PerioDisplay
          perio={props.tooth.periodontal}
          toothId={props.tooth.id}
          isVisible={isVisuallyPresent() && props.showPerioVisuals}
        />

        {/* Visual icon overlay */}
        <Show when={isVisuallyPresent() && getIconData().path}>
          <svg class={`absolute inset-0 w-full h-full overflow-visible ${getIconData().color}`} fill="none" viewBox="0 0 10 10"> <path d={getIconData().path!} stroke="currentColor" /> </svg>
        </Show>
      </div>

      {/* Tooth Number */}
      <div class={`text-xs font-semibold select-none ${props.tooth.isDeciduous ? 'text-purple-700' : ''} ${!isVisuallyPresent() ? 'text-gray-400' : ''}`}>
        {props.tooth.name} {isUnerupted() ? <span class="text-sky-600"> (U)</span> : ''}
      </div>

      {/* Condition Indicator Dots */}
      <Show when={isVisuallyPresent()}>
        <div class="absolute -top-1 -right-1 flex flex-wrap gap-0.5 max-w-[20px] pointer-events-none">
          <Index each={filteredConditions()}>{(condition) => {
            const info = getConditionById(condition().type);
            if (info && !info.wholeToothStyle && !info.wholeToothIcon && info.id !== 'missing') {
              let dotStyle = info.statusStyles?.planned?.icon ? 'ring-blue-500 ring-1' : info.statusStyles?.completed?.icon ? 'ring-green-500 ring-1' : 'ring-black/30 ring-1';
              return <span class={`block w-1.5 h-1.5 rounded-full ${condition().color} ${dotStyle}`} title={info.name}></span>;
            } return null;
          }}</Index>
        </div>
      </Show>
    </div>
  );
};

// // src/components/DentalChart/ToothDisplay.tsx
// import { Component, createMemo, For, Index, Show, JSX } from 'solid-js';
//
// import type { Tooth, Surface, Condition, ConditionId, SurfaceName, TreatmentStatus, SurfaceCondition, PeriodontalMeasurements, ChartViewFilter, ToothPresence } from '../types/dental.types';
// import { conditionsList, getConditionById } from '../constants/conditions';
// import { PerioDisplay } from './PerioDisplay';
//
// interface ToothDisplayProps {
//   tooth: Tooth;
//   isSelected: boolean;
//   isMultiSelected: boolean;
//   selectedSurfaceName: SurfaceName | null;
//   viewFilter: ChartViewFilter;
//   showPerioVisuals: boolean; // Prop to control visibility
//   onToothClick: (toothId: number, event: MouseEvent) => void;
//   onSurfaceClick: (toothId: number, surfaceName: SurfaceName, event: MouseEvent) => void;
// }
//
// // --- Helper Functions for Styling ---
//
//
// // Updated to more reliably find the condition to display for styling
// const getSurfaceStylingInfo = (
//   surface: Surface | undefined | null,
//   viewFilter: ChartViewFilter
// ): { bgColorClass: string; statusStyleClass: string } => {
//   if (!surface || surface.conditions.length === 0) {
//     return { bgColorClass: 'bg-white hover:bg-blue-100', statusStyleClass: '' };
//   }
//
//   // Find the last condition added that matches the filter
//   const relevantCondition = surface.conditions
//     .slice() // Create a shallow copy to reverse
//     .reverse()
//     .find(c => viewFilter === 'all' || c.status === viewFilter);
//
//   if (!relevantCondition) {
//     // No condition matches the filter for this surface
//     return { bgColorClass: 'bg-white hover:bg-blue-100', statusStyleClass: '' };
//   }
//
//   const conditionInfo = getConditionById(relevantCondition.type);
//   let bgColor = conditionInfo ? `${conditionInfo.color} hover:brightness-110` : 'bg-white hover:bg-blue-100';
//   let statusStyle = '';
//
//   if (conditionInfo?.statusStyles) {
//     const styles = conditionInfo.statusStyles;
//     if (relevantCondition.status === 'planned' && styles.planned?.surfaceClass) {
//       statusStyle = styles.planned.surfaceClass;
//     } else if (relevantCondition.status === 'completed' && styles.completed?.surfaceClass) {
//       statusStyle = styles.completed.surfaceClass;
//     }
//   }
//
//   return { bgColorClass: bgColor, statusStyleClass: statusStyle };
// };
//
// const getWholeToothClasses = (tooth: Tooth, isSelected: boolean, isMultiSelected: boolean): string => {
//   let baseClasses = 'relative flex flex-col items-center mx-0.5 cursor-pointer p-1 rounded transition-all duration-150 group'; // Added group for tooltip parent
//   let stateClasses = '';
//   let primaryConditionAppliedStyle = false;
//
//   // --- PRIORITY 1: Check Explicit Presence ---
//   if (tooth.presence === 'missing') {
//     return `${baseClasses} opacity-20 pointer-events-none border border-dashed border-gray-300`; // Style for missing
//   }
//   if (tooth.presence === 'unerupted') {
//     // Style for unerupted (overrides conditions below)
//     stateClasses += ' bg-sky-100 border border-dashed border-sky-400 opacity-80';
//     primaryConditionAppliedStyle = true; // Prevent condition styles from applying over this
//   }
//
//   // --- PRIORITY 2: Conditions (only if presence is 'present' or undefined) ---
//   if (!primaryConditionAppliedStyle && (tooth.presence === 'present' || tooth.presence === undefined)) {
//     const primaryCondition = /* Find highest priority existing/planned/completed condition */
//       tooth.conditions.find(c => c.type === 'extraction') || // Should be planned
//       tooth.conditions.find(c => c.type === 'bridge-pontic') ||
//       tooth.conditions.find(c => c.type === 'bridge-abutment') ||
//       tooth.conditions.find(c => c.type === 'implant') ||
//       tooth.conditions.find(c => c.type.startsWith('crown-')) || // Any crown type
//       tooth.conditions.find(c => c.type === 'fractured-tooth') ||
//       tooth.conditions.find(c => c.type === 'root-canal') ||
//       tooth.conditions.find(c => c.type === 'veneer') ||
//       tooth.conditions.find(c => c.type === 'impacted'); // Impacted implies present but not erupted fully
//
//     if (primaryCondition) {
//       const condInfo = getConditionById(primaryCondition.type);
//       if (condInfo) {
//         stateClasses += ` ${condInfo.color || ''} ${condInfo.wholeToothStyle || ''}`;
//         primaryConditionAppliedStyle = true;
//         // Apply status overlay style
//         const statusStyles = condInfo.statusStyles;
//         if (primaryCondition.status === 'planned' && statusStyles?.planned?.toothClass) {
//           stateClasses += ` ${statusStyles.planned.toothClass}`;
//         } else if (primaryCondition.status === 'completed' && statusStyles?.completed?.toothClass) {
//           stateClasses += ` ${statusStyles.completed.toothClass}`;
//         }
//       }
//     }
//
//     // Subtle border if other conditions exist but no primary style
//     if (!primaryConditionAppliedStyle && tooth.conditions.length > 0) {
//       stateClasses += ' border border-gray-400';
//     }
//     // Default border for healthy teeth
//     if (!primaryConditionAppliedStyle && tooth.conditions.length === 0) {
//       stateClasses += ' border border-transparent hover:border-gray-300';
//     }
//   }
//
//
//   // --- Selection Styling (applied regardless of presence unless missing) ---
//   if (isSelected) {
//     stateClasses += ' ring-2 ring-offset-1 ring-blue-500 z-20';
//   } else if (isMultiSelected) {
//     stateClasses += ' ring-1 ring-offset-1 ring-blue-300 z-10';
//   }
//
//   // Deciduous indicator
//   if (tooth.isDeciduous) {
//     stateClasses += ' shadow-inner shadow-purple-200';
//   }
//
//   return `${baseClasses} ${stateClasses}`;
// };
//
//
//
//
//
// // --- Component: ToothDisplay ---
// export const ToothDisplay: Component<ToothDisplayProps> = (props) => {
//
//   const containerClasses = createMemo(() => getWholeToothClasses(props.tooth, props.isSelected, props.isMultiSelected));
//
//   const getIconData = createMemo(() => {
//     const primaryVisualCondition =
//       props.tooth.conditions.find(c => c.type === 'extraction') ||
//       props.tooth.conditions.find(c => c.type === 'fractured-tooth');
//
//     if (primaryVisualCondition) {
//       const info = getConditionById(primaryVisualCondition.type);
//       if (info?.wholeToothIcon) {
//         let colorClass = 'text-black stroke-1';
//         if (info.id === 'extraction') colorClass = 'text-red-600 stroke-2';
//         return { path: info.wholeToothIcon, color: colorClass };
//       }
//     }
//     // Check for status-specific icons
//     const plannedIconCond = props.tooth.conditions.find(c => c.status === 'planned' && getConditionById(c.type)?.statusStyles?.planned?.icon);
//     if (plannedIconCond) {
//       // TODO: Implement Planned Icon rendering if path provided
//     }
//     const completedIconCond = props.tooth.conditions.find(c => c.status === 'completed' && getConditionById(c.type)?.statusStyles?.completed?.icon);
//     if (completedIconCond) {
//       // TODO: Implement Completed Icon rendering if path provided (e.g., checkmark)
//     }
//
//     return { path: null, color: '' };
//   });
//
//
//   const surfaceNames = Object.keys(props.tooth.surfaces).filter(key => props.tooth.surfaces[key as SurfaceName] !== undefined) as SurfaceName[];
//
//   // --- Bridge Link Styling ---
//   const hasBridgeLink = createMemo(() => {
//     // Check if *any* condition on this tooth has bridge links defined
//     return props.tooth.conditions.some(c => c.details?.linkedToothIds && c.details.linkedToothIds.length > 0) ||
//       surfaceNames.some(sn => props.tooth.surfaces[sn]?.conditions.some(sc => sc.details?.linkedToothIds && sc.details.linkedToothIds.length > 0));
//   });
//
//   // Filter conditions based on viewFilter prop
//   const filteredConditions = createMemo(() => {
//     const allConds = [
//       ...props.tooth.conditions,
//       ...surfaceNames.flatMap(name => props.tooth.surfaces[name]?.conditions || [])
//     ];
//     if (props.viewFilter === 'all') return allConds;
//     return allConds.filter(c => c.status === props.viewFilter);
//   });
//
//   // Tooltip content generation
//   const tooltipContent = createMemo(() => {
//     const conditions = filteredConditions();
//     if (conditions.length === 0) return `Tooth ${props.tooth.name} (${props.tooth.type})`;
//     return conditions.map(c => {
//       const info = getConditionById(c.type);
//       const surfaceInfo = surfaceNames.find(sn => props.tooth.surfaces[sn]?.conditions.some(sc => sc.id === c.id));
//       return `${info?.name || c.type}${surfaceInfo ? ` (${surfaceInfo})` : ''} [${c.status}]${c.text ? `: ${c.text}` : ''}`;
//     }).join('\n');
//   });
//
//   // Determine if tooth should be visually interactive based on presence
//   const isVisuallyPresent = createMemo(() => props.tooth.presence !== 'missing');
//   const isUnerupted = createMemo(() => props.tooth.presence === 'unerupted');
//
//   return (
//     <div // Consider wrapping with Tooltip component here
//       class={containerClasses()}
//       classList={{ 'pointer-events-none': !isVisuallyPresent() }} // Disable clicks if missing
//
//       onClick={(e) => isVisuallyPresent() && props.onToothClick(props.tooth.id, e)} // Only allow click if present/unerupted
//       title={tooltipContent()} // Basic HTML tooltip
//     >
//       {/* Tooth Visual Representation */}
//       <div class={`relative w-10 h-10 border border-gray-400 bg-gray-100 mb-1 ${isUnerupted() ? 'bg-sky-100 border-sky-400' : ''}`}> {/* Adjust bg for unerupted */}
//
//         {/* Render surfaces */}
//         <Show when={isVisuallyPresent() && !isUnerupted()}>
//           <For each={surfaceNames}>
//             {(surfaceName) => {
//               const surfaceData = props.tooth.surfaces[surfaceName];
//               // Find the most relevant condition to determine style (e.g., highest priority or last added)
//               // Simple approach: use the last condition added that matches the view filter
//               const relevantCondition = createMemo(() =>
//                 surfaceData?.conditions.slice().reverse().find(c =>
//                   props.viewFilter === 'all' || c.status === props.viewFilter
//                 ));
//
//
//               const styling = createMemo(() => getSurfaceStylingInfo(surfaceData, props.viewFilter));
//
//               const getLayoutClass = () => {
//                 const type = props.tooth.type;
//                 const molarLayout = { occlusal: 'absolute w-1/2 h-1/2 top-1/4 left-1/4 z-10', mesial: 'absolute w-1/2 h-1/4 top-0 left-1/4', distal: 'absolute w-1/2 h-1/4 bottom-0 left-1/4', buccal: 'absolute w-1/4 h-1/2 top-1/4 right-0', lingual: 'absolute w-1/4 h-1/2 top-1/4 left-0', root: 'hidden' }; // Hide root visually for now
//                 const anteriorLayout = { incisal: 'absolute w-full h-1/3 top-0 left-0', buccal: 'absolute w-full h-2/3 bottom-0 left-0 z-5', mesial: 'absolute w-1/4 h-2/3 bottom-0 left-0', distal: 'absolute w-1/4 h-2/3 bottom-0 right-0', lingual: 'absolute w-1/2 h-2/3 bottom-0 left-1/4 opacity-50', root: 'hidden' };
//
//                 if ((type === 'molar' || type === 'premolar') && surfaceName in molarLayout) {
//                   return molarLayout[surfaceName as keyof typeof molarLayout];
//                 }
//                 if ((type === 'incisor' || type === 'canine') && surfaceName in anteriorLayout) {
//                   return anteriorLayout[surfaceName as keyof typeof anteriorLayout];
//                 }
//                 return 'hidden';
//               };
//
//
//               const isSurfaceSelected = () => props.isSelected && props.selectedSurfaceName === surfaceName;
//
//
//               const surfaceCondition = relevantCondition(); // Get the condition relevant to current filter
//               const conditionInfo = getConditionById(surfaceCondition?.type);
//
//               return (
//                 <div
//                   class={`${getLayoutClass()} border border-gray-300 transition-colors duration-150
//                                     ${styling().bgColorClass} ${styling().statusStyleClass}
//                                     ${isSurfaceSelected() ? 'ring-2 ring-inset ring-red-500' : ''}`}
//                   onClick={(e) => props.onSurfaceClick(props.tooth.id, surfaceName, e)}
//                 />
//               );
//             }}
//           </For>
//         </Show>
//
//         {/* Perio Display Overlay */}
//         {/* --- Render Perio Display (Conditionally) --- */}
//         <Show when={isVisuallyPresent() && props.showPerioVisuals}>
//           <PerioDisplay
//             perio={props.tooth.periodontal}
//             toothId={props.tooth.id}
//           // Pass other props like showCAL if added
//           />
//         </Show>
//
//         {/* Visual icon overlay (only if present/unerupted?) */}
//         <Show when={isVisuallyPresent() && getIconData().path}>
//           {/* ... icon rendering ... */}
//           <svg class={`absolute inset-0 w-full h-full overflow-visible ${getIconData().color}`} fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
//             <path d={getIconData().path!} stroke="currentColor" />
//           </svg>
//         </Show>
//       </div>
//
//
//       {/* Tooth Number */}
//       <div class={`text-xs font-semibold select-none ${props.tooth.isDeciduous ? 'text-purple-700' : ''} ${!isVisuallyPresent() ? 'text-gray-400' : ''}`}>
//         {props.tooth.name}
//         {isUnerupted() ? <span class="text-sky-600"> (U)</span> : ''}
//       </div>
//
//       {/* Condition Indicator Dots (only show if they match filter) */}
//       {/* ... Logic for dots needs updating to check filteredConditions() ... */}
//
//       <Show when={isVisuallyPresent()}>
//         <div class="absolute -top-1 -right-1 flex flex-wrap gap-0.5 max-w-[20px] pointer-events-none">
//           <Index each={filteredConditions()}>
//             {(condition) => {
//               const info = getConditionById(condition().type);
//               // Example: Only show dots for non-major conditions
//               if (info && !info.wholeToothStyle && !info.wholeToothIcon && info.id !== 'missing') {
//                 let dotStyle = info.statusStyles?.planned?.icon ? 'ring-blue-500 ring-1' : // Example planned dot
//                   info.statusStyles?.completed?.icon ? 'ring-green-500 ring-1' : // Example completed dot
//                     'ring-black/30 ring-1';
//                 return <span class={`block w-1.5 h-1.5 rounded-full ${condition().color} ${dotStyle}`} title={info.name}></span>;
//               }
//               return null;
//             }}
//           </Index>
//         </div>
//       </Show>
//       {/* Placeholder for drawing actual bridge connector lines (would need parent context or SVG overlay) */}
//       <Show when={hasBridgeLink()}>
//         <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full opacity-70" title="Part of bridge"></div>
//       </Show>
//
//     </div>
//   );
// };
