import { For, createMemo } from 'solid-js';
import type { Tooth, EruptionStatus, ToothStatus } from '../../types/dental-chart';

interface EruptionBoardProps {
  teeth: Tooth[];
  selectedToothId?: string;
  onSelectTooth: (tooth: Tooth) => void;
  onUpdateEruption: (toothId: string, status: EruptionStatus) => void;
  onUpdateStatus: (toothId: string, status: ToothStatus) => void;
}

const ERUPTION_LABELS: Record<EruptionStatus, { label: string; color: string }> = {
  fully_erupted: { label: 'Erupted', color: 'bg-emerald-500' },
  erupting: { label: 'Erupting', color: 'bg-amber-500' },
  unerupted: { label: 'Planned', color: 'bg-slate-400' }
};

const TOOTH_STATUS_OPTIONS: ToothStatus[] = ['healthy', 'erupting', 'unerupted', 'missing', 'retained_primary'];

export function EruptionBoard(props: EruptionBoardProps) {
  const grouped = createMemo(() => {
    return {
      upper: props.teeth.filter((t) => t.position.arch === 'upper'),
      lower: props.teeth.filter((t) => t.position.arch === 'lower')
    };
  });

  const renderToothCard = (tooth: Tooth) => {
    const eruptionMeta = ERUPTION_LABELS[tooth.eruptionStatus ?? 'unerupted'];
    return (
      <div
        class="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
        classList={{
          'ring-4 ring-blue-500': props.selectedToothId === tooth.id
        }}
      >
        <div class="flex items-baseline justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tooth</p>
            <p class="text-2xl font-semibold text-slate-900 dark:text-white">{tooth.position.universal}</p>
          </div>
          <span class={`rounded-full px-3 py-1 text-xs font-semibold text-white ${eruptionMeta.color}`}>
            {eruptionMeta.label}
          </span>
        </div>

        <div class="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p class="font-semibold text-slate-700 dark:text-slate-200">{tooth.position.type}</p>
          <p>Quadrant {tooth.position.quadrant}</p>
          <p>Conditions: {tooth.conditions.length}</p>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 text-xs">
          <For each={Object.entries(ERUPTION_LABELS)}>
            {([statusKey, meta]) => (
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 font-medium transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700"
                classList={{ 'bg-blue-50 text-blue-700': tooth.eruptionStatus === statusKey }}
                onClick={() => props.onUpdateEruption(tooth.id, statusKey as EruptionStatus)}
              >
                {meta.label}
              </button>
            )}
          </For>
        </div>

        <div class="mt-3 text-xs">
          <label class="block text-slate-500">Status</label>
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-inner focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            value={tooth.status}
            onChange={(event) => props.onUpdateStatus(tooth.id, event.currentTarget.value as ToothStatus)}
          >
            <For each={TOOTH_STATUS_OPTIONS}>
              {(statusOption) => (
                <option value={statusOption}>{statusOption.replace('_', ' ')}</option>
              )}
            </For>
          </select>
        </div>

        <button
          type="button"
          class="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          onClick={() => props.onSelectTooth(tooth)}
        >
          Open Chairside Panel
        </button>
      </div>
    );
  };

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Upper Arch</h2>
        <div class="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <For each={grouped().upper}>{(tooth) => renderToothCard(tooth)}</For>
        </div>
      </div>

      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Lower Arch</h2>
        <div class="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <For each={grouped().lower}>{(tooth) => renderToothCard(tooth)}</For>
        </div>
      </div>
    </div>
  );
}
