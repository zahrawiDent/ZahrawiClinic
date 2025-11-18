import { For } from 'solid-js';
import type { DentitionType } from '../../types/dental-chart';
import type { StageMetrics } from '../../lib/dental/chart-v4-presets';

const STAGE_META: Record<DentitionType, { label: string; description: string; accent: string }> = {
  primary: {
    label: 'Primary Dentition',
    description: '20 teeth • eruption tracking for pediatric patients',
    accent: 'from-amber-200 to-orange-300'
  },
  mixed: {
    label: 'Mixed Dentition',
    description: 'Monitor transitional stages and retained primaries',
    accent: 'from-pink-200 to-purple-300'
  },
  permanent: {
    label: 'Permanent Dentition',
    description: 'Full adult dentition with comprehensive specialties',
    accent: 'from-blue-200 to-indigo-300'
  }
};

interface StageSelectorProps {
  currentStage: DentitionType;
  stats: Record<DentitionType, StageMetrics>;
  onSelect: (stage: DentitionType) => void;
}

export function StageSelector(props: StageSelectorProps) {
  return (
    <div class="grid gap-4 md:grid-cols-3">
      <For each={Object.keys(STAGE_META) as DentitionType[]}>
        {(stage) => {
          const isActive = () => props.currentStage === stage;
          const meta = STAGE_META[stage];
          const stageStats = props.stats[stage];
          return (
            <button
              type="button"
              class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
              classList={{
                'ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900': isActive()
              }}
              onClick={() => props.onSelect(stage)}
            >
              <div class={`absolute inset-0 opacity-70 bg-gradient-to-br ${meta.accent}`} />
              <div class="relative space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  {isActive() ? 'Active Stage' : 'Stage'}
                </p>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">{meta.label}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-300">{meta.description}</p>
                <div class="grid grid-cols-3 gap-2 text-xs">
                  <div class="rounded-lg bg-white/70 p-2 text-center font-semibold text-emerald-600 shadow-sm dark:bg-slate-800/70">
                    <p>Fully</p>
                    <p class="text-lg">{stageStats?.erupted ?? 0}</p>
                  </div>
                  <div class="rounded-lg bg-white/70 p-2 text-center font-semibold text-amber-600 shadow-sm dark:bg-slate-800/70">
                    <p>Erupting</p>
                    <p class="text-lg">{stageStats?.erupting ?? 0}</p>
                  </div>
                  <div class="rounded-lg bg-white/70 p-2 text-center font-semibold text-slate-600 shadow-sm dark:bg-slate-800/70">
                    <p>Future</p>
                    <p class="text-lg">{stageStats?.unerupted ?? 0}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        }}
      </For>
    </div>
  );
}
