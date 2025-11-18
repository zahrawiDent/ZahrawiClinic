import { For, Show } from 'solid-js';

export type HistoryEventCategory = 'operative' | 'prostho' | 'implants' | 'endo' | 'perio' | 'surgery' | 'exam' | 'procedure';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: HistoryEventCategory;
}

const CATEGORY_COLORS: Record<HistoryEventCategory, string> = {
  operative: 'border-sky-400 text-sky-600',
  prostho: 'border-amber-400 text-amber-600',
  implants: 'border-cyan-400 text-cyan-600',
  endo: 'border-purple-400 text-purple-600',
  perio: 'border-emerald-400 text-emerald-600',
  surgery: 'border-rose-400 text-rose-600',
  exam: 'border-slate-400 text-slate-600',
  procedure: 'border-indigo-400 text-indigo-600'
};

interface HistoryTimelineProps {
  events: HistoryEvent[];
}

export function HistoryTimeline(props: HistoryTimelineProps) {
  return (
    <section class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
      <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Continuity</p>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Chairside history</h2>
        </div>
        <span class="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {props.events.length} entries
        </span>
      </header>

      <Show
        when={props.events.length > 0}
        fallback={<p class="mt-6 text-sm text-slate-500">No history captured yet—add findings or exams to populate this stream.</p>}
      >
        <div class="mt-6 space-y-4">
          <For each={props.events}>
            {(event) => (
              <article class="relative rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
                <div class={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_COLORS[event.category]}`}>
                  <span>{event.category}</span>
                  <span>•</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{event.title}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
              </article>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
