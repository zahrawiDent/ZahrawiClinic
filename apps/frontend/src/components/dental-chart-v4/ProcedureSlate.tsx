import { For, Show } from 'solid-js';
import type { Procedure, ProcedureStatus } from '../../types/dental-chart';

interface ProcedureSlateProps {
  procedures: Procedure[];
  onUpdateStatus: (procedureId: string, status: ProcedureStatus) => void;
}

const STATUS_COLORS: Record<ProcedureStatus, string> = {
  planned: 'bg-slate-200 text-slate-800',
  in_progress: 'bg-amber-200 text-amber-800',
  completed: 'bg-emerald-200 text-emerald-800',
  cancelled: 'bg-rose-200 text-rose-800'
};

export function ProcedureSlate(props: ProcedureSlateProps) {
  return (
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-baseline justify-between">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Treatment Plan</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Track interdisciplinary procedures</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {props.procedures.length} entries
        </span>
      </div>

      <Show when={props.procedures.length > 0} fallback={<p class="mt-4 text-sm text-slate-500">No procedures yet. Use the composer to add one.</p>}>
        <div class="mt-4 space-y-3">
          <For each={props.procedures}>
            {(procedure) => (
              <div class="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-400 dark:border-slate-700">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">{procedure.category}</p>
                    <p class="text-lg font-bold text-slate-900 dark:text-white">{procedure.name}</p>
                    <p class="text-xs text-slate-500">
                      Teeth: {procedure.toothIds.join(', ') || '—'}
                    </p>
                  </div>
                  <select
                    class={`rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide dark:border-slate-600 ${STATUS_COLORS[procedure.status]}`}
                    value={procedure.status}
                    onChange={(event) => props.onUpdateStatus(procedure.id, event.currentTarget.value as ProcedureStatus)}
                  >
                    <For each={Object.keys(STATUS_COLORS) as ProcedureStatus[]}>
                      {(statusKey) => (
                        <option value={statusKey}>{statusKey.replace('_', ' ')}</option>
                      )}
                    </For>
                  </select>
                </div>
                <Show when={procedure.notes}>
                  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{procedure.notes}</p>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
