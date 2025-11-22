# Dental Chart V2 - Professional Edition 🦷

## Overview

**Dental Chart V2** is a comprehensive, professional-grade dental charting system with advanced features including:

- **Grid-based tooth surface selection** - 3x3 grid interface for precise surface selection
- **Black's classification validation** - Automatic detection and validation of caries classifications
- **Root canal system mapping** - Visual representation of roots with individual canal tracking
- **Material-specific visual themes** - Unique, recognizable styling for each restoration type
- **Advanced endodontic workflow** - Multi-canal tracking with individual status for each canal

## 🚀 Quick Start

### Access the Application

Navigate to: **`/dental-chart-v2`**

### Basic Workflow

1. **Select a tooth** - Click on any tooth in the chart (upper or lower arch)
2. **Choose surfaces** - Click individual surface cells in the 3x3 grid (M, O, D, B, L)
3. **Select condition type** - Choose from Operative or Endodontics tab
4. **Add treatment** - Complete the form and click "Add Condition"
5. **View results** - See visual feedback with unique styling for each material/condition

---

## 🎯 Key Features

### 1. Grid-Based Tooth Surface Selection

Each tooth is represented as a **3x3 grid** with clickable surface cells:

```
┌───┬───┬───┐
│   │ D │   │  D = Distal
├───┼───┼───┤
│ B │ O │ L │  B = Buccal, O = Occlusal/Incisal, L = Lingual
├───┼───┼───┤
│   │ M │   │  M = Mesial
└───┴───┴───┘
```

**Advantages:**
- Larger click targets (easier than SVG polygons)
- Clear visual feedback for selected surfaces
- Supports anterior (incisal) and posterior (occlusal) teeth
- Option to select entire tooth for crowns/extractions

### 2. Black's Classification System

Automatic validation based on **G.V. Black's classification** of carious lesions:

| Class | Description | Applicable Teeth | Common Combinations |
|-------|-------------|------------------|---------------------|
| **I** | Occlusal pits & fissures | Posterior only | O |
| **II** | Proximal surfaces | Posterior only | MO, DO, MOD, M, D |
| **III** | Proximal (no incisal) | Anterior only | M, D |
| **IV** | Proximal (with incisal) | Anterior only | MI, DI |
| **V** | Cervical third (gingival) | All teeth | B, L |
| **VI** | Incisal edges / cusp tips | All teeth | I, O |

**Features:**
- ✅ Auto-detection of class from selected surfaces
- ⚠️ Real-time validation with error messages
- 🎓 Educational tooltips explaining each class
- 🔒 Prevents invalid surface combinations

**Example Validation:**
```
Selected: Mesial + Occlusal on tooth #3 (molar)
✓ Valid → Class II (MO)

Selected: Mesial + Occlusal on tooth #8 (central incisor)
✗ Invalid → Class II only applies to posterior teeth
```

### 3. Material-Specific Visual Themes

Each restoration material has a **unique, instantly recognizable appearance**:

#### Composites & Restorations
- **Composite** 🔵 - Blue gradient (rgb(59, 130, 246) → rgb(96, 165, 250))
- **Amalgam** ⚫ - Metallic gray (rgb(107, 114, 128) → rgb(156, 163, 175))
- **GIC** 🟡 - Yellow solid (rgb(234, 179, 8))
- **Gold** 🟠 - Amber metallic (rgb(217, 119, 6) → rgb(245, 158, 11))
- **Porcelain** ⚪ - White gradient with gray border

#### Crowns
- **Full Crown** 👑 - Gold gradient (amber-600 → amber-500)
- **Zirconia Crown** 💎 - Slate metallic with border

#### Endodontics
- **Endo (in progress)** 🔴 - Red striped pattern
- **Endo (completed)** ✅ - Solid dark red

#### Other
- **Caries** 🟤 - Dark brown/maroon
- **Extraction** ❌ - Black with crosshatch + diagonal lines
- **Implant** 🦷 - Slate metallic

