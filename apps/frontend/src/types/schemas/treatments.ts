/**
 * Treatments Schema
 * 
 * Individual treatment records performed during appointments
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const TreatmentsDataSchema = v.object({
  patient: v.string(), // relation to patients
  appointment: v.optional(v.string()), // relation to appointments
  performedBy: v.string(), // relation to users (dentist)

  // Treatment Details (normalized)
  treatmentType: v.string(), // relation to treatments_catalog
  toothNumber: v.optional(v.string()), // dental notation (e.g., "18", "2.1")
  surface: v.optional(v.string()), // e.g., "occlusal", "mesial"

  // Clinical Notes
  diagnosis: v.optional(v.string()),
  procedure: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Billing
  actualCost: v.optional(v.number()), // if different from catalog price

  // Link to invoice item for payment tracking
  invoiceItem: v.optional(v.string()), // relation to invoice_items

  // Date
  treatmentDate: v.string(), // ISO date
  completedAt: v.optional(v.string()), // ISO date
})

// Full schema with base record fields (for API responses)
export const TreatmentsSchema = v.intersect([BaseRecordSchema, TreatmentsDataSchema])

// Schema for creating/updating (without base record fields)
export const TreatmentsFormSchema = TreatmentsDataSchema

// Types
export type TreatmentsRecord = v.InferOutput<typeof TreatmentsSchema>
export type TreatmentsFormData = v.InferOutput<typeof TreatmentsFormSchema>
