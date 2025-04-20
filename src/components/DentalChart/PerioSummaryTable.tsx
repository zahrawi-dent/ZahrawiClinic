// src/components/DentalChart/PerioSummaryTable.tsx
import { Component, For, Index, Show, Accessor, JSX, createMemo } from 'solid-js';
import type { Tooth, PeriodontalMeasurements } from './types/dental.types';
import { getCal } from './FullPerioChart';

interface PerioSummaryTableProps {
  upperTeeth: Accessor<Readonly<Tooth[]>>; // Sorted list of upper teeth to display
  lowerTeeth: Accessor<Readonly<Tooth[]>>; // Sorted list of lower teeth to display
}

// Helper to calculate CAL for a single site
const calculateCAL = (pd: number | null | undefined, rec: number | null | undefined): number | null => {
  if (pd === null || pd === undefined) return null;
  const recessionValue = (rec === null || rec === undefined) ? 0 : rec;
  return pd + recessionValue;
};

// Helper to get site value for display
const getVal = (arr: (number | boolean | null)[] | undefined, index: number): string | number | JSX.Element => {
  const val = arr?.[index];
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') {
    return val ? <span class="text-red-600 font-bold text-lg leading-none">•</span> : '-'; // Larger BOP dot
  }
  // Style high PD/CAL numbers
  const numVal = Number(val); // Ensure it's a number for comparison
  if (!isNaN(numVal) && numVal >= 5) {
    return <span class="text-red-600 font-semibold">{numVal}</span>;
  }
  return val; // Return original number if not high, or string if it wasn't parsed initially
};

// Reusable Row Component for the table structure
const SummaryRow: Component<{
  label: string;
  teeth: Tooth[]; // Pass the array directly
  siteIndices: number[];
  dataExtractor: (perio: PeriodontalMeasurements | undefined, siteIndex: number) => string | number | JSX.Element;
  rowClass?: string;
}> = (props) => {
  return (
    <tr class={props.rowClass || ''}>
      <td class="border p-1 font-medium text-xs text-gray-600 sticky left-0 bg-gray-50 z-10">{props.label}</td>
      {/* Use For instead of Index if direct array access is fine */}
      <For each={props.teeth}>
        {(tooth) => (
          <Index each={props.siteIndices}>
            {(siteIndex) => (
              <td class="border p-1 text-center font-mono text-xs">
                {props.dataExtractor(tooth.periodontal, siteIndex())}
              </td>
            )}
          </Index>
        )}
      </For>
    </tr>
  );
};


