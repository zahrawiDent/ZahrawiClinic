import { For, Show, createMemo } from 'solid-js';
import type { Tooth, ToothCondition, ToothSurface } from '../../types/dental-chart';
import { TOOTH_SURFACES } from '../../types/dental-chart';

const SURFACE_RECTS: Record<'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual', { x: number; y: number; width: number; height: number }> = {
  occlusal: { x: 12, y: 6, width: 56, height: 24 },
  mesial: { x: 4, y: 32, width: 18, height: 44 },
  distal: { x: 68, y: 32, width: 18, height: 44 },
  buccal: { x: 12, y: 78, width: 30, height: 18 },
  lingual: { x: 38, y: 78, width: 30, height: 18 }
};

const CONDITION_COLORS = {
  restoration: '#38bdf8',
  caries: '#f97316',
  fracture: '#fbbf24',
  crown: '#c084fc',
  implant: '#0ea5e9'
} satisfies Record<string, string>;

const BADGE_META = {
  endo: { label: 'Endo', className: 'bg-purple-100 text-purple-700' },
  crown: { label: 'Crown', className: 'bg-amber-100 text-amber-700' },
  implant: { label: 'Implant', className: 'bg-cyan-100 text-cyan-700' },
  extraction: { label: 'Extraction', className: 'bg-slate-200 text-slate-700' },
  surgery: { label: 'Surgery', className: 'bg-rose-100 text-rose-700' },
  perio: { label: 'Perio', className: 'bg-emerald-100 text-emerald-700' }
};

const SURFACE_PRIORITY: Record<string, number> = {
  crown: 4,
  restoration: 3,
  caries: 2,
  fracture: 1,
  implant: 1
};

type BadgeKind = keyof typeof BADGE_META;

export type ConditionLayer = 'all' | 'operative' | 'endo' | 'perio' | 'prostho' | 'surgery' | 'implants';

interface FullArchVisualizerProps {
  teeth: Tooth[];
  selectedToothId?: string;
  onSelectTooth: (tooth: Tooth) => void;
  activeLayer: ConditionLayer;
}

export function FullArchVisualizer(props: FullArchVisualizerProps) {
  const grouped = createMemo(() => {
    const sorted = [...props.teeth].sort((a, b) => a.position.fdi - b.position.fdi);
    return {
      upper: sorted.filter((tooth) => tooth.position.arch === 'upper'),
      lower: sorted.filter((tooth) => tooth.position.arch === 'lower')
    };
  });

  return (
    <section class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <header class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Arch visualizer</p>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Full-mouth canvas</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Tap any tooth to drive the chairside composer. Surface fills indicate operative findings, badges track specialty work.
          </p>
        </div>
        <Legend />
      </header>

      <div class="mt-6 space-y-8">
        <ArchRow
          label="Upper arch"
          teeth={grouped().upper}
          selectedToothId={props.selectedToothId}
          onSelectTooth={props.onSelectTooth}
          activeLayer={props.activeLayer}
        />
        <ArchRow
          label="Lower arch"
          teeth={grouped().lower}
          selectedToothId={props.selectedToothId}
          onSelectTooth={props.onSelectTooth}
          activeLayer={props.activeLayer}
        />
      </div>
    </section>
  );
}

interface ArchRowProps {
  label: string;
  teeth: Tooth[];
  selectedToothId?: string;
  onSelectTooth: (tooth: Tooth) => void;
  activeLayer: ConditionLayer;
}

function ArchRow(props: ArchRowProps) {
  return (
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">{props.label}</h3>
        <span class="text-xs uppercase tracking-wider text-slate-400">{props.teeth.length} teeth</span>
      </div>
      <div class="grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-16">
        <For each={props.teeth}>
          {(tooth) => (
            <ToothGlyph
              tooth={tooth}
              isSelected={props.selectedToothId === tooth.id}
              onSelect={() => props.onSelectTooth(tooth)}
              activeLayer={props.activeLayer}
            />
          )}
        </For>
      </div>
    </div>
  );
}

interface ToothGlyphProps {
  tooth: Tooth;
  isSelected: boolean;
  onSelect: () => void;
  activeLayer: ConditionLayer;
}

