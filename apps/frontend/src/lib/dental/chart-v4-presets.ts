import type {
  DentitionType,
  Tooth,
  ToothArch,
  ToothQuadrant,
  ToothType,
  ToothStatus,
  EruptionStatus
} from '../../types/dental-chart';

const POSITION_TYPE_LOOKUP: ToothType[] = ['molar', 'molar', 'molar', 'premolar', 'premolar', 'canine', 'incisor', 'incisor'];

interface QuadrantConfig {
  arch: ToothArch;
  quadrant: ToothQuadrant;
  startUniversal: number;
  count: number;
}

const PERMANENT_QUADRANTS: QuadrantConfig[] = [
  { arch: 'upper', quadrant: 1, startUniversal: 1, count: 8 },
  { arch: 'upper', quadrant: 2, startUniversal: 9, count: 8 },
  { arch: 'lower', quadrant: 3, startUniversal: 17, count: 8 },
  { arch: 'lower', quadrant: 4, startUniversal: 25, count: 8 }
];

const PRIMARY_QUADRANTS: Array<QuadrantConfig & { startFDI: number; startLetter: number }> = [
  { arch: 'upper', quadrant: 1, startUniversal: 1, count: 5, startFDI: 51, startLetter: 0 },
  { arch: 'upper', quadrant: 2, startUniversal: 6, count: 5, startFDI: 61, startLetter: 5 },
  { arch: 'lower', quadrant: 3, startUniversal: 11, count: 5, startFDI: 71, startLetter: 10 },
  { arch: 'lower', quadrant: 4, startUniversal: 16, count: 5, startFDI: 81, startLetter: 15 }
];

const PRIMARY_LABELS = 'ABCDEFGHIJKLMNOPQRST'.split('');

const now = () => new Date().toISOString();

const eruptionPalette: Record<'permanent' | 'mixed' | 'primary', Record<string, EruptionStatus>> = {
  permanent: {
    molarDistal: 'unerupted',
    thirdMolars: 'unerupted',
    anterior: 'fully_erupted',
    premolars: 'fully_erupted',
    erupting: 'erupting'
  },
  mixed: {
    molarDistal: 'unerupted',
    thirdMolars: 'unerupted',
    anterior: 'fully_erupted',
    premolars: 'erupting',
    erupting: 'erupting'
  },
  primary: {
    molarDistal: 'fully_erupted',
    thirdMolars: 'fully_erupted',
    anterior: 'fully_erupted',
    premolars: 'fully_erupted',
    erupting: 'fully_erupted'
  }
};

function resolveToothType(position: number): ToothType {
  return POSITION_TYPE_LOOKUP[position - 1] ?? 'molar';
}

function getDefaultStatus(toothType: ToothType): ToothStatus {
  if (toothType === 'molar') return 'healthy';
  return 'healthy';
}

function resolveEruption(stage: 'permanent' | 'mixed' | 'primary', position: number, toothType: ToothType): EruptionStatus {
  const palette = eruptionPalette[stage];
  if (toothType === 'molar' && position === 1) {
    return palette.thirdMolars;
  }
  if (toothType === 'molar' && position === 2) {
    return palette.molarDistal;
  }
  if (toothType === 'premolar') {
    return palette.premolars;
  }
  if (toothType === 'incisor' || toothType === 'canine') {
    return palette.anterior;
  }
  return palette.erupting;
}

function createPermanentDentition(stage: 'permanent' | 'mixed' = 'permanent'): Tooth[] {
  const teeth: Tooth[] = [];

  PERMANENT_QUADRANTS.forEach((quadrantConfig) => {
    for (let i = 0; i < quadrantConfig.count; i++) {
      const universal = quadrantConfig.startUniversal + i;
      const position = (i % 8) + 1;
      const toothType = resolveToothType(position);
      const eruptionStatus = resolveEruption(stage, position, toothType);
      const fdiBase = quadrantConfig.quadrant === 1
        ? 10
        : quadrantConfig.quadrant === 2
          ? 20
          : quadrantConfig.quadrant === 3
            ? 30
            : 40;
      const fdi = fdiBase + position;

      teeth.push({
        id: `${stage}-permanent-${universal}`,
        position: {
          universal,
          fdi,
          arch: quadrantConfig.arch,
          quadrant: quadrantConfig.quadrant,
          position,
          type: toothType,
          isPrimary: false
        },
        status: getDefaultStatus(toothType),
        eruptionStatus,
        conditions: [],
        lastModified: now()
      });
    }
  });

  return teeth;
}

function createPrimaryDentition(stage: 'primary' | 'mixed' = 'primary'): Tooth[] {
  const teeth: Tooth[] = [];

  PRIMARY_QUADRANTS.forEach((config) => {
    for (let i = 0; i < config.count; i++) {
      const label = PRIMARY_LABELS[config.startLetter + i];
      const position = (i % 5) + 1;
      const toothType = position <= 2 ? 'molar' : position === 3 ? 'canine' : 'incisor';
      const eruptionStatus = stage === 'mixed' && toothType === 'incisor' ? 'erupting' : 'fully_erupted';

      teeth.push({
        id: `${stage}-primary-${label}`,
        position: {
          universal: label,
          fdi: config.startFDI + position,
          arch: config.arch,
          quadrant: config.quadrant,
          position,
          type: toothType,
          isPrimary: true
        },
        status: stage === 'mixed' && toothType === 'incisor' ? 'retained_primary' : 'healthy',
        eruptionStatus,
        conditions: [],
        lastModified: now()
      });
    }
  });

  return teeth;
}

function createMixedDentition(): Tooth[] {
  const permanent = createPermanentDentition('mixed');
  const primary = createPrimaryDentition('mixed');

  return [...permanent, ...primary];
}

export function createDentitionStages(): Record<DentitionType, Tooth[]> {
  const permanent = createPermanentDentition('permanent');
  const primary = createPrimaryDentition('primary');
  const mixed = createMixedDentition();

  return {
    permanent,
    primary,
    mixed
  };
}

export type StageMetrics = {
  total: number;
  erupted: number;
  erupting: number;
  unerupted: number;
};

export function calculateStageMetrics(teeth: Tooth[]): StageMetrics {
  return teeth.reduce<StageMetrics>((acc, tooth) => {
    acc.total += 1;
    if (tooth.eruptionStatus === 'fully_erupted') acc.erupted += 1;
    else if (tooth.eruptionStatus === 'erupting') acc.erupting += 1;
    else if (tooth.eruptionStatus === 'unerupted') acc.unerupted += 1;
    return acc;
  }, {
    total: 0,
    erupted: 0,
    erupting: 0,
    unerupted: 0
  });
}
