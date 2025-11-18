import { For } from 'solid-js';
import type { ConditionLayer } from './FullArchVisualizer';

interface ConditionLayerPanelProps {
  activeLayer: ConditionLayer;
  summary: Record<ConditionLayer, number>;
  onLayerChange: (layer: ConditionLayer) => void;
}

const LAYERS: Array<{ key: ConditionLayer; label: string; description: string; accent: string }> = [
  { key: 'all', label: 'All findings', description: 'Show every condition simultaneously', accent: 'from-slate-200 to-slate-100' },
  { key: 'operative', label: 'Operative', description: 'Caries, restorations, fractures', accent: 'from-sky-200 to-blue-200' },
  { key: 'prostho', label: 'Prostho', description: 'Crowns, bridges, veneers', accent: 'from-amber-200 to-orange-200' },
  { key: 'implants', label: 'Implants', description: 'Fixture and restoration status', accent: 'from-cyan-200 to-blue-200' },
  { key: 'endo', label: 'Endo', description: 'Root canals & pulpal stages', accent: 'from-purple-200 to-indigo-200' },
  { key: 'perio', label: 'Perio', description: 'Mobility, CAL, perio notes', accent: 'from-emerald-200 to-teal-200' },
  { key: 'surgery', label: 'Surgery', description: 'Extractions, surgeries, impactions', accent: 'from-rose-200 to-pink-200' }
];

export function ConditionLayerPanel(props: ConditionLayerPanelProps) {
  return (
    <div class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
      <header class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Layer controls</p>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">Focus on a specialty lane</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Toggle the arch to surface only the discipline you are charting. Counts update in real time.</p>
      </header>
      <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <For each={LAYERS}>
          {(layer) => (
            <button
              type="button"
              class="relative overflow-hidden rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-700"
              classList={{ 'ring-4 ring-blue-500': props.activeLayer === layer.key }}
              onClick={() => props.onLayerChange(layer.key)}
            >
              <div class={`absolute inset-0 opacity-60 bg-gradient-to-br ${layer.accent}`} />
              <div class="relative space-y-1">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300">{layer.label}</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">{props.summary[layer.key] ?? 0} findings</p>
                <p class="text-xs text-slate-600 dark:text-slate-400">{layer.description}</p>
              </div>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
