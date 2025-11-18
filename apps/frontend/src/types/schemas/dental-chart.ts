/**
 * Dental Chart Schema
 * 
 * Tooth-level clinical data and charting information
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Tooth numbering systems picklist
export const TOOTH_NUMBERING_SYSTEMS = [
  "universal", // 1-32 (US)
  "palmer",    // Quadrant notation
  "fdi"        // Two-digit (ISO 3950)
] as const

// Tooth surface codes
export const TOOTH_SURFACES = [
  "occlusal",  // O
  "mesial",    // M
  "distal",    // D
  "buccal",    // B
  "lingual",   // L
  "incisal",   // I
  "facial"     // F
] as const

// Tooth conditions
export const TOOTH_CONDITIONS = [
  "healthy",
  "cavity",
  "filling",
  "crown",
  "root_canal",
  "missing",
  "extracted",
  "implant",
  "bridge",
  "veneer",
  "fracture",
  "abscess",
  "other"
] as const

// Data fields (without base record fields)
export const DentalChartDataSchema = v.object({
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients

  // Tooth Identification
  toothNumber: v.pipe(v.string(), v.nonEmpty("Tooth number is required")), // e.g., "14", "UR4"
  toothNumberingSystem: v.optional(v.picklist(TOOTH_NUMBERING_SYSTEMS)),

  // Condition
  condition: v.optional(v.picklist(TOOTH_CONDITIONS)),
  affectedSurfaces: v.optional(v.array(v.picklist(TOOTH_SURFACES))), // which surfaces affected

  // Clinical Notes
  diagnosis: v.optional(v.string()),
  findings: v.optional(v.string()),
  
  // Treatment
  existingTreatment: v.optional(v.string()), // description of existing work
  plannedTreatment: v.optional(v.string()), // relation to treatment_plan_items
  treatment: v.optional(v.string()), // relation to treatments (completed)

  // Status
  status: v.optional(v.picklist([
    "healthy",
    "watch",
    "treatment_needed",
    "treatment_planned",
    "treatment_completed",
    "missing",
    "extracted"
  ])),

  // Mobility & Periodontal
  mobility: v.optional(v.picklist(["0", "1", "2", "3"])), // tooth mobility grade
  pocketDepth: v.optional(v.number()), // mm
  bleeding: v.optional(v.boolean()),
  plaque: v.optional(v.boolean()),

  // Dates
  examinationDate: v.optional(v.string()), // ISO date
  lastModifiedDate: v.optional(v.string()), // ISO date
  modifiedBy: v.optional(v.string()), // relation to users (dentist)

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const DentalChartSchema = v.intersect([BaseRecordSchema, DentalChartDataSchema])

// Schema for creating/updating (without base record fields)
export const DentalChartFormSchema = DentalChartDataSchema

// Types
export type DentalChartRecord = v.InferOutput<typeof DentalChartSchema>
export type DentalChartFormData = v.InferOutput<typeof DentalChartFormSchema>

// Type-safe constants for components
export type ToothNumberingSystem = typeof TOOTH_NUMBERING_SYSTEMS[number]
export type ToothSurface = typeof TOOTH_SURFACES[number]
export type ToothCondition = typeof TOOTH_CONDITIONS[number]
