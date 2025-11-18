import { For, Show, createSignal } from 'solid-js';
import type {
  Tooth,
  ToothCondition,
  ToothSurface,
  RestorationMaterial,
  RCTStage,
  ProcedureCategory,
  ProcedureStatus,
  PulpDiagnosis,
  PeriapicalDiagnosis,
  MobilityGrade,
  ICDASCode,
  FurcationGrade
} from '../../types/dental-chart';
import { TOOTH_SURFACES } from '../../types/dental-chart';

interface SpecialtyComposerProps {
  selectedTooth: Tooth | null;
  onAddCondition: (condition: ToothCondition) => void;
  onScheduleProcedure: (draft: {
    category: ProcedureCategory;
    name: string;
    status: ProcedureStatus;
    notes?: string;
  }) => void;
}

type SpecialtyTab = 'operative' | 'fixed' | 'endo' | 'perio' | 'surgery';

const TAB_CONFIG: Record<SpecialtyTab, { label: string; description: string; category: ProcedureCategory }> = {
  operative: { label: 'Operative', description: 'Caries, restorations, fractures', category: 'operative' },
  fixed: { label: 'Fixed / Prostho', description: 'Crowns, bridges, implants', category: 'prosth' },
  endo: { label: 'Endodontics', description: 'Pulpal diagnosis & RCT stages', category: 'endo' },
  perio: { label: 'Periodontics', description: 'Mobility, furcation, CAL', category: 'perio' },
  surgery: { label: 'Surgery', description: 'Extractions, apicoectomies, grafting', category: 'surgery' }
};

const MATERIALS: RestorationMaterial[] = ['composite', 'amalgam', 'gic', 'rmgic', 'porcelain', 'zirconia', 'gold'];
const RCT_STAGES: RCTStage[] = ['indicated', 'access', 'instrumentation', 'obturation', 'completed'];
const PULP_DIAGNOSIS: PulpDiagnosis[] = ['normal', 'reversible_pulpitis', 'irreversible_pulpitis', 'necrotic', 'previously_treated'];
const PERIAPICAL: PeriapicalDiagnosis[] = ['normal', 'symptomatic_apical_periodontitis', 'asymptomatic_apical_periodontitis', 'acute_apical_abscess', 'chronic_apical_abscess'];
const MOBILITY: MobilityGrade[] = [0, 1, 2, 3];
const ISOLATION_OPTIONS = ['rubber_dam', 'isovac', 'cotton_roll', 'dry_field'];
const OPERATIVE_FLAGS = ['Recurrent decay', 'Open margin', 'Hypersensitive', 'Non-carious cervical', 'Secondary caries'];
const PROSTHO_SHADES = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1'];
const PROSTHO_MARGINS = ['deep_chamfer', 'shoulder', 'feather_edge'];
const PONTIC_DESIGNS = ['ovate', 'modified ridge lap', 'sanitary'];
const IMPLANT_SITE_OPTIONS = ['ideal', 'limited', 'compromised'];
const ENDO_SYMPTOMS = ['Spontaneous pain', 'Lingering cold', 'Percussion sensitive', 'Palpation sensitive', 'Swelling'];
const ENDO_IRRIGANTS = ['NaOCl', 'CHX', 'EDTA'];
const ENDO_OBTURATION = ['GP + sealer', 'Warm vertical', 'Carrier based'];
const PERIO_BLEEDING_SITES = ['MB', 'B', 'DB', 'ML', 'L', 'DL'];
const SEDATION_OPTIONS = ['local', 'nitrous', 'oral', 'iv'];
const FLAP_OPTIONS = ['envelope', 'triangular', 'papilla preservation'];
const GRAFT_OPTIONS = ['none', 'allograft', 'autograft', 'xenograft', 'membrane'];

