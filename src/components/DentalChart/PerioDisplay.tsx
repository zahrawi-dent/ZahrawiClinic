// src/components/DentalChart/PerioDisplay.tsx
import { Component, createMemo, Index, Show, JSX } from 'solid-js';
import type { PeriodontalMeasurements } from './types/dental.types';

interface PerioDisplayProps {
  perio: PeriodontalMeasurements | undefined;
  toothId: number; // For debugging context if needed
  isVisible: boolean;
}


export const PerioDisplay: Component<PerioDisplayProps> = (props) => {

  // Helper to get value or default '-'
  const getSiteValue = (arr: (number | boolean | null)[] | undefined, index: number): string | number | boolean => {
    const val = arr?.[index];
    return val === null || val === undefined ? '-' : val;
  };

  // Helper to calculate CAL = PD + REC (handle nulls)
  const calculateCAL = (pd: number | null | undefined, rec: number | null | undefined): number | null => {
    if (pd === null || pd === undefined) return null;
    const recessionValue = (rec === null || rec === undefined) ? 0 : rec;
    return pd + recessionValue;
  };

  // --- Positioning Helpers (Values likely need fine-tuning) ---
  const numPosStyles: JSX.CSSProperties[] = [
    // Buccal (MB, B, DB - Indices 0, 1, 2)
    { position: 'absolute', top: '-11px', left: '15%', transform: 'translateX(-50%)' }, // MB
    { position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)' }, // B
    { position: 'absolute', top: '-11px', right: '15%', transform: 'translateX(50%)', left: 'auto' }, // DB
    // Lingual (DL, L, ML - Indices 3, 4, 5)
    { position: 'absolute', bottom: '-11px', right: '15%', transform: 'translateX(50%)', left: 'auto' }, // DL
    { position: 'absolute', bottom: '-11px', left: '50%', transform: 'translateX(-50%)' }, // L
    { position: 'absolute', bottom: '-11px', left: '15%', transform: 'translateX(-50%)' }, // ML
  ];


  const getBopPosStyle = (siteIndex: number): JSX.CSSProperties => {
    const basePos = { ...numPosStyles[siteIndex] };
    if (siteIndex < 3) basePos.top = '-6px'; else basePos.bottom = '-6px';
    basePos.left = '50%'; basePos.transform = 'translateX(-50%)';
    basePos.width = 'auto'; delete basePos.right; delete basePos['text-align'];
    return basePos;
  };

  const getRecLineStyle = (siteIndex: number, recValue: number): JSX.CSSProperties | null => {
    if (recValue <= 0) return null;
    const visualRec = Math.min(recValue, 9);
    const heightPercent = Math.min(45, (visualRec / 9) * 45);
    const styles: JSX.CSSProperties = {
      position: 'absolute', height: '1.5px', 'background-color': '#f59e0b', // orange-500
      'pointer-events': 'none', 'z-index': 5
    };
    const siteWithinRow = siteIndex < 3 ? siteIndex : (5 - siteIndex);
    if (siteWithinRow === 0) { styles.left = '5%'; styles.width = '30%'; }
    else if (siteWithinRow === 1) { styles.left = '35%'; styles.width = '30%'; }
    else if (siteWithinRow === 2) { styles.left = '65%'; styles.width = '30%'; }
    if (siteIndex < 3) styles.top = `${heightPercent}%`; else styles.bottom = `${heightPercent}%`;
    return styles;
  };

  const numberStyle: JSX.CSSProperties = {
    'font-size': '9px', 'line-height': '1', 'text-align': 'center',
    'font-family': 'monospace', width: '30%',
  };

  return (
    <div
      class="absolute inset-0 pointer-events-none z-10 overflow-visible transition-opacity duration-150 ease-in-out" // Added overflow-visible


      classList={{
        'opacity-100': props.isVisible, // Show when visible
        'opacity-0': !props.isVisible   // Hide smoothly when not visible
        // Alternatively use Tailwind's 'hidden' class:
        // 'hidden': !props.isVisible
      }}
    >
      {/* Pocket Depths */}
      <Index each={Array(6).fill(0)}>
        {(_, i) => {
          const pd = getSiteValue(props.perio?.pocketDepth, i);
          const isHighPd = typeof pd === 'number' && pd >= 5;
          const style = { ...numberStyle, ...numPosStyles[i] };
          return <span style={style} class={isHighPd ? 'text-red-600 font-bold' : 'text-blue-700'}>{pd}</span>;
        }}
      </Index>

      {/* BOP Indicators */}
      <Index each={Array(6).fill(0)}>
        {(_, i) => {
          const bop = getSiteValue(props.perio?.bleedingOnProbing, i);
          return (<Show when={bop === true}> <div style={getBopPosStyle(i)} class="absolute w-1.5 h-1.5 bg-red-500 rounded-full"></div> </Show>);
        }}
      </Index>

      {/* Recession Lines */}
      <Index each={Array(6).fill(0)}>
        {(_, i) => {
          const recRaw = getSiteValue(props.perio?.recession, i);
          const rec = typeof recRaw === 'number' ? recRaw : 0;
          const lineStyle = getRecLineStyle(i, rec);
          return (<Show when={lineStyle}> <div style={lineStyle!}></div> </Show>);
        }}
      </Index>
    </div>
  );
};

