import { For } from 'solid-js';
import type { DentitionType } from '../../types/dental-chart';

interface PatientSnapshotProps {
  stage: DentitionType;
  riskLevel: 'low' | 'moderate' | 'high';
  missingTeeth: number;
  treatedTeeth: number;
  highlights: string[];
  alerts: string[];
}

const RISK_COLORS: Record<'low' | 'moderate' | 'high', string> = {
  low: 'from-emerald-400 to-green-500',
  moderate: 'from-amber-400 to-orange-500',
  high: 'from-rose-500 to-red-600'
};

export function PatientSnapshot(props: PatientSnapshotProps) {
  return (
    <div class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Patient snapshot</p>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">{props.stage} dentition overview</h2>
        </div>
        <div class={`rounded-2xl bg-gradient-to-br ${RISK_COLORS[props.riskLevel]} px-6 py-3 text-white shadow-lg`}>
          <p class="text-xs uppercase tracking-widest text-white/70">Risk tier</p>
          <p class="text-2xl font-black capitalize">{props.riskLevel}</p>
        </div>
      </header>

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <Metric label="Missing" value={props.missingTeeth.toString()} description="documented teeth" />
        <Metric label="Documented" value={props.treatedTeeth.toString()} description="conditions on record" />
        <Metric label="Alerts" value={props.alerts.length.toString()} description="clinical flags" />
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <Panel title="Key story" items={props.highlights} empty="Chart findings will auto-summarize as you work." />
        <Panel title="Action alerts" items={props.alerts} empty="No alerts generated yet." />
      </div>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
  description: string;
}

function Metric(props: MetricProps) {
  return (
    <div class="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900/60">
      <p class="text-xs uppercase tracking-wide text-slate-400">{props.label}</p>
      <p class="mt-1 text-3xl font-black text-slate-900 dark:text-white">{props.value}</p>
      <p class="text-xs text-slate-500">{props.description}</p>
    </div>
  );
}

interface PanelProps {
  title: string;
  items: string[];
  empty: string;
}

function Panel(props: PanelProps) {
  return (
    <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <p class="text-xs uppercase tracking-wide text-slate-500">{props.title}</p>
      {props.items.length > 0 ? (
        <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <For each={props.items}>{(item) => <li>{item}</li>}</For>
        </ul>
      ) : (
        <p class="mt-3 text-sm text-slate-500">{props.empty}</p>
      )}
    </div>
  );
}
