/**
 * Treatment Plans Schema
 * 
 * Multi-step treatment plans for patients
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const TreatmentPlansDataSchema = v.object({
  patient: v.string(), // relation to patients
  createdBy: v.string(), // relation to users (dentist)

  // Plan Details
  title: v.pipe(v.string(), v.nonEmpty("Title is required")),
  description: v.optional(v.string()),
  diagnosis: v.optional(v.string()),

  // Status
  status: v.picklist(["proposed", "accepted", "in_progress", "completed", "cancelled"]),

  // Dates
  proposedDate: v.optional(v.string()), // ISO date
  acceptedDate: v.optional(v.string()),
  completedDate: v.optional(v.string()),

  // Financial (calculated from plan items)
  estimatedCost: v.optional(v.number()),
})

// Full schema with base record fields (for API responses)
export const TreatmentPlansSchema = v.intersect([BaseRecordSchema, TreatmentPlansDataSchema])

// Schema for creating/updating (without base record fields)
export const TreatmentPlansFormSchema = TreatmentPlansDataSchema

// Types
export type TreatmentPlansRecord = v.InferOutput<typeof TreatmentPlansSchema>
export type TreatmentPlansFormData = v.InferOutput<typeof TreatmentPlansFormSchema>