// // src/components/DentalChart/PerioDisplay.tsx
// import { Component, createMemo, Index, Show, JSX } from 'solid-js';
// import type { PeriodontalMeasurements } from '../types/dental.types';
//
// interface PerioDisplayProps {
//   perio: PeriodontalMeasurements | undefined;
//   toothId: number; // For debugging context if needed
//   // Add props here later if CAL display becomes optional
// }
//
// export const PerioDisplay: Component<PerioDisplayProps> = (props) => {
//
//   // Helper to get value or default '-'
//   const getSiteValue = (arr: (number | boolean | null)[] | undefined, index: number): string | number | boolean => {
//     const val = arr?.[index];
//     return val === null || val === undefined ? '-' : val;
//   };
//
//   // Helper to calculate CAL = PD + REC (handle nulls)
//   const calculateCAL = (pd: number | null | undefined, rec: number | null | undefined): number | null => {
//     if (pd === null || pd === undefined) return null;
//     const recessionValue = (rec === null || rec === undefined) ? 0 : rec;
//     return pd + recessionValue;
//   };
//
//   // --- Positioning Helpers (These values likely need fine-tuning based on your exact tooth graphic size/style) ---
//
//   // Base positioning for numbers (adjust offsets as needed)
//   // Buccal: Top edge; Lingual: Bottom edge
//   // Index maps to [MB, B, DB, DL, L, ML] for array access
//   const numPosStyles: JSX.CSSProperties[] = [
//     // Buccal (MB, B, DB - Indices 0, 1, 2)
//     { position: 'absolute', top: '-11px', left: '15%', transform: 'translateX(-50%)' }, // MB
//     { position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)' }, // B
//     { position: 'absolute', top: '-11px', right: '15%', transform: 'translateX(50%)', left: 'auto' }, // DB
//     // Lingual (DL, L, ML - Indices 3, 4, 5)
//     { position: 'absolute', bottom: '-11px', right: '15%', transform: 'translateX(50%)', left: 'auto' }, // DL
//     { position: 'absolute', bottom: '-11px', left: '50%', transform: 'translateX(-50%)' }, // L
//     { position: 'absolute', bottom: '-11px', left: '15%', transform: 'translateX(-50%)' }, // ML
//   ];
//
//   // Positioning for BOP dots relative to numbers
//   const getBopPosStyle = (siteIndex: number): JSX.CSSProperties => {
//     const basePos = { ...numPosStyles[siteIndex] }; // Copy base style
//     // Offset slightly vertically towards center of tooth
//     if (siteIndex < 3) basePos.top = '-6px';
//     else basePos.bottom = '-6px';
//     // Center horizontally
//     basePos.left = '50%';
//     basePos.transform = 'translateX(-50%)';
//     basePos.width = 'auto'; delete basePos.right; delete basePos['text-align'];
//     return basePos;
//   };
//
//   // Style for REC lines
//   const getRecLineStyle = (siteIndex: number, recValue: number): JSX.CSSProperties | null => {
//     if (recValue <= 0) return null;
//     const visualRec = Math.min(recValue, 9); // Clamp for visualization
//     const heightPercent = Math.min(45, (visualRec / 9) * 45); // % of tooth height, capped
//     const styles: JSX.CSSProperties = {
//       position: 'absolute', height: '1.5px', 'background-color': '#f59e0b', // orange-500
//       'pointer-events': 'none', 'z-index': 5
//     };
//
//     // Horizontal position covers approx one third per site
//     const siteWithinRow = siteIndex < 3 ? siteIndex : (5 - siteIndex); // 0=M, 1=Mid, 2=D
//     if (siteWithinRow === 0) { styles.left = '5%'; styles.width = '30%'; }
//     else if (siteWithinRow === 1) { styles.left = '35%'; styles.width = '30%'; }
//     else if (siteWithinRow === 2) { styles.left = '65%'; styles.width = '30%'; }
//
//     // Vertical position from edge (CEJ approximation)
//     if (siteIndex < 3) styles.top = `${heightPercent}%`; // Down from top
//     else styles.bottom = `${heightPercent}%`; // Up from bottom
//
//     return styles;
//   };
//
//   // Styles for the numbers themselves
//   const numberStyle: JSX.CSSProperties = {
//     'font-size': '9px',
//     'line-height': '1',
//     'text-align': 'center',
//     'font-family': 'monospace',
//     width: '30%', // Give numbers some width to align centers better
//   };
//
//   return (
//     // Container div for all perio visuals for a single tooth
//     <div class="absolute inset-0 pointer-events-none z-10 overflow-visible">
//       {/* Pocket Depths */}
//       <Index each={Array(6).fill(0)}>
//         {(_, i) => {
//           const pd = getSiteValue(props.perio?.pocketDepth, i);
//           const isHighPd = typeof pd === 'number' && pd >= 5;
//           const style = { ...numberStyle, ...numPosStyles[i] }; // Combine base style and position
//           return <span style={style} class={isHighPd ? 'text-red-600 font-bold' : 'text-blue-700'}>{pd}</span>;
//         }}
//       </Index>
//
//       {/* BOP Indicators */}
//       <Index each={Array(6).fill(0)}>
//         {(_, i) => {
//           const bop = getSiteValue(props.perio?.bleedingOnProbing, i);
//           return (
//             <Show when={bop === true}>
//               <div style={getBopPosStyle(i)} class="absolute w-1.5 h-1.5 bg-red-500 rounded-full"></div>
//             </Show>
//           );
//         }}
//       </Index>
//
//       {/* Recession Lines */}
//       <Index each={Array(6).fill(0)}>
//         {(_, i) => {
//           const recRaw = getSiteValue(props.perio?.recession, i);
//           const rec = typeof recRaw === 'number' ? recRaw : 0;
//           const lineStyle = getRecLineStyle(i, rec);
//           return (<Show when={lineStyle}> <div style={lineStyle!}></div> </Show>);
//         }}
//       </Index>
//
//       {/* Calculated CAL (Optional Display - could add a prop to control) */}
//       {/*
//             <Index each={Array(6).fill(0)}>
//                  {(_, i) => {
//                     const pd = props.perio?.pocketDepth?.[i];
//                     const rec = props.perio?.recession?.[i];
//                     const cal = calculateCAL(pd, rec);
//                     const calDisplay = cal === null ? '-' : cal;
//                     const isHighCal = typeof cal === 'number' && cal >= 5;
//                     // Position CAL below lingual / above buccal numbers, slightly offset
//                     const calPosStyle = getPosStyle(i, i < 3 ? '0px' : '-20px');
//                     const style = { ...numberStyle, ...calPosStyle };
//                     return <span style={style} class={`text-[8px] ${isHighCal ? 'text-red-700 font-bold' : 'text-green-700'}`}>{calDisplay}</span>;
//                 }}
//             </Index>
//              */}
//     </div>
//   );
// };
//
//
// // // src/components/DentalChart/PerioDisplay.tsx
// // import { Component, createMemo, Index, Show, JSX } from 'solid-js';
// // import type { PeriodontalMeasurements } from 'types/dental.types';
// //
// // interface PerioDisplayProps {
// //   perio: PeriodontalMeasurements | undefined;
// //   toothId: number; // For potential debugging
// // }
// //
// // export const PerioDisplay: Component<PerioDisplayProps> = (props) => {
// //
// //   // Helper to get value or default '-'
// //   const getSiteValue = (arr: (number | boolean | null)[] | undefined, index: number): string | number | boolean => {
// //     const val = arr?.[index];
// //     return val === null || val === undefined ? '-' : val;
// //   };
// //
// //   // --- Positioning Helpers ---
// //   // Buccal sites (Indices 0, 1, 2 -> MB, B, DB) - Placed ABOVE the tooth graphic
// //   const buccalSitePositions: JSX.CSSProperties[] = [
// //     { position: 'absolute', top: '-11px', left: '10%', transform: 'translateX(-50%)', 'text-align': 'center', width: '30%' }, // MB (left-ish)
// //     { position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', 'text-align': 'center', width: '30%' }, // B (center)
// //     { position: 'absolute', top: '-11px', right: '10%', transform: 'translateX(50%)', 'text-align': 'center', width: '30%' }, // DB (right-ish)
// //   ];
// //   // Lingual sites (Indices 5, 4, 3 -> ML, L, DL) - Placed BELOW the tooth graphic
// //   const lingualSitePositions: JSX.CSSProperties[] = [
// //     { position: 'absolute', bottom: '-11px', left: '10%', transform: 'translateX(-50%)', 'text-align': 'center', width: '30%' }, // ML (left-ish)
// //     { position: 'absolute', bottom: '-11px', left: '50%', transform: 'translateX(-50%)', 'text-align': 'center', width: '30%' }, // L (center)
// //     { position: 'absolute', bottom: '-11px', right: '10%', transform: 'translateX(50%)', 'text-align': 'center', width: '30%' }, // DL (right-ish)
// //   ];
// //   // Combine and map to the 6 site indices [0, 1, 2, 5, 4, 3] order we might use elsewhere
// //   const sitePosStyles = [
// //     buccalSitePositions[0], buccalSitePositions[1], buccalSitePositions[2], // MB, B, DB
// //     lingualSitePositions[2], lingualSitePositions[1], lingualSitePositions[0] // DL, L, ML (mapped from indices 3,4,5)
// //   ];
// //
// //   // Positioning for BOP dots relative to numbers
// //   const getBopPosStyle = (siteIndex: number): JSX.CSSProperties => {
// //     const basePos = { ...sitePosStyles[siteIndex] }; // Copy base style
// //     // Offset slightly vertically
// //     if (siteIndex < 3) basePos.top = '-5px'; // Slightly below number
// //     else basePos.bottom = '-5px'; // Slightly above number
// //     // Center the dot horizontally
// //     basePos.left = '50%';
// //     basePos.transform = 'translateX(-50%)';
// //     basePos.width = 'auto'; // Don't need width for dot
// //     delete basePos.right; // Remove right positioning if set
// //     delete basePos['text-align'];
// //     return basePos;
// //   };
// //
// //   // Style for REC lines
// //   const getRecLineStyle = (siteIndex: number, recValue: number): JSX.CSSProperties | null => {
// //     if (recValue <= 0) return null;
// //     // Clamp recession for visual purposes if needed (e.g., max visually is 5mm line)
// //     const visualRec = Math.min(recValue, 9);
// //     const heightPercent = (visualRec / 9) * 50; // Represents % of tooth height (approx)
// //     const styles: JSX.CSSProperties = {
// //       position: 'absolute', height: '1.5px', 'background-color': '#f59e0b', // Tailwind orange-500
// //       'pointer-events': 'none', 'z-index': 5 // Ensure lines are visible
// //     };
// //
// //     // Horizontal positioning similar to numbers
// //     const siteWithinRow = siteIndex < 3 ? siteIndex : (5 - siteIndex);
// //     if (siteWithinRow === 0) { styles.left = '5%'; styles.width = '30%'; }
// //     else if (siteWithinRow === 1) { styles.left = '35%'; styles.width = '30%'; }
// //     else if (siteWithinRow === 2) { styles.left = '65%'; styles.width = '30%'; }
// //
// //     // Vertical position from edge (CEJ approximation)
// //     if (siteIndex < 3) styles.top = `${heightPercent}%`; // Down from top
// //     else styles.bottom = `${heightPercent}%`; // Up from bottom
// //
// //     return styles;
// //   };
// //
// //
// //   return (
// //     <div class="absolute inset-0 pointer-events-none z-10 overflow-visible">
// //       {/* Pocket Depths */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const pd = getSiteValue(props.perio?.pocketDepth, i);
// //           const isHighPd = typeof pd === 'number' && pd >= 5; // Example threshold
// //           return (
// //             <span style={sitePosStyles[i]}
// //               class={`text-[9px] font-mono text-center ${isHighPd ? 'text-red-600 font-bold' : 'text-blue-700'}`}
// //             >
// //               {pd}
// //             </span>
// //           );
// //         }}
// //       </Index>
// //
// //       {/* BOP Indicators */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const bop = getSiteValue(props.perio?.bleedingOnProbing, i);
// //           return (
// //             <Show when={bop === true}>
// //               <div style={getBopPosStyle(i)} class="absolute w-1.5 h-1.5 bg-red-500 rounded-full"></div>
// //             </Show>
// //           );
// //         }}
// //       </Index>
// //
// //       {/* Recession Lines */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const recRaw = getSiteValue(props.perio?.recession, i);
// //           const rec = typeof recRaw === 'number' ? recRaw : 0;
// //           const lineStyle = getRecLineStyle(i, rec);
// //           return (
// //             <Show when={lineStyle}>
// //               <div style={lineStyle!}></div>
// //             </Show>
// //           );
// //         }}
// //       </Index>
// //     </div>
// //   );
// // };
//
// // // src/components/DentalChart/PerioDisplay.tsx
// // import { Component, createMemo, Index, Show, JSX } from 'solid-js';
// // import type { PeriodontalMeasurements } from 'types/dental.types';
// //
// // interface PerioDisplayProps {
// //   perio: PeriodontalMeasurements | undefined;
// //   toothId: number; // For potential debug logging
// //   showCalculatedCAL?: boolean; // Optional prop to display CAL
// // }
// //
// // export const PerioDisplay: Component<PerioDisplayProps> = (props) => {
// //
// //   const getSiteValue = (arr: (number | boolean | null)[] | undefined, index: number): string | number | boolean => {
// //     const val = arr?.[index];
// //     return val === null || val === undefined ? '-' : val;
// //   };
// //
// //   // Calculate CAL = PD + REC (handle nulls, negative recession becomes positive for calc)
// //   const calculateCAL = (pd: number | null | undefined, rec: number | null | undefined): number | null => {
// //     if (pd === null || pd === undefined) return null; // Cannot calculate without PD
// //     const recessionValue = (rec === null || rec === undefined) ? 0 : rec; // Treat null recession as 0 for CAL
// //     return pd + recessionValue;
// //   };
// //
// //   // --- Positioning Helpers (Requires CSS Fine-tuning) ---
// //   const getPosStyle = (siteIndex: number, verticalOffset: string = '-10px'): JSX.CSSProperties => {
// //     const isBuccal = siteIndex < 3;
// //     const styles: JSX.CSSProperties = { position: 'absolute', 'font-size': '9px', 'line-height': '1', 'text-align': 'center', 'font-family': 'monospace' };
// //     if (isBuccal) styles.top = verticalOffset;
// //     else styles.bottom = verticalOffset;
// //
// //     const siteWithinRow = isBuccal ? siteIndex : (5 - siteIndex);
// //     if (siteWithinRow === 0) styles.left = '10%';
// //     else if (siteWithinRow === 1) { styles.left = '50%'; styles.transform = 'translateX(-50%)'; }
// //     else if (siteWithinRow === 2) styles.right = '10%'; styles.left = 'auto'; // Ensure right takes precedence
// //
// //     return styles;
// //   };
// //
// //   const getBopPosStyle = (siteIndex: number): JSX.CSSProperties => {
// //     const basePos = getPosStyle(siteIndex, '-4px'); // Position slightly inside the number
// //     return { ...basePos, width: '6px', height: '6px', 'background-color': 'red', 'border-radius': '50%' };
// //   };
// //
// //   const getRecLineStyle = (siteIndex: number, recValue: number): JSX.CSSProperties | null => {
// //     if (recValue <= 0) return null;
// //     const heightPercent = Math.min(45, (recValue / 9) * 45); // Cap at 45% height
// //     const styles: JSX.CSSProperties = {
// //       position: 'absolute', height: '1.5px', 'background-color': '#f59e0b', // Amber-500
// //     };
// //     const siteWithinRow = siteIndex < 3 ? siteIndex : (5 - siteIndex);
// //     if (siteWithinRow === 0) { styles.left = '5%'; styles.width = '30%'; }
// //     else if (siteWithinRow === 1) { styles.left = '35%'; styles.width = '30%'; }
// //     else if (siteWithinRow === 2) { styles.left = '65%'; styles.width = '30%'; }
// //
// //     if (siteIndex < 3) styles.top = `${heightPercent}%`;
// //     else styles.bottom = `${heightPercent}%`;
// //
// //     return styles;
// //   };
// //
// //   return (
// //     <div class="absolute inset-0 pointer-events-none z-10 overflow-visible">
// //       {/* Pocket Depths - Blue */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const pd = getSiteValue(props.perio?.pocketDepth, i);
// //           const style = getPosStyle(i);
// //           return <span style={style} classList={{ 'text-red-600 font-bold': typeof pd === 'number' && pd >= 5, 'text-blue-700': typeof pd === 'number' && pd < 5 }}>{pd}</span>;
// //         }}
// //       </Index>
// //
// //       {/* BOP Indicators - Red Dots */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const bop = getSiteValue(props.perio?.bleedingOnProbing, i);
// //           return (<Show when={bop === true}> <div style={getBopPosStyle(i)}></div> </Show>);
// //         }}
// //       </Index>
// //
// //       {/* Recession Lines - Orange */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const recRaw = getSiteValue(props.perio?.recession, i);
// //           const rec = typeof recRaw === 'number' ? recRaw : 0;
// //           const lineStyle = getRecLineStyle(i, rec);
// //           // Optionally display REC number too, slightly offset from PD
// //           // const recNumStyle = getPosStyle(i, i < 3 ? '-1px' : '-19px'); // Example offset
// //           return (
// //             <>
// //               {/* <Show when={rec > 0}><span style={recNumStyle} class="text-[7px] text-orange-600">({rec})</span></Show> */}
// //               <Show when={lineStyle}> <div style={lineStyle!}></div> </Show>
// //             </>
// //           );
// //         }}
// //       </Index>
// //
// //       {/* Calculated CAL (Optional) - Green */}
// //       <Show when={props.showCalculatedCAL}>
// //         <Index each={Array(6).fill(0)}>
// //           {(_, i) => {
// //             const pd = props.perio?.pocketDepth?.[i];
// //             const rec = props.perio?.recession?.[i];
// //             const cal = calculateCAL(pd, rec);
// //             const calDisplay = cal === null ? '-' : cal;
// //             // Position CAL below lingual / above buccal numbers
// //             const style = getPosStyle(i, i < 3 ? '0px' : '-20px');
// //             return <span style={style} classList={{ 'text-red-600 font-bold': typeof cal === 'number' && cal >= 5, 'text-green-700': typeof cal === 'number' && cal < 5 }}>{calDisplay}</span>;
// //           }}
// //         </Index>
// //       </Show>
// //
// //       {/* Add Furcation, Suppuration visualization here */}
// //     </div>
// //   );
// // };
//
// // const PerioDisplay: Component<{ perio: PeriodontalMeasurements | undefined }> = (props) => {
// //   // Helper to get value or default '-'
// //   const getSiteValue = (arr: (number | boolean | null)[] | undefined, index: number): string | number | boolean => {
// //     const val = arr?.[index];
// //     return val === null || val === undefined ? '-' : val;
// //   };
// //
// //   // Helper for positioning - NEEDS FINE-TUNING WITH CSS
// //   // Returns style object { top, left, right, bottom, transform }
// //   const getPosStyle = (siteIndex: number): JSX.CSSProperties => {
// //     const isBuccal = siteIndex < 3; // MB, B, DB
// //     const isLingual = siteIndex >= 3; // ML, L, DL (mapped from index 5, 4, 3)
// //
// //     const styles: JSX.CSSProperties = { position: 'absolute' };
// //
// //     // Vertical position
// //     if (isBuccal) styles.top = '-10px'; // Above the tooth graphic
// //     if (isLingual) styles.bottom = '-10px'; // Below the tooth graphic
// //
// //     // Horizontal position
// //     const siteWithinRow = isBuccal ? siteIndex : (5 - siteIndex); // 0=Mesial, 1=Mid, 2=Distal
// //     if (siteWithinRow === 0) styles.left = '10%';
// //     else if (siteWithinRow === 1) { styles.left = '50%'; styles.transform = 'translateX(-50%)'; }
// //     else if (siteWithinRow === 2) styles.right = '10%';
// //
// //     return styles;
// //   };
// //
// //   // Style for BOP dots
// //   const getBopPosStyle = (siteIndex: number): JSX.CSSProperties => {
// //     const basePos = getPosStyle(siteIndex);
// //     // Offset BOP dot slightly from the number position
// //     if (siteIndex < 3) basePos.top = '-4px'; // Slightly lower than number
// //     else basePos.bottom = '-4px'; // Slightly higher than number
// //     return basePos;
// //   };
// //
// //   // Style for REC lines (very basic implementation)
// //   const getRecLineStyle = (siteIndex: number, recValue: number): JSX.CSSProperties | null => {
// //     if (recValue <= 0) return null;
// //     const heightPercent = Math.min(50, (recValue / 9) * 50); // Crude %, max 50% height
// //     const styles: JSX.CSSProperties = {
// //       position: 'absolute',
// //       height: '1px',
// //       'background-color': 'orange', // Use a distinct color
// //       'pointer-events': 'none'
// //     };
// //
// //     const siteWithinRow = siteIndex < 3 ? siteIndex : (5 - siteIndex); // 0=M, 1=Mid, 2=D
// //     if (siteWithinRow === 0) { styles.left = '5%'; styles.width = '30%'; }
// //     else if (siteWithinRow === 1) { styles.left = '35%'; styles.width = '30%'; }
// //     else if (siteWithinRow === 2) { styles.left = '65%'; styles.width = '30%'; }
// //
// //     // Apply vertical position based on recession amount (originates from CEJ - approximated by tooth edge)
// //     if (siteIndex < 3) styles.top = `${heightPercent}%`; // Line position down from top edge
// //     else styles.bottom = `${heightPercent}%`; // Line position up from bottom edge
// //
// //     return styles;
// //   };
// //
// //
// //   return (
// //     // Container for all perio elements, prevents interfering with clicks
// //     <div class="absolute inset-0 pointer-events-none z-10 overflow-visible">
// //       {/* Pocket Depths */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const pd = getSiteValue(props.perio?.pocketDepth, i);
// //           return <span style={getPosStyle(i)} class="text-[9px] font-mono text-center text-blue-700">{pd}</span>;
// //         }}
// //       </Index>
// //
// //       {/* BOP Indicators */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const bop = getSiteValue(props.perio?.bleedingOnProbing, i);
// //           return (
// //             <Show when={bop === true}>
// //               <div style={getBopPosStyle(i)} class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
// //             </Show>
// //           );
// //         }}
// //       </Index>
// //
// //       {/* Recession Values & Lines */}
// //       <Index each={Array(6).fill(0)}>
// //         {(_, i) => {
// //           const recRaw = getSiteValue(props.perio?.recession, i);
// //           const rec = typeof recRaw === 'number' ? recRaw : 0;
// //           const lineStyle = getRecLineStyle(i, rec);
// //           return (
// //             <>
// //               {/* Display REC number if > 0 */}
// //               {/* <Show when={rec > 0}>
// //                                 <span style={getRecNumPosStyle(i)} class="text-[8px] font-mono text-orange-600">{rec}</span>
// //                             </Show> */}
// //               {/* Draw Recession Line */}
// //               <Show when={lineStyle}>
// //                 <div style={lineStyle!}></div>
// //               </Show>
// //             </>
// //           );
// //         }}
// //       </Index>
// //
// //       {/* Add Furcation, Suppuration visualization here */}
// //     </div>
// //   );
// // };
