/**
 * Core type definitions for the Dental Charting Application
 * Supports all dentition stages, specialties, and charting requirements
 */

// ============================================================================
// NUMBERING SYSTEMS
// ============================================================================

export type NumberingSystem = 'universal' | 'fdi' | 'palmer';

export type DentitionType = 'primary' | 'mixed' | 'permanent';

// Universal: 1-32 (permanent), A-T (primary)
export type UniversalNumber = number | string;

// FDI: 11-48 (permanent), 51-85 (primary)
export type FDINumber = number;

// ============================================================================
// TOOTH ANATOMY
// ============================================================================

export type ToothSurface = 'mesial' | 'occlusal' | 'distal' | 'buccal' | 'lingual' | 'incisal';
export const TOOTH_SURFACES: ToothSurface[] = ['mesial', 'occlusal', 'distal', 'buccal', 'lingual'];

export type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar';
export type ToothArch = 'upper' | 'lower';
export type ToothQuadrant = 1 | 2 | 3 | 4; // FDI quadrants

export interface ToothPosition {
  universal: UniversalNumber;
  fdi: FDINumber;
  arch: ToothArch;
  quadrant: ToothQuadrant;
  position: number; // 1-8 within quadrant
  type: ToothType;
  isPrimary: boolean;
}

// ============================================================================
// TOOTH STATUS
// ============================================================================

export type ToothStatus = 
  | 'healthy'
  | 'missing'
  | 'extracted'
  | 'unerupted'
  | 'erupting'
  | 'impacted'
  | 'supernumerary'
  | 'retained_primary'
  | 'congenitally_missing';

export type EruptionStatus = 'unerupted' | 'erupting' | 'fully_erupted';

// ============================================================================
// OPERATIVE DENTISTRY
// ============================================================================

export type CariesClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type ICDASCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type RestorationMaterial = 
  | 'composite'
  | 'amalgam'
  | 'gic'
  | 'rmgic'
  | 'porcelain'
  | 'gold'
  | 'zirconia'
  | 'emax'
  | 'pfm'
  | 'temporary';

export type RestorationStatus = 'intact' | 'defective' | 'fractured' | 'debonded' | 'stained';

export type CrownType = 'full_crown' | 'partial_crown' | 'onlay' | 'inlay' | '3quarter_crown';

export interface CariesCondition {
  type: 'caries';
  surfaces: ToothSurface[];
  class?: CariesClass;
  icdas?: ICDASCode;
  severity: 'early' | 'moderate' | 'advanced';
  notes?: string;
}

export interface RestorationCondition {
  type: 'restoration';
  surfaces: ToothSurface[];
  material: RestorationMaterial;
  condition: RestorationStatus;
  dateCompleted?: string;
  notes?: string;
}

export interface CrownCondition {
  type: 'crown';
  crownType: CrownType;
  material: RestorationMaterial;
  condition: RestorationStatus;
  dateCompleted?: string;
  notes?: string;
}

export interface FractureCondition {
  type: 'fracture';
  surfaces: ToothSurface[];
  severity: 'enamel' | 'dentin' | 'pulp_exposure';
  traumatic: boolean;
  notes?: string;
}

// ============================================================================
// ENDODONTICS
// ============================================================================

export type PulpDiagnosis = 
  | 'normal'
  | 'reversible_pulpitis'
  | 'irreversible_pulpitis'
  | 'necrotic'
  | 'previously_treated';

export type PeriapicalDiagnosis = 
  | 'normal'
  | 'symptomatic_apical_periodontitis'
  | 'asymptomatic_apical_periodontitis'
  | 'acute_apical_abscess'
  | 'chronic_apical_abscess';

export type RCTStage = 'indicated' | 'access' | 'instrumentation' | 'obturation' | 'completed';

export interface EndoCondition {
  type: 'endo';
  pulpDiagnosis: PulpDiagnosis;
  periapicalDiagnosis?: PeriapicalDiagnosis;
  stage: RCTStage;
  numberOfCanals?: number;
  workingLength?: Record<string, number>; // canal -> length
  vitalityTest?: {
    cold: 'positive' | 'negative' | 'delayed';
    heat?: 'positive' | 'negative';
    electric?: number;
  };
  hasPostAndCore?: boolean;
  notes?: string;
}

// ============================================================================
// PERIODONTICS
// ============================================================================

export type MobilityGrade = 0 | 1 | 2 | 3;
export type FurcationGrade = 0 | 1 | 2 | 3;

