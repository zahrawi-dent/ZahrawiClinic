// src/constants/conditions.ts
import type { Condition, ConditionId } from '../types/dental.types';

// Define styles for different statuses (can be reused)
const plannedStyle = { surfaceClass: 'outline outline-blue-500 outline-1 outline-offset-[-1px]', toothClass: 'outline outline-blue-500 outline-1' };
const completedStyle = { surfaceClass: 'opacity-80', toothClass: 'opacity-80' /* Add checkmark? */ };

export const conditionsList: Readonly<Condition[]> = [
  // --- Surface Conditions ---
  { id: 'caries', name: 'Caries', color: 'bg-red-500', abbr: 'C', appliesTo: 'surface', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'filling-composite', name: 'Filling (Comp)', color: 'bg-blue-500', abbr: 'Co', appliesTo: 'surface', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'filling-amalgam', name: 'Filling (Amal)', color: 'bg-gray-500', abbr: 'Am', appliesTo: 'surface', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'filling-gic', name: 'Filling (GIC)', color: 'bg-yellow-200', abbr: 'GI', appliesTo: 'surface', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'filling-temp', name: 'Filling (Temp)', color: 'bg-pink-300', abbr: 'Tmp', appliesTo: 'surface', statusStyles: { planned: plannedStyle } }, // Temp fillings usually aren't 'completed'
  { id: 'sealant', name: 'Sealant', color: 'bg-green-300', abbr: 'Se', appliesTo: 'surface', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'sensitivity', name: 'Sensitivity', color: 'bg-indigo-400', abbr: 'S', appliesTo: 'surface' }, // Status may not apply
  { id: 'fractured-cusp', name: 'Fractured Cusp', color: 'bg-yellow-700 border border-dashed border-black', abbr: 'FrC', appliesTo: 'surface' }, // Status may not apply directly

  // --- Whole Tooth Conditions ---
  { id: 'crown-pfm', name: 'Crown (PFM)', color: 'bg-yellow-400', abbr: 'PFM', appliesTo: 'whole', wholeToothStyle: 'border-2 border-yellow-600', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'crown-zirconia', name: 'Crown (Zr)', color: 'bg-stone-300', abbr: 'Zr', appliesTo: 'whole', wholeToothStyle: 'border-2 border-stone-500', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'crown-gold', name: 'Crown (Gold)', color: 'bg-amber-400', abbr: 'Au', appliesTo: 'whole', wholeToothStyle: 'border-2 border-amber-600', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'crown-temp', name: 'Crown (Temp)', color: 'bg-rose-300', abbr: 'TCr', appliesTo: 'whole', wholeToothStyle: 'border-2 border-rose-500', statusStyles: { planned: plannedStyle } },
  { id: 'implant', name: 'Implant', color: 'bg-green-600', abbr: 'I', appliesTo: 'whole', wholeToothStyle: 'border-2 border-green-800', statusStyles: { planned: { toothClass: 'outline outline-green-800 outline-2' }, completed: {} } }, // Implant itself is usually existing/completed
  { id: 'missing', name: 'Missing', color: 'bg-gray-400', abbr: 'M', appliesTo: 'whole', wholeToothStyle: 'opacity-20 pointer-events-none' }, // Status n/a
  { id: 'extraction', name: 'Extraction Needed', color: 'bg-black text-white', abbr: 'X', appliesTo: 'whole', wholeToothStyle: 'border-2 border-red-700', wholeToothIcon: 'M1 1 L9 9 M9 1 L1 9', statusStyles: { planned: {}, completed: {} } }, // Becomes 'missing' when completed
  { id: 'root-canal', name: 'RCT', color: 'bg-orange-500', abbr: 'RC', appliesTo: 'whole', wholeToothStyle: 'border-b-4 border-orange-500', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'fractured-tooth', name: 'Fractured Tooth', color: 'bg-yellow-700', abbr: 'FrT', appliesTo: 'whole', wholeToothStyle: 'border border-dashed border-black', wholeToothIcon: 'M2 8 L5 2 L8 8' },
  { id: 'veneer', name: 'Veneer', color: 'bg-teal-300', abbr: 'V', appliesTo: 'whole', wholeToothStyle: 'border-l-4 border-teal-500', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'impacted', name: 'Impacted', color: 'bg-pink-500', abbr: 'Imp', appliesTo: 'whole', wholeToothStyle: 'rotate-12 opacity-80' },
  { id: 'unerupted', name: 'Unerupted', color: 'bg-sky-200', abbr: 'U', appliesTo: 'whole', wholeToothStyle: 'opacity-60 border border-dashed border-sky-400' },
  { id: 'mobility-1', name: 'Mobility I', color: 'bg-amber-500', abbr: 'Mo1', appliesTo: 'whole' },
  { id: 'mobility-2', name: 'Mobility II', color: 'bg-amber-600', abbr: 'Mo2', appliesTo: 'whole' },
  { id: 'mobility-3', name: 'Mobility III', color: 'bg-amber-700', abbr: 'Mo3', appliesTo: 'whole' },
  { id: 'bridge-pontic', name: 'Bridge Pontic', color: 'bg-purple-400', abbr: 'BP', appliesTo: 'whole', wholeToothStyle: 'opacity-50 border-2 border-purple-600', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'bridge-abutment', name: 'Bridge Abutment', color: 'bg-purple-600', abbr: 'BA', appliesTo: 'whole', wholeToothStyle: 'border-2 border-purple-800', statusStyles: { planned: plannedStyle, completed: completedStyle } },
  { id: 'abscess', name: 'Abscess', color: 'bg-red-700', abbr: 'Abs', appliesTo: 'root', statusStyles: { planned: plannedStyle } }, // Often treated via RCT/Extraction

  // --- Indicators (May not be primary conditions, but useful) ---
  // Note: Actual perio numbers stored separately. These are just flags/indicators if needed.
  // { id: 'periodontal-pocket', name: 'Pocket >3mm', color: 'bg-red-200', abbr: 'Poc', appliesTo: 'root' },
  // { id: 'bleeding-on-probing', name: 'BoP', color: 'bg-red-400', abbr: 'BoP', appliesTo: 'root' }, // Maybe just visual dots
  // { id: 'recession', name: 'Recession', color: 'bg-yellow-300', abbr: 'Rec', appliesTo: 'root' }, // Maybe just visual line

] as const;

export const getConditionById = (id: ConditionId | undefined): Condition | undefined => {
  if (!id) return undefined;
  return conditionsList.find(c => c.id === id);
};

// Helper for mapping deciduous to permanent and vice-versa (FDI Notation)
// Returns null if no corresponding tooth exists
export const getPermanentSuccessorId = (deciduousId: number): number | null => {
  if (deciduousId < 51 || deciduousId > 85) return null;
  const toothNum = deciduousId % 10; // 1 to 5
  if (toothNum > 5) return null; // Deciduous molars don't have premolar successors directly mapped this way
  const quadrant = Math.floor(deciduousId / 10); // 5, 6, 7, 8
  const permanentQuadrant = quadrant - 4; // 1, 2, 3, 4
  return permanentQuadrant * 10 + toothNum;
};

export const getDeciduousPredecessorId = (permanentId: number): number | null => {
  if (permanentId < 11 || permanentId > 48) return null;
  const toothNum = permanentId % 10; // 1 to 8
  if (toothNum > 5) return null; // Premolars/Molars don't have predecessors this way
  const quadrant = Math.floor(permanentId / 10); // 1, 2, 3, 4
  const deciduousQuadrant = quadrant + 4; // 5, 6, 7, 8
  return deciduousQuadrant * 10 + toothNum;
};
