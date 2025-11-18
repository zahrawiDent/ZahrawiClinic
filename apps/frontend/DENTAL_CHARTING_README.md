# Dental Charting Application

A comprehensive, professional-grade dental charting system built with SolidJS and Tailwind CSS v4.

## 🎯 Features

### Core Functionality

- **Universal Tooth Charting**
  - Support for permanent dentition (32 teeth)
  - Support for primary dentition (20 teeth) 
  - Mixed dentition visualization
  - Toggle between Universal, FDI, and Palmer numbering systems
  - Visual indicators for tooth eruption status

- **Interactive Odontogram**
  - Click on any tooth to view/edit details
  - Color-coded visual representation of conditions
  - Surface-level charting (Mesial, Occlusal, Distal, Buccal, Lingual)
  - Real-time updates with reactive state management

### Specialty-Specific Charting

#### Operative Dentistry
- Caries detection and classification (Class I-VI, ICDAS)
- Restorations with multiple materials (Composite, Amalgam, GIC, Porcelain, etc.)
- Surface-specific condition tracking
- Restoration status monitoring (intact, defective, fractured)

#### Endodontics
- Pulpal and periapical diagnosis
- RCT stages tracking (indicated → access → instrumentation → obturation → completed)
- Canal count and working length measurements
- Post and core documentation

#### Periodontics
- 6-point probing depths per tooth
- Gingival recession measurements
- Auto-calculated Clinical Attachment Loss (CAL)
- Bleeding on probing (BOP) indicators
- Mobility grading (0-3)
- Furcation involvement

#### Implantology
- Implant planning and placement tracking
- Manufacturer and system documentation
- Implant dimensions (diameter, length)
- Component status (fixture, healing abutment, crown)
- Bone level indicators

#### Oral Surgery
- Extraction planning (simple, surgical, sectional)
- Impaction classification
- Surgical procedure documentation

### Data Management

- **LocalStorage Persistence**: All data automatically saved to browser localStorage
- **Export/Import**: JSON export for backup and data portability
- **Undo/Redo**: History management with undo capabilities
- **Patient Records**: Complete patient demographics and medical history

## 🏗️ Architecture

### Technology Stack

- **Frontend**: SolidJS (fine-grained reactivity)
- **Styling**: Tailwind CSS v4
- **State Management**: SolidJS stores with signals
- **Data Persistence**: localStorage (backend-ready architecture)
- **Type Safety**: Full TypeScript coverage

### Project Structure

```
src/
├── types/
│   └── dental-chart.ts          # Comprehensive type definitions
├── lib/
│   └── dental/
│       ├── chart-store.ts       # State management & persistence
│       └── tooth-mapping.ts     # Numbering system conversions
├── components/
│   └── dental/
│       ├── tooth-component.tsx  # Interactive tooth visualization
│       ├── odontogram.tsx       # Full chart grid
│       ├── tooth-details-panel.tsx  # Side panel editor
│       └── perio-chart.tsx      # Periodontal charting module
└── routes/
    └── dental-chart.tsx         # Main application route
```

### Core Data Models

#### Tooth
```typescript
interface Tooth {
  id: string;
  position: ToothPosition;
  status: ToothStatus;
  eruptionStatus?: EruptionStatus;
  conditions: ToothCondition[];
  notes?: string;
  photos?: string[];
  lastModified: string;
}
```

#### ToothCondition (Union Type)
- `CariesCondition`
- `RestorationCondition`
- `CrownCondition`
- `EndoCondition`
- `PerioCondition`
- `ImplantCondition`
- `ExtractionCondition`
- `SurgeryCondition`

#### DentalChart
```typescript
interface DentalChart {
  patientId: string;
  teeth: Tooth[];
  perioMeasurements: PerioMeasurement[];
  procedures: Procedure[];
  preferredNumberingSystem: NumberingSystem;
  chartMode: 'existing' | 'treatment_plan';
  version: number;
  createdAt: string;
  lastModified: string;
}
```

## 🚀 Getting Started

### Access the Application

Navigate to the dental charting route:
```
/dental-chart
```

### Demo Data

The application initializes with a demo patient including:
- Caries on tooth #3
- Composite restoration on tooth #14
- Completed RCT on tooth #19
- Zirconia crown on tooth #30
- Missing tooth #1

### Basic Workflow

