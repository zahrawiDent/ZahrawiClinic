/**
 * Medical History Schema
 * 
 * Patient medical history records
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const MedicalHistoryDataSchema = v.object({
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients

  // Medical Conditions
  chronicConditions: v.optional(v.array(v.string())), // e.g., ["diabetes", "hypertension"]
  allergies: v.optional(v.array(v.string())), // medications, materials, foods
  currentMedications: v.optional(v.array(v.string())),

  // Dental-Specific
  previousDentalSurgeries: v.optional(v.string()),
  bleedingDisorders: v.optional(v.boolean()),
  pregnancyStatus: v.optional(v.picklist(["not_applicable", "not_pregnant", "pregnant", "unsure"])),

  // Habits
  smokingStatus: v.optional(v.picklist(["never", "former", "current"])),
  alcoholConsumption: v.optional(v.picklist(["none", "occasional", "moderate", "heavy"])),

  // Emergency Info
  bloodType: v.optional(v.picklist(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"])),

  // Notes
  additionalNotes: v.optional(v.string()),
  lastUpdated: v.string(), // ISO date
  updatedBy: v.optional(v.string()), // relation to users (staff)
})

// Full schema with base record fields (for API responses)
export const MedicalHistorySchema = v.intersect([BaseRecordSchema, MedicalHistoryDataSchema])

// Schema for creating/updating (without base record fields)
export const MedicalHistoryFormSchema = MedicalHistoryDataSchema

// Types
export type MedicalHistoryRecord = v.InferOutput<typeof MedicalHistorySchema>
export type MedicalHistoryFormData = v.InferOutput<typeof MedicalHistoryFormSchema>
