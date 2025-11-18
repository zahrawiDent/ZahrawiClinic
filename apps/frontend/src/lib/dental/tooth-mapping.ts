/**
 * Tooth numbering system conversions and position mappings
 */

import type { ToothPosition, UniversalNumber, FDINumber, ToothArch, ToothQuadrant } from '../../types/dental-chart';

// ============================================================================
// PERMANENT DENTITION MAPPING
// ============================================================================

export const PERMANENT_TEETH: ToothPosition[] = [
  // Upper Right Quadrant (1)
  { universal: 1, fdi: 18, arch: 'upper', quadrant: 1, position: 8, type: 'molar', isPrimary: false },
  { universal: 2, fdi: 17, arch: 'upper', quadrant: 1, position: 7, type: 'molar', isPrimary: false },
  { universal: 3, fdi: 16, arch: 'upper', quadrant: 1, position: 6, type: 'molar', isPrimary: false },
  { universal: 4, fdi: 15, arch: 'upper', quadrant: 1, position: 5, type: 'premolar', isPrimary: false },
  { universal: 5, fdi: 14, arch: 'upper', quadrant: 1, position: 4, type: 'premolar', isPrimary: false },
  { universal: 6, fdi: 13, arch: 'upper', quadrant: 1, position: 3, type: 'canine', isPrimary: false },
  { universal: 7, fdi: 12, arch: 'upper', quadrant: 1, position: 2, type: 'incisor', isPrimary: false },
  { universal: 8, fdi: 11, arch: 'upper', quadrant: 1, position: 1, type: 'incisor', isPrimary: false },
  
  // Upper Left Quadrant (2)
  { universal: 9, fdi: 21, arch: 'upper', quadrant: 2, position: 1, type: 'incisor', isPrimary: false },
  { universal: 10, fdi: 22, arch: 'upper', quadrant: 2, position: 2, type: 'incisor', isPrimary: false },
  { universal: 11, fdi: 23, arch: 'upper', quadrant: 2, position: 3, type: 'canine', isPrimary: false },
  { universal: 12, fdi: 24, arch: 'upper', quadrant: 2, position: 4, type: 'premolar', isPrimary: false },
  { universal: 13, fdi: 25, arch: 'upper', quadrant: 2, position: 5, type: 'premolar', isPrimary: false },
  { universal: 14, fdi: 26, arch: 'upper', quadrant: 2, position: 6, type: 'molar', isPrimary: false },
  { universal: 15, fdi: 27, arch: 'upper', quadrant: 2, position: 7, type: 'molar', isPrimary: false },
  { universal: 16, fdi: 28, arch: 'upper', quadrant: 2, position: 8, type: 'molar', isPrimary: false },
  
  // Lower Left Quadrant (3)
  { universal: 17, fdi: 38, arch: 'lower', quadrant: 3, position: 8, type: 'molar', isPrimary: false },
  { universal: 18, fdi: 37, arch: 'lower', quadrant: 3, position: 7, type: 'molar', isPrimary: false },
  { universal: 19, fdi: 36, arch: 'lower', quadrant: 3, position: 6, type: 'molar', isPrimary: false },
  { universal: 20, fdi: 35, arch: 'lower', quadrant: 3, position: 5, type: 'premolar', isPrimary: false },
  { universal: 21, fdi: 34, arch: 'lower', quadrant: 3, position: 4, type: 'premolar', isPrimary: false },
  { universal: 22, fdi: 33, arch: 'lower', quadrant: 3, position: 3, type: 'canine', isPrimary: false },
  { universal: 23, fdi: 32, arch: 'lower', quadrant: 3, position: 2, type: 'incisor', isPrimary: false },
  { universal: 24, fdi: 31, arch: 'lower', quadrant: 3, position: 1, type: 'incisor', isPrimary: false },
  
  // Lower Right Quadrant (4)
  { universal: 25, fdi: 41, arch: 'lower', quadrant: 4, position: 1, type: 'incisor', isPrimary: false },
  { universal: 26, fdi: 42, arch: 'lower', quadrant: 4, position: 2, type: 'incisor', isPrimary: false },
  { universal: 27, fdi: 43, arch: 'lower', quadrant: 4, position: 3, type: 'canine', isPrimary: false },
  { universal: 28, fdi: 44, arch: 'lower', quadrant: 4, position: 4, type: 'premolar', isPrimary: false },
  { universal: 29, fdi: 45, arch: 'lower', quadrant: 4, position: 5, type: 'premolar', isPrimary: false },
  { universal: 30, fdi: 46, arch: 'lower', quadrant: 4, position: 6, type: 'molar', isPrimary: false },
  { universal: 31, fdi: 47, arch: 'lower', quadrant: 4, position: 7, type: 'molar', isPrimary: false },
  { universal: 32, fdi: 48, arch: 'lower', quadrant: 4, position: 8, type: 'molar', isPrimary: false },
];

