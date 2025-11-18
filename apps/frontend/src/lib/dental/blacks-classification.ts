/**
 * Black's Classification Helper & Validator
 * Validates surface combinations against Black's classification rules
 */

import type { CariesClass, ToothSurface, ToothType } from '../../types/dental-chart';
import { BLACKS_CLASSIFICATION } from '../../types/dental-chart-v2';

export interface ValidationResult {
  isValid: boolean;
  suggestedClass?: CariesClass;
  errors: string[];
  warnings: string[];
}

/**
 * Determine if tooth is anterior or posterior
 */
export function getToothCategory(toothType: ToothType): 'anterior' | 'posterior' {
  return toothType === 'incisor' || toothType === 'canine' ? 'anterior' : 'posterior';
}

/**
 * Validate surface combination against Black's classification
 */
export function validateSurfaceCombination(
  surfaces: ToothSurface[],
  toothType: ToothType,
  suggestedClass?: CariesClass
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (surfaces.length === 0) {
    result.errors.push('No surfaces selected');
    result.isValid = false;
    return result;
  }

  const toothCategory = getToothCategory(toothType);

  // If class is suggested, validate against it
  if (suggestedClass) {
    const rule = BLACKS_CLASSIFICATION[suggestedClass];
    
    // Check if tooth type matches
    if (!rule.toothTypes.includes(toothCategory)) {
      result.errors.push(
        `Class ${suggestedClass} only applies to ${rule.toothTypes.join(' or ')} teeth`
      );
      result.isValid = false;
    }

    // Check if surfaces are allowed
    const invalidSurfaces = surfaces.filter(s => !rule.allowedSurfaces.includes(s));
    if (invalidSurfaces.length > 0) {
      result.errors.push(
        `Class ${suggestedClass} does not include: ${invalidSurfaces.join(', ')}`
      );
      result.isValid = false;
    }

    return result;
  }

  // Auto-detect classification
  const detectedClass = detectBlacksClass(surfaces, toothType);
  
  if (detectedClass) {
    result.suggestedClass = detectedClass;
    result.isValid = true;
  } else {
    result.warnings.push('Surface combination does not match standard Black\'s classification');
    // Still valid, just unusual
  }

  return result;
}

/**
 * Automatically detect Black's classification from surfaces
 */
export function detectBlacksClass(
  surfaces: ToothSurface[],
  toothType: ToothType
): CariesClass | null {
  const toothCategory = getToothCategory(toothType);
  const surfaceSet = new Set(surfaces);

  // Class I: Occlusal only (posterior)
  if (
    toothCategory === 'posterior' &&
    surfaceSet.has('occlusal') &&
    surfaces.length === 1
  ) {
    return 'I';
  }

  // Class II: Proximal surfaces of posterior teeth
  if (toothCategory === 'posterior') {
    const hasProximal = surfaceSet.has('mesial') || surfaceSet.has('distal');
    const onlyValidSurfaces = surfaces.every(s => 
      ['mesial', 'distal', 'occlusal'].includes(s)
    );
    
    if (hasProximal && onlyValidSurfaces) {
      return 'II';
    }
  }

  // Class III: Proximal surfaces of anterior (not involving incisal)
  if (toothCategory === 'anterior') {
    const hasProximal = surfaceSet.has('mesial') || surfaceSet.has('distal');
    const hasIncisal = surfaceSet.has('incisal');
    
    if (hasProximal && !hasIncisal) {
      const onlyValidSurfaces = surfaces.every(s => 
        ['mesial', 'distal', 'buccal', 'lingual'].includes(s)
      );
      if (onlyValidSurfaces) return 'III';
    }
  }

  // Class IV: Proximal surfaces of anterior (involving incisal)
  if (toothCategory === 'anterior') {
    const hasProximal = surfaceSet.has('mesial') || surfaceSet.has('distal');
    const hasIncisal = surfaceSet.has('incisal');
    
    if (hasProximal && hasIncisal) {
      return 'IV';
    }
  }

  // Class V: Cervical third (gingival)
  if (
    (surfaceSet.has('buccal') || surfaceSet.has('lingual')) &&
    surfaces.length === 1
  ) {
    return 'V';
  }

  // Class VI: Incisal edges / cusp tips
  if (
    (surfaceSet.has('incisal') || surfaceSet.has('occlusal')) &&
    surfaces.length === 1
  ) {
    return 'VI';
  }

  return null;
}

/**
 * Get common surface combinations for a class
 */
export function getCommonCombinations(
  classType: CariesClass,
  toothType: ToothType
): string[][] {
  const rule = BLACKS_CLASSIFICATION[classType];
  const toothCategory = getToothCategory(toothType);

  // Filter by tooth type compatibility
  if (!rule.toothTypes.includes(toothCategory)) {
    return [];
  }

  return rule.commonCombinations;
}

/**
 * Get surface abbreviation
 */
export function getSurfaceAbbr(surface: ToothSurface): string {
  const abbr: Record<ToothSurface, string> = {
    mesial: 'M',
    occlusal: 'O',
    distal: 'D',
    buccal: 'B',
    lingual: 'L',
    incisal: 'I'
  };
  return abbr[surface];
}

/**
 * Format surface combination as abbreviation string (e.g., "MOD", "MI")
 */
export function formatSurfaceCombination(surfaces: ToothSurface[]): string {
  // Standard order: M, O/I, D, B, L
  const order: ToothSurface[] = ['mesial', 'occlusal', 'incisal', 'distal', 'buccal', 'lingual'];
  
  return surfaces
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map(getSurfaceAbbr)
    .join('');
}

/**
 * Get validation message for UI display
 */
export function getValidationMessage(result: ValidationResult): string {
  if (!result.isValid) {
    return result.errors.join('. ');
  }
  
  if (result.suggestedClass) {
    return `Class ${result.suggestedClass}: ${BLACKS_CLASSIFICATION[result.suggestedClass].description}`;
  }
  
  if (result.warnings.length > 0) {
    return result.warnings.join('. ');
  }
  
  return 'Valid surface combination';
}
