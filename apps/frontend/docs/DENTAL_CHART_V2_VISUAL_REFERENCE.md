# 🎨 Visual Design Reference - Dental Chart V2

## Grid Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    TOOTH #3 (MOLAR)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│         ┌───────────┬───────────┬───────────┐           │
│         │           │           │           │           │
│         │   Empty   │  DISTAL   │   Empty   │           │
│         │           │    (D)    │           │           │
│         │           │           │           │           │
│         ├───────────┼───────────┼───────────┤           │
│         │           │           │           │           │
│         │  BUCCAL   │ OCCLUSAL  │  LINGUAL  │           │
│         │    (B)    │    (O)    │    (L)    │           │
│         │           │           │           │           │
│         ├───────────┼───────────┼───────────┤           │
│         │           │           │           │           │
│         │   Empty   │  MESIAL   │   Empty   │           │
│         │           │    (M)    │           │           │
│         │           │           │           │           │
│         └───────────┴───────────┴───────────┘           │
│                                                           │
│               Each cell: 33×33 pixels                    │
│               Total grid: 100×100 pixels                 │
└─────────────────────────────────────────────────────────┘
```

---

## Material Color Schemes

### 🔵 Composite (Blue Gradient)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(96, 165, 250)
│ ░░░░░░░░░░░░░░ │  ↓ gradient
│ ████████████   │  RGB(59, 130, 246)
│ ████████████   │  
└────────────────┘
Icon: 🔵  Text: White
Use: Resin-based composite restorations
```

### ⚫ Amalgam (Metallic Gray)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(156, 163, 175)
│ ████████████   │  RGB(107, 114, 128) ← center
│ ████████████   │  RGB(156, 163, 175)
│ ░░░░░░░░░░░░░░ │  
└────────────────┘
Icon: ⚫  Text: White
Pattern: Three-tone metallic
Use: Silver amalgam fillings
```

### 🟡 GIC (Solid Yellow)
```
┌────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  RGB(234, 179, 8)
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  Solid yellow
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└────────────────┘
Icon: 🟡  Text: Black
Use: Glass ionomer cement
```

### 🟠 Gold (Amber Metallic)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(245, 158, 11)
│ ░░░░░░░░░░░░░░ │  ↓ gradient
│ ████████████   │  RGB(217, 119, 6)
│ ████████████   │  
└────────────────┘
Icon: 🟠  Text: Black
Pattern: Metallic shimmer
Use: Gold inlays, onlays
```

### ⚪ Porcelain (White/Gray)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(255, 255, 255)
│ ░░░░░░░░░░░░░░ │  ↓ gradient
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │  RGB(243, 244, 246)
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │  
└────────────────┘
Icon: ⚪  Text: Black
Border: RGB(209, 213, 219)
Use: Ceramic restorations
```

### 👑 Crown (Gold Gradient)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(245, 158, 11)
│ ░░░░░░░░░░░░░░ │  ↓ gradient
│ ████████████   │  RGB(217, 119, 6)
│ ████████████   │  
└────────────────┘
Icon: 👑  Text: White
Covers: Entire tooth
```

### 💎 Zirconia Crown (Slate Metallic)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(241, 245, 249)
│ ████████████   │  RGB(226, 232, 240)
│ ████████████   │  Three-tone metallic
│ ░░░░░░░░░░░░░░ │  
└────────────────┘
Icon: 💎  Text: Black
Border: RGB(148, 163, 184)
```

### 🔴 Endo - Active (Red Striped)
```
┌────────────────┐
│ ////▓▓▓▓////▓▓ │  RGB(248, 113, 113)
│ ▓▓////▓▓▓▓//// │  RGB(220, 38, 38)
│ ////▓▓▓▓////▓▓ │  45° diagonal stripes
│ ▓▓////▓▓▓▓//// │  
└────────────────┘
Icon: 🔴  Text: White
Pattern: Repeating stripes (4px/4px)
Use: RCT in progress
```

### ✅ Endo - Completed (Solid Red)
```
┌────────────────┐
│ ████████████   │
│ ████████████   │  RGB(185, 28, 28)
│ ████████████   │  Solid dark red
│ ████████████   │
└────────────────┘
Icon: ✅  Text: White
Use: RCT finished
```

### 🟤 Caries (Dark Brown)
```
┌────────────────┐
│ ████████████   │
│ ████████████   │  RGB(127, 29, 29)
│ ████████████   │  Dark maroon/brown
│ ████████████   │
└────────────────┘
Icon: 🟤  Text: White
Use: Decay
```

### ❌ Extraction (Crosshatch + X)
```
┌────────────────┐
│ X▒▒X▒▒▒X▒▒▒X▒▒ │  Black crosshatch
│ ▒X▒▒▒X▒▒▒X▒▒▒X │  + diagonal X overlay
│ X▒▒X▒▒▒X▒▒▒X▒▒ │  45° and -45° lines
│ ▒X▒▒▒X▒▒▒X▒▒▒X │
└────────────────┘
Icon: ❌  Text: White
Pattern: Double crosshatch
Use: Missing/extracted tooth
```

### 🦷 Implant (Titanium Slate)
```
┌────────────────┐
│ ░░░░░░░░░░░░░░ │  RGB(100, 116, 139)
│ ████████████   │  RGB(71, 85, 105)
│ ████████████   │  Metallic gradient
│ ░░░░░░░░░░░░░░ │  
└────────────────┘
Icon: 🦷  Text: White
Use: Dental implant
```

---

## Root Canal Display

### Single Root (Incisor/Canine)
```
     ┌─────┐
     │  P  │  ← Crown portion
     ├─────┤
     │     │
     │  ○  │  ← Canal P (Palatal/Single)
    ╱│     │╲
   ╱ │     │ ╲
  ╱  │     │  ╲
 ╱   │     │   ╲
     │     │
     │  ●  │  ← Apex
     └─────┘

