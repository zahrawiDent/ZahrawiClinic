/**
 * Grid-Based Tooth Component V2
 * Square grid representation with clickable surfaces and unique condition styling
 */

import { createMemo, Show, type Component } from 'solid-js';
import type { Tooth, ToothSurface, ToothCondition } from '../../types/dental-chart';
import { CONDITION_THEMES, type ConditionVisualTheme } from '../../types/dental-chart-v2';

interface ToothGridProps {
  tooth: Tooth;
  onSurfaceClick?: (surface: ToothSurface) => void;
  onWholeToothClick?: () => void;
  selectedSurfaces?: ToothSurface[];
  size?: number; // Grid size in pixels
  showLabel?: boolean;
}

/**
 * Get the visual theme for a condition
 */
function getConditionTheme(condition: ToothCondition): ConditionVisualTheme {
  switch (condition.type) {
    case 'restoration':
      return CONDITION_THEMES[condition.material] || CONDITION_THEMES.composite;
    case 'crown':
      if (condition.material === 'zirconia') return CONDITION_THEMES.crown_zirconia;
      return CONDITION_THEMES.crown_full;
    case 'endo':
      return condition.stage === 'completed' 
        ? CONDITION_THEMES.endo_completed 
        : CONDITION_THEMES.endo;
    case 'caries':
      return CONDITION_THEMES.caries;
    case 'extraction':
      return CONDITION_THEMES.extraction;
    case 'implant':
      return CONDITION_THEMES.implant;
    default:
      return CONDITION_THEMES.composite;
  }
}

/**
 * Get background style based on condition and pattern
 */
