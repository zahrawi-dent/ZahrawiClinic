// src/constants/initialData.ts
import type { Tooth } from '../types/dental.types';

// Define initial PERMANENT teeth data
export const initialPermanentTeethData: Tooth[] = [
  // Quadrant 1
  { id: 18, name: '18', quadrant: 1, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // ... (rest of 11-17, 21-28, 31-38, 41-48 - Ensure 'isDeciduous: false') ...
  { id: 17, name: '17', quadrant: 1, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 16, name: '16', quadrant: 1, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 15, name: '15', quadrant: 1, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 14, name: '14', quadrant: 1, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 13, name: '13', quadrant: 1, isDeciduous: false, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 12, name: '12', quadrant: 1, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 11, name: '11', quadrant: 1, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // Quadrant 2
  { id: 21, name: '21', quadrant: 2, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 22, name: '22', quadrant: 2, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 23, name: '23', quadrant: 2, isDeciduous: false, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 24, name: '24', quadrant: 2, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 25, name: '25', quadrant: 2, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 26, name: '26', quadrant: 2, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 27, name: '27', quadrant: 2, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 28, name: '28', quadrant: 2, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // Quadrant 3
  { id: 31, name: '31', quadrant: 3, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 32, name: '32', quadrant: 3, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 33, name: '33', quadrant: 3, isDeciduous: false, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 34, name: '34', quadrant: 3, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 35, name: '35', quadrant: 3, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 36, name: '36', quadrant: 3, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 37, name: '37', quadrant: 3, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 38, name: '38', quadrant: 3, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // Quadrant 4
  { id: 41, name: '41', quadrant: 4, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 42, name: '42', quadrant: 4, isDeciduous: false, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 43, name: '43', quadrant: 4, isDeciduous: false, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 44, name: '44', quadrant: 4, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 45, name: '45', quadrant: 4, isDeciduous: false, type: 'premolar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 46, name: '46', quadrant: 4, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 47, name: '47', quadrant: 4, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 48, name: '48', quadrant: 4, isDeciduous: false, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
];

// Define initial DECIDUOUS teeth data (FDI Notation 51-85)
export const initialDeciduousTeethData: Tooth[] = [
  // Quadrant 5 (Upper Right Deciduous)
  { id: 55, name: '55', quadrant: 5, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 54, name: '54', quadrant: 5, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 53, name: '53', quadrant: 5, isDeciduous: true, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 52, name: '52', quadrant: 5, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 51, name: '51', quadrant: 5, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // Quadrant 6 (Upper Left Deciduous)
  { id: 61, name: '61', quadrant: 6, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 62, name: '62', quadrant: 6, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 63, name: '63', quadrant: 6, isDeciduous: true, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 64, name: '64', quadrant: 6, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 65, name: '65', quadrant: 6, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // Quadrant 7 (Lower Left Deciduous)
  { id: 71, name: '71', quadrant: 7, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 72, name: '72', quadrant: 7, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 73, name: '73', quadrant: 7, isDeciduous: true, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 74, name: '74', quadrant: 7, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 75, name: '75', quadrant: 7, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  // Quadrant 8 (Lower Right Deciduous)
  { id: 81, name: '81', quadrant: 8, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 82, name: '82', quadrant: 8, isDeciduous: true, type: 'incisor', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 83, name: '83', quadrant: 8, isDeciduous: true, type: 'canine', conditions: [], surfaces: { incisal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 84, name: '84', quadrant: 8, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
  { id: 85, name: '85', quadrant: 8, isDeciduous: true, type: 'molar', conditions: [], surfaces: { occlusal: { conditions: [] }, mesial: { conditions: [] }, distal: { conditions: [] }, buccal: { conditions: [] }, lingual: { conditions: [] } } },
];

// Combine all possible teeth for the store (simplifies state management for now)
// A 'mixed' mode display filter would need more logic to select appropriate teeth.
export const initialCombinedTeethData: Tooth[] = [
  ...initialPermanentTeethData,
  ...initialDeciduousTeethData
];
