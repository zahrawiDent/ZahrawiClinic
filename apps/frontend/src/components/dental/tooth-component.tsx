/**
 * Interactive Tooth Component
 * Displays a single tooth with clickable surfaces and visual indicators
 * Enhanced with better visual design and surface interaction
 */

import { type Component, Show, For, createMemo } from 'solid-js';
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

export const ToothComponent: Component<ToothProps> = (props) => {
  const scale = () => props.scale ?? 1;
  const numberingSystem = () => props.numberingSystem ?? 'universal';

  const toothNumber = () => {
    return numberingSystem() === 'fdi' 
      ? props.tooth.position.fdi 
      : props.tooth.position.universal;
  };

  // Determine tooth color based on status and conditions
  const getToothColor = () => {
    if (props.tooth.status === 'missing' || props.tooth.status === 'extracted') {
      return 'rgb(220, 220, 220)'; // Light gray
    }
    if (props.tooth.status === 'unerupted') {
      return 'rgb(240, 240, 255)'; // Very light blue
    }

    // Check for specific conditions
    const hasRCT = props.tooth.conditions.some((c: ToothCondition) => c.type === 'endo');
    const hasImplant = props.tooth.conditions.some((c: ToothCondition) => c.type === 'implant');
    const hasCrown = props.tooth.conditions.some((c: ToothCondition) => c.type === 'crown');
    const hasCaries = props.tooth.conditions.some((c: ToothCondition) => c.type === 'caries');
    
    if (hasImplant) return 'rgb(180, 180, 220)'; // Purple-gray
    if (hasRCT) return 'rgb(255, 220, 220)'; // Light red
    if (hasCrown) return 'rgb(255, 215, 0)'; // Gold
    if (hasCaries) return 'rgb(255, 180, 180)'; // Pink-red
    
    return 'rgb(255, 255, 255)'; // White (healthy)
  };

  // Get surface color based on conditions
  const getSurfaceColor = (surface: ToothSurface): string | null => {
    // Find conditions affecting this surface
    const surfaceConditions = props.tooth.conditions.filter((condition: ToothCondition) => {
      if (condition.type === 'caries' || condition.type === 'restoration' || condition.type === 'fracture') {
        return condition.surfaces.includes(surface);
      }
      return false;
    });

    if (surfaceConditions.length === 0) return null;

    // Priority: restoration > caries > fracture
    const restoration = surfaceConditions.find((c: ToothCondition) => c.type === 'restoration');
    if (restoration) return 'rgb(100, 180, 255)'; // Blue for restorations

    const caries = surfaceConditions.find((c: ToothCondition) => c.type === 'caries');
    if (caries) return 'rgb(255, 100, 100)'; // Red for caries

    const fracture = surfaceConditions.find((c: ToothCondition) => c.type === 'fracture');
    if (fracture) return 'rgb(255, 165, 0)'; // Orange for fractures

    return null;
  };

  const isAnterior = () => {
    return props.tooth.position.type === 'incisor' || props.tooth.position.type === 'canine';
  };

  const handleSurfaceClick = (surface: ToothSurface, e: MouseEvent) => {
    e.stopPropagation();
    props.onSurfaceClick?.(surface);
  };

  return (
    <div
      class="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105"
      style={{ transform: `scale(${scale()})` }}
      onClick={() => props.onClick?.()}
    >
      {/* Tooth Number */}
      <Show when={props.showNumber !== false}>
        <div class="text-xs font-medium text-gray-600 dark:text-gray-400">
          {toothNumber()}
        </div>
      </Show>

      {/* Tooth Visualization */}
      <div
        class="relative"
        classList={{
          'ring-2 ring-blue-500': props.selected,
        }}
      >
        <svg
          width="60"
          height="80"
          viewBox="0 0 60 80"
          class="drop-shadow-sm"
        >
          {/* Main tooth body */}
          <Show when={props.tooth.status !== 'missing' && props.tooth.status !== 'extracted'}>
            {/* Crown portion */}
            <path
              d={isAnterior() 
                ? "M 10 25 Q 10 10, 30 10 Q 50 10, 50 25 L 50 45 Q 50 55, 40 55 L 20 55 Q 10 55, 10 45 Z"
                : "M 5 20 Q 5 5, 30 5 Q 55 5, 55 20 L 55 50 Q 55 60, 45 60 L 15 60 Q 5 60, 5 50 Z"
              }
              fill={getToothColor()}
              stroke="rgb(100, 100, 100)"
              stroke-width="1.5"
            />

            {/* Root portion - only if not implant */}
            <Show when={!props.tooth.conditions.some((c: ToothCondition) => c.type === 'implant')}>
              <path
                d={isAnterior()
                  ? "M 20 55 L 25 75 L 35 75 L 40 55"
                  : "M 15 60 L 20 75 L 40 75 L 45 60"
                }
                fill={getToothColor()}
                stroke="rgb(100, 100, 100)"
                stroke-width="1.5"
              />
            </Show>

            {/* Surface overlays */}
            {/* Mesial */}
            <Show when={getSurfaceColor('mesial')}>
              <rect
                x={isAnterior() ? "10" : "5"}
                y={isAnterior() ? "25" : "20"}
                width="8"
                height="25"
                fill={getSurfaceColor('mesial')!}
                opacity="0.7"
                class="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleSurfaceClick('mesial', e)}
              />
            </Show>

            {/* Distal */}
            <Show when={getSurfaceColor('distal')}>
              <rect
                x={isAnterior() ? "42" : "47"}
                y={isAnterior() ? "25" : "20"}
                width="8"
                height="25"
                fill={getSurfaceColor('distal')!}
                opacity="0.7"
                class="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleSurfaceClick('distal', e)}
              />
            </Show>

            {/* Occlusal/Incisal */}
            <Show when={getSurfaceColor('occlusal') || getSurfaceColor('incisal')}>
              <ellipse
                cx="30"
                cy={isAnterior() ? "18" : "15"}
                rx={isAnterior() ? "18" : "23"}
                ry="8"
                fill={getSurfaceColor(isAnterior() ? 'incisal' : 'occlusal')!}
                opacity="0.7"
                class="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleSurfaceClick(isAnterior() ? 'incisal' : 'occlusal', e)}
              />
            </Show>

            {/* Buccal */}
            <Show when={getSurfaceColor('buccal')}>
              <rect
                x={isAnterior() ? "18" : "13"}
                y={isAnterior() ? "25" : "20"}
                width={isAnterior() ? "24" : "34"}
                height="12"
                fill={getSurfaceColor('buccal')!}
                opacity="0.7"
                class="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleSurfaceClick('buccal', e)}
              />
            </Show>

            {/* Lingual */}
            <Show when={getSurfaceColor('lingual')}>
              <rect
                x={isAnterior() ? "18" : "13"}
                y={isAnterior() ? "38" : "43"}
                width={isAnterior() ? "24" : "34"}
                height="12"
                fill={getSurfaceColor('lingual')!}
                opacity="0.7"
                class="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleSurfaceClick('lingual', e)}
              />
            </Show>
          </Show>

          {/* Missing tooth indicator */}
          <Show when={props.tooth.status === 'missing' || props.tooth.status === 'extracted'}>
            <line x1="15" y1="15" x2="45" y2="65" stroke="rgb(200, 0, 0)" stroke-width="3" />
            <line x1="45" y1="15" x2="15" y2="65" stroke="rgb(200, 0, 0)" stroke-width="3" />
          </Show>

          {/* Condition indicators */}
          {/* RCT indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'endo' && 'stage' in c && c.stage === 'completed')}>
            <line
              x1="30"
              y1={isAnterior() ? "55" : "60"}
              x2="30"
              y2="72"
              stroke="rgb(200, 0, 0)"
              stroke-width="2"
            />
          </Show>

          {/* Implant indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'implant')}>
            <circle cx="30" cy="70" r="3" fill="rgb(100, 100, 200)" />
            <line x1="30" y1="67" x2="30" y2={isAnterior() ? "55" : "60"} stroke="rgb(100, 100, 200)" stroke-width="2" />
          </Show>

          {/* Crown indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'crown')}>
            <path
              d="M 20 12 L 30 5 L 40 12"
              fill="none"
              stroke="rgb(218, 165, 32)"
              stroke-width="2"
            />
          </Show>

          {/* Mobility indicator */}
          <Show when={props.tooth.conditions.some((c: ToothCondition) => c.type === 'perio' && 'mobility' in c && c.mobility > 0)}>
            <text x="50" y="35" font-size="10" fill="red" font-weight="bold">
              M{(() => { const c = props.tooth.conditions.find((c: ToothCondition) => c.type === 'perio'); return c && 'mobility' in c ? c.mobility : ''; })()}
            </text>
          </Show>
        </svg>
      </div>

      {/* Status badge */}
      <Show when={props.tooth.status !== 'healthy'}>
        <div class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {props.tooth.status === 'erupting' && 'Erupting'}
          {props.tooth.status === 'unerupted' && 'Unerupted'}
          {props.tooth.status === 'impacted' && 'Impacted'}
          {props.tooth.status === 'supernumerary' && 'Extra'}
        </div>
      </Show>
    </div>
  );
};