function getBackgroundStyle(theme: ConditionVisualTheme): string {
  switch (theme.pattern) {
    case 'gradient':
      return `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
    case 'metallic':
      return `linear-gradient(180deg, ${theme.secondary} 0%, ${theme.primary} 50%, ${theme.secondary} 100%)`;
    case 'striped':
      return `repeating-linear-gradient(45deg, ${theme.primary}, ${theme.primary} 4px, ${theme.secondary} 4px, ${theme.secondary} 8px)`;
    case 'crosshatch':
      return `repeating-linear-gradient(45deg, ${theme.primary} 0, ${theme.primary} 2px, transparent 2px, transparent 4px),
              repeating-linear-gradient(-45deg, ${theme.primary} 0, ${theme.primary} 2px, transparent 2px, transparent 4px)`;
    default:
      return theme.primary;
  }
}

/**
 * Get condition affecting a specific surface
 */
function getSurfaceCondition(tooth: Tooth, surface: ToothSurface): ToothCondition | undefined {
  return tooth.conditions.find(c => 
    'surfaces' in c && c.surfaces.includes(surface)
  );
}

/**
 * Get whole-tooth condition (no surfaces or affects all)
 */
function getWholeToothCondition(tooth: Tooth): ToothCondition | undefined {
  return tooth.conditions.find(c => 
    c.type === 'extraction' || 
    c.type === 'implant' || 
    (c.type === 'crown' && !('surfaces' in c)) ||
    (c.type === 'endo')
  );
}

export const ToothGridV2: Component<ToothGridProps> = (props) => {
  const size = () => props.size || 100;
  const cellSize = () => size() / 3;
  
  // Check if tooth has whole-tooth condition
  const wholeToothCondition = createMemo(() => getWholeToothCondition(props.tooth));
  
  // Check each surface for conditions
  const surfaceConditions = createMemo(() => ({
    mesial: getSurfaceCondition(props.tooth, 'mesial'),
    occlusal: getSurfaceCondition(props.tooth, 'occlusal'),
    incisal: getSurfaceCondition(props.tooth, 'incisal'),
    distal: getSurfaceCondition(props.tooth, 'distal'),
    buccal: getSurfaceCondition(props.tooth, 'buccal'),
    lingual: getSurfaceCondition(props.tooth, 'lingual'),
  }));

  const isAnterior = () => 
    props.tooth.position.type === 'incisor' || 
    props.tooth.position.type === 'canine';

  // Surface click handler
  const handleSurfaceClick = (surface: ToothSurface, e: MouseEvent) => {
    e.stopPropagation();
    props.onSurfaceClick?.(surface);
  };

  // Whole tooth click handler
  const handleWholeToothClick = () => {
    props.onWholeToothClick?.();
  };

  /**
   * Render a grid cell for a surface
   */
  const SurfaceCell: Component<{ 
    surface: ToothSurface; 
    label: string;
    position: { row: number; col: number };
  }> = (cellProps) => {
    const condition = () => surfaceConditions()[cellProps.surface];
    const isSelected = () => props.selectedSurfaces?.includes(cellProps.surface);
    const theme = () => condition() ? getConditionTheme(condition()!) : null;
    
    const cellStyle = () => {
      const baseStyle: Record<string, string> = {
        width: `${cellSize()}px`,
        height: `${cellSize()}px`,
        'grid-row': String(cellProps.position.row),
        'grid-column': String(cellProps.position.col),
      };

      if (theme()) {
        const t = theme()!;
        baseStyle.background = getBackgroundStyle(t);
        baseStyle.color = t.textColor || 'white';
        if (t.border) {
          baseStyle.border = t.border === 'dashed' 
            ? '2px dashed currentColor' 
            : `2px solid ${t.border}`;
        }
      }

      return baseStyle;
    };

    return (
      <button
        class="relative flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all cursor-pointer font-bold text-xs"
        classList={{
          'ring-4 ring-blue-500 ring-inset': isSelected(),
          'bg-gray-50 dark:bg-gray-800': !condition() && !isSelected(),
        }}
        style={cellStyle()}
        onClick={(e) => handleSurfaceClick(cellProps.surface, e)}
        title={cellProps.surface}
      >
        <span class="text-[10px] font-bold opacity-70">
          {cellProps.label}
        </span>
        <Show when={condition()}>
          <span class="absolute top-0 right-0 text-[10px]">
            {theme()?.icon}
          </span>
        </Show>
      </button>
    );
  };

  return (
    <div class="flex flex-col items-center gap-1">
      {/* Tooth Number Label */}
      <Show when={props.showLabel !== false}>
        <div class="text-xs font-bold text-gray-700 dark:text-gray-300">
          {props.tooth.position.universal}
        </div>
      </Show>

      {/* Grid Container */}
      <div 
        class="relative border-2 border-gray-400 dark:border-gray-500 rounded-sm shadow-md"
        style={{ width: `${size()}px`, height: `${size()}px` }}
      >
        {/* Whole Tooth Overlay (for extraction, implant, crown) */}
        <Show when={wholeToothCondition()}>
          {(condition) => {
            const theme = getConditionTheme(condition());
            return (
              <button
                class="absolute inset-0 z-10 flex items-center justify-center text-2xl"
                style={{
                  background: getBackgroundStyle(theme),
                  color: theme.textColor || 'white'
                }}
                onClick={handleWholeToothClick}
                title={`${condition().type} - Click to edit`}
              >
                <span>{theme.icon}</span>
                <Show when={condition().type === 'extraction'}>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-full h-0.5 bg-black transform rotate-45" />
                    <div class="w-full h-0.5 bg-black transform -rotate-45 absolute" />
                  </div>
                </Show>
              </button>
            );
          }}
        </Show>

        {/* Grid Layout: 3x3 */}
        <div 
          class="grid w-full h-full"
          style={{ 
            'grid-template-rows': `repeat(3, ${cellSize()}px)`,
            'grid-template-columns': `repeat(3, ${cellSize()}px)`,
          }}
        >
          {/* Top Row: Distal */}
          <div class="border-b border-gray-300 dark:border-gray-600" style="grid-row: 1; grid-column: 1" />
          <SurfaceCell surface="distal" label="D" position={{ row: 1, col: 2 }} />
          <div class="border-b border-gray-300 dark:border-gray-600" style="grid-row: 1; grid-column: 3" />

          {/* Middle Row: Buccal, Occlusal/Incisal, Lingual */}
          <SurfaceCell 
            surface="buccal" 
            label="B" 
            position={{ row: 2, col: 1 }} 
          />
          <SurfaceCell 
            surface={isAnterior() ? 'incisal' : 'occlusal'} 
            label={isAnterior() ? 'I' : 'O'} 
            position={{ row: 2, col: 2 }} 
          />
          <SurfaceCell 
            surface="lingual" 
            label="L" 
            position={{ row: 2, col: 3 }} 
          />

          {/* Bottom Row: Mesial */}
          <div class="border-t border-gray-300 dark:border-gray-600" style="grid-row: 3; grid-column: 1" />
          <SurfaceCell surface="mesial" label="M" position={{ row: 3, col: 2 }} />
          <div class="border-t border-gray-300 dark:border-gray-600" style="grid-row: 3; grid-column: 3" />
        </div>
      </div>

      {/* Tooth Status Badge */}
      <Show when={props.tooth.status !== 'healthy'}>
        <div class="text-[9px] px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
          {props.tooth.status.replace('_', ' ')}
        </div>
      </Show>
    </div>
  );
};
