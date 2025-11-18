/**
 * Quick Condition Toolbar
 * Fast access to common dental conditions with visual indicators
 */

import { type Component, For, createSignal } from 'solid-js';
import type { ToothCondition, ToothSurface } from '../../types/dental-chart';

interface QuickConditionButton {
  id: string;
  name: string;
  icon: string;
  color: string;
  createCondition: (surfaces?: ToothSurface[]) => ToothCondition;
}

interface QuickConditionToolbarProps {
  onConditionSelect: (createFn: (surfaces?: ToothSurface[]) => ToothCondition) => void;
  selectedSurfaces: ToothSurface[];
}

export const QuickConditionToolbar: Component<QuickConditionToolbarProps> = (props) => {
  const [activeCondition, setActiveCondition] = createSignal<string | null>(null);

  const conditions: QuickConditionButton[] = [
    {
      id: 'caries',
      name: 'Caries',
      icon: '🦷',
      color: 'bg-red-500 hover:bg-red-600 text-white',
      createCondition: (surfaces = []) => ({
        type: 'caries',
        surfaces,
        class: 'II',
        severity: 'moderate',
      }),
    },
    {
      id: 'composite',
      name: 'Composite',
      icon: '🔵',
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      createCondition: (surfaces = []) => ({
        type: 'restoration',
        surfaces,
        material: 'composite',
        condition: 'intact',
        dateCompleted: new Date().toISOString().split('T')[0],
      }),
    },
    {
      id: 'amalgam',
      name: 'Amalgam',
      icon: '⚫',
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      createCondition: (surfaces = []) => ({
        type: 'restoration',
        surfaces,
        material: 'amalgam',
        condition: 'intact',
        dateCompleted: new Date().toISOString().split('T')[0],
      }),
    },
    {
      id: 'crown',
      name: 'Crown',
      icon: '👑',
      color: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      createCondition: () => ({
        type: 'crown',
        crownType: 'full_crown',
        material: 'zirconia',
        condition: 'intact',
        dateCompleted: new Date().toISOString().split('T')[0],
      }),
    },
    {
      id: 'rct',
      name: 'RCT',
      icon: '🔴',
      color: 'bg-orange-500 hover:bg-orange-600 text-white',
      createCondition: () => ({
        type: 'endo',
        pulpDiagnosis: 'irreversible_pulpitis',
        stage: 'indicated',
      }),
    },
    {
      id: 'extraction',
      name: 'Extraction',
      icon: '❌',
      color: 'bg-red-700 hover:bg-red-800 text-white',
      createCondition: () => ({
        type: 'extraction',
        status: 'planned',
        extractionType: 'simple',
      }),
    },
    {
      id: 'implant',
      name: 'Implant',
      icon: '🔩',
      color: 'bg-green-600 hover:bg-green-700 text-white',
      createCondition: () => ({
        type: 'implant',
        status: 'planned',
        component: 'fixture',
      }),
    },
  ];

  const handleConditionClick = (condition: QuickConditionButton) => {
    setActiveCondition(condition.id);
    props.onConditionSelect(condition.createCondition);
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">Quick Add Conditions</h3>
        <div class="text-xs text-gray-600 dark:text-gray-400">
          {props.selectedSurfaces.length > 0 
            ? `Selected: ${props.selectedSurfaces.join(', ')}`
            : 'Select surfaces or whole tooth'}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <For each={conditions}>
          {(condition) => (
            <button
              onClick={() => handleConditionClick(condition)}
              class={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${condition.color} shadow-sm hover:shadow-md hover:scale-105`}
              classList={{
                'ring-2 ring-offset-2 ring-blue-500 scale-105': activeCondition() === condition.id,
              }}
              title={condition.name}
            >
              <span class="text-2xl mb-1">{condition.icon}</span>
              <span class="text-[10px] font-medium">{condition.name}</span>
            </button>
          )}
        </For>
      </div>

      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <p class="mb-1"><strong>Tip:</strong> Click a tooth or surface first, then select a condition</p>
        <p>Surface conditions (Caries, Composite, Amalgam) require surface selection</p>
      </div>
    </div>
  );
};