export function SpecialtyComposer(props: SpecialtyComposerProps) {
  const [activeTab, setActiveTab] = createSignal<SpecialtyTab>('operative');
  const [selectedSurfaces, setSelectedSurfaces] = createSignal<ToothSurface[]>([]);
  const [material, setMaterial] = createSignal<RestorationMaterial>('composite');
  const [cariesSeverity, setCariesSeverity] = createSignal<'early' | 'moderate' | 'advanced'>('moderate');
  const [operativeType, setOperativeType] = createSignal<'caries' | 'restoration' | 'fracture'>('caries');
  const [operativeIsolation, setOperativeIsolation] = createSignal<string>('rubber_dam');
  const [operativeIcdas, setOperativeIcdas] = createSignal<ICDASCode>(2);
  const [operativeFlags, setOperativeFlags] = createSignal<string[]>([]);

  const [prosthoType, setProsthoType] = createSignal<'crown' | 'implant'>('crown');
  const [crownStyle, setCrownStyle] = createSignal<'full_crown' | 'onlay' | 'inlay'>('full_crown');
  const [prosthoShade, setProsthoShade] = createSignal<string>('A2');
  const [prosthoMarginStyle, setProsthoMarginStyle] = createSignal<string>('deep_chamfer');
  const [ponticDesign, setPonticDesign] = createSignal<string>('ovate');
  const [implantSiteQuality, setImplantSiteQuality] = createSignal<string>('ideal');
  const [implantHealingTimeline, setImplantHealingTimeline] = createSignal<string>('8 weeks');

  const [endoStage, setEndoStage] = createSignal<RCTStage>('indicated');
  const [pulpDx, setPulpDx] = createSignal<PulpDiagnosis>('irreversible_pulpitis');
  const [periapicalDx, setPeriapicalDx] = createSignal<PeriapicalDiagnosis>('symptomatic_apical_periodontitis');
  const [endoSymptoms, setEndoSymptoms] = createSignal<string[]>([]);
  const [endoWorkingLength, setEndoWorkingLength] = createSignal<number>(19);
  const [endoIrrigant, setEndoIrrigant] = createSignal<string>('NaOCl');
  const [endoObturation, setEndoObturation] = createSignal<string>('GP + sealer');

  const [perioDiagnosis, setPerioDiagnosis] = createSignal<'healthy' | 'gingivitis' | 'periodontitis_slight' | 'periodontitis_moderate' | 'periodontitis_severe'>('gingivitis');
  const [mobilityGrade, setMobilityGrade] = createSignal<MobilityGrade>(1);
  const [boneLoss, setBoneLoss] = createSignal(10);
  const [perioPocketDepth, setPerioPocketDepth] = createSignal<number>(4);
  const [perioBleedingSites, setPerioBleedingSites] = createSignal<string[]>([]);
  const [perioPlaqueScore, setPerioPlaqueScore] = createSignal<number>(35);
  const [perioFurcation, setPerioFurcation] = createSignal<FurcationGrade>(0);

  const [surgeryPlan, setSurgeryPlan] = createSignal<'extraction' | 'apico' | 'bone_graft'>('extraction');
  const [sedationMode, setSedationMode] = createSignal<string>('local');
  const [flapDesign, setFlapDesign] = createSignal<string>('envelope');
  const [graftMaterial, setGraftMaterial] = createSignal<string>('none');
  const [procedureStatus, setProcedureStatus] = createSignal<ProcedureStatus>('planned');
  const [procedureName, setProcedureName] = createSignal('');
  const [procedureNotes, setProcedureNotes] = createSignal('');

  const toggleSurface = (surface: ToothSurface) => {
    setSelectedSurfaces((surfaces) =>
      surfaces.includes(surface) ? surfaces.filter((s) => s !== surface) : [...surfaces, surface]
    );
  };

  const toggleStringValue = (source: () => string[], setter: (next: string[]) => void, value: string) => {
    setter(source().includes(value) ? source().filter((item) => item !== value) : [...source(), value]);
  };

  const toggleOperativeFlag = (flag: string) => toggleStringValue(operativeFlags, setOperativeFlags, flag);
  const toggleEndoSymptom = (symptom: string) => toggleStringValue(endoSymptoms, setEndoSymptoms, symptom);
  const toggleBleedingSite = (site: string) => toggleStringValue(perioBleedingSites, setPerioBleedingSites, site);

  const requireTooth = () => {
    if (!props.selectedTooth) {
      alert('Select a tooth from the chart to document a condition.');
      return false;
    }
    return true;
  };

  const handleAddOperative = () => {
    if (!requireTooth()) return;
    if (selectedSurfaces().length === 0) {
      alert('Choose at least one surface.');
      return;
    }
    const note = `Isolation: ${operativeIsolation()} | Flags: ${operativeFlags().length ? operativeFlags().join(', ') : 'none'}`;

    if (operativeType() === 'caries') {
      props.onAddCondition({
        type: 'caries',
        surfaces: [...selectedSurfaces()],
        severity: cariesSeverity(),
        icdas: operativeIcdas(),
        notes: note
      });
    } else if (operativeType() === 'restoration') {
      props.onAddCondition({
        type: 'restoration',
        surfaces: [...selectedSurfaces()],
        material: material(),
        condition: 'intact',
        dateCompleted: new Date().toISOString().split('T')[0],
        notes: note
      });
    } else {
      props.onAddCondition({
        type: 'fracture',
        surfaces: [...selectedSurfaces()],
        severity: 'enamel',
        traumatic: true,
        notes: note
      });
    }

    setSelectedSurfaces([]);
    setProcedureName(`${operativeType()} - ${props.selectedTooth?.position.universal}`);
    setProcedureStatus('planned');
  };

  const handleAddProstho = () => {
    if (!requireTooth()) return;

    if (prosthoType() === 'crown') {
      props.onAddCondition({
        type: 'crown',
        crownType: crownStyle(),
        material: material(),
        condition: 'intact',
        notes: `Shade: ${prosthoShade()} | Margin: ${prosthoMarginStyle()} | Pontic: ${ponticDesign()}`
      });
      setProcedureName(`Crown prep ${props.selectedTooth?.position.universal}`);
    } else {
      props.onAddCondition({
        type: 'implant',
        status: 'planned',
        component: 'fixture',
        notes: `Site: ${implantSiteQuality()} | Healing: ${implantHealingTimeline()} | Shade: ${prosthoShade()}`,
        manufacturer: 'Universal',
        system: 'v4-guided'
      });
      setProcedureName(`Implant placement ${props.selectedTooth?.position.universal}`);
    }
    setProcedureStatus('planned');
  };

  const handleAddEndo = () => {
    if (!requireTooth()) return;
    props.onAddCondition({
      type: 'endo',
      stage: endoStage(),
      pulpDiagnosis: pulpDx(),
      periapicalDiagnosis: periapicalDx(),
      numberOfCanals: props.selectedTooth?.position.type === 'molar' ? 3 : props.selectedTooth?.position.type === 'premolar' ? 2 : 1,
      vitalityTest: {
        cold: 'positive',
        electric: 40
      },
      workingLength: { main: endoWorkingLength() },
      notes: `Symptoms: ${endoSymptoms().length ? endoSymptoms().join(', ') : 'none'} | Irrigant: ${endoIrrigant()} | Obturation: ${endoObturation()}`
    });
    setProcedureName(`RCT ${props.selectedTooth?.position.universal}`);
    setProcedureStatus('in_progress');
  };

  const handleAddPerio = () => {
    if (!requireTooth()) return;
    props.onAddCondition({
      type: 'perio',
      diagnosis: perioDiagnosis(),
      mobility: mobilityGrade(),
      boneLoss: boneLoss(),
      furcation: perioFurcation(),
      plaqueScore: perioPlaqueScore(),
      bleedingSites: [...perioBleedingSites()],
      deepestPocket: perioPocketDepth(),
      maintenancePhase: boneLoss() > 30 ? 'active' : 'maintenance',
      bopNote: perioBleedingSites().length ? 'Active bleeding at recorded sites' : 'No bleeding on probing',
      notes: `Deepest pocket ${perioPocketDepth()}mm | BOP: ${perioBleedingSites().join(', ') || 'none'}`
    });
    setProcedureName(`Perio therapy ${props.selectedTooth?.position.universal}`);
    setProcedureStatus('planned');
  };

  const handleAddSurgery = () => {
    if (!requireTooth()) return;
    const sharedNotes = `Sedation: ${sedationMode()} | Flap: ${flapDesign()} | Graft: ${graftMaterial()}`;

    if (surgeryPlan() === 'extraction') {
      props.onAddCondition({
        type: 'extraction',
        extractionType: 'surgical',
        status: 'planned',
        notes: sharedNotes
      });
      setProcedureName(`Extraction ${props.selectedTooth?.position.universal}`);
    } else if (surgeryPlan() === 'apico') {
      props.onAddCondition({
        type: 'surgery',
        procedure: 'apicoectomy',
        status: 'planned',
        notes: sharedNotes
      });
      setProcedureName(`Apico ${props.selectedTooth?.position.universal}`);
    } else {
      props.onAddCondition({
        type: 'surgery',
        procedure: 'bone_graft',
        status: 'planned',
        notes: `${sharedNotes} | Healing timeline: ${implantHealingTimeline()}`
      });
      setProcedureName(`Bone graft ${props.selectedTooth?.position.universal}`);
    }
    setProcedureStatus('planned');
  };

  const submitProcedure = () => {
    if (!procedureName()) {
      alert('Give the procedure a name.');
      return;
    }
    props.onScheduleProcedure({
      category: TAB_CONFIG[activeTab()].category,
      name: procedureName(),
      status: procedureStatus(),
      notes: procedureNotes()
    });
    setProcedureNotes('');
    setProcedureName('');
  };

  return (
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <For each={Object.entries(TAB_CONFIG)}>
          {([key, config]) => (
            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-semibold capitalize transition"
              classList={{
                'bg-blue-600 text-white shadow-lg': activeTab() === key,
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300': activeTab() !== key
              }}
              onClick={() => setActiveTab(key as SpecialtyTab)}
            >
              {config.label}
            </button>
          )}
        </For>
      </div>

      <div class="mt-6 space-y-6">
        <Show when={props.selectedTooth} fallback={<p class="text-sm text-slate-500">Select a tooth to enable documentation.</p>}>
          <div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Chairside Focus: <strong>#{props.selectedTooth?.position.universal}</strong> • {props.selectedTooth?.position.type} • Quadrant {props.selectedTooth?.position.quadrant}
          </div>
        </Show>

        <SwitchForm
          activeTab={activeTab()}
          onAddOperative={handleAddOperative}
          onAddProstho={handleAddProstho}
          onAddEndo={handleAddEndo}
          onAddPerio={handleAddPerio}
          onAddSurgery={handleAddSurgery}
          state={{
            selectedSurfaces,
            toggleSurface,
            material,
            setMaterial,
            cariesSeverity,
            setCariesSeverity,
            operativeType,
            setOperativeType,
            operativeIsolation,
            setOperativeIsolation,
            operativeIcdas,
            setOperativeIcdas,
            operativeFlags,
            toggleOperativeFlag,
            prosthoType,
            setProsthoType,
            crownStyle,
            setCrownStyle,
            prosthoShade,
            setProsthoShade,
            prosthoMarginStyle,
            setProsthoMarginStyle,
            ponticDesign,
            setPonticDesign,
            implantSiteQuality,
            setImplantSiteQuality,
            implantHealingTimeline,
            setImplantHealingTimeline,
            endoStage,
            setEndoStage,
            pulpDx,
            setPulpDx,
            periapicalDx,
            setPeriapicalDx,
            endoSymptoms,
            toggleEndoSymptom,
            endoWorkingLength,
            setEndoWorkingLength,
            endoIrrigant,
            setEndoIrrigant,
            endoObturation,
            setEndoObturation,
            perioDiagnosis,
            setPerioDiagnosis,
            mobilityGrade,
            setMobilityGrade,
            boneLoss,
            setBoneLoss,
            perioPocketDepth,
            setPerioPocketDepth,
            perioBleedingSites,
            toggleBleedingSite,
            perioPlaqueScore,
            setPerioPlaqueScore,
            perioFurcation,
            setPerioFurcation,
            surgeryPlan,
            setSurgeryPlan,
            sedationMode,
            setSedationMode,
            flapDesign,
            setFlapDesign,
            graftMaterial,
            setGraftMaterial
          }}
        />

        <div class="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Plan Procedure</h4>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <input
              class="rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="Procedure name"
              value={procedureName()}
              onInput={(event) => setProcedureName(event.currentTarget.value)}
            />
            <select
              class="rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={procedureStatus()}
              onChange={(event) => setProcedureStatus(event.currentTarget.value as ProcedureStatus)}
            >
              <For each={['planned', 'in_progress', 'completed', 'cancelled'] as ProcedureStatus[]}>
                {(status) => (
                  <option value={status}>{status.replace('_', ' ')}</option>
                )}
              </For>
            </select>
          </div>
          <textarea
            class="mt-3 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            rows={3}
            placeholder="Notes"
            value={procedureNotes()}
            onInput={(event) => setProcedureNotes(event.currentTarget.value)}
          />
          <button
            type="button"
            class="mt-3 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-2 text-sm font-semibold text-white shadow-lg"
            onClick={submitProcedure}
          >
            Add to Treatment Plan ({TAB_CONFIG[activeTab()].category})
          </button>
        </div>
      </div>
    </div>
  );
}