export const PerioSummaryTable: Component<PerioSummaryTableProps> = (props) => {

  const siteIndicesBuccal = [0, 1, 2]; // MB, B, DB
  const siteIndicesLingual = [5, 4, 3]; // ML, L, DL

  // Combine teeth for easier iteration
  // Important: Ensure the order matches the header rendering order
  const allDisplayedTeeth = createMemo(() => [...props.upperTeeth(), ...props.lowerTeeth()]);

  const hasAnyPerioData = createMemo(() =>
    allDisplayedTeeth().some(t => t.periodontal && Object.keys(t.periodontal).length > 0 && t.presence !== 'missing')
  );

  return (
    <div class="mt-6 mb-6">
      <h2 class="text-xl font-semibold mb-3 text-center text-gray-700">Periodontal Summary Chart</h2>
      <Show when={hasAnyPerioData()}
        fallback={<p class="text-center italic text-gray-500 p-4 bg-white rounded shadow border">No periodontal data recorded for the current view.</p>}
      >
        <div class="overflow-x-auto shadow-md rounded-lg border border-gray-200 bg-white relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <table class="w-full border-collapse text-sm min-w-[800px]">
            <thead class="sticky top-0 z-20 bg-gray-100">
              <tr>
                {/* Sticky header cell for Metric Label */}
                <th class="border p-1 font-semibold text-gray-700 text-xs w-[60px] sticky left-0 bg-gray-100 z-10">Tooth #</th>
                {/* Tooth number headers - Render based on combined list order */}
                <For each={allDisplayedTeeth()}>
                  {(tooth) => (
                    <th colspan="3" class={`border p-1 font-semibold text-gray-700 text-center text-xs ${tooth.isDeciduous ? 'text-purple-700' : ''}`}>{tooth.name}</th>
                  )}
                </For>
              </tr>
              <tr>
                <th class="border p-1 font-medium text-xs text-gray-600 sticky left-0 bg-gray-100 z-10">Site</th>
                {/* Site sub-headers (repeat for each tooth) */}
                <For each={allDisplayedTeeth()}>
                  {() => (<>
                    <th class="border p-1 font-medium text-xs text-gray-500 w-[20px]">M</th>
                    <th class="border p-1 font-medium text-xs text-gray-500 w-[20px]">B/L</th>
                    <th class="border p-1 font-medium text-xs text-gray-500 w-[20px]">D</th>
                  </>)}
                </For>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {/* Buccal Rows */}
              <SummaryRow label="PD (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
              <SummaryRow label="REC (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
              <SummaryRow label="BOP (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
              <SummaryRow label="CAL (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
              {/* Lingual Rows */}
              <SummaryRow label="PD (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
              <SummaryRow label="REC (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
              <SummaryRow label="BOP (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
              <SummaryRow label="CAL (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
};

// // src/components/DentalChart/PerioSummaryTable.tsx
// import { Component, For, Index, Show, Accessor, JSX, createMemo } from 'solid-js';
// import type { Tooth, PeriodontalMeasurements } from '../types/dental.types';
//
// interface PerioSummaryTableProps {
//   upperTeeth: Accessor<Readonly<Tooth[]>>; // Sorted list of upper teeth to display
//   lowerTeeth: Accessor<Readonly<Tooth[]>>; // Sorted list of lower teeth to display
// }
//
// // Helper to calculate CAL for a single site
// const calculateCAL = (pd: number | null | undefined, rec: number | null | undefined): number | null => {
//   if (pd === null || pd === undefined) return null;
//   const recessionValue = (rec === null || rec === undefined) ? 0 : rec;
//   return pd + recessionValue;
// };
//
// // Helper to get site value for display
// const getVal = (arr: (number | boolean | null)[] | undefined, index: number): string | number | JSX.Element => {
//   const val = arr?.[index];
//   if (val === null || val === undefined) return '-';
//   if (typeof val === 'boolean') {
//     return val ? <span class="text-red-600 font-bold text-lg leading-none">•</span> : '-'; // Larger BOP dot
//   }
//   // Style high PD/CAL numbers
//   if (typeof val === 'number' && val >= 5) {
//     return <span class="text-red-600 font-semibold">{val}</span>;
//   }
//   return val;
// };
//
// // Reusable Row Component for the table structure
// const SummaryRow: Component<{
//   label: string;
//   teeth: Tooth[];
//   siteIndices: number[]; // e.g., [0, 1, 2] for Buccal, [5, 4, 3] for Lingual
//   dataExtractor: (perio: PeriodontalMeasurements | undefined, siteIndex: number) => string | number | JSX.Element;
//   rowClass?: string;
// }> = (props) => {
//   return (
//     <tr class={props.rowClass || ''}>
//       <td class="border p-1 font-medium text-xs text-gray-600 sticky left-0 bg-gray-50 z-10">{props.label}</td>
//       <Index each={props.teeth}>
//         {(tooth) => (
//           <Index each={props.siteIndices}>
//             {(siteIndex) => (
//               <td class="border p-1 text-center font-mono text-xs">
//                 {props.dataExtractor(tooth().periodontal, siteIndex())}
//               </td>
//             )}
//           </Index>
//         )}
//       </Index>
//     </tr>
//   );
// };
//
//
// export const PerioSummaryTable: Component<PerioSummaryTableProps> = (props) => {
//
//   const siteIndicesBuccal = [0, 1, 2]; // MB, B, DB
//   const siteIndicesLingual = [5, 4, 3]; // ML, L, DL
//
//   // Combine teeth for easier iteration if needed, or handle upper/lower separately
//   const allDisplayedTeeth = createMemo(() => [...props.upperTeeth(), ...props.lowerTeeth()]);
//
//   const hasAnyPerioData = createMemo(() =>
//     allDisplayedTeeth().some(t => t.periodontal && Object.keys(t.periodontal).length > 0)
//   );
//
//   return (
//     <div class="mt-6 mb-6">
//       <h2 class="text-xl font-semibold mb-3 text-center text-gray-700">Periodontal Summary Chart</h2>
//       <Show when={hasAnyPerioData()}
//         fallback={<p class="text-center italic text-gray-500 p-4 bg-white rounded shadow border">No periodontal data recorded for the current view.</p>}
//       >
//         <div class="overflow-x-auto shadow-md rounded-lg border border-gray-200 bg-white relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
//           <table class="w-full border-collapse text-sm min-w-[800px]"> {/* Min width helps */}
//             <thead class="sticky top-0 z-20 bg-gray-100">
//               <tr>
//                 {/* Sticky header cell for Metric Label */}
//                 <th class="border p-1 font-semibold text-gray-700 text-xs w-[60px] sticky left-0 bg-gray-100 z-10">Tooth #</th>
//                 {/* Tooth number headers */}
//                 <Index each={props.upperTeeth()}>
//                   {(tooth) => (
//                     <th colspan="3" class={`border p-1 font-semibold text-gray-700 text-center text-xs ${tooth().isDeciduous ? 'text-purple-700' : ''}`}>{tooth().name}</th>
//                   )}
//                 </Index>
//                 <Index each={props.lowerTeeth()}>
//                   {(tooth) => (
//                     <th colspan="3" class={`border p-1 font-semibold text-gray-700 text-center text-xs ${tooth().isDeciduous ? 'text-purple-700' : ''}`}>{tooth().name}</th>
//                   )}
//                 </Index>
//               </tr>
//               <tr>
//                 <th class="border p-1 font-medium text-xs text-gray-600 sticky left-0 bg-gray-100 z-10">Site</th>
//                 {/* Site sub-headers (repeat for each tooth) */}
//                 <For each={allDisplayedTeeth()}>
//                   {() => (<>
//                     <th class="border p-1 font-medium text-xs text-gray-500 w-[20px]">M</th>
//                     <th class="border p-1 font-medium text-xs text-gray-500 w-[20px]">B/L</th>
//                     <th class="border p-1 font-medium text-xs text-gray-500 w-[20px]">D</th>
//                   </>)}
//                 </For>
//               </tr>
//             </thead>
//             <tbody class="divide-y divide-gray-200">
//               {/* Buccal Rows */}
//               <SummaryRow label="PD (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
//               <SummaryRow label="REC (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
//               <SummaryRow label="BOP (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
//               <SummaryRow label="CAL (B)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesBuccal} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
//               {/* Lingual Rows */}
//               <SummaryRow label="PD (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
//               <SummaryRow label="REC (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
//               <SummaryRow label="BOP (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
//               <SummaryRow label="CAL (L)" teeth={allDisplayedTeeth()} siteIndices={siteIndicesLingual} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
//               {/* Add Mobility/Furcation Rows Here */}
//             </tbody>
//           </table>
//         </div>
//       </Show>
//     </div>
//   );
// };
