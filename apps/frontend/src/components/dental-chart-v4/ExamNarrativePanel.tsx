import { For } from 'solid-js';

interface ExamNarrativePanelProps {
  clinicalFindings: string[];
  radiographicFindings: string[];
  narrative: string;
  onToggleFinding: (section: 'clinical' | 'radiographic', finding: string) => void;
  onNarrativeChange: (value: string) => void;
  onCommit: () => void;
}

const CLINICAL_PRESETS = ['Generalized plaque', 'Localized bleeding', 'White spot lesions', 'Attrition facets', 'Abfraction', 'Mobility Grade 2'];
const RADIO_PRESETS = ['Periapical radiolucency', 'Horizontal bone loss', 'Vertical defect', 'Impacted third molar', 'Open margins'];

export function ExamNarrativePanel(props: ExamNarrativePanelProps) {
  return (
    <div class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Exam narratives</p>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Clinical & radiographic impressions</h3>
      </header>

      <section class="mt-4 space-y-3">
        <SectionChips
          title="Clinical cues"
          presets={CLINICAL_PRESETS}
          selected={props.clinicalFindings}
          onToggle={(finding) => props.onToggleFinding('clinical', finding)}
        />
        <SectionChips
          title="Radiographic cues"
          presets={RADIO_PRESETS}
          selected={props.radiographicFindings}
          onToggle={(finding) => props.onToggleFinding('radiographic', finding)}
        />
      </section>

      <textarea
        class="mt-4 w-full rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm shadow-inner focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        rows={4}
        placeholder="Synthesize the current exam..."
        value={props.narrative}
        onInput={(event) => props.onNarrativeChange(event.currentTarget.value)}
      />

      <button
        type="button"
        class="mt-4 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 py-2 text-sm font-semibold text-white shadow-lg"
        onClick={props.onCommit}
      >
        Log exam to history
      </button>
    </div>
  );
}

interface SectionChipsProps {
  title: string;
  presets: string[];
  selected: string[];
  onToggle: (finding: string) => void;
}

function SectionChips(props: SectionChipsProps) {
  return (
    <div>
      <p class="text-xs uppercase tracking-wide text-slate-500">{props.title}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <For each={props.presets}>
          {(preset) => (
            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition dark:border-slate-700"
              classList={{ 'bg-blue-600 text-white shadow': props.selected.includes(preset) }}
              onClick={() => props.onToggle(preset)}
            >
              {preset}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
