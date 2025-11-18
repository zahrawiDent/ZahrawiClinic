/**
 * Tooth Details Side Panel
 * Comprehensive editor for all dental conditions and procedures
 */

import { type Component, createSignal, Show, For, Match, Switch } from 'solid-js';
import type { 
  Tooth, 
  ToothCondition, 
  ToothStatus,
  CariesCondition,
  RestorationCondition,
  EndoCondition,
  PerioCondition,
  ImplantCondition,
  ExtractionCondition,
  ToothSurface,
  RestorationMaterial,
  CariesClass,
} from '../../types/dental-chart';

interface ToothDetailsPanelProps {
  tooth: Tooth | null;
  onClose: () => void;
  onUpdate: (toothId: string, updates: Partial<Tooth>) => void;
  onAddCondition: (toothId: string, condition: ToothCondition) => void;
  onRemoveCondition: (toothId: string, index: number) => void;
}

export const ToothDetailsPanel: Component<ToothDetailsPanelProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<'conditions' | 'operative' | 'endo' | 'perio' | 'surgery' | 'implant'>('conditions');
  const [selectedSurfaces, setSelectedSurfaces] = createSignal<ToothSurface[]>([]);

  // Form state for new conditions
  const [cariesClass, setCariesClass] = createSignal<CariesClass>('I');
  const [restorationMaterial, setRestorationMaterial] = createSignal<RestorationMaterial>('composite');

  const tooth = () => props.tooth;

  const toggleSurface = (surface: ToothSurface) => {
    const surfaces = selectedSurfaces();
    if (surfaces.includes(surface)) {
      setSelectedSurfaces(surfaces.filter(s => s !== surface));
    } else {
      setSelectedSurfaces([...surfaces, surface]);
    }
  };

  const updateToothStatus = (status: ToothStatus) => {
    if (!tooth()) return;
    props.onUpdate(tooth()!.id, { status });
  };

  const addCaries = () => {
    if (!tooth() || selectedSurfaces().length === 0) return;
    
    const condition: CariesCondition = {
      type: 'caries',
      surfaces: selectedSurfaces(),
      class: cariesClass(),
      severity: 'moderate',
    };
    
    props.onAddCondition(tooth()!.id, condition);
    setSelectedSurfaces([]);
  };

  const addRestoration = () => {
    if (!tooth() || selectedSurfaces().length === 0) return;
    
    const condition: RestorationCondition = {
      type: 'restoration',
      surfaces: selectedSurfaces(),
      material: restorationMaterial(),
      condition: 'intact',
      dateCompleted: new Date().toISOString().split('T')[0],
    };
    
    props.onAddCondition(tooth()!.id, condition);
    setSelectedSurfaces([]);
  };

  const addRCT = () => {
    if (!tooth()) return;
    
    const condition: EndoCondition = {
      type: 'endo',
      pulpDiagnosis: 'irreversible_pulpitis',
      stage: 'indicated',
    };
    
    props.onAddCondition(tooth()!.id, condition);
  };

  const addExtraction = () => {
    if (!tooth()) return;
    
    const condition: ExtractionCondition = {
      type: 'extraction',
      status: 'planned',
      extractionType: 'simple',
    };
    
    props.onAddCondition(tooth()!.id, condition);
  };

  const addImplant = () => {
    if (!tooth()) return;
    
    const condition: ImplantCondition = {
      type: 'implant',
      status: 'planned',
      component: 'fixture',
    };
    
    props.onAddCondition(tooth()!.id, condition);
  };

  const addPerioCondition = () => {
    if (!tooth()) return;
    
    const condition: PerioCondition = {
      type: 'perio',
      diagnosis: 'periodontitis_moderate',
      mobility: 1,
    };
    
    props.onAddCondition(tooth()!.id, condition);
  };

  return (
    <Show when={tooth()}>
      <div class="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              Tooth #{tooth()!.position.universal} (FDI: {tooth()!.position.fdi})
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {tooth()!.position.arch === 'upper' ? 'Upper' : 'Lower'} {tooth()!.position.type}
            </p>
          </div>
          <button
            onClick={props.onClose}
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            classList={{
              'text-blue-600 border-b-2 border-blue-600': activeTab() === 'conditions',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab() !== 'conditions',
            }}
            onClick={() => setActiveTab('conditions')}
          >
            Overview
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            classList={{
              'text-blue-600 border-b-2 border-blue-600': activeTab() === 'operative',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab() !== 'operative',
            }}
            onClick={() => setActiveTab('operative')}
          >
            Operative
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            classList={{
              'text-blue-600 border-b-2 border-blue-600': activeTab() === 'endo',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab() !== 'endo',
            }}
            onClick={() => setActiveTab('endo')}
          >
            Endo
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            classList={{
              'text-blue-600 border-b-2 border-blue-600': activeTab() === 'perio',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab() !== 'perio',
            }}
            onClick={() => setActiveTab('perio')}
          >
            Perio
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            classList={{
              'text-blue-600 border-b-2 border-blue-600': activeTab() === 'surgery',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab() !== 'surgery',
            }}
            onClick={() => setActiveTab('surgery')}
          >
            Surgery
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            classList={{
              'text-blue-600 border-b-2 border-blue-600': activeTab() === 'implant',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab() !== 'implant',
            }}
            onClick={() => setActiveTab('implant')}
          >
            Implant
          </button>
        </div>

        {/* Content */}
        <div class="p-4 space-y-4">
          <Switch>
            {/* Overview Tab */}
            <Match when={activeTab() === 'conditions'}>
              <div class="space-y-4">
                {/* Tooth Status */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tooth Status
                  </label>
                  <select
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={tooth()!.status}
                    onChange={(e) => updateToothStatus(e.currentTarget.value as ToothStatus)}
                  >
                    <option value="healthy">Healthy</option>
                    <option value="missing">Missing</option>
                    <option value="extracted">Extracted</option>
                    <option value="unerupted">Unerupted</option>
                    <option value="erupting">Erupting</option>
                    <option value="impacted">Impacted</option>
                    <option value="supernumerary">Supernumerary</option>
                    <option value="retained_primary">Retained Primary</option>
                    <option value="congenitally_missing">Congenitally Missing</option>
                  </select>
                </div>

                {/* Existing Conditions */}
                <div>
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Existing Conditions ({tooth()!.conditions.length})
                  </h3>
                  <div class="space-y-2">
                    <For each={tooth()!.conditions}>
                      {(condition, index) => (
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {condition.type}
                            </div>
                            <Show when={'surfaces' in condition}>
                              <div class="text-xs text-gray-600 dark:text-gray-400">
                                Surfaces: {(() => {
                                  if ('surfaces' in condition) {
                                    return condition.surfaces.join(', ');
                                  }
                                  return '';
                                })()}
                              </div>
                            </Show>
                          </div>
                          <button
                            onClick={() => props.onRemoveCondition(tooth()!.id, index())}
                            class="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </For>
                    <Show when={tooth()!.conditions.length === 0}>
                      <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No conditions recorded
                      </p>
                    </Show>
                  </div>
                </div>
              </div>
            </Match>

            {/* Operative Tab */}
            <Match when={activeTab() === 'operative'}>
              <div class="space-y-4">
                {/* Surface Selector */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Surfaces
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <For each={['mesial', 'occlusal', 'distal', 'buccal', 'lingual'] as ToothSurface[]}>
                      {(surface) => (
                        <button
                          class="px-3 py-2 text-sm rounded-md transition-colors"
                          classList={{
                            'bg-blue-600 text-white': selectedSurfaces().includes(surface),
                            'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300': !selectedSurfaces().includes(surface),
                          }}
                          onClick={() => toggleSurface(surface)}
                        >
                          {surface[0].toUpperCase()}
                        </button>
                      )}
                    </For>
                  </div>
                </div>

                {/* Add Caries */}
                <div class="border border-gray-200 dark:border-gray-600 rounded-md p-3 space-y-3">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Add Caries</h4>
                  <select
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={cariesClass()}
                    onChange={(e) => setCariesClass(e.currentTarget.value as CariesClass)}
                  >
                    <option value="I">Class I</option>
                    <option value="II">Class II</option>
                    <option value="III">Class III</option>
                    <option value="IV">Class IV</option>
                    <option value="V">Class V</option>
                    <option value="VI">Class VI</option>
                  </select>
                  <button
                    onClick={addCaries}
                    disabled={selectedSurfaces().length === 0}
                    class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Add Caries
                  </button>
                </div>

                {/* Add Restoration */}
                <div class="border border-gray-200 dark:border-gray-600 rounded-md p-3 space-y-3">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Add Restoration</h4>
                  <select
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={restorationMaterial()}
                    onChange={(e) => setRestorationMaterial(e.currentTarget.value as RestorationMaterial)}
                  >
                    <option value="composite">Composite</option>
                    <option value="amalgam">Amalgam</option>
                    <option value="gic">GIC</option>
                    <option value="rmgic">RM-GIC</option>
                    <option value="porcelain">Porcelain</option>
                    <option value="gold">Gold</option>
                    <option value="zirconia">Zirconia</option>
                    <option value="emax">E-max</option>
                  </select>
                  <button
                    onClick={addRestoration}
                    disabled={selectedSurfaces().length === 0}
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Add Restoration
                  </button>
                </div>
              </div>
            </Match>

            {/* Endo Tab */}
            <Match when={activeTab() === 'endo'}>
              <div class="space-y-4">
                <button
                  onClick={addRCT}
                  class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Mark RCT Indicated
                </button>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Click to add endodontic treatment indication for this tooth.
                </p>
              </div>
            </Match>

            {/* Perio Tab */}
            <Match when={activeTab() === 'perio'}>
              <div class="space-y-4">
                <button
                  onClick={addPerioCondition}
                  class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Add Periodontal Condition
                </button>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Mark this tooth with periodontal involvement. Full perio charting available in the dedicated module.
                </p>
              </div>
            </Match>

            {/* Surgery Tab */}
            <Match when={activeTab() === 'surgery'}>
              <div class="space-y-4">
                <button
                  onClick={addExtraction}
                  class="w-full px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
                >
                  Plan Extraction
                </button>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Mark this tooth for extraction.
                </p>
              </div>
            </Match>

            {/* Implant Tab */}
            <Match when={activeTab() === 'implant'}>
              <div class="space-y-4">
                <button
                  onClick={addImplant}
                  class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Plan Implant
                </button>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Mark this position for dental implant placement.
                </p>
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </Show>
  );
};
