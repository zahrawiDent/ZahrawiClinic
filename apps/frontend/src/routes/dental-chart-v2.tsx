/**
 * Dental Chart V2 - Advanced Edition
 * Features:
 * - Grid-based tooth surface selection
 * - Black's classification validation
 * - Root canal system with individual canal tracking
 * - Unique visual themes for each condition type
 * - Material-specific styling
 */

import { createSignal, For, Show, createEffect, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import type {
  Tooth,
  ToothSurface,
  ToothCondition,
  CariesClass,
  RestorationMaterial,
  RCTStage
} from '../types/dental-chart';
import type {
  RootConfiguration,
  CanalStatus,
  EnhancedEndoCondition
} from '../types/dental-chart-v2';
import { CONDITION_THEMES } from '../types/dental-chart-v2';
import { ToothGridV2 } from '../components/dental/tooth-grid-v2';
import { RootCanalDisplay, CanalStatusLegend } from '../components/dental/root-canal-display';
import {
  validateSurfaceCombination,
  formatSurfaceCombination,
  getValidationMessage,
  detectBlacksClass
} from '../lib/dental/blacks-classification';

import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/dental-chart-v2')({
  component: DentalChartV2,
})

// Mock teeth data
function createMockTeeth(): Tooth[] {
  const teeth: Tooth[] = [];

  // Upper teeth (1-16)
  for (let i = 1; i <= 16; i++) {
    teeth.push({
      id: `tooth-${i}`,
      position: {
        universal: i,
        fdi: i <= 8 ? 10 + i : 20 + (i - 8),
        arch: 'upper',
        quadrant: i <= 8 ? 1 : 2,
        position: i <= 8 ? i : i - 8,
        type: i <= 2 || i >= 15 ? 'incisor' : i === 3 || i === 14 ? 'canine' : i <= 5 || i >= 12 ? 'premolar' : 'molar',
        isPrimary: false
      },
      status: 'healthy',
      conditions: [],
      lastModified: new Date().toISOString()
    });
  }

  // Lower teeth (17-32)
  for (let i = 17; i <= 32; i++) {
    teeth.push({
      id: `tooth-${i}`,
      position: {
        universal: i,
        fdi: i <= 24 ? 30 + (i - 16) : 40 + (i - 24),
        arch: 'lower',
        quadrant: i <= 24 ? 3 : 4,
        position: i <= 24 ? i - 16 : i - 24,
        type: i >= 24 && i <= 25 || i >= 32 ? 'incisor' : i === 22 || i === 27 ? 'canine' : i >= 20 && i <= 21 || i >= 28 && i <= 29 ? 'premolar' : 'molar',
        isPrimary: false
      },
      status: 'healthy',
      conditions: [],
      lastModified: new Date().toISOString()
    });
  }

  return teeth;
}

