/**
 * State management for dental charting application
 * Uses SolidJS stores with localStorage persistence
 */

import { createStore } from 'solid-js/store';
import { createSignal, createEffect } from 'solid-js';
import type {
  Patient,
  DentalChart,
  Tooth,
  ToothCondition,
  PerioMeasurement,
  Procedure,
  NumberingSystem,
  ChartHistory,
  ExportData,
} from '../../types/dental-chart';
import { PERMANENT_TEETH, PRIMARY_TEETH, generateToothId } from './tooth-mapping';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PATIENTS: 'dental_chart_patients',
  CHARTS: 'dental_chart_charts',
  HISTORY: 'dental_chart_history',
  CURRENT_PATIENT: 'dental_chart_current_patient',
  PREFERENCES: 'dental_chart_preferences',
} as const;

// ============================================================================
// PREFERENCES
// ============================================================================

interface UserPreferences {
  numberingSystem: NumberingSystem;
  language: 'en' | 'ar';
  darkMode: boolean;
}

const defaultPreferences: UserPreferences = {
  numberingSystem: 'universal',
  language: 'en',
  darkMode: false,
};

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function savePreferences(prefs: UserPreferences) {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
}

export const [preferences, setPreferences] = createStore<UserPreferences>(loadPreferences());

createEffect(() => {
  savePreferences(preferences);
});

// ============================================================================
// PATIENT STORE
// ============================================================================

function loadPatients(): Patient[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePatients(patients: Patient[]) {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
}

export const [patients, setPatients] = createStore<Patient[]>(loadPatients());

createEffect(() => {
  savePatients(patients);
});

// ============================================================================
// CHART STORE
// ============================================================================

function loadCharts(): DentalChart[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHARTS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCharts(charts: DentalChart[]) {
  localStorage.setItem(STORAGE_KEYS.CHARTS, JSON.stringify(charts));
}

export const [charts, setCharts] = createStore<DentalChart[]>(loadCharts());

createEffect(() => {
  saveCharts(charts);
});

// ============================================================================
// CURRENT PATIENT & CHART
// ============================================================================

const [currentPatientId, setCurrentPatientId] = createSignal<string | null>(
  localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT)
);

createEffect(() => {
  const id = currentPatientId();
  if (id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PATIENT);
  }
});

export function getCurrentPatient(): Patient | null {
  const id = currentPatientId();
  return id ? patients.find(p => p.id === id) ?? null : null;
}

export function getCurrentChart(): DentalChart | null {
  const id = currentPatientId();
  return id ? charts.find(c => c.patientId === id) ?? null : null;
}

export function setCurrentPatient(patientId: string | null) {
  setCurrentPatientId(patientId);
}

// ============================================================================
// HISTORY STORE
// ============================================================================

function loadHistory(): ChartHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChartHistory[]) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export const [history, setHistory] = createStore<ChartHistory[]>(loadHistory());

createEffect(() => {
  saveHistory(history);
});

// ============================================================================
// PATIENT CRUD OPERATIONS
// ============================================================================

export function createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'lastModified'>): Patient {
  const patient: Patient = {
    ...data,
    id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };

  setPatients([...patients, patient]);

  // Create initial chart
  const chart = createInitialChart(patient.id, patient.dentitionType);
  setCharts([...charts, chart]);

  return patient;
}

export function updatePatient(id: string, data: Partial<Patient>) {
  const index = patients.findIndex(p => p.id === id);
  if (index !== -1) {
    setPatients(index, {
      ...patients[index],
      ...data,
      lastModified: new Date().toISOString(),
    });
  }
}

export function deletePatient(id: string) {
  setPatients(patients.filter(p => p.id !== id));
  setCharts(charts.filter(c => c.patientId !== id));
  setHistory(history.filter(h => h.patientId !== id));
  if (currentPatientId() === id) {
    setCurrentPatientId(null);
  }
}

// ============================================================================
// CHART INITIALIZATION
// ============================================================================