interface SwitchFormProps {
  activeTab: SpecialtyTab;
  onAddOperative: () => void;
  onAddProstho: () => void;
  onAddEndo: () => void;
  onAddPerio: () => void;
  onAddSurgery: () => void;
  state: any;
}

function SwitchForm(props: SwitchFormProps) {
  switch (props.activeTab) {
    case 'operative':
      return (
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold text-slate-600 dark:text-slate-200">Surfaces</label>
            <div class="mt-2 flex flex-wrap gap-2">
              <For each={TOOTH_SURFACES}>
                {(surface) => (
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1 text-sm capitalize dark:border-slate-700"
                    classList={{ 'bg-blue-600 text-white': props.state.selectedSurfaces().includes(surface) }}
                    onClick={() => props.state.toggleSurface(surface)}
                  >
                    {surface}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div>
              <label class="text-sm font-semibold">Entry type</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.operativeType()}
                onChange={(e) => props.state.setOperativeType(e.currentTarget.value)}
              >
                <option value="caries">Caries</option>
                <option value="restoration">Restoration</option>
                <option value="fracture">Fracture</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Material</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.material()}
                onChange={(e) => props.state.setMaterial(e.currentTarget.value)}
              >
                <For each={MATERIALS}>{(mat) => <option value={mat}>{mat}</option>}</For>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Severity</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.cariesSeverity()}
                onChange={(e) => props.state.setCariesSeverity(e.currentTarget.value)}
              >
                <option value="early">Early</option>
                <option value="moderate">Moderate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-2xl bg-blue-600 py-2 text-sm font-semibold text-white shadow-lg"
            onClick={props.onAddOperative}
          >
            Capture Operative Condition
          </button>
        </div>
      );
    case 'fixed':
      return (
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div>
              <label class="text-sm font-semibold">Prostho type</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.prosthoType()}
                onChange={(e) => props.state.setProsthoType(e.currentTarget.value)}
              >
                <option value="crown">Crown</option>
                <option value="implant">Implant</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Crown style</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.crownStyle()}
                onChange={(e) => props.state.setCrownStyle(e.currentTarget.value)}
              >
                <option value="full_crown">Full coverage</option>
                <option value="onlay">Onlay</option>
                <option value="inlay">Inlay</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-2xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-lg"
            onClick={props.onAddProstho}
          >
            Save Fixed Plan
          </button>
        </div>
      );
    case 'endo':
      return (
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-3">
            <div>
              <label class="text-sm font-semibold">RCT Stage</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.endoStage()}
                onChange={(e) => props.state.setEndoStage(e.currentTarget.value)}
              >
                <For each={RCT_STAGES}>{(stage) => <option value={stage}>{stage}</option>}</For>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Pulp diagnosis</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.pulpDx()}
                onChange={(e) => props.state.setPulpDx(e.currentTarget.value)}
              >
                <For each={PULP_DIAGNOSIS}>{(dx) => <option value={dx}>{dx.replaceAll('_', ' ')}</option>}</For>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Periapical</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.periapicalDx()}
                onChange={(e) => props.state.setPeriapicalDx(e.currentTarget.value)}
              >
                <For each={PERIAPICAL}>{(dx) => <option value={dx}>{dx.replaceAll('_', ' ')}</option>}</For>
              </select>
            </div>
          </div>
          <button
            type="button"
            class="w-full rounded-2xl bg-purple-600 py-2 text-sm font-semibold text-white shadow-lg"
            onClick={props.onAddEndo}
          >
            Document Endo Step
          </button>
        </div>
      );
    case 'perio':
      return (
        <div class="space-y-5">
          <div class="grid gap-3 md:grid-cols-3">
            <div>
              <label class="text-sm font-semibold">Diagnosis</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.perioDiagnosis()}
                onChange={(e) => props.state.setPerioDiagnosis(e.currentTarget.value)}
              >
                <option value="healthy">Healthy</option>
                <option value="gingivitis">Gingivitis</option>
                <option value="periodontitis_slight">Slight</option>
                <option value="periodontitis_moderate">Moderate</option>
                <option value="periodontitis_severe">Severe</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Mobility</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.mobilityGrade()}
                onChange={(e) => props.state.setMobilityGrade(Number(e.currentTarget.value))}
              >
                <For each={MOBILITY}>{(grade) => <option value={grade}>{grade}</option>}</For>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Bone loss %</label>
              <input
                type="number"
                min="0"
                max="100"
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.boneLoss()}
                onInput={(e) => props.state.setBoneLoss(Number(e.currentTarget.value))}
              />
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div>
              <label class="text-sm font-semibold">Deepest pocket (mm)</label>
              <input
                type="number"
                min="0"
                max="12"
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.perioPocketDepth()}
                onInput={(e) => props.state.setPerioPocketDepth(Number(e.currentTarget.value))}
              />
            </div>
            <div>
              <label class="text-sm font-semibold">Plaque score %</label>
              <input
                type="number"
                min="0"
                max="100"
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.perioPlaqueScore()}
                onInput={(e) => props.state.setPerioPlaqueScore(Number(e.currentTarget.value))}
              />
            </div>
            <div>
              <label class="text-sm font-semibold">Furcation</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.perioFurcation()}
                onChange={(e) => props.state.setPerioFurcation(Number(e.currentTarget.value))}
              >
                <For each={[0, 1, 2, 3] as FurcationGrade[]}>{(grade) => <option value={grade}>{grade}</option>}</For>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold">Bleeding on probing</label>
            <div class="mt-2 flex flex-wrap gap-2">
              <For each={PERIO_BLEEDING_SITES}>
                {(site) => (
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide dark:border-slate-700"
                    classList={{ 'bg-rose-500 text-white': props.state.perioBleedingSites().includes(site) }}
                    onClick={() => props.state.toggleBleedingSite(site)}
                  >
                    {site}
                  </button>
                )}
              </For>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-2xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-lg"
            onClick={props.onAddPerio}
          >
            Save Perio Snapshot
          </button>
        </div>
      );
    case 'surgery':
    default:
      return (
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div>
              <label class="text-sm font-semibold">Procedure</label>
              <select
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={props.state.surgeryPlan()}
                onChange={(e) => props.state.setSurgeryPlan(e.currentTarget.value)}
              >
                <option value="extraction">Extraction</option>
                <option value="apico">Apicoectomy</option>
                <option value="bone_graft">Bone graft</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Notes</label>
              <input
                class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Sedation, flap, graft"
                value={props.state.sedationMode()}
                onInput={(e) => props.state.setSedationMode(e.currentTarget.value)}
              />
            </div>
          </div>
          <button
            type="button"
            class="w-full rounded-2xl bg-rose-600 py-2 text-sm font-semibold text-white shadow-lg"
            onClick={props.onAddSurgery}
          >
            Stage Surgical Plan
          </button>
        </div>
      );
  }
}
