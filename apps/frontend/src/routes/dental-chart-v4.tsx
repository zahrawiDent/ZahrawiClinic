import { createMemo, createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createFileRoute } from '@tanstack/solid-router';

import type {
  DentitionType,
  Tooth,
  ToothCondition,
  Procedure,
  ProcedureStatus
} from '../types/dental-chart';
import { StageSelector } from '../components/dental-chart-v4/StageSelector';
import { EruptionBoard } from '../components/dental-chart-v4/EruptionBoard';
import { SpecialtyComposer } from '../components/dental-chart-v4/SpecialtyComposer';
import { ProcedureSlate } from '../components/dental-chart-v4/ProcedureSlate';
import { InsightCards } from '../components/dental-chart-v4/InsightCards';
import { FullArchVisualizer } from '../components/dental-chart-v4/FullArchVisualizer';
import { calculateStageMetrics, createDentitionStages } from '../lib/dental/chart-v4-presets';

export const Route = createFileRoute('/dental-chart-v4')({
  component: DentalChartV4
});

function DentalChartV4() {
  const [teethMap, setTeethMap] = createStore<Record<DentitionType, Tooth[]>>(createDentitionStages());
  const [currentStage, setCurrentStage] = createSignal<DentitionType>('permanent');
  const [selectedToothId, setSelectedToothId] = createSignal<string>();
  const [procedures, setProcedures] = createStore<Procedure[]>([]);

  const selectedStageTeeth = createMemo(() => teethMap[currentStage()]);

  const selectedTooth = createMemo(() =>
    selectedStageTeeth().find((tooth) => tooth.id === selectedToothId()) ?? null
  );

  const stageMetrics = createMemo(() => ({
    primary: calculateStageMetrics(teethMap.primary),
    mixed: calculateStageMetrics(teethMap.mixed),
    permanent: calculateStageMetrics(teethMap.permanent)
  }));

  const conditionSummary = createMemo(() => {
    const summary = {
      operative: 0,
      fixed: 0,
      endo: 0,
      perio: 0,
      surgery: 0
    } as Record<'operative' | 'fixed' | 'endo' | 'perio' | 'surgery', number>;

    selectedStageTeeth().forEach((tooth) => {
      tooth.conditions.forEach((condition) => {
        switch (condition.type) {
          case 'caries':
          case 'restoration':
          case 'fracture':
            summary.operative += 1;
            break;
          case 'crown':
          case 'implant':
            summary.fixed += 1;
            break;
          case 'endo':
            summary.endo += 1;
            break;
          case 'perio':
            summary.perio += 1;
            break;
          case 'extraction':
          case 'impaction':
          case 'surgery':
            summary.surgery += 1;
            break;
          default:
            summary.operative += 1;
        }
      });
    });

    return summary;
  });

  const cues = createMemo(() => {
    const list: string[] = [];
    if (conditionSummary().endo > 0) {
      list.push('Review obturation lengths before completing RCT cases.');
    }
    if (conditionSummary().perio > 0) {
      list.push('Schedule a comprehensive perio charting session.');
    }
    if (stageMetrics()[currentStage()].unerupted > 0) {
      list.push('Monitor eruption timing for pending teeth.');
    }
    if (conditionSummary().surgery > 0) {
      list.push('Coordinate surgical guide and consent forms.');
    }
    return list;
  });

  const handleSelectTooth = (tooth: Tooth) => {
    setSelectedToothId(tooth.id);
  };

  const handleStageChange = (stage: DentitionType) => {
    setCurrentStage(stage);
    setSelectedToothId(undefined);
  };

  const handleEruptionUpdate = (toothId: string, status: Tooth['eruptionStatus']) => {
    const stage = currentStage();
    const index = teethMap[stage].findIndex((tooth) => tooth.id === toothId);
    if (index === -1) return;
    setTeethMap(stage, index, 'eruptionStatus', status);
  };

  const handleStatusUpdate = (toothId: string, status: Tooth['status']) => {
    const stage = currentStage();
    const index = teethMap[stage].findIndex((tooth) => tooth.id === toothId);
    if (index === -1) return;
    setTeethMap(stage, index, 'status', status);
  };

  const handleConditionAdd = (condition: ToothCondition) => {
    const stage = currentStage();
    const index = teethMap[stage].findIndex((tooth) => tooth.id === selectedToothId());
    if (index === -1) return;
    setTeethMap(stage, index, 'conditions', (conditions) => [...conditions, condition]);
    setTeethMap(stage, index, 'lastModified', new Date().toISOString());
  };

  const handleProcedureAdd = (draft: {
    category: Procedure['category'];
    name: string;
    status: ProcedureStatus;
    notes?: string;
  }) => {
    const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const newProcedure: Procedure = {
      id,
      toothIds: selectedToothId() ? [selectedToothId()!] : [],
      category: draft.category,
      name: draft.name,
      description: draft.notes,
      status: draft.status,
      notes: draft.notes
    };

    setProcedures((current) => [...current, newProcedure]);
  };

  const handleProcedureStatusChange = (procedureId: string, status: ProcedureStatus) => {
    const index = procedures.findIndex((procedure) => procedure.id === procedureId);
    if (index === -1) return;
    setProcedures(index, 'status', status);
  };

  return (
    <div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div class="mx-auto flex max-w-[1800px] flex-col gap-8">
        <header class="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Dental Chart v4</p>
          <h1 class="mt-2 text-4xl font-black text-slate-900 dark:text-white">
            Comprehensive eruption intelligence + full specialty command center
          </h1>
          <p class="mt-3 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Stage-aware odontogram, chairside composer, and treatment board designed for multi-specialty clinics. Switch between dentition stages, capture complex findings, and plan procedures in seconds.
          </p>
        </header>

        <StageSelector
          currentStage={currentStage()}
          stats={stageMetrics()}
          onSelect={handleStageChange}
        />

        <FullArchVisualizer
          teeth={selectedStageTeeth()}
          selectedToothId={selectedToothId()}
          onSelectTooth={handleSelectTooth}
        />

        <InsightCards
          eruption={stageMetrics()[currentStage()]}
          conditionSummary={conditionSummary()}
          cues={cues()}
        />

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <EruptionBoard
            teeth={selectedStageTeeth()}
            selectedToothId={selectedToothId()}
            onSelectTooth={handleSelectTooth}
            onUpdateEruption={handleEruptionUpdate}
            onUpdateStatus={handleStatusUpdate}
          />

          <div class="space-y-6">
            <SpecialtyComposer
              selectedTooth={selectedTooth()}
              onAddCondition={handleConditionAdd}
              onScheduleProcedure={handleProcedureAdd}
            />
            <ProcedureSlate
              procedures={procedures}
              onUpdateStatus={handleProcedureStatusChange}
            />
          </div>
        </div>

        <Show when={selectedTooth()}>
          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
              History for #{selectedTooth()?.position.universal}
            </h2>
            <p class="text-sm text-slate-500">
              {selectedTooth()?.conditions.length || 0} recorded conditions • Last updated {new Date(selectedTooth()!.lastModified).toLocaleDateString()}
            </p>
            <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {selectedTooth()?.conditions.map((condition) => (
                <div class="rounded-2xl border border-slate-200 p-4 text-sm shadow-sm dark:border-slate-700">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{condition.type}</p>
                  <p class="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {'surfaces' in condition && condition.surfaces ? condition.surfaces.join(', ') : 'Specialty record'}
                  </p>
                  <p class="text-xs text-slate-500">
                    {condition.notes ?? 'Chairside capture'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Show>
      </div>
    </div>
  );
}
