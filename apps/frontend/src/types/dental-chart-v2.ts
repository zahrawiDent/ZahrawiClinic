/**
 * Enhanced Dental Chart Types V2
 * Includes advanced root canal system, Black's classification validation
 */

import type { 
  ToothSurface, 
  CariesClass, 
  PulpDiagnosis,
  PeriapicalDiagnosis,
  RCTStage
} from './dental-chart';

// ============================================================================
// BLACK'S CLASSIFICATION RULES
// ============================================================================

export interface BlacksClassificationRule {
  class: CariesClass;
  allowedSurfaces: ToothSurface[];
  toothTypes: ('anterior' | 'posterior')[];
  commonCombinations: string[][]; // e.g., ['M', 'O'], ['M', 'O', 'D']
  description: string;
}

export const BLACKS_CLASSIFICATION: Record<CariesClass, BlacksClassificationRule> = {
  'I': {
    class: 'I',
    allowedSurfaces: ['occlusal'],
    toothTypes: ['posterior'],
    commonCombinations: [['occlusal']],
    description: 'Occlusal pits and fissures - Posterior teeth only'
  },
  'II': {
    class: 'II',
    allowedSurfaces: ['mesial', 'occlusal', 'distal'],
    toothTypes: ['posterior'],
    commonCombinations: [
      ['mesial', 'occlusal'],
      ['distal', 'occlusal'],
      ['mesial', 'occlusal', 'distal'],
      ['mesial'],
      ['distal']
    ],
    description: 'Proximal surfaces - Posterior teeth (MO, DO, MOD, M, D)'
  },
  'III': {
    class: 'III',
    allowedSurfaces: ['mesial', 'distal'],
    toothTypes: ['anterior'],
    commonCombinations: [['mesial'], ['distal']],
    description: 'Proximal surfaces - Anterior teeth (not involving incisal edge)'
  },
  'IV': {
    class: 'IV',
    allowedSurfaces: ['mesial', 'distal', 'incisal'],
    toothTypes: ['anterior'],
    commonCombinations: [
      ['mesial', 'incisal'],
      ['distal', 'incisal']
    ],
    description: 'Proximal surfaces - Anterior teeth (involving incisal edge)'
  },
  'V': {
    class: 'V',
    allowedSurfaces: ['buccal', 'lingual'],
    toothTypes: ['anterior', 'posterior'],
    commonCombinations: [['buccal'], ['lingual']],
    description: 'Cervical third - All teeth (gingival third)'
  },
  'VI': {
    class: 'VI',
    allowedSurfaces: ['incisal', 'occlusal'],
    toothTypes: ['anterior', 'posterior'],
    commonCombinations: [['incisal'], ['occlusal']],
    description: 'Incisal edges and cusp tips - Wear facets'
  }
};

// ============================================================================
// ROOT CANAL SYSTEM
// ============================================================================

export type CanalStatus = 
  | 'untreated'
  | 'located'
  | 'instrumented'
  | 'obturated'
  | 'post_space'
  | 'post_placed'
  | 'retreatment_needed';

export interface RootCanal {
  canalName: string; // 'MB', 'DB', 'P', 'MB2', 'ML', 'DL' etc
  status: CanalStatus;
  workingLength?: number; // in mm
  masterApicalFile?: number; // e.g., 25, 30, 35
  obturated?: boolean;
  hasPost?: boolean;
  notes?: string;
}

export interface RootConfiguration {
  toothNumber: string;
  rootCount: number; // 1-4 typical, but can be more
  canals: RootCanal[];
  anatomy: 'single' | 'bifurcated' | 'trifurcated' | 'complex';
  notes?: string;
}

// Typical root configurations by tooth type
export const TYPICAL_ROOT_CONFIGS: Record<string, { roots: number; canals: string[] }> = {
  // Maxillary
  'central_incisor': { roots: 1, canals: ['P'] },
  'lateral_incisor': { roots: 1, canals: ['P'] },
  'canine': { roots: 1, canals: ['P'] },
  'first_premolar': { roots: 2, canals: ['B', 'P'] },
  'second_premolar': { roots: 1, canals: ['P'] },
  'first_molar': { roots: 3, canals: ['MB', 'DB', 'P'] }, // often MB2
  'second_molar': { roots: 3, canals: ['MB', 'DB', 'P'] },
  'third_molar': { roots: 3, canals: ['MB', 'DB', 'P'] },
  // Mandibular
  'mandibular_incisor': { roots: 1, canals: ['P'] },
  'mandibular_canine': { roots: 1, canals: ['P'] },
  'mandibular_premolar': { roots: 1, canals: ['P'] },
  'mandibular_first_molar': { roots: 2, canals: ['ML', 'DL', 'D'] },
  'mandibular_second_molar': { roots: 2, canals: ['M', 'D'] },
  'mandibular_third_molar': { roots: 2, canals: ['M', 'D'] }
};