Anatomy: single
Canals: 1 (P)
```

### Bifurcated (Maxillary First Premolar)
```
      ┌───────┐
      │  B P  │  ← Crown
      ├───┬───┤
     ╱    │    ╲
    ╱  ○  │  ○  ╲  ← Canals B, P
   ╱      │      ╲
  ╱       │       ╲
 ╱        │        ╲
│    ●    │    ●   │  ← Apices
└─────────┴─────────┘

Anatomy: bifurcated
Canals: 2 (B, P)
```

### Trifurcated (Molar)
```
      ┌──────────┐
      │ MB DB P  │  ← Crown
      ├──┬───┬───┤
     ╱   │   │    ╲
    ╱ ○  │ ○ │  ○  ╲  ← Canals MB, DB, P
   ╱     │   │      ╲
  ╱      │   │       ╲
 ╱       │   │        ╲
│   ●    │ ● │    ●   │  ← Apices
└────────┴───┴────────┘

Anatomy: trifurcated
Canals: 3 (MB, DB, P)
Note: May have MB2 (4 canals)
```

### Canal Status Icons

```
○  Untreated    (Gray)     - Not accessed yet
◐  Located      (Blue)     - Orifice found
◑  Instrumented (Orange)   - Cleaning/shaping
●  Obturated    (Red)      - Filled with gutta-percha
⬤  Post Space   (Purple)   - Prepared for post
⬛  Post Placed  (Gray)     - Post cemented
⚠  Retreatment  (Yellow)   - Needs redo
```

---

## Interactive States

### Surface Cell States

#### 1. **Default (Unselected, No Condition)**
```
┌───────────┐
│           │  Background: rgb(249, 250, 251)
│     M     │  Border: 1px solid rgb(209, 213, 219)
│           │  Hover: Light blue tint
└───────────┘
```

#### 2. **Selected (Active Selection)**
```
┌═══════════┐
║           ║  Ring: 4px solid rgb(59, 130, 246)
║     M     ║  Background: Same as default
║           ║  Ring: Inset
└═══════════┘
```

#### 3. **Has Condition (Composite Example)**
```
┌───────────┐
│    🔵     │  Background: Blue gradient
│     M     │  Icon: Top-right corner
│           │  Text: White, bold
└───────────┘
```

#### 4. **Hover State**
```
┌───────────┐
│    hover  │  Scale: 1.05 transform
│     M     │  Cursor: pointer
│           │  Transition: 200ms
└───────────┘
```

---

## Black's Classification Visual Guide

### Class I - Occlusal Only
```
POSTERIOR TOOTH (Molar #3)
┌───┬───┬───┐
│   │   │   │
├───┼───┼───┤
│   │ ● │   │  ← Occlusal surface only
├───┼───┼───┤
│   │   │   │
└───┴───┴───┘
Valid: O
Invalid: Any other combination
```

### Class II - MO, DO, MOD (Posterior)
```
POSTERIOR TOOTH (Premolar #5)
┌───┬───┬───┐
│   │   │   │
├───┼───┼───┤
│   │ ● │   │  ← Occlusal
├───┼───┼───┤
│   │ ● │   │  ← Mesial
└───┴───┴───┘
Valid: M, D, MO, DO, MOD
Invalid on: Anterior teeth
```

### Class III - M or D (Anterior, No Incisal)
```
ANTERIOR TOOTH (Central #8)
┌───┬───┬───┐
│   │   │   │
├───┼───┼───┤
│   │   │   │  ← Incisal NOT involved
├───┼───┼───┤
│   │ ● │   │  ← Mesial or Distal
└───┴───┴───┘
Valid: M, D
Invalid: With incisal edge
```

### Class IV - MI or DI (Anterior, With Incisal)
```
ANTERIOR TOOTH (Lateral #7)
┌───┬───┬───┐
│   │ ● │   │  ← Distal
├───┼───┼───┤
│   │ ● │   │  ← Incisal involved
├───┼───┼───┤
│   │   │   │
└───┴───┴───┘
Valid: MI, DI
Requires: Incisal edge involvement
```

### Class V - Cervical (All Teeth)
```
ANY TOOTH
┌───┬───┬───┐
│   │   │   │
├───┼───┼───┤
│ ● │   │ ● │  ← Buccal or Lingual
├───┼───┼───┤
│   │   │   │
└───┴───┴───┘
Valid: B, L (cervical third)
Any tooth type allowed
```

### Class VI - Incisal/Cusp Wear (All Teeth)
```
ANY TOOTH
┌───┬───┬───┐
│   │   │   │
├───┼───┼───┤
│   │ ● │   │  ← Incisal or Occlusal (wear)
├───┼───┼───┤
│   │   │   │
└───┴───┴───┘
Valid: I (anterior), O (posterior)
Attrition/wear only
```

---

## Validation Badge Colors

### ✅ Valid
```
┌────────────────────────────────────┐
│  ✓ Class II: MO - Posterior teeth  │
└────────────────────────────────────┘
Background: rgb(220, 252, 231) (green-100)
Text: rgb(22, 101, 52) (green-800)
```

### ⚠️ Warning
```
┌────────────────────────────────────┐
│  ⚠ Unusual combination             │
└────────────────────────────────────┘
Background: rgb(254, 243, 199) (yellow-100)
Text: rgb(133, 77, 14) (yellow-800)
```

### ❌ Invalid
```
┌────────────────────────────────────┐
│  ✗ Class II only for posterior     │
└────────────────────────────────────┘
Background: rgb(254, 226, 226) (red-100)
Text: rgb(153, 27, 27) (red-800)
```

---

## Layout Dimensions

### Tooth Grid Component
```
Overall size: 100×100px
Grid: 3×3 cells
Cell size: 33.33×33.33px
Border: 2px solid rgb(156, 163, 175)
Border radius: 2px
Shadow: 0 4px 6px rgba(0,0,0,0.1)
```

### Root Canal Display
```
Overall width: 120px (default)
Overall height: 96px (80% of width)
Root width: 120px / rootCount
Canal button: auto × 24px
Padding: 8px between elements
```

### Chart Layout
```
Upper Arch Panel:
  Background: White
  Padding: 24px
  Border radius: 12px
  Gap between teeth: 16px
  
Lower Arch Panel:
  Same as upper
  
Side Panel:
  Width: 33% (on XL screens)
  Sticky position
```

---

## Typography

### Headers
```
H1 (Page Title):
  Size: 1.875rem (30px)
  Weight: 700 (bold)
  Gradient: Blue-600 to Indigo-600
  
H2 (Section):
  Size: 1.125rem (18px)
  Weight: 700
  Color: Gray-700 / Gray-300
  
H3 (Subsection):
  Size: 0.875rem (14px)
  Weight: 600
  Color: Gray-600 / Gray-400
```

### Body Text
```
Regular:
  Size: 0.875rem (14px)
  Weight: 400
  Line height: 1.5
  
Small (Labels):
  Size: 0.75rem (12px)
  Weight: 500
  
Tiny (Legends):
  Size: 0.625rem (10px)
  Weight: 400
```

### Surface Labels
```
Inside cells:
  Size: 0.625rem (10px)
  Weight: 700 (bold)
  Opacity: 0.7
  
Tooth numbers:
  Size: 0.75rem (12px)
  Weight: 700
```

---

## Animation & Transitions

### Hover Effects
```css
.tooth-grid:hover {
  transform: scale(1.05);
  transition: transform 200ms ease-out;
}

.surface-cell:hover {
  background: rgba(59, 130, 246, 0.1);
  transition: background 150ms ease;
}
```

### Selection Ring
```css
.selected {
  ring: 4px solid rgb(59, 130, 246);
  ring-offset: 2px;
  animation: ring-pulse 2s infinite;
}
```

### Validation Badge
```css
.validation-badge {
  transition: all 300ms ease-out;
  animation: slide-down 200ms ease-out;
}
```

---

## Accessibility

### Contrast Ratios
- White text on blue: 4.5:1 ✓ AA
- Black text on yellow: 8.6:1 ✓ AAA
- White text on red: 5.1:1 ✓ AA

### Focus States
```css
.focusable:focus {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}
```

### Screen Reader Labels
```html
<button aria-label="Select mesial surface">M</button>
<button aria-label="Tooth number 3, upper right first molar">
```

---

## Dark Mode Adaptations

### Background Colors
```
Light: rgb(249, 250, 251)
Dark:  rgb(31, 41, 55)
```

### Text Colors
```
Light: rgb(55, 65, 81)
Dark:  rgb(209, 213, 219)
```

### Border Colors
```
Light: rgb(209, 213, 219)
Dark:  rgb(75, 85, 99)
```

**Note:** Material colors remain consistent in both modes for clinical recognition.

---

## Print Styles

When printing charts:
- Remove shadows
- Use solid borders
- Increase contrast
- Preserve color coding
- A4 paper layout

```css
@media print {
  .tooth-grid {
    box-shadow: none;
    border: 2px solid black;
  }
}
```

---

**Reference Version:** 2.0.0  
**Last Updated:** November 2025  
**For:** Dental Chart V2 Application
