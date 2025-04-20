// src/types/dental.types.ts

import { Patient } from "src/types/dental";

// Status for conditions/treatments
export type TreatmentStatus = 'existing' | 'planned' | 'completed' | 'referred';


// More specific Condition IDs (optional but helpful)
export type ConditionId =
  | 'caries' | 'filling-amalgam' | 'filling-composite' | 'filling-gic' | 'filling-temp'
  | 'sealant' | 'sensitivity'
  | 'crown-pfm' | 'crown-zirconia' | 'crown-gold' | 'crown-temp'
  | 'implant' | 'missing' | 'extraction' | 'root-canal'
  | 'fractured-tooth' | 'fractured-cusp' // Added fractured cusp
  | 'veneer' | 'impacted' | 'mobility-1' | 'mobility-2' | 'mobility-3' // Specify mobility grade
  | 'bridge-pontic' | 'bridge-abutment'
  | 'periodontal-pocket' // Representing general issue, specific depths stored elsewhere
  | 'bleeding-on-probing' // BoP indicator
  | 'recession' // Recession indicator
  | 'abscess' | 'unerupted'; // Added more common conditions
// Add any other custom condition IDs here

export interface ConditionDetails {
  material?: string; // e.g., 'Composite A2', 'Zirconia', 'Amalgam'
  shade?: string; // e.g., 'A2', 'B1'
  procedureCode?: string; // e.g., 'D2330', 'D2740'
  canalsFilled?: number | string; // Can be number or description like 'MBT, DB, P'
  fillMaterial?: string; // e.g., 'Gutta Percha', 'Bioceramic Sealer'
  apexStatus?: 'sealed' | 'open' | 'lesion' | 'resorption';
  // --- Bridge Linking ---
  linkedToothIds?: number[]; // Array of other tooth IDs in the same bridge
  bridgeId?: string | number; // Optional unique ID for the bridge unit
  // Add other relevant details
  // Add other relevant details
}

export interface SurfaceCondition {
  id: number;
  text: string;
  type: ConditionId;
  color: string;     // Base color from Condition definition
  timestamp: string;
  status: TreatmentStatus; // REQUIRED: Track treatment status
  details?: ConditionDetails; // Optional structured details
}

// Define Perio measurements structure
export interface PeriodontalMeasurements {
  // Store 6 sites per tooth: MB, B, DB, ML, L, DL
  // Use null for unrecorded sites
  pocketDepth?: (number | null)[]; // e.g., [3, 2, 3, null, 2, 3] length 6
  bleedingOnProbing?: (boolean | null)[]; // BoP - true if bleeding
  recession?: (number | null)[];
  // Future additions:
  // furcation?: (string | null)[]; // e.g., 'I', 'II', 'III'
  // mobility?: 0 | 1 | 2 | 3 | null; // Single value per tooth often sufficient
  // suppuration?: (boolean | null)[]; // Pus
  // plaque?: (boolean | null)[]; // Presence/absence per site
}

export interface Tooth {
  id: number;
  name: string;
  quadrant: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // Include deciduous quadrants 5-8
  isDeciduous: boolean; // Flag for deciduous teeth
  type: 'molar' | 'premolar' | 'canine' | 'incisor';
  presence?: ToothPresence; // Added: Explicit presence state (overrides default)
  conditions: SurfaceCondition[];
  surfaces: {
    occlusal?: Surface;
    incisal?: Surface;
    mesial: Surface;
    distal: Surface;
    buccal: Surface;
    lingual: Surface;
    // Optional 'root' surface for conditions like abscess
    root?: Surface;
  };
  periodontal?: PeriodontalMeasurements; // Add periodontal data
}

// --- Other interfaces (Surface, Condition, HistoryEntry, PatientInfo, SurfaceName) remain largely the same ---
// Update Condition interface slightly
export interface Condition {
  id: ConditionId;
  name: string;
  color: string;
  abbr: string;
  appliesTo: 'surface' | 'whole' | 'root' | 'both'; // Added 'root' possibility
  wholeToothStyle?: string;
  wholeToothIcon?: string;
  // Optional hints for styling based on status
  statusStyles?: {
    planned?: { // Styles applied *in addition* to base style
      surfaceClass?: string; // e.g., 'outline outline-blue-500 outline-1'
      toothClass?: string;
      icon?: string; // e.g., SVG path for a specific 'planned' icon
    };
    completed?: {
      surfaceClass?: string; // e.g., 'opacity-75' or specific color adjustments
      toothClass?: string;
      icon?: string; // e.g., checkmark SVG path
    };
    // 'existing' uses the base styles
  }
}

export interface Surface {
  conditions: SurfaceCondition[];
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  text: string;
}

export interface PatientInfo {
  name: string;
  id: string;
  dob: string;
  lastVisit: string;
  nextAppointment: string;
}

export type SurfaceName = keyof Tooth['surfaces'];

// Type for view filters
export type ChartViewFilter = 'all' | 'existing' | 'planned' | 'completed';

export type DentitionMode = 'permanent' | 'deciduous' | 'mixed';

export type ToothPresence = 'present' | 'missing' | 'unerupted';

// Define the structure for saved state
export interface SavedChartState {
  version: number;
  patientInfo: Patient;
  teeth: Tooth[];
  history: HistoryEntry[];
  dentitionMode: DentitionMode;
  viewFilter: ChartViewFilter;
  showPerioVisuals?: boolean; // Save view state
  showPerioSummary?: boolean; // Save view state
}
