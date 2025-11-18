/**
 * Root Canal System Visualization Component
 * Shows tooth roots with individual canal status
 */

import { For, Show, type Component } from 'solid-js';
import type { RootConfiguration, CanalStatus } from '../../types/dental-chart-v2';

interface RootCanalDisplayProps {
  rootConfig: RootConfiguration;
  onCanalClick?: (canalName: string) => void;
  size?: number;
  showLabels?: boolean;
}

/**
 * Get color for canal status
 */
function getCanalColor(status: CanalStatus): string {
  switch (status) {
    case 'untreated':
      return 'rgb(209, 213, 219)'; // gray-300
    case 'located':
      return 'rgb(96, 165, 250)'; // blue-400
    case 'instrumented':
      return 'rgb(251, 146, 60)'; // orange-400
    case 'obturated':
      return 'rgb(220, 38, 38)'; // red-600
    case 'post_space':
      return 'rgb(168, 85, 247)'; // purple-500
    case 'post_placed':
      return 'rgb(107, 114, 128)'; // gray-500
    case 'retreatment_needed':
      return 'rgb(234, 179, 8)'; // yellow-500
    default:
      return 'rgb(156, 163, 175)'; // gray-400
  }
}

/**
 * Get icon for canal status
 */
function getCanalIcon(status: CanalStatus): string {
  switch (status) {
    case 'untreated':
      return '○';
    case 'located':
      return '◐';
    case 'instrumented':
      return '◑';
    case 'obturated':
      return '●';
    case 'post_space':
      return '⬤';
    case 'post_placed':
      return '⬛';
    case 'retreatment_needed':
      return '⚠';
    default:
      return '○';
  }
}

export const RootCanalDisplay: Component<RootCanalDisplayProps> = (props) => {
  const size = () => props.size || 120;
  const rootWidth = () => size() / Math.max(props.rootConfig.rootCount, 1);

  return (
    <div class="flex flex-col items-center gap-2">
      {/* Root Display */}
      <div 
        class="flex items-start justify-center gap-1 relative"
        style={{ width: `${size()}px`, height: `${size() * 0.8}px` }}
      >
        <For each={Array(props.rootConfig.rootCount).fill(0)}>
          {(_, index) => {
            // Find canals for this root
            const rootCanals = props.rootConfig.canals.filter((_, i) => 
              Math.floor(i / Math.ceil(props.rootConfig.canals.length / props.rootConfig.rootCount)) === index()
            );

            return (
              <div 
                class="relative flex flex-col items-center"
                style={{ width: `${rootWidth()}px` }}
              >
                {/* Root Shape */}
                <svg
                  width={rootWidth()}
                  height={size() * 0.8}
                  viewBox={`0 0 ${rootWidth()} ${size() * 0.8}`}
                  class="absolute top-0"
                >
                  {/* Root outline */}
                  <path
                    d={`
                      M ${rootWidth() * 0.2} 0
                      L ${rootWidth() * 0.1} ${size() * 0.6}
                      Q ${rootWidth() * 0.1} ${size() * 0.75} ${rootWidth() * 0.5} ${size() * 0.8}
                      Q ${rootWidth() * 0.9} ${size() * 0.75} ${rootWidth() * 0.9} ${size() * 0.6}
                      L ${rootWidth() * 0.8} 0
                      Z
                    `}
                    fill="rgb(243, 244, 246)"
                    stroke="rgb(156, 163, 175)"
                    stroke-width="1"
                  />
                </svg>

                {/* Canals within root */}
                <div class="relative z-10 flex flex-col gap-1 mt-2">
                  <For each={rootCanals}>
                    {(canal) => (
                      <button
                        class="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all hover:scale-110"
                        style={{
                          background: getCanalColor(canal.status),
                          color: canal.status === 'untreated' ? 'black' : 'white'
                        }}
                        onClick={() => props.onCanalClick?.(canal.canalName)}
                        title={`${canal.canalName}: ${canal.status.replace('_', ' ')}`}
                      >
                        <span>{getCanalIcon(canal.status)}</span>
                        <span class="font-bold">{canal.canalName}</span>
                        <Show when={canal.workingLength}>
                          <span class="text-[10px] opacity-80">
                            {canal.workingLength}mm
                          </span>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Canal Legend */}
      <Show when={props.showLabels !== false}>
        <div class="flex flex-wrap gap-2 justify-center text-[10px]">
          <For each={props.rootConfig.canals}>
            {(canal) => (
              <div class="flex items-center gap-1">
                <span 
                  class="w-3 h-3 rounded-full inline-block"
                  style={{ background: getCanalColor(canal.status) }}
                />
                <span class="font-medium">{canal.canalName}:</span>
                <span class="text-gray-600 dark:text-gray-400">
                  {canal.status.replace('_', ' ')}
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Root Anatomy Badge */}
      <div class="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
        {props.rootConfig.rootCount} {props.rootConfig.rootCount === 1 ? 'root' : 'roots'} • {props.rootConfig.anatomy}
      </div>
    </div>
  );
};

/**
 * Canal Status Legend Component
 */
export const CanalStatusLegend: Component = () => {
  const statuses: CanalStatus[] = [
    'untreated',
    'located',
    'instrumented',
    'obturated',
    'post_space',
    'post_placed',
    'retreatment_needed'
  ];

  return (
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
        Canal Status Legend
      </h3>
      <div class="grid grid-cols-2 gap-2">
        <For each={statuses}>
          {(status) => (
            <div class="flex items-center gap-2 text-xs">
              <span class="text-lg">{getCanalIcon(status)}</span>
              <span 
                class="w-3 h-3 rounded-full"
                style={{ background: getCanalColor(status) }}
              />
              <span class="text-gray-700 dark:text-gray-300">
                {status.replace('_', ' ')}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