// ============================================================================
// PRIMARY DENTITION MAPPING
// ============================================================================

export const PRIMARY_TEETH: ToothPosition[] = [
  // Upper Right Quadrant (5)
  { universal: 'A', fdi: 55, arch: 'upper', quadrant: 1, position: 5, type: 'molar', isPrimary: true },
  { universal: 'B', fdi: 54, arch: 'upper', quadrant: 1, position: 4, type: 'molar', isPrimary: true },
  { universal: 'C', fdi: 53, arch: 'upper', quadrant: 1, position: 3, type: 'canine', isPrimary: true },
  { universal: 'D', fdi: 52, arch: 'upper', quadrant: 1, position: 2, type: 'incisor', isPrimary: true },
  { universal: 'E', fdi: 51, arch: 'upper', quadrant: 1, position: 1, type: 'incisor', isPrimary: true },
  
  // Upper Left Quadrant (6)
  { universal: 'F', fdi: 61, arch: 'upper', quadrant: 2, position: 1, type: 'incisor', isPrimary: true },
  { universal: 'G', fdi: 62, arch: 'upper', quadrant: 2, position: 2, type: 'incisor', isPrimary: true },
  { universal: 'H', fdi: 63, arch: 'upper', quadrant: 2, position: 3, type: 'canine', isPrimary: true },
  { universal: 'I', fdi: 64, arch: 'upper', quadrant: 2, position: 4, type: 'molar', isPrimary: true },
  { universal: 'J', fdi: 65, arch: 'upper', quadrant: 2, position: 5, type: 'molar', isPrimary: true },
  
  // Lower Left Quadrant (7)
  { universal: 'K', fdi: 75, arch: 'lower', quadrant: 3, position: 5, type: 'molar', isPrimary: true },
  { universal: 'L', fdi: 74, arch: 'lower', quadrant: 3, position: 4, type: 'molar', isPrimary: true },
  { universal: 'M', fdi: 73, arch: 'lower', quadrant: 3, position: 3, type: 'canine', isPrimary: true },
  { universal: 'N', fdi: 72, arch: 'lower', quadrant: 3, position: 2, type: 'incisor', isPrimary: true },
  { universal: 'O', fdi: 71, arch: 'lower', quadrant: 3, position: 1, type: 'incisor', isPrimary: true },
  
  // Lower Right Quadrant (8)
  { universal: 'P', fdi: 81, arch: 'lower', quadrant: 4, position: 1, type: 'incisor', isPrimary: true },
  { universal: 'Q', fdi: 82, arch: 'lower', quadrant: 4, position: 2, type: 'incisor', isPrimary: true },
  { universal: 'R', fdi: 83, arch: 'lower', quadrant: 4, position: 3, type: 'canine', isPrimary: true },
  { universal: 'S', fdi: 84, arch: 'lower', quadrant: 4, position: 4, type: 'molar', isPrimary: true },
  { universal: 'T', fdi: 85, arch: 'lower', quadrant: 4, position: 5, type: 'molar', isPrimary: true },
];

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

export function universalToFDI(universal: UniversalNumber, isPrimary: boolean = false): FDINumber | null {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH;
  const tooth = teeth.find(t => t.universal === universal);
  return tooth?.fdi ?? null;
}

export function fdiToUniversal(fdi: FDINumber): UniversalNumber | null {
  const allTeeth = [...PERMANENT_TEETH, ...PRIMARY_TEETH];
  const tooth = allTeeth.find(t => t.fdi === fdi);
  return tooth?.universal ?? null;
}

export function getToothPosition(universal: UniversalNumber, isPrimary: boolean = false): ToothPosition | null {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH;
  return teeth.find(t => t.universal === universal) ?? null;
}

export function getToothPositionByFDI(fdi: FDINumber): ToothPosition | null {
  const allTeeth = [...PERMANENT_TEETH, ...PRIMARY_TEETH];
  return allTeeth.find(t => t.fdi === fdi) ?? null;
}

// ============================================================================
// TOOTH ID GENERATION
// ============================================================================

export function generateToothId(position: ToothPosition): string {
  return `tooth-${position.fdi}`;
}

// ============================================================================
// ARCH/QUADRANT UTILITIES
// ============================================================================

export function getTeethByArch(arch: ToothArch, isPrimary: boolean = false): ToothPosition[] {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH;
  return teeth.filter(t => t.arch === arch);
}

export function getTeethByQuadrant(quadrant: ToothQuadrant, isPrimary: boolean = false): ToothPosition[] {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH;
  return teeth.filter(t => t.quadrant === quadrant);
}

export function getAllTeeth(includePrimary: boolean = false): ToothPosition[] {
  return includePrimary ? [...PERMANENT_TEETH, ...PRIMARY_TEETH] : PERMANENT_TEETH;
}