function ToothGlyph(props: ToothGlyphProps) {
  const surfaceMap = createMemo(() => deriveSurfaceMap(props.tooth, props.activeLayer));
  const badges = createMemo(() => deriveBadges(props.tooth, props.activeLayer));
  const isMissing = () => props.tooth.status === 'missing' || props.tooth.status === 'extracted';
  const hasExtractionPlan = () => badges().some((badge) => badge.kind === 'extraction');
  const hasEndo = () => badges().some((badge) => badge.kind === 'endo');
  const hasCrown = () => badges().some((badge) => badge.kind === 'crown');
  const hasImplant = () => badges().some((badge) => badge.kind === 'implant');
  const hasLayerMatch = () => props.activeLayer === 'all' || badges().length > 0 || Object.keys(surfaceMap()).length > 0;
  const shouldDim = () => props.activeLayer !== 'all' && !hasLayerMatch();
  const baseFill = () => {
    if (props.activeLayer === 'implants' && hasImplant()) return '#bae6fd';
    if (hasCrown()) return '#fde68a';
    return '#f8fafc';
  };

  return (
    <button
      type="button"
      class="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
      classList={{ 'ring-4 ring-blue-500': props.isSelected }}
      style={{ opacity: shouldDim() ? 0.45 : 1 }}
      onClick={props.onSelect}
    >
      <div class="relative">
        <svg width="90" height="110" viewBox="0 0 90 110" class="drop-shadow">
          <rect x="8" y="4" width="74" height="100" rx="18" fill={baseFill()} stroke="#cbd5f5" stroke-width="1.5" />
          <For each={Object.entries(SURFACE_RECTS)}>
            {([surfaceKey, rect]) => (
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx={4}
                fill={surfaceMap()[surfaceKey as keyof typeof SURFACE_RECTS] ?? '#e2e8f0'}
                stroke="#cbd5f5"
                stroke-width="1"
              />
            )}
          </For>
          <Show when={hasEndo()}>
            <path d="M45 32 L45 80" stroke="#a855f7" stroke-width="4" stroke-linecap="round" />
          </Show>
          <Show when={hasExtractionPlan() || isMissing()}>
            <line x1="10" y1="10" x2="80" y2="100" stroke="#475569" stroke-width="3" stroke-dasharray="6 6" />
            <line x1="80" y1="10" x2="10" y2="100" stroke="#475569" stroke-width="3" stroke-dasharray="6 6" />
          </Show>
        </svg>
        <span class="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
          {props.tooth.position.universal}
        </span>
        <span class="absolute right-2 top-2 rounded-full bg-white/90 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow">
          {props.tooth.position.type}
        </span>
      </div>
      <div class="flex flex-wrap justify-center gap-1">
        <Show when={isMissing()}>
          <span class="rounded-full bg-slate-200 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Missing
          </span>
        </Show>
        <For each={badges()}>
          {(badge) => (
            <span class={`rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </For>
      </div>
    </button>
  );
}

type SurfaceMap = Partial<Record<keyof typeof SURFACE_RECTS, string>>;

function deriveSurfaceMap(tooth: Tooth, layer: ConditionLayer): SurfaceMap {
  const map: SurfaceMap = {};
  const priority: Partial<Record<keyof typeof SURFACE_RECTS, number>> = {};

  const applyColor = (surfaces: ToothSurface[] | undefined, colorKey: keyof typeof CONDITION_COLORS) => {
    if (!surfaces) return;
    const color = CONDITION_COLORS[colorKey];
    const prio = SURFACE_PRIORITY[colorKey];
    surfaces.forEach((surface) => {
      const normalized = normalizeSurface(surface);
      if (!normalized) return;
      if (!priority[normalized] || (prio && priority[normalized]! <= prio)) {
        map[normalized] = color;
        if (prio) priority[normalized] = prio;
      }
    });
  };

  tooth.conditions.forEach((condition) => {
    if (!conditionMatchesLayer(condition, layer)) return;
    switch (condition.type) {
      case 'restoration':
        applyColor(condition.surfaces, 'restoration');
        break;
      case 'caries':
        applyColor(condition.surfaces, 'caries');
        break;
      case 'fracture':
        applyColor(condition.surfaces, 'fracture');
        break;
      case 'crown':
        applyColor(TOOTH_SURFACES, 'crown');
        break;
      default:
        break;
    }
  });

  return map;
}

interface BadgeData {
  label: string;
  className: string;
  kind: BadgeKind;
}

function deriveBadges(tooth: Tooth, layer: ConditionLayer): BadgeData[] {
  const badgeMap = new Map<BadgeKind, BadgeData>();

  const addBadge = (kind: BadgeKind) => {
    if (badgeMap.has(kind)) return;
    const meta = BADGE_META[kind];
    badgeMap.set(kind, { ...meta, kind });
  };

  tooth.conditions.forEach((condition) => {
    if (!conditionMatchesLayer(condition, layer)) return;
    switch (condition.type) {
      case 'endo':
        addBadge('endo');
        break;
      case 'crown':
        addBadge('crown');
        break;
      case 'implant':
        addBadge('implant');
        break;
      case 'extraction':
        addBadge('extraction');
        break;
      case 'surgery':
        addBadge('surgery');
        break;
      case 'perio':
        addBadge('perio');
        break;
      default:
        break;
    }
  });

  if (tooth.status === 'missing' || tooth.status === 'extracted') {
    if (layer === 'all' || layer === 'surgery') {
      addBadge('extraction');
    }
  }

  return Array.from(badgeMap.values());
}

function normalizeSurface(surface: ToothSurface | undefined): keyof typeof SURFACE_RECTS | undefined {
  if (!surface) return undefined;
  if (surface === 'incisal') return 'occlusal';
  if (surface in SURFACE_RECTS) return surface as keyof typeof SURFACE_RECTS;
  return undefined;
}

function conditionMatchesLayer(condition: ToothCondition, layer: ConditionLayer): boolean {
  if (layer === 'all') return true;
  switch (condition.type) {
    case 'caries':
    case 'restoration':
    case 'fracture':
      return layer === 'operative';
    case 'endo':
      return layer === 'endo';
    case 'perio':
      return layer === 'perio';
    case 'crown':
      return layer === 'prostho';
    case 'implant':
      return layer === 'implants';
    case 'extraction':
    case 'impaction':
    case 'surgery':
      return layer === 'surgery';
    default:
      return false;
  }
}

function Legend() {
  const items = [
    { label: 'Composite/Restoration', color: CONDITION_COLORS.restoration },
    { label: "Caries/Watch", color: CONDITION_COLORS.caries },
    { label: 'Fracture', color: CONDITION_COLORS.fracture },
    { label: 'Full coverage', color: CONDITION_COLORS.crown },
    { label: 'Endo / Implant / Surgery badges', color: '#94a3b8' }
  ];

  return (
    <div class="flex flex-wrap gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900">
      <For each={items}>
        {(item) => (
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full" style={{ background: item.color }} />
            <span>{item.label}</span>
          </div>
        )}
      </For>
    </div>
  );
}