export interface PerioMeasurement {
  toothId: string;
  // 6 sites: MB, B, DB, ML, L, DL (Mesio-Buccal, Buccal, Disto-Buccal, Mesio-Lingual, Lingual, Disto-Lingual)
  probingDepths: [number, number, number, number, number, number];
  gingivalRecession: [number, number, number, number, number, number];
  bleeding: [boolean, boolean, boolean, boolean, boolean, boolean];
  suppuration: [boolean, boolean, boolean, boolean, boolean, boolean];
  // Auto-calculated: CAL = PD + Recession
  cal?: [number, number, number, number, number, number];
  mobility: MobilityGrade;
  furcation?: FurcationGrade;
  plaqueScore?: number; // 0-100%
  notes?: string;
}

export interface PerioCondition {
  type: 'perio';
  diagnosis: 'healthy' | 'gingivitis' | 'periodontitis_slight' | 'periodontitis_moderate' | 'periodontitis_severe';
  mobility: MobilityGrade;
  furcation?: FurcationGrade;
  boneLoss?: number; // percentage
  notes?: string;
}

// ============================================================================
// IMPLANTOLOGY
// ============================================================================

export type ImplantStatus = 
  | 'planned'
  | 'placed'
  | 'healing'
  | 'restored'
  | 'failed'
  | 'removed';

export type ImplantComponent = 
  | 'fixture'
  | 'healing_abutment'
  | 'temporary_crown'
  | 'final_crown';

export interface ImplantCondition {
  type: 'implant';
  status: ImplantStatus;
  manufacturer?: string;
  system?: string;
  diameter?: number; // mm
  length?: number; // mm
  insertionTorque?: number; // Ncm
  component: ImplantComponent;
  boneLevel?: number; // mm from implant shoulder
  notes?: string;
}

// ============================================================================
// ORAL SURGERY
// ============================================================================

export type ExtractionType = 'simple' | 'surgical' | 'sectional';

export type ImpactionClass = 
  | 'class_1'
  | 'class_2'
  | 'class_3'; // Pell & Gregory

export type ImpactionAngulation = 
  | 'vertical'
  | 'mesioangular'
  | 'horizontal'
  | 'distoangular';

export interface ExtractionCondition {
  type: 'extraction';
  status: 'planned' | 'completed';
  extractionType: ExtractionType;
  reason?: string;
  dateCompleted?: string;
  notes?: string;
}

export interface ImpactionCondition {
  type: 'impaction';
  classification: ImpactionClass;
  angulation: ImpactionAngulation;
  extractionPlanned: boolean;
  notes?: string;
}

export interface SurgeryCondition {
  type: 'surgery';
  procedure: 'bone_graft' | 'sinus_lift' | 'cyst_removal' | 'apicoectomy' | 'other';
  status: 'planned' | 'completed';
  dateCompleted?: string;
  notes?: string;
}

// ============================================================================
// UNION TYPE FOR ALL CONDITIONS
// ============================================================================

export type ToothCondition =
  | CariesCondition
  | RestorationCondition
  | CrownCondition
  | FractureCondition
  | EndoCondition
  | PerioCondition
  | ImplantCondition
  | ExtractionCondition
  | ImpactionCondition
  | SurgeryCondition;

// ============================================================================
// TOOTH MODEL
// ============================================================================

export interface Tooth {
  id: string; // unique identifier
  position: ToothPosition;
  status: ToothStatus;
  eruptionStatus?: EruptionStatus;
  conditions: ToothCondition[];
  notes?: string;
  photos?: string[]; // URLs or base64
  lastModified: string; // ISO date
}

// ============================================================================
// PROCEDURE & TREATMENT PLANNING
// ============================================================================

export type ProcedureStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ProcedureCategory = 'operative' | 'endo' | 'perio' | 'surgery' | 'prosth' | 'implant' | 'ortho';

export interface Procedure {
  id: string;
  toothIds: string[];
  category: ProcedureCategory;
  name: string;
  description?: string;
  status: ProcedureStatus;
  estimatedCost?: number;
  completedCost?: number;
  dateScheduled?: string;
  dateCompleted?: string;
  operator?: string;
  notes?: string;
}

// ============================================================================
// PATIENT MODEL
// ============================================================================

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  age?: number;
  dentitionType: DentitionType;
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  createdAt: string;
  lastModified: string;
}

// ============================================================================
// CHART STATE
// ============================================================================

export interface DentalChart {
  patientId: string;
  teeth: Tooth[];
  perioMeasurements: PerioMeasurement[];
  procedures: Procedure[];
  preferredNumberingSystem: NumberingSystem;
  chartMode: 'existing' | 'treatment_plan';
  version: number;
  createdAt: string;
  lastModified: string;
}

// ============================================================================
// HISTORY & VERSIONING
// ============================================================================

export interface ChartHistory {
  id: string;
  chartId: string;
  patientId: string;
  snapshot: DentalChart;
  changeDescription: string;
  changedBy?: string;
  timestamp: string;
}

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

export interface ExportData {
  version: string;
  exportDate: string;
  patients: Patient[];
  charts: DentalChart[];
  history: ChartHistory[];
}
