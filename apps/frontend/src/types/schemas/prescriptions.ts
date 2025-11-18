/**
 * Prescriptions Schema
 * 
 * Medication prescriptions for patients
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const PrescriptionsDataSchema = v.object({
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients
  prescribedBy: v.pipe(v.string(), v.nonEmpty("Prescribing dentist is required")), // relation to users (dentist)

  // Related visit
  appointment: v.optional(v.string()), // relation to appointments
  treatment: v.optional(v.string()), // relation to treatments

  // Medication Details
  medicationName: v.pipe(v.string(), v.nonEmpty("Medication name is required")),
  dosage: v.pipe(v.string(), v.nonEmpty("Dosage is required")), // e.g., "500mg"
  frequency: v.pipe(v.string(), v.nonEmpty("Frequency is required")), // e.g., "twice daily"
  duration: v.pipe(v.string(), v.nonEmpty("Duration is required")), // e.g., "7 days"

  // Dates
  prescriptionDate: v.pipe(v.string(), v.nonEmpty("Prescription date is required")), // ISO date
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),

  // Instructions
  instructions: v.optional(v.string()), // e.g., "take with food"
  purpose: v.optional(v.string()), // e.g., "antibiotic for infection"

  // Quantity & Refills
  quantity: v.optional(v.number()),
  refillsAllowed: v.optional(v.number()),

  // Status
  status: v.optional(v.picklist(["active", "completed", "discontinued"])),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const PrescriptionsSchema = v.intersect([BaseRecordSchema, PrescriptionsDataSchema])

// Schema for creating/updating (without base record fields)
export const PrescriptionsFormSchema = PrescriptionsDataSchema

// Types
export type PrescriptionsRecord = v.InferOutput<typeof PrescriptionsSchema>
export type PrescriptionsFormData = v.InferOutput<typeof PrescriptionsFormSchema>
