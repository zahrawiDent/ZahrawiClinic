/**
 * Dental Charting Application - Main Route
 * Isolated demonstration of comprehensive dental charting system
 */

import { createSignal, onMount, Show } from 'solid-js';
import { Odontogram } from '../components/dental/odontogram';
import { ToothDetailsPanel } from '../components/dental/tooth-details-panel';
import { PerioChart } from '../components/dental/perio-chart';
import type { Tooth, NumberingSystem, ToothSurface } from '../types/dental-chart';
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

export const Route = createFileRoute('/dental-chart')({
  component: DentalChart,
})

function DentalChart() {
  const [selectedTooth, setSelectedTooth] = createSignal<Tooth | null>(null);
  const [view, setView] = createSignal<'chart' | 'perio'>('chart');
  const [demoInitialized, setDemoInitialized] = createSignal(false);

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
    // Create demo patient
    const patient = createPatient({
      name: 'Demo Patient',
      dateOfBirth: '1990-01-15',
      age: 34,
      dentitionType: 'permanent',
      medicalHistory: ['No significant medical history'],
      allergies: ['None known'],
    });

    setCurrentPatient(patient.id);

    // Add some sample conditions
    const chart = getCurrentChart();
    if (chart) {
      // Add caries to tooth #3
      const tooth3 = chart.teeth.find((t: Tooth) => t.position.universal === 3);
      if (tooth3) {
        addToothCondition(patient.id, tooth3.id, {
          type: 'caries',
          surfaces: ['occlusal'],
          class: 'I',
          severity: 'moderate',
        });
      }

      // Add restoration to tooth #14
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

      // Add RCT to tooth #19
      const tooth19 = chart.teeth.find((t: Tooth) => t.position.universal === 19);
      if (tooth19) {
        addToothCondition(patient.id, tooth19.id, {
          type: 'endo',
          pulpDiagnosis: 'necrotic',
          stage: 'completed',
          numberOfCanals: 3,
        });
      }

      // Add crown to tooth #30
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

      // Mark tooth #1 as missing
      const tooth1 = chart.teeth.find((t: Tooth) => t.position.universal === 1);
      if (tooth1) {
        updateTooth(patient.id, tooth1.id, { status: 'missing' });
      }
    }
  };

  const currentChart = () => getCurrentChart();
  const currentPatient = () => patients.find((p: any) => p.id === currentChart()?.patientId);

  const handleToothClick = (tooth: Tooth) => {
    setSelectedTooth(tooth);
  };

  const handleToothSurfaceClick = (tooth: Tooth, surface: ToothSurface) => {
    console.log(`Clicked ${surface} surface of tooth ${tooth.position.universal}`);
    setSelectedTooth(tooth);
  };

  const handleUpdateTooth = (toothId: string, updates: Partial<Tooth>) => {
    const chart = currentChart();
    if (chart) {
      updateTooth(chart.patientId, toothId, updates);
      // Refresh selected tooth
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
      // Refresh selected tooth
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
      // Refresh selected tooth
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
        // Refresh selected tooth if it exists
        if (selectedTooth()) {
          const updatedTooth = currentChart()?.teeth.find(t => t.id === selectedTooth()!.id);
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

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Dental Charting System
              </h1>
              <Show when={currentPatient()}>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Patient: {currentPatient()!.name} | DOB: {currentPatient()!.dateOfBirth} | Age: {currentPatient()!.age}
                </p>
              </Show>
            </div>

            <div class="flex items-center gap-3">
              {/* View Toggle */}
              <div class="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  classList={{
                    'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow': view() === 'chart',
                    'text-gray-600 dark:text-gray-400': view() !== 'chart',
                  }}
                  onClick={() => setView('chart')}
                >
                  Chart
                </button>
                <button
                  class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  classList={{
                    'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow': view() === 'perio',
                    'text-gray-600 dark:text-gray-400': view() !== 'perio',
                  }}
                  onClick={() => setView('perio')}
                >
                  Perio Chart
                </button>
              </div>

              {/* Numbering System Toggle */}
              <button
                onClick={toggleNumberingSystem}
                class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {preferences.numberingSystem === 'universal' && 'Universal'}
                {preferences.numberingSystem === 'fdi' && 'FDI'}
                {preferences.numberingSystem === 'palmer' && 'Palmer'}
              </button>

              {/* Actions */}
              <button
                onClick={handleUndo}
                class="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                title="Undo last change"
              >
                ↶ Undo
              </button>

              <button
                onClick={handleExportJSON}
                class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </Show>
      </div>

      {/* Side Panel */}
      <ToothDetailsPanel
        tooth={selectedTooth()}
        onClose={() => setSelectedTooth(null)}
        onUpdate={handleUpdateTooth}
        onAddCondition={handleAddCondition}
        onRemoveCondition={handleRemoveCondition}
      />

      {/* Info Banner */}
      <div class="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
        <p class="text-sm font-medium mb-1">Dental Charting Demo</p>
        <p class="text-xs opacity-90">
          Click on any tooth to view/edit details. All data is stored in localStorage.
          Toggle between chart and perio views using the buttons above.
        </p>
      </div>
    </div>
  );
};