// ============================================================================
// ENHANCED ENDO CONDITION
// ============================================================================

export interface EnhancedEndoCondition {
  type: 'endo';
  pulpDiagnosis: PulpDiagnosis;
  periapicalDiagnosis?: PeriapicalDiagnosis;
  stage: RCTStage;
  rootConfiguration: RootConfiguration;
  vitalityTest?: {
    cold: 'positive' | 'negative' | 'delayed';
    heat?: 'positive' | 'negative';
    electric?: number;
  };
  hasPostAndCore?: boolean;
  obturationTechnique?: 'lateral_condensation' | 'warm_vertical' | 'thermoplasticized' | 'carrier_based';
  sealerType?: string;
  dateStarted?: string;
  dateCompleted?: string;
  notes?: string;
}

// ============================================================================
// SURFACE SELECTION GRID STATE
// ============================================================================

export interface SurfaceGridState {
  selectedSurfaces: ToothSurface[];
  wholeToothSelected: boolean;
  validationErrors?: string[];
}

// ============================================================================
// CONDITION VISUAL THEMES
// ============================================================================

export interface ConditionVisualTheme {
  primary: string; // Main color
  secondary: string; // Accent/gradient color
  pattern?: 'solid' | 'gradient' | 'striped' | 'metallic' | 'crosshatch';
  icon?: string; // Emoji or symbol
  border?: string;
  textColor?: string;
}

export const CONDITION_THEMES: Record<string, ConditionVisualTheme> = {
  // Operative
  composite: {
    primary: 'rgb(59, 130, 246)', // blue-500
    secondary: 'rgb(96, 165, 250)', // blue-400
    pattern: 'gradient',
    icon: '🔵',
    textColor: 'white'
  },
  amalgam: {
    primary: 'rgb(107, 114, 128)', // gray-500
    secondary: 'rgb(156, 163, 175)', // gray-400
    pattern: 'metallic',
    icon: '⚫',
    textColor: 'white'
  },
  gic: {
    primary: 'rgb(234, 179, 8)', // yellow-500
    secondary: 'rgb(250, 204, 21)', // yellow-400
    pattern: 'solid',
    icon: '🟡',
    textColor: 'black'
  },
  gold: {
    primary: 'rgb(217, 119, 6)', // amber-600
    secondary: 'rgb(245, 158, 11)', // amber-500
    pattern: 'metallic',
    icon: '🟠',
    textColor: 'black'
  },
  porcelain: {
    primary: 'rgb(255, 255, 255)',
    secondary: 'rgb(243, 244, 246)', // gray-100
    pattern: 'gradient',
    icon: '⚪',
    textColor: 'black',
    border: 'rgb(209, 213, 219)' // gray-300
  },
  
  // Crown types
  crown_full: {
    primary: 'rgb(217, 119, 6)', // amber-600
    secondary: 'rgb(245, 158, 11)',
    pattern: 'gradient',
    icon: '👑',
    textColor: 'white'
  },
  crown_zirconia: {
    primary: 'rgb(241, 245, 249)', // slate-100
    secondary: 'rgb(226, 232, 240)', // slate-200
    pattern: 'metallic',
    icon: '💎',
    textColor: 'black',
    border: 'rgb(148, 163, 184)' // slate-400
  },
  
  // Endodontics
  endo: {
    primary: 'rgb(220, 38, 38)', // red-600
    secondary: 'rgb(248, 113, 113)', // red-400
    pattern: 'striped',
    icon: '🔴',
    textColor: 'white'
  },
  endo_completed: {
    primary: 'rgb(185, 28, 28)', // red-700
    secondary: 'rgb(220, 38, 38)', // red-600
    pattern: 'solid',
    icon: '✅',
    textColor: 'white'
  },
  
  // Extraction/Missing
  extraction: {
    primary: 'rgb(0, 0, 0)',
    secondary: 'rgb(55, 65, 81)', // gray-700
    pattern: 'crosshatch',
    icon: '❌',
    textColor: 'white'
  },
  missing: {
    primary: 'transparent',
    secondary: 'transparent',
    pattern: 'crosshatch',
    icon: '⬜',
    textColor: 'rgb(156, 163, 175)',
    border: 'dashed'
  },
  
  // Implant
  implant: {
    primary: 'rgb(71, 85, 105)', // slate-600
    secondary: 'rgb(100, 116, 139)', // slate-500
    pattern: 'metallic',
    icon: '🦷',
    textColor: 'white'
  },
  
  // Caries
  caries: {
    primary: 'rgb(127, 29, 29)', // red-900
    secondary: 'rgb(153, 27, 27)', // red-800
    pattern: 'solid',
    icon: '🟤',
    textColor: 'white'
  }
};