**Visual Patterns:**
- `gradient` - Smooth color transition
- `metallic` - Reflective appearance
- `striped` - 45° diagonal stripes
- `crosshatch` - Grid pattern for missing/extracted
- `solid` - Single color

### 4. Root Canal System Visualization

Advanced **endodontic workflow** with visual root representation:

#### Root Configurations
- **Single root** - Incisors, canines, mandibular premolars (1 canal: P)
- **Bifurcated** - Maxillary first premolars (2 canals: B, P)
- **Trifurcated** - Molars (3 canals: MB, DB, P)
- **Complex** - Custom configurations (MB2, ML, DL, etc.)

#### Canal Status Tracking
Each canal can have individual status:

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| **Untreated** | ○ | Gray | Canal not accessed |
| **Located** | ◐ | Blue | Canal orifice found |
| **Instrumented** | ◑ | Orange | Cleaning in progress |
| **Obturated** | ● | Red | Filled with gutta-percha |
| **Post Space** | ⬤ | Purple | Prepared for post |
| **Post Placed** | ⬛ | Gray | Post cemented |
| **Retreatment** | ⚠ | Yellow | Needs retreatment |

#### Features
- Visual root anatomy display
- Working length tracking (per canal)
- Master apical file recording
- Obturation technique selection
- Vitality test results

**Example: Maxillary First Molar**
```
Root Count: 3 (Trifurcated)
Canals:
  - MB (Mesio-Buccal): Obturated ● | WL: 21mm
  - DB (Disto-Buccal): Obturated ● | WL: 20mm
  - P (Palatal): Instrumented ◑ | WL: 22mm
```

---

## 🎨 Component Architecture

### Core Components

#### 1. `ToothGridV2`
**Location:** `src/components/dental/tooth-grid-v2.tsx`

Grid-based tooth component with surface selection.

```tsx
<ToothGridV2 
  tooth={tooth}
  selectedSurfaces={['mesial', 'occlusal']}
  onSurfaceClick={(surface) => console.log(surface)}
  size={100}
  showLabel={true}
/>
```

**Props:**
- `tooth: Tooth` - Tooth data object
- `onSurfaceClick?: (surface: ToothSurface) => void` - Surface click handler
- `onWholeToothClick?: () => void` - Whole tooth click handler
- `selectedSurfaces?: ToothSurface[]` - Highlighted surfaces
- `size?: number` - Grid size in pixels (default: 100)
- `showLabel?: boolean` - Show tooth number (default: true)

#### 2. `RootCanalDisplay`
**Location:** `src/components/dental/root-canal-display.tsx`

Visual representation of root canal system.

```tsx
<RootCanalDisplay 
  rootConfig={{
    toothNumber: '3',
    rootCount: 3,
    canals: [
      { canalName: 'MB', status: 'obturated', workingLength: 21 },
      { canalName: 'DB', status: 'obturated', workingLength: 20 },
      { canalName: 'P', status: 'instrumented', workingLength: 22 }
    ],
    anatomy: 'trifurcated'
  }}
  onCanalClick={(canalName) => console.log(canalName)}
  size={120}
  showLabels={true}
/>
```

**Props:**
- `rootConfig: RootConfiguration` - Root and canal configuration
- `onCanalClick?: (canalName: string) => void` - Canal click handler
- `size?: number` - Display size (default: 120)
- `showLabels?: boolean` - Show canal legend (default: true)

#### 3. `CanalStatusLegend`
**Location:** `src/components/dental/root-canal-display.tsx`

Legend explaining canal status icons and colors.

```tsx
<CanalStatusLegend />
```

---

## 📚 Type System

### Enhanced Types (V2)

#### `EnhancedEndoCondition`
**Location:** `src/types/dental-chart-v2.ts`

Extended endodontic condition with root canal details.

```typescript
interface EnhancedEndoCondition {
  type: 'endo';
  pulpDiagnosis: PulpDiagnosis;
  periapicalDiagnosis?: PeriapicalDiagnosis;
  stage: RCTStage;
  rootConfiguration: RootConfiguration;
  vitalityTest?: {
    cold: 'positive' | 'negative' | 'delayed';
    heat?: 'positive' | 'negative';
    electric?: number;
  };
  hasPostAndCore?: boolean;
  obturationTechnique?: 'lateral_condensation' | 'warm_vertical' | 'thermoplasticized' | 'carrier_based';
  sealerType?: string;
  dateStarted?: string;
  dateCompleted?: string;
  notes?: string;
}
```

