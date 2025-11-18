/**
 * Enhanced Dental Charting Application - Main Route
 * With improved visual design and quick condition toolbar
 */

import { createSignal, onMount, Show } from 'solid-js';
import { Odontogram } from '../components/dental/odontogram';
import { ToothDetailsPanel } from '../components/dental/tooth-details-panel';
import { PerioChart } from '../components/dental/perio-chart';
import { QuickConditionToolbar } from '../components/dental/quick-condition-toolbar';
import type { Tooth, NumberingSystem, ToothSurface, ToothCondition } from '../types/dental-chart';
import {
  patients,
  createPatient,
  getCurrentChart,
  setCurrentPatient,
  updateTooth,
  addToothCondition,
  removeToothCondition,
  updatePerioMeasurement,
  exportPatientData,
  undoLastChange,
  preferences,
  setPreferences,
} from '../lib/dental/chart-store';

import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/dental-chart-enhanced')({
  component: DentalChartEnhanced,
})

export default function DentalChartEnhanced() {
  const [selectedTooth, setSelectedTooth] = createSignal<Tooth | null>(null);
  const [selectedSurfaces, setSelectedSurfaces] = createSignal<ToothSurface[]>([]);
  const [view, setView] = createSignal<'chart' | 'perio' | 'quick'>('chart');
  const [demoInitialized, setDemoInitialized] = createSignal(false);
  const [quickConditionMode, setQuickConditionMode] = createSignal(false);
  const [pendingConditionCreator, setPendingConditionCreator] = createSignal<((surfaces?: ToothSurface[]) => ToothCondition) | null>(null);

  // Initialize demo patient on mount
  onMount(() => {
    if (patients.length === 0 && !demoInitialized()) {
      initializeDemoData();
      setDemoInitialized(true);
    } else if (patients.length > 0) {
      setCurrentPatient(patients[0].id);
    }
  });

  const initializeDemoData = () => {
    const patient = createPatient({
      name: 'Demo Patient',
      dateOfBirth: '1990-01-15',
      age: 34,
      dentitionType: 'permanent',
      medicalHistory: ['No significant medical history'],
      allergies: ['None known'],
    });

    setCurrentPatient(patient.id);

    const chart = getCurrentChart();
    if (chart) {
      // Add some sample conditions
      const tooth3 = chart.teeth.find((t: Tooth) => t.position.universal === 3);
      if (tooth3) {
        addToothCondition(patient.id, tooth3.id, {
          type: 'caries',
          surfaces: ['occlusal'],
          class: 'I',
          severity: 'moderate',
        });
      }

      const tooth14 = chart.teeth.find((t: Tooth) => t.position.universal === 14);
      if (tooth14) {
        addToothCondition(patient.id, tooth14.id, {
          type: 'restoration',
          surfaces: ['mesial', 'occlusal'],
          material: 'composite',
          condition: 'intact',
          dateCompleted: '2024-06-15',
        });
      }

      const tooth19 = chart.teeth.find((t: Tooth) => t.position.universal === 19);
      if (tooth19) {
        addToothCondition(patient.id, tooth19.id, {
          type: 'endo',
          pulpDiagnosis: 'necrotic',
          stage: 'completed',
          numberOfCanals: 3,
        });
      }

      const tooth30 = chart.teeth.find((t: Tooth) => t.position.universal === 30);
      if (tooth30) {
        addToothCondition(patient.id, tooth30.id, {
          type: 'crown',
          crownType: 'full_crown',
          material: 'zirconia',
          condition: 'intact',
          dateCompleted: '2023-11-20',
        });
      }

      const tooth1 = chart.teeth.find((t: Tooth) => t.position.universal === 1);
      if (tooth1) {
        updateTooth(patient.id, tooth1.id, { status: 'missing' });
      }
    }
  };

  const currentChart = () => getCurrentChart();
  const currentPatient = () => patients.find((p: any) => p.id === currentChart()?.patientId);

  const handleToothClick = (tooth: Tooth) => {
    const creator = pendingConditionCreator();

    if (creator && quickConditionMode()) {
      // Apply quick condition
      const chart = currentChart();
      if (chart) {
        const condition = creator(selectedSurfaces());
        addToothCondition(chart.patientId, tooth.id, condition);

        // Refresh
        const updatedTooth = currentChart()?.teeth.find((t: Tooth) => t.id === tooth.id);
        if (updatedTooth) {
          setSelectedTooth(updatedTooth);
        }

        // Reset
        setSelectedSurfaces([]);
        setPendingConditionCreator(null);
        setQuickConditionMode(false);
      }
    } else {
      setSelectedTooth(tooth);
      setSelectedSurfaces([]);
    }
  };

  const handleToothSurfaceClick = (tooth: Tooth, surface: ToothSurface) => {
    setSelectedTooth(tooth);

    // Toggle surface selection
    const surfaces = selectedSurfaces();
    if (surfaces.includes(surface)) {
      setSelectedSurfaces(surfaces.filter(s => s !== surface));
    } else {
      setSelectedSurfaces([...surfaces, surface]);
    }
  };

  const handleUpdateTooth = (toothId: string, updates: Partial<Tooth>) => {
    const chart = currentChart();
    if (chart) {
      updateTooth(chart.patientId, toothId, updates);
      const updatedTooth = currentChart()?.teeth.find((t: Tooth) => t.id === toothId);
      if (updatedTooth) {
        setSelectedTooth(updatedTooth);
      }
    }
  };

  const handleAddCondition = (toothId: string, condition: any) => {
    const chart = currentChart();
    if (chart) {
      addToothCondition(chart.patientId, toothId, condition);
      const updatedTooth = currentChart()?.teeth.find((t: Tooth) => t.id === toothId);
      if (updatedTooth) {
        setSelectedTooth(updatedTooth);
      }
    }
  };

  const handleRemoveCondition = (toothId: string, index: number) => {
    const chart = currentChart();
    if (chart) {
      removeToothCondition(chart.patientId, toothId, index);
      const updatedTooth = currentChart()?.teeth.find((t: Tooth) => t.id === toothId);
      if (updatedTooth) {
        setSelectedTooth(updatedTooth);
      }
    }
  };

  const handleUpdatePerioMeasurement = (measurement: any) => {
    const chart = currentChart();
    if (chart) {
      updatePerioMeasurement(chart.patientId, measurement);
    }
  };

  const handleExportJSON = () => {
    const chart = currentChart();
    if (chart) {
      const data = exportPatientData(chart.patientId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dental-chart-${currentPatient()?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleUndo = () => {
    const chart = currentChart();
    if (chart) {
      const success = undoLastChange(chart.patientId);
      if (success) {
        if (selectedTooth()) {
          const updatedTooth = currentChart()?.teeth.find((t: Tooth) => t.id === selectedTooth()!.id);
          setSelectedTooth(updatedTooth || null);
        }
      }
    }
  };

  const toggleNumberingSystem = () => {
    const current = preferences.numberingSystem;
    const next: NumberingSystem = current === 'universal' ? 'fdi' : current === 'fdi' ? 'palmer' : 'universal';
    setPreferences('numberingSystem', next);
  };

  const handleQuickConditionSelect = (createFn: (surfaces?: ToothSurface[]) => ToothCondition) => {
    setPendingConditionCreator(() => createFn);
    setQuickConditionMode(true);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <div class="bg-white dark:bg-gray-800 border-b-2 border-blue-600 dark:border-blue-400 shadow-lg sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Enhanced Dental Charting
              </h1>
              <Show when={currentPatient()}>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full font-medium">
                    {currentPatient()!.name}
                  </span>
                  <span>DOB: {currentPatient()!.dateOfBirth}</span>
                  <span>Age: {currentPatient()!.age}</span>
                </p>
              </Show>
            </div>

            <div class="flex items-center gap-3">
              {/* View Toggle */}
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
                <button
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  classList={{
                    'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md transform scale-105': view() === 'chart',
                    'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': view() !== 'chart',
                  }}
                  onClick={() => setView('chart')}
                >
                  📊 Chart
                </button>
                <button
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  classList={{
                    'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md transform scale-105': view() === 'perio',
                    'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': view() !== 'perio',
                  }}
                  onClick={() => setView('perio')}
                >
                  📈 Perio
                </button>
                <button
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  classList={{
                    'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md transform scale-105': view() === 'quick',
                    'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': view() !== 'quick',
                  }}
                  onClick={() => setView('quick')}
                >
                  ⚡ Quick Add
                </button>
              </div>

              {/* Numbering System */}
              <button
                onClick={toggleNumberingSystem}
                class="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {preferences.numberingSystem === 'universal' && '🔢 Universal'}
                {preferences.numberingSystem === 'fdi' && '🌍 FDI'}
                {preferences.numberingSystem === 'palmer' && '📐 Palmer'}
              </button>

              {/* Actions */}
              <button
                onClick={handleUndo}
                class="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="Undo last change"
              >
                ↶ Undo
              </button>

              <button
                onClick={handleExportJSON}
                class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                💾 Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick Condition Mode Banner */}
        <Show when={quickConditionMode()}>
          <div class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl animate-pulse">⚡</span>
              <div>
                <p class="font-bold">Quick Add Mode Active</p>
                <p class="text-sm opacity-90">Click a tooth to apply the selected condition</p>
              </div>
            </div>
            <button
              onClick={() => {
                setQuickConditionMode(false);
                setPendingConditionCreator(null);
              }}
              class="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Show>

        <Show when={currentChart()}>
          <Show when={view() === 'chart'}>
            <Odontogram
              teeth={currentChart()!.teeth}
              selectedToothId={selectedTooth()?.id}
              numberingSystem={preferences.numberingSystem}
              showPrimary={currentPatient()?.dentitionType === 'mixed'}
              onToothClick={handleToothClick}
              onToothSurfaceClick={handleToothSurfaceClick}
            />
          </Show>

          <Show when={view() === 'perio'}>
            <PerioChart
              teeth={currentChart()!.teeth}
              measurements={currentChart()!.perioMeasurements}
              onUpdateMeasurement={handleUpdatePerioMeasurement}
            />
          </Show>

          <Show when={view() === 'quick'}>
            <div class="space-y-6">
              <QuickConditionToolbar
                onConditionSelect={handleQuickConditionSelect}
                selectedSurfaces={selectedSurfaces()}
              />
              <Odontogram
                teeth={currentChart()!.teeth}
                selectedToothId={selectedTooth()?.id}
                numberingSystem={preferences.numberingSystem}
                showPrimary={currentPatient()?.dentitionType === 'mixed'}
                onToothClick={handleToothClick}
                onToothSurfaceClick={handleToothSurfaceClick}
              />
            </div>
          </Show>
        </Show>
      </div>

      {/* Side Panel */}
      <ToothDetailsPanel
        tooth={selectedTooth()}
        onClose={() => {
          setSelectedTooth(null);
          setSelectedSurfaces([]);
        }}
        onUpdate={handleUpdateTooth}
        onAddCondition={handleAddCondition}
        onRemoveCondition={handleRemoveCondition}
      />

      {/* Enhanced Info Banner */}
      <div class="fixed bottom-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md">
        <p class="text-sm font-bold mb-2 flex items-center gap-2">
          <span class="text-xl">✨</span>
          Enhanced Dental Charting Demo
        </p>
        <p class="text-xs opacity-95">
          • Click teeth for details<br />
          • Use Quick Add mode for fast input<br />
          • Surface click for specific areas<br />
          • All data saved in localStorage
        </p>
      </div>
    </div>
  );
}
