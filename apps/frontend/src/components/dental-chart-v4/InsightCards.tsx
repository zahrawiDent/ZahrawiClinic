import { For, Show } from 'solid-js';
import type { StageMetrics } from '../../lib/dental/chart-v4-presets';

interface InsightCardsProps {
  eruption: StageMetrics;
  conditionSummary: Record<'operative' | 'prostho' | 'endo' | 'perio' | 'surgery' | 'implants', number>;
  cues: string[];
}

const CARD_META = [
  { key: 'operative', label: 'Operative', color: 'from-sky-400 to-blue-500' },
  { key: 'prostho', label: 'Prostho', color: 'from-amber-400 to-orange-500' },
  { key: 'endo', label: 'Endodontics', color: 'from-purple-400 to-indigo-500' },
  { key: 'perio', label: 'Periodontics', color: 'from-emerald-400 to-teal-500' },
  { key: 'surgery', label: 'Surgery', color: 'from-rose-400 to-pink-500' },
  { key: 'implants', label: 'Implants', color: 'from-cyan-400 to-blue-500' }
] as const;

export function InsightCards(props: InsightCardsProps) {
  return (
    <div class="space-y-6">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-xl">
          <p class="text-xs uppercase tracking-wide text-white/70">Eruption overview</p>
          <p class="mt-2 text-4xl font-black">{props.eruption.erupted}/{props.eruption.total}</p>
          <p class="text-sm text-white/80">Fully erupted teeth</p>
          <div class="mt-4 space-y-2 text-sm">
            <p>Erupting: {props.eruption.erupting}</p>
            <p>Planned: {props.eruption.unerupted}</p>
          </div>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500">Clinical cues</p>
          <Show when={props.cues.length > 0} fallback={<p class="mt-3 text-sm text-slate-500">Add conditions to see generated cues.</p>}>
            <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <For each={props.cues}>{(cue) => <li>{cue}</li>}</For>
            </ul>
          </Show>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500">Momentum</p>
          <p class="mt-2 text-4xl font-black text-blue-600 dark:text-blue-400">
            {Object.values(props.conditionSummary).reduce((sum, value) => sum + value, 0)}
          </p>
          <p class="text-sm text-slate-500">Active findings</p>
        </div>
      </div>

  <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <For each={CARD_META}>
          {(card) => (
            <div class={`rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white shadow-lg`}>
              <p class="text-xs uppercase tracking-wide text-white/70">{card.label}</p>
              <p class="mt-2 text-3xl font-black">{props.conditionSummary[card.key]}</p>
              <p class="text-sm text-white/80">conditions</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