1. **View Chart**: The main odontogram displays all teeth with visual indicators
2. **Select Tooth**: Click any tooth to open the details panel
3. **Add Conditions**: Use the tabs (Operative, Endo, Perio, Surgery, Implant) to add findings
4. **Select Surfaces**: For operative conditions, select affected surfaces (M, O, D, B, L)
5. **Perio Charting**: Switch to "Perio Chart" view for detailed periodontal measurements
6. **Export Data**: Use "Export JSON" to backup patient data

## 📊 Charting Views

### Chart View
- Full odontogram with all teeth
- Color-coded visual indicators
- Click-to-edit interaction
- Real-time condition updates

### Perio Chart View
- Tabular input for probing depths
- Six sites per tooth (MB, B, DB, ML, L, DL)
- Gingival recession tracking
- Bleeding on probing toggles
- Mobility grade selectors
- Color-coded depth indicators (green: 1-3mm, yellow: 4-5mm, red: ≥6mm)

## 🎨 Visual Indicators

### Tooth Colors
- **White**: Healthy tooth
- **Light Red**: RCT performed
- **Gold**: Crown present
- **Purple-Gray**: Implant
- **Pink-Red**: Active caries
- **Light Gray**: Missing/Extracted
- **Light Blue**: Unerupted

### Surface Colors
- **Red**: Caries
- **Blue**: Restoration
- **Orange**: Fracture

### Special Markers
- **Red Vertical Line**: Completed RCT
- **Circle + Line**: Implant
- **Crown Symbol**: Crown restoration
- **"M" with number**: Mobility grade

## 🔧 State Management

### LocalStorage Keys
- `dental_chart_patients`: Patient records
- `dental_chart_charts`: Dental charts
- `dental_chart_history`: Change history
- `dental_chart_current_patient`: Active patient ID
- `dental_chart_preferences`: User preferences

### Reactive Updates
All state changes are automatically persisted and trigger UI updates through SolidJS's fine-grained reactivity system.

## 📱 Responsive Design

- Desktop-optimized interface
- Tablet-compatible touch interactions
- Accessible keyboard navigation
- Dark mode support

## 🔐 Data Privacy

- All data stored locally in browser
- No server transmission (in current implementation)
- Export/import for data portability
- Patient data never leaves the device

## 🛠️ Extensibility

### Adding New Conditions

1. Define type in `types/dental-chart.ts`:
```typescript
export interface MyCondition {
  type: 'my_condition';
  // ... properties
}
```

2. Add to union type:
```typescript
export type ToothCondition =
  | CariesCondition
  | RestorationCondition
  | MyCondition; // Add here
```

3. Add UI in `tooth-details-panel.tsx`
4. Update tooth color logic in `tooth-component.tsx` if needed

### Adding New Views

Create new components and add view toggle in the main route.

## 📄 Export Format

JSON export includes:
```json
{
  "version": "1.0.0",
  "exportDate": "2025-11-18T...",
  "patients": [...],
  "charts": [...],
  "history": [...]
}
```

## 🎯 Future Enhancements

### Planned Features
- PDF export with visual charts
- Treatment planning module with cost estimation
- Patient timeline view
- Photo attachment and annotation
- Multi-language support (English/Arabic)
- Cloud sync capabilities
- Print-optimized layouts
- Voice dictation
- Template system for common conditions

### Backend Integration
The architecture is designed for easy backend integration:
- Replace localStorage functions in `chart-store.ts`
- Add API calls for CRUD operations
- Implement authentication
- Add real-time collaboration features

## 📚 Key Technologies

- **SolidJS**: Fine-grained reactivity without VDOM
- **TypeScript**: Full type safety
- **Tailwind CSS v4**: Utility-first styling
- **LocalStorage API**: Client-side persistence
- **SVG**: Scalable tooth visualizations

## 🏥 Clinical Use

This system is designed for:
- General dental practices
- Specialist clinics (Endo, Perio, Prostho, Oral Surgery)
- Dental schools and training
- Patient education
- Treatment documentation
- Insurance claims support

## ⚕️ Standards Compliance

- FDI World Dental Federation numbering
- Universal (ADA) numbering system
- Palmer notation support
- ICDAS caries classification
- Standard periodontal charting protocols

## 🤝 Contributing

To extend the dental charting system:
1. Follow existing type definitions
2. Maintain reactive patterns with SolidJS
3. Ensure localStorage persistence
4. Add comprehensive TypeScript types
5. Document new features

## 📞 Support

For issues or questions:
- Review type definitions in `types/dental-chart.ts`
- Check store implementation in `lib/dental/chart-store.ts`
- Examine component examples in `components/dental/`

---

**Built with ❤️ for dental professionals**