function createInitialChart(patientId: string, dentitionType: 'primary' | 'mixed' | 'permanent'): DentalChart {
  const teethPositions = dentitionType === 'primary' 
    ? PRIMARY_TEETH 
    : dentitionType === 'permanent'
    ? PERMANENT_TEETH
    : [...PERMANENT_TEETH, ...PRIMARY_TEETH];

  const teeth: Tooth[] = teethPositions.map(position => ({
    id: generateToothId(position),
    position,
    status: 'healthy',
    eruptionStatus: 'fully_erupted',
    conditions: [],
    lastModified: new Date().toISOString(),
  }));

  return {
    patientId,
    teeth,
    perioMeasurements: [],
    procedures: [],
    preferredNumberingSystem: preferences.numberingSystem,
    chartMode: 'existing',
    version: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
}

// ============================================================================
// CHART OPERATIONS
// ============================================================================

export function updateTooth(patientId: string, toothId: string, updates: Partial<Tooth>) {
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) return;

  const toothIndex = charts[chartIndex].teeth.findIndex(t => t.id === toothId);
  if (toothIndex === -1) return;

  // Save to history before update
  saveChartToHistory(charts[chartIndex], `Updated tooth ${toothId}`);

  setCharts(chartIndex, 'teeth', toothIndex, {
    ...charts[chartIndex].teeth[toothIndex],
    ...updates,
    lastModified: new Date().toISOString(),
  });

  setCharts(chartIndex, {
    lastModified: new Date().toISOString(),
    version: charts[chartIndex].version + 1,
  });
}

export function addToothCondition(patientId: string, toothId: string, condition: ToothCondition) {
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) return;

  const toothIndex = charts[chartIndex].teeth.findIndex(t => t.id === toothId);
  if (toothIndex === -1) return;

  saveChartToHistory(charts[chartIndex], `Added ${condition.type} condition to tooth ${toothId}`);

  const currentConditions = charts[chartIndex].teeth[toothIndex].conditions;
  setCharts(chartIndex, 'teeth', toothIndex, {
    conditions: [...currentConditions, condition],
    lastModified: new Date().toISOString(),
  });

  setCharts(chartIndex, {
    lastModified: new Date().toISOString(),
    version: charts[chartIndex].version + 1,
  });
}

export function removeToothCondition(patientId: string, toothId: string, conditionIndex: number) {
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) return;

  const toothIndex = charts[chartIndex].teeth.findIndex(t => t.id === toothId);
  if (toothIndex === -1) return;

  saveChartToHistory(charts[chartIndex], `Removed condition from tooth ${toothId}`);

  const currentConditions = charts[chartIndex].teeth[toothIndex].conditions;
  setCharts(chartIndex, 'teeth', toothIndex, {
    conditions: currentConditions.filter((_, i) => i !== conditionIndex),
    lastModified: new Date().toISOString(),
  });

  setCharts(chartIndex, {
    lastModified: new Date().toISOString(),
    version: charts[chartIndex].version + 1,
  });
}

export function updatePerioMeasurement(patientId: string, measurement: PerioMeasurement) {
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) return;

  saveChartToHistory(charts[chartIndex], `Updated perio measurements for tooth ${measurement.toothId}`);

  const existingIndex = charts[chartIndex].perioMeasurements.findIndex(
    m => m.toothId === measurement.toothId
  );

  // Auto-calculate CAL (Clinical Attachment Loss)
  const cal: [number, number, number, number, number, number] = [
    measurement.probingDepths[0] + measurement.gingivalRecession[0],
    measurement.probingDepths[1] + measurement.gingivalRecession[1],
    measurement.probingDepths[2] + measurement.gingivalRecession[2],
    measurement.probingDepths[3] + measurement.gingivalRecession[3],
    measurement.probingDepths[4] + measurement.gingivalRecession[4],
    measurement.probingDepths[5] + measurement.gingivalRecession[5],
  ];

  const measurementWithCAL = { ...measurement, cal };

  if (existingIndex !== -1) {
    setCharts(chartIndex, 'perioMeasurements', existingIndex, measurementWithCAL);
  } else {
    const currentMeasurements = charts[chartIndex].perioMeasurements;
    setCharts(chartIndex, 'perioMeasurements', [...currentMeasurements, measurementWithCAL]);
  }

  setCharts(chartIndex, {
    lastModified: new Date().toISOString(),
    version: charts[chartIndex].version + 1,
  });
}