#### `RootConfiguration`
```typescript
interface RootConfiguration {
  toothNumber: string;
  rootCount: number; // 1-4 typical
  canals: RootCanal[];
  anatomy: 'single' | 'bifurcated' | 'trifurcated' | 'complex';
  notes?: string;
}
```

#### `RootCanal`
```typescript
interface RootCanal {
  canalName: string; // 'MB', 'DB', 'P', 'MB2', etc.
  status: CanalStatus;
  workingLength?: number; // in mm
  masterApicalFile?: number; // e.g., 25, 30, 35
  obturated?: boolean;
  hasPost?: boolean;
  notes?: string;
}
```

#### `ConditionVisualTheme`
```typescript
interface ConditionVisualTheme {
  primary: string; // Main color (RGB)
  secondary: string; // Accent color
  pattern?: 'solid' | 'gradient' | 'striped' | 'metallic' | 'crosshatch';
  icon?: string; // Emoji identifier
  border?: string; // Border color or 'dashed'
  textColor?: string; // Text color
}
```

---

## 🔧 Utility Functions

### Black's Classification Helpers
**Location:** `src/lib/dental/blacks-classification.ts`

#### `validateSurfaceCombination()`
Validates surface selection against Black's classification rules.

```typescript
const result = validateSurfaceCombination(
  ['mesial', 'occlusal'], 
  'molar',
  'II'
);
// Returns: { isValid: true, suggestedClass: 'II', errors: [], warnings: [] }
```

#### `detectBlacksClass()`
Auto-detects classification from selected surfaces.

```typescript
const classType = detectBlacksClass(['mesial', 'occlusal'], 'molar');
// Returns: 'II'
```

#### `formatSurfaceCombination()`
Formats surfaces as abbreviation string (e.g., "MOD").

```typescript
formatSurfaceCombination(['mesial', 'occlusal', 'distal']);
// Returns: "MOD"
```

#### `getValidationMessage()`
Generates user-friendly validation message.

```typescript
getValidationMessage(validationResult);
// Returns: "Class II: Proximal surfaces - Posterior teeth (MO, DO, MOD, M, D)"
```

---

## 🎓 Clinical Workflows

### Workflow 1: Adding a Class II Restoration

1. **Select tooth** → Click on tooth #3 (upper right first molar)
2. **Select surfaces** → Click "M" and "O" cells in grid
3. **Validation** → Green message: "Class II: Proximal surfaces - Posterior teeth"
4. **Choose type** → Select "Restoration"
5. **Choose material** → Select "Composite"
6. **Add** → Click "Add Condition"
7. **Result** → Tooth shows blue gradient on mesial and occlusal surfaces

### Workflow 2: Root Canal Treatment

1. **Select tooth** → Click on tooth #19 (lower left first molar)
2. **Switch tab** → Click "Endodontics"
3. **View roots** → See 2 roots displayed (ML, DL, D canals)
4. **Set stage** → Choose "Instrumentation"
5. **Update canals**:
   - MB: "Instrumented"
   - DB: "Instrumented"  
   - P: "Located"
6. **Add** → Click "Add Endo Treatment"
7. **Result** → Tooth shows red striped pattern (RCT in progress)

### Workflow 3: Crown Preparation

1. **Select tooth** → Click on tooth #8 (upper right central incisor)
2. **Click whole tooth** → Click center of tooth grid
3. **Choose type** → Select "Crown"
4. **Choose material** → Select "Zirconia"
5. **Add** → Click "Add Condition"
6. **Result** → Entire tooth shows slate metallic appearance with 💎 icon

---

## 🎨 Customization Guide

### Adding New Material Themes

Edit `CONDITION_THEMES` in `src/types/dental-chart-v2.ts`:

