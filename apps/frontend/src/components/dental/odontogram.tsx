/**
 * Odontogram Component - Full Dental Chart Grid
 * Displays permanent and/or primary teeth with interactive selection
 */

import { type Component, For, Show } from 'solid-js';
import type { Tooth, NumberingSystem, ToothSurface } from '../../types/dental-chart';
import { ToothComponent } from './tooth-component';

interface OdontogramProps {
  teeth: Tooth[];
  selectedToothId?: string;
  numberingSystem?: NumberingSystem;
  showPrimary?: boolean;
  onToothClick?: (tooth: Tooth) => void;
  onToothSurfaceClick?: (tooth: Tooth, surface: ToothSurface) => void;
}

export const Odontogram: Component<OdontogramProps> = (props) => {
  const numberingSystem = () => props.numberingSystem ?? 'universal';

  // Separate teeth by arch and type
  const upperPermanentTeeth = () => props.teeth
    .filter(t => t.position.arch === 'upper' && !t.position.isPrimary)
    .sort((a, b) => {
      if (typeof a.position.universal === 'number' && typeof b.position.universal === 'number') {
        return a.position.universal - b.position.universal;
      }
      return 0;
    });

  const lowerPermanentTeeth = () => props.teeth
    .filter(t => t.position.arch === 'lower' && !t.position.isPrimary)
    .sort((a, b) => {
      if (typeof a.position.universal === 'number' && typeof b.position.universal === 'number') {
        return b.position.universal - a.position.universal;
      }
      return 0;
    });

  const upperPrimaryTeeth = () => props.teeth
    .filter(t => t.position.arch === 'upper' && t.position.isPrimary)
    .sort((a, b) => a.position.fdi - b.position.fdi);

  const lowerPrimaryTeeth = () => props.teeth
    .filter(t => t.position.arch === 'lower' && t.position.isPrimary)
    .sort((a, b) => b.position.fdi - a.position.fdi);

  return (
    <div class="flex flex-col items-center gap-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div class="flex items-center justify-between w-full max-w-4xl">
        <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {numberingSystem() === 'universal' && 'Universal Numbering'}
          {numberingSystem() === 'fdi' && 'FDI Numbering'}
          {numberingSystem() === 'palmer' && 'Palmer Notation'}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-500">
          Click tooth to view/edit details
        </div>
      </div>

      {/* Upper Arch */}
      <div class="flex flex-col gap-4 items-center">
        {/* Primary upper teeth (if showing) */}
        <Show when={props.showPrimary && upperPrimaryTeeth().length > 0}>
          <div class="flex gap-2 items-end">
            <For each={upperPrimaryTeeth()}>
              {(tooth) => (
                <ToothComponent
                  tooth={tooth}
                  selected={props.selectedToothId === tooth.id}
                  numberingSystem={numberingSystem()}
                  scale={0.8}
                  onClick={() => props.onToothClick?.(tooth)}
                  onSurfaceClick={(surface) => props.onToothSurfaceClick?.(tooth, surface)}
                />
              )}
            </For>
          </div>
        </Show>

        {/* Permanent upper teeth */}
        <Show when={upperPermanentTeeth().length > 0}>
          <div class="flex gap-2 items-end">
            <For each={upperPermanentTeeth()}>
              {(tooth) => (
                <ToothComponent
                  tooth={tooth}
                  selected={props.selectedToothId === tooth.id}
                  numberingSystem={numberingSystem()}
                  onClick={() => props.onToothClick?.(tooth)}
                  onSurfaceClick={(surface) => props.onToothSurfaceClick?.(tooth, surface)}
                />
              )}
            </For>
          </div>
        </Show>

        {/* Divider line */}
        <div class="w-full max-w-4xl h-0.5 bg-gray-300 dark:bg-gray-700" />

        {/* Permanent lower teeth */}
        <Show when={lowerPermanentTeeth().length > 0}>
          <div class="flex gap-2 items-start">
            <For each={lowerPermanentTeeth()}>
              {(tooth) => (
                <ToothComponent
                  tooth={tooth}
                  selected={props.selectedToothId === tooth.id}
                  numberingSystem={numberingSystem()}
                  onClick={() => props.onToothClick?.(tooth)}
                  onSurfaceClick={(surface) => props.onToothSurfaceClick?.(tooth, surface)}
                />
              )}
            </For>
          </div>
        </Show>

        {/* Primary lower teeth (if showing) */}
        <Show when={props.showPrimary && lowerPrimaryTeeth().length > 0}>
          <div class="flex gap-2 items-start">
            <For each={lowerPrimaryTeeth()}>
              {(tooth) => (
                <ToothComponent
                  tooth={tooth}
                  selected={props.selectedToothId === tooth.id}
                  numberingSystem={numberingSystem()}
                  scale={0.8}
                  onClick={() => props.onToothClick?.(tooth)}
                  onSurfaceClick={(surface) => props.onToothSurfaceClick?.(tooth, surface)}
                />
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Legend */}
      <div class="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 justify-center max-w-4xl">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-white border-2 border-gray-400 rounded" />
          <span>Healthy</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" style="background-color: rgb(255, 100, 100);" />
          <span>Caries</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" style="background-color: rgb(100, 180, 255);" />
          <span>Restoration</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" style="background-color: rgb(255, 220, 220);" />
          <span>RCT</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" style="background-color: rgb(255, 215, 0);" />
          <span>Crown</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" style="background-color: rgb(180, 180, 220);" />
          <span>Implant</span>
        </div>
        <div class="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="rgb(200, 0, 0)" stroke-width="2" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="rgb(200, 0, 0)" stroke-width="2" />
          </svg>
          <span>Missing</span>
        </div>
      </div>
    </div>
  );
};