function DentalChartV2() {
  const [teeth, setTeeth] = createStore<Tooth[]>(createMockTeeth());
  const [selectedTooth, setSelectedTooth] = createSignal<Tooth | null>(null);
  const [selectedSurfaces, setSelectedSurfaces] = createSignal<ToothSurface[]>([]);
  const [activeTab, setActiveTab] = createSignal<'operative' | 'endo' | 'info'>('operative');

  // Operative form state
  const [conditionType, setConditionType] = createSignal<'caries' | 'restoration' | 'crown'>('caries');
  const [material, setMaterial] = createSignal<RestorationMaterial>('composite');
  const [suggestedClass, setSuggestedClass] = createSignal<CariesClass | undefined>();

  // Endo form state
  const [rootConfig, setRootConfig] = createStore<RootConfiguration>({
    toothNumber: '',
    rootCount: 1,
    canals: [],
    anatomy: 'single'
  });
  const [rctStage, setRctStage] = createSignal<RCTStage>('indicated');

  // Validation
  const validation = createMemo(() => {
    if (!selectedTooth() || selectedSurfaces().length === 0) {
      return null;
    }
    return validateSurfaceCombination(
      selectedSurfaces(),
      selectedTooth()!.position.type,
      suggestedClass()
    );
  });

  // Auto-detect classification
  createEffect(() => {
    if (selectedSurfaces().length > 0 && selectedTooth()) {
      const detected = detectBlacksClass(
        selectedSurfaces(),
        selectedTooth()!.position.type
      );
      if (detected && !suggestedClass()) {
        setSuggestedClass(detected);
      }
    }
  });

  // Handle tooth selection
  const handleToothClick = (tooth: Tooth) => {
    setSelectedTooth(tooth);
    setSelectedSurfaces([]);

    // Initialize root config for endo
    const toothNum = typeof tooth.position.universal === 'number' ? tooth.position.universal : parseInt(tooth.position.universal as string, 10);

    if (tooth.position.type === 'molar') {
      setRootConfig({
        toothNumber: String(tooth.position.universal),
        rootCount: 3,
        canals: [
          { canalName: 'MB', status: 'untreated' },
          { canalName: 'DB', status: 'untreated' },
          { canalName: 'P', status: 'untreated' }
        ],
        anatomy: 'trifurcated'
      });
    } else if (tooth.position.type === 'premolar' && toothNum >= 4 && toothNum <= 5) {
      setRootConfig({
        toothNumber: String(tooth.position.universal),
        rootCount: 2,
        canals: [
          { canalName: 'B', status: 'untreated' },
          { canalName: 'P', status: 'untreated' }
        ],
        anatomy: 'bifurcated'
      });
    } else {
      setRootConfig({
        toothNumber: String(tooth.position.universal),
        rootCount: 1,
        canals: [{ canalName: 'P', status: 'untreated' }],
        anatomy: 'single'
      });
    }
  };

  // Handle surface selection
  const handleSurfaceClick = (surface: ToothSurface) => {
    setSelectedSurfaces(prev =>
      prev.includes(surface)
        ? prev.filter(s => s !== surface)
        : [...prev, surface]
    );
  };

  // Add condition
  const handleAddCondition = () => {
    if (!selectedTooth() || selectedSurfaces().length === 0) return;

    const tooth = selectedTooth()!;
    let newCondition: ToothCondition;

    if (conditionType() === 'caries') {
      newCondition = {
        type: 'caries',
        surfaces: [...selectedSurfaces()],
        class: suggestedClass(),
        severity: 'moderate'
      };
    } else if (conditionType() === 'restoration') {
      newCondition = {
        type: 'restoration',
        surfaces: [...selectedSurfaces()],
        material: material(),
        condition: 'intact',
        dateCompleted: new Date().toISOString().split('T')[0]
      };
    } else {
      newCondition = {
        type: 'crown',
        crownType: 'full_crown',
        material: material(),
        condition: 'intact',
        dateCompleted: new Date().toISOString().split('T')[0]
      };
    }

    setTeeth(
      teeth.findIndex(t => t.id === tooth.id),
      'conditions',
      (conditions) => [...conditions, newCondition]
    );

    // Reset
    setSelectedSurfaces([]);
    setSuggestedClass(undefined);
  };

  // Add endo condition
  const handleAddEndo = () => {
    if (!selectedTooth()) return;

    const tooth = selectedTooth()!;
    const endoCondition: EnhancedEndoCondition = {
      type: 'endo',
      pulpDiagnosis: 'irreversible_pulpitis',
      stage: rctStage(),
      rootConfiguration: { ...rootConfig }
    };

    setTeeth(
      teeth.findIndex(t => t.id === tooth.id),
      'conditions',
      (conditions) => [...conditions, endoCondition as any]
    );
  };

  // Update canal status
  const handleCanalStatusChange = (index: number, status: CanalStatus) => {
    setRootConfig('canals', index, 'status', status);
  };

  const upperTeeth = () => teeth.filter(t => t.position.arch === 'upper');
  const lowerTeeth = () => teeth.filter(t => t.position.arch === 'lower');

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div class="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dental Chart V2 - Professional Edition
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Advanced charting with Black's classification, root canal mapping, and material-specific visualization
          </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div class="xl:col-span-2 space-y-6">
            {/* Upper Arch */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Upper Arch (Maxillary)
              </h2>
              <div class="flex flex-wrap gap-4 justify-center">
                <For each={upperTeeth()}>
                  {(tooth) => (
                    <div
                      class="cursor-pointer transition-transform hover:scale-105"
                      classList={{
                        'ring-4 ring-blue-500 rounded-lg': selectedTooth()?.id === tooth.id
                      }}
                      onClick={() => handleToothClick(tooth)}
                    >
                      <ToothGridV2
                        tooth={tooth}
                        selectedSurfaces={selectedTooth()?.id === tooth.id ? selectedSurfaces() : []}
                        onSurfaceClick={handleSurfaceClick}
                        size={100}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Lower Arch */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Lower Arch (Mandibular)
              </h2>
              <div class="flex flex-wrap gap-4 justify-center">
                <For each={lowerTeeth()}>
                  {(tooth) => (
                    <div
                      class="cursor-pointer transition-transform hover:scale-105"
                      classList={{
                        'ring-4 ring-blue-500 rounded-lg': selectedTooth()?.id === tooth.id
                      }}
                      onClick={() => handleToothClick(tooth)}
                    >
                      <ToothGridV2
                        tooth={tooth}
                        selectedSurfaces={selectedTooth()?.id === tooth.id ? selectedSurfaces() : []}
                        onSurfaceClick={handleSurfaceClick}
                        size={100}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Material Legend */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Material & Condition Legend
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <For each={Object.entries(CONDITION_THEMES)}>
                  {([key, theme]) => (
                    <div class="flex items-center gap-2 text-sm">
                      <div
                        class="w-8 h-8 rounded flex items-center justify-center text-lg shadow-sm"
                        style={{
                          background: theme.pattern === 'gradient'
                            ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                            : theme.primary,
                          border: theme.border ? `2px solid ${theme.border}` : 'none'
                        }}
                      >
                        {theme.icon}
                      </div>
                      <span class="text-gray-700 dark:text-gray-300 font-medium">
                        {key.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div class="space-y-6">
            <Show when={selectedTooth()}>
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
                  Tooth #{selectedTooth()!.position.universal}
                </h2>

                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>FDI:</strong> {selectedTooth()!.position.fdi}</p>
                  <p><strong>Type:</strong> {selectedTooth()!.position.type}</p>
                  <p><strong>Arch:</strong> {selectedTooth()!.position.arch}</p>
                </div>

                {/* Tabs */}
                <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    class="px-4 py-2 font-medium transition-colors"
                    classList={{
                      'border-b-2 border-blue-600 text-blue-600': activeTab() === 'operative',
                      'text-gray-500 hover:text-gray-700': activeTab() !== 'operative'
                    }}
                    onClick={() => setActiveTab('operative')}
                  >
                    Operative
                  </button>
                  <button
                    class="px-4 py-2 font-medium transition-colors"
                    classList={{
                      'border-b-2 border-blue-600 text-blue-600': activeTab() === 'endo',
                      'text-gray-500 hover:text-gray-700': activeTab() !== 'endo'
                    }}
                    onClick={() => setActiveTab('endo')}
                  >
                    Endodontics
                  </button>
                  <button
                    class="px-4 py-2 font-medium transition-colors"
                    classList={{
                      'border-b-2 border-blue-600 text-blue-600': activeTab() === 'info',
                      'text-gray-500 hover:text-gray-700': activeTab() !== 'info'
                    }}
                    onClick={() => setActiveTab('info')}
                  >
                    Info
                  </button>
                </div>

                {/* Operative Tab */}
                <Show when={activeTab() === 'operative'}>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Surfaces: {formatSurfaceCombination(selectedSurfaces())}
                      </label>
                      <Show when={validation()}>
                        <div
                          class="text-xs p-2 rounded"
                          classList={{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': validation()!.isValid,
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': !validation()!.isValid
                          }}
                        >
                          {getValidationMessage(validation()!)}
                        </div>
                      </Show>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Condition Type
                      </label>
                      <select
                        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={conditionType()}
                        onChange={(e) => setConditionType(e.currentTarget.value as any)}
                      >
                        <option value="caries">Caries</option>
                        <option value="restoration">Restoration</option>
                        <option value="crown">Crown</option>
                      </select>
                    </div>

                    <Show when={conditionType() !== 'caries'}>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Material
                        </label>
                        <select
                          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={material()}
                          onChange={(e) => setMaterial(e.currentTarget.value as any)}
                        >
                          <option value="composite">Composite</option>
                          <option value="amalgam">Amalgam</option>
                          <option value="gic">GIC</option>
                          <option value="gold">Gold</option>
                          <option value="porcelain">Porcelain</option>
                          <option value="zirconia">Zirconia</option>
                        </select>
                      </div>
                    </Show>

                    <Show when={conditionType() === 'caries'}>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Black's Class
                        </label>
                        <select
                          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={suggestedClass() || ''}
                          onChange={(e) => setSuggestedClass(e.currentTarget.value as CariesClass)}
                        >
                          <option value="">Auto-detect</option>
                          <option value="I">Class I - Occlusal</option>
                          <option value="II">Class II - Proximal (Posterior)</option>
                          <option value="III">Class III - Proximal (Anterior, no incisal)</option>
                          <option value="IV">Class IV - Proximal (Anterior, with incisal)</option>
                          <option value="V">Class V - Cervical</option>
                          <option value="VI">Class VI - Incisal/Cusp</option>
                        </select>
                      </div>
                    </Show>

                    <button
                      class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAddCondition}
                      disabled={selectedSurfaces().length === 0 || (validation() ? !validation()!.isValid : false)}
                    >
                      Add Condition
                    </button>
                  </div>
                </Show>

                {/* Endo Tab */}
                <Show when={activeTab() === 'endo'}>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        RCT Stage
                      </label>
                      <select
                        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={rctStage()}
                        onChange={(e) => setRctStage(e.currentTarget.value as RCTStage)}
                      >
                        <option value="indicated">Indicated</option>
                        <option value="access">Access</option>
                        <option value="instrumentation">Instrumentation</option>
                        <option value="obturation">Obturation</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Root Configuration
                      </label>
                      <RootCanalDisplay
                        rootConfig={rootConfig}
                        size={200}
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Canal Status
                      </label>
                      <div class="space-y-2">
                        <For each={rootConfig.canals}>
                          {(canal, index) => (
                            <div class="flex items-center gap-2">
                              <span class="w-12 text-sm font-bold text-gray-700 dark:text-gray-300">
                                {canal.canalName}
                              </span>
                              <select
                                class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                value={canal.status}
                                onChange={(e) => handleCanalStatusChange(index(), e.currentTarget.value as CanalStatus)}
                              >
                                <option value="untreated">Untreated</option>
                                <option value="located">Located</option>
                                <option value="instrumented">Instrumented</option>
                                <option value="obturated">Obturated</option>
                                <option value="post_space">Post Space</option>
                                <option value="post_placed">Post Placed</option>
                                <option value="retreatment_needed">Retreatment</option>
                              </select>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>

                    <button
                      class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                      onClick={handleAddEndo}
                    >
                      Add Endo Treatment
                    </button>
                  </div>
                </Show>

                {/* Info Tab */}
                <Show when={activeTab() === 'info'}>
                  <div class="space-y-3">
                    <h3 class="font-bold text-gray-700 dark:text-gray-300">
                      Existing Conditions ({selectedTooth()!.conditions.length})
                    </h3>
                    <Show when={selectedTooth()!.conditions.length === 0}>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        No conditions recorded for this tooth.
                      </p>
                    </Show>
                    <For each={selectedTooth()!.conditions}>
                      {(condition) => (
                        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-lg">{CONDITION_THEMES[condition.type]?.icon || '📋'}</span>
                            <span class="font-bold text-gray-700 dark:text-gray-300">
                              {condition.type.toUpperCase()}
                            </span>
                          </div>
                          <Show when={'surfaces' in condition}>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              Surfaces: {formatSurfaceCombination((condition as any).surfaces)}
                            </p>
                          </Show>
                          <Show when={'material' in condition}>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              Material: {(condition as any).material}
                            </p>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Canal Legend */}
              <Show when={activeTab() === 'endo'}>
                <CanalStatusLegend />
              </Show>
            </Show>

            <Show when={!selectedTooth()}>
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p class="text-gray-500 dark:text-gray-400 text-center">
                  Click on a tooth to begin charting
                </p>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalChartV2;