```typescript
export const CONDITION_THEMES: Record<string, ConditionVisualTheme> = {
  // ... existing themes
  
  my_custom_material: {
    primary: 'rgb(255, 0, 255)', // Magenta
    secondary: 'rgb(255, 128, 255)', // Light magenta
    pattern: 'gradient',
    icon: '💜',
    textColor: 'white'
  }
};
```

### Adding New Root Configurations

Edit `TYPICAL_ROOT_CONFIGS` in `src/types/dental-chart-v2.ts`:

```typescript
export const TYPICAL_ROOT_CONFIGS: Record<string, { roots: number; canals: string[] }> = {
  // ... existing configs
  
  'custom_tooth': { 
    roots: 4, 
    canals: ['MB', 'MB2', 'DB', 'P'] 
  }
};
```

---

## 🆚 Comparison: V2 vs Enhanced vs Original

| Feature | Original | Enhanced | **V2** |
|---------|----------|----------|--------|
| Tooth representation | SVG polygon | 56×72px box | **100×100px grid** |
| Surface selection | Click SVG paths | Click surfaces | **Click grid cells** |
| Visual themes | Basic colors | Material colors | **Unique patterns** |
| Black's classification | ❌ No | ❌ No | **✅ Full validation** |
| Root canal tracking | Basic stage | ❌ No | **✅ Per-canal status** |
| Whole tooth conditions | ✅ Yes | ✅ Yes | **✅ With overlays** |
| Material distinction | ⚠️ Limited | ⚠️ Color only | **✅ Color + pattern** |
| Educational features | ❌ No | ❌ No | **✅ Classifications** |

---

## 🐛 Troubleshooting

### Issue: Surfaces won't select
**Solution:** Ensure tooth is selected first (blue ring around tooth)

### Issue: "Invalid surface combination" error
**Solution:** Check Black's classification - some combinations only work on specific tooth types (e.g., Class II is posterior-only)

### Issue: Can't add endo treatment
**Solution:** Switch to "Endodontics" tab first, set RCT stage, then click "Add Endo Treatment"

### Issue: Visual theme not showing
**Solution:** Condition must be added to tooth. Check "Info" tab to see existing conditions.

---

## 📖 References

### Black's Classification
- Black, G.V. (1908). *Operative Dentistry*. Medico-Dental Publishing Company.
- Class I-VI classification system for carious lesions

### Root Canal Anatomy
- Vertucci, F.J. (1984). Root canal anatomy of the human permanent teeth.
- Typical canal configurations by tooth type

---

## 🚀 Future Enhancements

Potential features for future versions:

- [ ] **Photo attachments** - Clinical photos per tooth/surface
- [ ] **Treatment planning** - Multi-visit planning with cost estimation
- [ ] **Radiograph integration** - Attach and annotate X-rays
- [ ] **3D tooth models** - WebGL-based 3D visualization
- [ ] **AI-powered detection** - Auto-detect caries from photos
- [ ] **Mobile optimization** - Touch-friendly interface
- [ ] **Multi-language** - Arabic, French, Spanish support
- [ ] **PDF export** - Professional treatment reports
- [ ] **Insurance coding** - Automatic CDT code generation
- [ ] **Patient portal** - Share chart with patients

---

## 🎯 Best Practices

### For Operative Dentistry
1. Always validate Black's classification before recording caries
2. Use standard surface abbreviations (MO, DO, MOD)
3. Select appropriate material for each restoration type
4. Document restoration date for tracking longevity

### For Endodontics
1. Initialize correct root count based on tooth type
2. Update canal status progressively (located → instrumented → obturated)
3. Record working lengths for all canals
4. Use "Retreatment" status for previously treated canals

### For Visual Clarity
1. Use contrasting materials for adjacent restorations
2. Prefer gradients for anterior esthetics (composite, porcelain)
3. Use metallic patterns for metal restorations (amalgam, gold)
4. Reserve red/endo styling for active treatments only

---

## 📝 License

Part of the new-clinic dental management system.

---

**Version:** 2.0.0  
**Last Updated:** November 2025  
**Route:** `/dental-chart-v2`