export function addProcedure(patientId: string, procedure: Omit<Procedure, 'id'>): Procedure {
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) throw new Error('Chart not found');

  saveChartToHistory(charts[chartIndex], `Added procedure: ${procedure.name}`);

  const newProcedure: Procedure = {
    ...procedure,
    id: `procedure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  const currentProcedures = charts[chartIndex].procedures;
  setCharts(chartIndex, {
    procedures: [...currentProcedures, newProcedure],
    lastModified: new Date().toISOString(),
    version: charts[chartIndex].version + 1,
  });

  return newProcedure;
}

export function updateProcedure(patientId: string, procedureId: string, updates: Partial<Procedure>) {
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) return;

  const procedureIndex = charts[chartIndex].procedures.findIndex(p => p.id === procedureId);
  if (procedureIndex === -1) return;

  saveChartToHistory(charts[chartIndex], `Updated procedure: ${charts[chartIndex].procedures[procedureIndex].name}`);

  setCharts(chartIndex, 'procedures', procedureIndex, {
    ...charts[chartIndex].procedures[procedureIndex],
    ...updates,
  });

  setCharts(chartIndex, {
    lastModified: new Date().toISOString(),
    version: charts[chartIndex].version + 1,
  });
}

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

function saveChartToHistory(chart: DentalChart, changeDescription: string) {
  const historyEntry: ChartHistory = {
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    chartId: chart.patientId,
    patientId: chart.patientId,
    snapshot: JSON.parse(JSON.stringify(chart)), // Deep clone
    changeDescription,
    timestamp: new Date().toISOString(),
  };

  setHistory([...history, historyEntry]);

  // Keep only last 50 entries per chart
  const chartHistory = history.filter(h => h.chartId === chart.patientId);
  if (chartHistory.length > 50) {
    const toRemove = chartHistory.slice(0, chartHistory.length - 50);
    setHistory(history.filter(h => !toRemove.some(r => r.id === h.id)));
  }
}

export function undoLastChange(patientId: string): boolean {
  const chartHistory = history.filter(h => h.patientId === patientId);
  if (chartHistory.length === 0) return false;

  const lastHistory = chartHistory[chartHistory.length - 1];
  const chartIndex = charts.findIndex(c => c.patientId === patientId);
  if (chartIndex === -1) return false;

  setCharts(chartIndex, lastHistory.snapshot);
  setHistory(history.filter(h => h.id !== lastHistory.id));

  return true;
}

export function getChartHistory(patientId: string): ChartHistory[] {
  return history.filter(h => h.patientId === patientId).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

export function exportAllData(): ExportData {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    patients: JSON.parse(JSON.stringify(patients)),
    charts: JSON.parse(JSON.stringify(charts)),
    history: JSON.parse(JSON.stringify(history)),
  };
}

export function exportPatientData(patientId: string): ExportData {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    patients: patients.filter(p => p.id === patientId),
    charts: charts.filter(c => c.patientId === patientId),
    history: history.filter(h => h.patientId === patientId),
  };
}

export function importData(data: ExportData) {
  try {
    // Merge patients (avoid duplicates)
    const existingPatientIds = new Set(patients.map(p => p.id));
    const newPatients = data.patients.filter(p => !existingPatientIds.has(p.id));
    setPatients([...patients, ...newPatients]);

    // Merge charts
    const existingChartPatientIds = new Set(charts.map(c => c.patientId));
    const newCharts = data.charts.filter(c => !existingChartPatientIds.has(c.patientId));
    setCharts([...charts, ...newCharts]);

    // Merge history
    const existingHistoryIds = new Set(history.map(h => h.id));
    const newHistory = data.history.filter(h => !existingHistoryIds.has(h.id));
    setHistory([...history, ...newHistory]);

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}

export function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    setPatients([]);
    setCharts([]);
    setHistory([]);
    setCurrentPatientId(null);
    localStorage.clear();
  }
}
