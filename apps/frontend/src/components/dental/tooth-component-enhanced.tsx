/**
 * Enhanced Interactive Tooth Component
 * Better visual design with improved surface interaction and status indicators
 */

import { type Component, Show, createMemo, For } from 'solid-js';
import type { Tooth, ToothSurface, ToothCondition, NumberingSystem } from '../../types/dental-chart';

interface ToothProps {
  tooth: Tooth;
  selected?: boolean;
  onClick?: () => void;
  onSurfaceClick?: (surface: ToothSurface) => void;
  scale?: number;
  showNumber?: boolean;
  numberingSystem?: NumberingSystem;
}

export const ToothComponentEnhanced: Component<ToothProps> = (props) => {
  const scale = () => props.scale ?? 1;
  const numberingSystem = () => props.numberingSystem ?? 'universal';

  const toothNumber = () => {
    return numberingSystem() === 'fdi' 
      ? props.tooth.position.fdi 
      : props.tooth.position.universal;
  };

  const isAnterior = () => {
    return props.tooth.position.type === 'incisor' || props.tooth.position.type === 'canine';
  };

  // Enhanced status determination
  const toothStatus = createMemo(() => {
    if (props.tooth.status === 'missing' || props.tooth.status === 'extracted') {
      return { color: 'bg-gray-200 dark:bg-gray-700', borderStyle: 'border-2 border-dashed border-gray-400', opacity: 'opacity-30' };
    }
    if (props.tooth.status === 'unerupted') {
      return { color: 'bg-sky-100 dark:bg-sky-900/30', borderStyle: 'border-2 border-dashed border-sky-400', opacity: 'opacity-70' };
    }

    // Check for primary conditions that affect whole tooth appearance
    const hasImplant = props.tooth.conditions.some((c: ToothCondition) => c.type === 'implant');
    const hasRCT = props.tooth.conditions.some((c: ToothCondition) => c.type === 'endo');
    const hasCrown = props.tooth.conditions.some((c: ToothCondition) => c.type === 'crown');
    const extraction = props.tooth.conditions.find((c: ToothCondition) => c.type === 'extraction');
    
    if (extraction) return { color: 'bg-red-50 dark:bg-red-900/20', borderStyle: 'border-2 border-red-600', opacity: 'opacity-100' };
    if (hasImplant) return { color: 'bg-green-50 dark:bg-green-900/20', borderStyle: 'border-2 border-green-600', opacity: 'opacity-100' };
    if (hasCrown) return { color: 'bg-yellow-50 dark:bg-yellow-900/20', borderStyle: 'border-2 border-yellow-600', opacity: 'opacity-100' };
    if (hasRCT) return { color: 'bg-orange-50 dark:bg-orange-900/20', borderStyle: 'border-2 border-orange-500', opacity: 'opacity-100' };
    
    return { color: 'bg-white dark:bg-gray-800', borderStyle: 'border border-gray-300 dark:border-gray-600', opacity: 'opacity-100' };
  });

  // Get surface color based on conditions
  const getSurfaceInfo = (surface: ToothSurface) => {
    const surfaceConditions = props.tooth.conditions.filter((condition: ToothCondition) => {
      if (condition.type === 'caries' || condition.type === 'restoration' || condition.type === 'fracture') {
        return condition.surfaces.includes(surface);
      }
      return false;
    });

    if (surfaceConditions.length === 0) return null;

    // Priority: restoration > fracture > caries
    const restoration = surfaceConditions.find((c: ToothCondition) => c.type === 'restoration');
    if (restoration && 'material' in restoration) {
      const materialColors: Record<string, string> = {
        composite: 'rgb(100, 180, 255)',
        amalgam: 'rgb(120, 120, 140)',
        gic: 'rgb(255, 230, 100)',
        rmgic: 'rgb(255, 200, 100)',
        porcelain: 'rgb(240, 240, 255)',
        gold: 'rgb(218, 165, 32)',
        zirconia: 'rgb(230, 230, 240)',
        emax: 'rgb(220, 240, 255)',
      };
      return { color: materialColors[restoration.material] || 'rgb(100, 180, 255)', label: restoration.material.slice(0, 2).toUpperCase() };
    }

    const fracture = surfaceConditions.find((c: ToothCondition) => c.type === 'fracture');
    if (fracture) return { color: 'rgb(255, 165, 0)', label: 'FR' };

    const caries = surfaceConditions.find((c: ToothCondition) => c.type === 'caries');
    if (caries && 'class' in caries) {
      return { color: 'rgb(255, 100, 100)', label: caries.class || 'C' };
    }

    return { color: 'rgb(255, 100, 100)', label: 'C' };
  };

  // Condition indicators for visual display
  const conditionIndicators = createMemo(() => {
    const indicators: Array<{ color: string; label: string; title: string }> = [];
    
    props.tooth.conditions.forEach((condition: ToothCondition) => {
      if (condition.type === 'perio' && 'mobility' in condition && condition.mobility > 0) {
        indicators.push({ color: 'text-red-600', label: `M${condition.mobility}`, title: `Mobility Grade ${condition.mobility}` });
      }
      if (condition.type === 'perio' && 'furcation' in condition && condition.furcation && condition.furcation > 0) {
        indicators.push({ color: 'text-orange-600', label: `F${condition.furcation}`, title: `Furcation Grade ${condition.furcation}` });
      }
    });

    return indicators;
  });

  const handleSurfaceClick = (surface: ToothSurface, e: MouseEvent) => {
    e.stopPropagation();
    props.onSurfaceClick?.(surface);
  };

  return (
    <div
      class="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 group"
      style={{ transform: `scale(${scale()})` }}
      onClick={() => props.onClick?.()}
    >
      {/* Tooth Number */}
      <Show when={props.showNumber !== false}>
        <div 
          class="text-xs font-bold transition-colors"
          classList={{
            'text-blue-600 dark:text-blue-400': props.selected,
            'text-gray-700 dark:text-gray-300': !props.selected,
            'text-purple-600 dark:text-purple-400': props.tooth.position.isPrimary,
          }}
        >
          {toothNumber()}
        </div>
      </Show>

      {/* Tooth Container */}
      <div
        class={`relative rounded-lg transition-all duration-200 ${toothStatus().color} ${toothStatus().borderStyle} ${toothStatus().opacity}`}
        classList={{
          'ring-4 ring-blue-500 ring-offset-2 shadow-lg scale-110': props.selected,
          'hover:shadow-md': !props.selected,
        }}
        style={{ width: '56px', height: '72px' }}
      >
        <Show when={props.tooth.status !== 'missing' && props.tooth.status !== 'extracted'}>
          {/* Surface Layout - Posterior (Molar/Premolar) */}
          <Show when={!isAnterior()}>
            {/* Occlusal */}
            <Show when={getSurfaceInfo('occlusal')}>
              {(info) => (
                <div
                  class="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-sm border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 hover:scale-105 flex items-center justify-center text-[8px] font-bold text-white shadow-inner"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('occlusal', e)}
                  title={`Occlusal: ${info().label}`}
                >
                  {info().label}
                </div>
              )}
            </Show>

            {/* Mesial */}
            <Show when={getSurfaceInfo('mesial')}>
              {(info) => (
                <div
                  class="absolute top-0 left-1/4 w-1/2 h-1/4 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('mesial', e)}
                  title={`Mesial: ${info().label}`}
                >
                  M
                </div>
              )}
            </Show>

            {/* Distal */}
            <Show when={getSurfaceInfo('distal')}>
              {(info) => (
                <div
                  class="absolute bottom-0 left-1/4 w-1/2 h-1/4 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('distal', e)}
                  title={`Distal: ${info().label}`}
                >
                  D
                </div>
              )}
            </Show>

            {/* Buccal */}
            <Show when={getSurfaceInfo('buccal')}>
              {(info) => (
                <div
                  class="absolute top-1/4 right-0 w-1/4 h-1/2 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('buccal', e)}
                  title={`Buccal: ${info().label}`}
                >
                  B
                </div>
              )}
            </Show>

            {/* Lingual */}
            <Show when={getSurfaceInfo('lingual')}>
              {(info) => (
                <div
                  class="absolute top-1/4 left-0 w-1/4 h-1/2 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white opacity-80"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('lingual', e)}
                  title={`Lingual: ${info().label}`}
                >
                  L
                </div>
              )}
            </Show>
          </Show>

          {/* Surface Layout - Anterior (Incisor/Canine) */}
          <Show when={isAnterior()}>
            {/* Incisal */}
            <Show when={getSurfaceInfo('incisal') || getSurfaceInfo('occlusal')}>
              {(info) => (
                <div
                  class="absolute top-0 left-0 w-full h-1/3 rounded-t-lg border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('incisal', e)}
                  title={`Incisal: ${info().label}`}
                >
                  I
                </div>
              )}
            </Show>

            {/* Mesial */}
            <Show when={getSurfaceInfo('mesial')}>
              {(info) => (
                <div
                  class="absolute bottom-0 left-0 w-1/4 h-2/3 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('mesial', e)}
                  title={`Mesial: ${info().label}`}
                >
                  M
                </div>
              )}
            </Show>

            {/* Distal */}
            <Show when={getSurfaceInfo('distal')}>
              {(info) => (
                <div
                  class="absolute bottom-0 right-0 w-1/4 h-2/3 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('distal', e)}
                  title={`Distal: ${info().label}`}
                >
                  D
                </div>
              )}
            </Show>

            {/* Buccal */}
            <Show when={getSurfaceInfo('buccal')}>
              {(info) => (
                <div
                  class="absolute bottom-0 left-1/4 w-1/2 h-1/3 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('buccal', e)}
                  title={`Buccal: ${info().label}`}
                >
                  B
                </div>
              )}
            </Show>

            {/* Lingual */}
            <Show when={getSurfaceInfo('lingual')}>
              {(info) => (
                <div
                  class="absolute bottom-0 left-1/4 w-1/2 h-1/3 border border-gray-400 dark:border-gray-500 transition-all cursor-pointer hover:brightness-110 flex items-center justify-center text-[7px] font-bold text-white opacity-70"
                  style={{ 'background-color': info().color }}
                  onClick={(e) => handleSurfaceClick('lingual', e)}
                  title={`Lingual: ${info().label}`}
                >
                  L
                </div>
              )}
            </Show>
          </Show>

          {/* Special Markers */}
          {/* RCT indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'endo' && 'stage' in c && c.stage === 'completed')}>
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-red-600 rounded-full" title="Root Canal Treatment" />
          </Show>

          {/* Implant indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'implant')}>
            <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <div class="w-1 h-4 bg-green-700 rounded-full" />
              <div class="w-2 h-2 rounded-full bg-green-600 border border-green-800" />
            </div>
          </Show>

          {/* Crown indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'crown')}>
            <svg class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-3" viewBox="0 0 24 12">
              <path d="M 2 10 L 12 2 L 22 10 Z" fill="rgb(218, 165, 32)" stroke="rgb(180, 130, 20)" stroke-width="1" />
            </svg>
          </Show>

          {/* Extraction marker */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'extraction')}>
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 56 72">
              <line x1="8" y1="8" x2="48" y2="64" stroke="rgb(220, 38, 38)" stroke-width="3" stroke-linecap="round" />
              <line x1="48" y1="8" x2="8" y2="64" stroke="rgb(220, 38, 38)" stroke-width="3" stroke-linecap="round" />
            </svg>
          </Show>
        </Show>

        {/* Missing tooth indicator */}
        <Show when={props.tooth.status === 'missing' || props.tooth.status === 'extracted'}>
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 56 72">
            <line x1="12" y1="12" x2="44" y2="60" stroke="rgb(150, 150, 150)" stroke-width="2" stroke-dasharray="4 4" />
            <line x1="44" y1="12" x2="12" y2="60" stroke="rgb(150, 150, 150)" stroke-width="2" stroke-dasharray="4 4" />
          </svg>
        </Show>
      </div>

      {/* Condition Indicators Below Tooth */}
      <Show when={conditionIndicators().length > 0}>
        <div class="flex gap-1 text-[9px] font-bold">
          <For each={conditionIndicators()}>
            {(indicator) => (
              <span class={`px-1 py-0.5 rounded ${indicator.color} bg-white dark:bg-gray-800 border border-current`} title={indicator.title}>
                {indicator.label}
              </span>
            )}
          </For>
        </div>
      </Show>

      {/* Status badge */}
      <Show when={props.tooth.status !== 'healthy' && props.tooth.status !== 'missing' && props.tooth.status !== 'extracted'}>
        <div class="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
          {props.tooth.status === 'erupting' && 'Erupting'}
          {props.tooth.status === 'unerupted' && 'Unerupted'}
          {props.tooth.status === 'impacted' && 'Impacted'}
          {props.tooth.status === 'supernumerary' && 'Extra'}
          {props.tooth.status === 'retained_primary' && 'Retained'}
        </div>
      </Show>
    </div>
  );
};
