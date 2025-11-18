/**
 * Periodontal Charting Module
 * 6-point probing measurements per tooth with auto-calculated CAL
 */

import { type Component, For } from 'solid-js';
import type { PerioMeasurement, Tooth } from '../../types/dental-chart';

interface PerioChartProps {
  teeth: Tooth[];
  measurements: PerioMeasurement[];
  onUpdateMeasurement: (measurement: PerioMeasurement) => void;
}

const SITE_LABELS = ['MB', 'B', 'DB', 'ML', 'L', 'DL'];

export const PerioChart: Component<PerioChartProps> = (props) => {
  const getMeasurement = (toothId: string): PerioMeasurement => {
    const existing = props.measurements.find(m => m.toothId === toothId);
    return existing || {
      toothId,
      probingDepths: [0, 0, 0, 0, 0, 0],
      gingivalRecession: [0, 0, 0, 0, 0, 0],
      bleeding: [false, false, false, false, false, false],
      suppuration: [false, false, false, false, false, false],
      mobility: 0,
    };
  };

  const updateProbing = (toothId: string, siteIndex: number, value: number) => {
    const measurement = getMeasurement(toothId);
    const newProbing = [...measurement.probingDepths] as [number, number, number, number, number, number];
    newProbing[siteIndex] = value;
    
    props.onUpdateMeasurement({
      ...measurement,
      probingDepths: newProbing,
    });
  };

  const updateRecession = (toothId: string, siteIndex: number, value: number) => {
    const measurement = getMeasurement(toothId);
    const newRecession = [...measurement.gingivalRecession] as [number, number, number, number, number, number];
    newRecession[siteIndex] = value;
    
    props.onUpdateMeasurement({
      ...measurement,
      gingivalRecession: newRecession,
    });
  };

  const toggleBleeding = (toothId: string, siteIndex: number) => {
    const measurement = getMeasurement(toothId);
    const newBleeding = [...measurement.bleeding] as [boolean, boolean, boolean, boolean, boolean, boolean];
    newBleeding[siteIndex] = !newBleeding[siteIndex];
    
    props.onUpdateMeasurement({
      ...measurement,
      bleeding: newBleeding,
    });
  };

  const updateMobility = (toothId: string, mobility: 0 | 1 | 2 | 3) => {
    const measurement = getMeasurement(toothId);
    props.onUpdateMeasurement({
      ...measurement,
      mobility,
    });
  };

  // Separate teeth by arch for display
  const upperTeeth = () => props.teeth
    .filter(t => t.position.arch === 'upper' && !t.position.isPrimary)
    .sort((a, b) => {
      if (typeof a.position.universal === 'number' && typeof b.position.universal === 'number') {
        return a.position.universal - b.position.universal;
      }
      return 0;
    });

  const lowerTeeth = () => props.teeth
    .filter(t => t.position.arch === 'lower' && !t.position.isPrimary)
    .sort((a, b) => {
      if (typeof a.position.universal === 'number' && typeof b.position.universal === 'number') {
        return b.position.universal - a.position.universal;
      }
      return 0;
    });

  const getCellColor = (depth: number): string => {
    if (depth === 0) return '';
    if (depth <= 3) return 'bg-green-100 dark:bg-green-900';
    if (depth <= 5) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div class="space-y-8 p-4 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Periodontal Charting</h2>
        <div class="flex gap-4 text-xs">
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 bg-green-100 dark:bg-green-900 border border-gray-300" />
            <span class="text-gray-600 dark:text-gray-400">1-3mm</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-gray-300" />
            <span class="text-gray-600 dark:text-gray-400">4-5mm</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 bg-red-100 dark:bg-red-900 border border-gray-300" />
            <span class="text-gray-600 dark:text-gray-400">≥6mm</span>
          </div>
        </div>
      </div>

      {/* Upper Arch */}
      <div class="overflow-x-auto">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upper Arch</div>
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-800">
              <th class="border border-gray-300 dark:border-gray-700 p-1 font-medium text-gray-700 dark:text-gray-300">Tooth</th>
              <For each={SITE_LABELS}>
                {(label) => (
                  <th class="border border-gray-300 dark:border-gray-700 p-1 font-medium text-gray-700 dark:text-gray-300">{label}</th>
                )}
              </For>
              <th class="border border-gray-300 dark:border-gray-700 p-1 font-medium text-gray-700 dark:text-gray-300">Mob</th>
            </tr>
          </thead>
          <tbody>
            {/* Probing Depths */}
            <For each={upperTeeth()}>
              {(tooth) => {
                const measurement = getMeasurement(tooth.id);
                return (
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="border border-gray-300 dark:border-gray-700 p-1 text-center font-medium bg-gray-50 dark:bg-gray-800">
                      {tooth.position.universal}
                    </td>
                    <For each={[0, 1, 2, 3, 4, 5]}>
                      {(siteIndex) => (
                        <td class={`border border-gray-300 dark:border-gray-700 p-0 ${getCellColor(measurement.probingDepths[siteIndex])}`}>
                          <div class="flex flex-col">
                            {/* Probing Depth */}
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={measurement.probingDepths[siteIndex] || ''}
                              onInput={(e) => updateProbing(tooth.id, siteIndex, parseInt(e.currentTarget.value) || 0)}
                              class="w-full text-center border-none bg-transparent p-1 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                              placeholder="0"
                            />
                            {/* Recession */}
                            <input
                              type="number"
                              min="-5"
                              max="10"
                              value={measurement.gingivalRecession[siteIndex] || ''}
                              onInput={(e) => updateRecession(tooth.id, siteIndex, parseInt(e.currentTarget.value) || 0)}
                              class="w-full text-center border-t border-gray-200 dark:border-gray-600 bg-transparent p-1 text-[10px] text-gray-600 dark:text-gray-400"
                              placeholder="0"
                            />
                            {/* Bleeding indicator */}
                            <button
                              onClick={() => toggleBleeding(tooth.id, siteIndex)}
                              class="text-center py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {measurement.bleeding[siteIndex] ? '🩸' : '-'}
                            </button>
                          </div>
                        </td>
                      )}
                    </For>
                    <td class="border border-gray-300 dark:border-gray-700 p-0">
                      <select
                        value={measurement.mobility}
                        onChange={(e) => updateMobility(tooth.id, parseInt(e.currentTarget.value) as 0 | 1 | 2 | 3)}
                        class="w-full text-center border-none bg-transparent p-1 text-gray-900 dark:text-white"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>

      {/* Lower Arch */}
      <div class="overflow-x-auto">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lower Arch</div>
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-800">
              <th class="border border-gray-300 dark:border-gray-700 p-1 font-medium text-gray-700 dark:text-gray-300">Tooth</th>
              <For each={SITE_LABELS}>
                {(label) => (
                  <th class="border border-gray-300 dark:border-gray-700 p-1 font-medium text-gray-700 dark:text-gray-300">{label}</th>
                )}
              </For>
              <th class="border border-gray-300 dark:border-gray-700 p-1 font-medium text-gray-700 dark:text-gray-300">Mob</th>
            </tr>
          </thead>
          <tbody>
            <For each={lowerTeeth()}>
              {(tooth) => {
                const measurement = getMeasurement(tooth.id);
                return (
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="border border-gray-300 dark:border-gray-700 p-1 text-center font-medium bg-gray-50 dark:bg-gray-800">
                      {tooth.position.universal}
                    </td>
                    <For each={[0, 1, 2, 3, 4, 5]}>
                      {(siteIndex) => (
                        <td class={`border border-gray-300 dark:border-gray-700 p-0 ${getCellColor(measurement.probingDepths[siteIndex])}`}>
                          <div class="flex flex-col">
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={measurement.probingDepths[siteIndex] || ''}
                              onInput={(e) => updateProbing(tooth.id, siteIndex, parseInt(e.currentTarget.value) || 0)}
                              class="w-full text-center border-none bg-transparent p-1 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                              placeholder="0"
                            />
                            <input
                              type="number"
                              min="-5"
                              max="10"
                              value={measurement.gingivalRecession[siteIndex] || ''}
                              onInput={(e) => updateRecession(tooth.id, siteIndex, parseInt(e.currentTarget.value) || 0)}
                              class="w-full text-center border-t border-gray-200 dark:border-gray-600 bg-transparent p-1 text-[10px] text-gray-600 dark:text-gray-400"
                              placeholder="0"
                            />
                            <button
                              onClick={() => toggleBleeding(tooth.id, siteIndex)}
                              class="text-center py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {measurement.bleeding[siteIndex] ? '🩸' : '-'}
                            </button>
                          </div>
                        </td>
                      )}
                    </For>
                    <td class="border border-gray-300 dark:border-gray-700 p-0">
                      <select
                        value={measurement.mobility}
                        onChange={(e) => updateMobility(tooth.id, parseInt(e.currentTarget.value) as 0 | 1 | 2 | 3)}
                        class="w-full text-center border-none bg-transparent p-1 text-gray-900 dark:text-white"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p><strong>Instructions:</strong></p>
        <ul class="list-disc list-inside space-y-0.5">
          <li>Top number: Probing depth (mm)</li>
          <li>Middle number: Gingival recession (mm, negative for gingival margin above CEJ)</li>
          <li>Bottom icon: Click to toggle bleeding on probing</li>
          <li>Mob: Tooth mobility (0-3)</li>
          <li>CAL automatically calculated as: Probing Depth + Recession</li>
        </ul>
      </div>
    </div>
  );
};
