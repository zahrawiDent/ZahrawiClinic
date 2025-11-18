/**
 * Treatment Plan Items Schema
 * 
 * Individual steps in a treatment plan
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const TreatmentPlanItemsDataSchema = v.object({
  treatmentPlan: v.string(), // relation to treatment_plans (required)

  // Treatment Details
  treatmentType: v.string(), // relation to treatments_catalog
  toothNumber: v.optional(v.string()),
  surface: v.optional(v.string()),

  // Planning
  description: v.optional(v.string()),
  priority: v.picklist(["low", "medium", "high", "urgent"]),
  estimatedCost: v.optional(v.number()),
  estimatedDuration: v.optional(v.number()), // minutes

  // Status
  status: v.picklist(["pending", "scheduled", "in_progress", "completed", "cancelled"]),

  // Scheduling
  scheduledDate: v.optional(v.string()), // ISO date
  completedDate: v.optional(v.string()),

  // Link to actual treatment when performed
  completedTreatment: v.optional(v.string()), // relation to treatments

  // Ordering
  sequenceNumber: v.optional(v.number()), // order in treatment plan

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const TreatmentPlanItemsSchema = v.intersect([BaseRecordSchema, TreatmentPlanItemsDataSchema])

// Schema for creating/updating (without base record fields)
export const TreatmentPlanItemsFormSchema = TreatmentPlanItemsDataSchema

// Types
export type TreatmentPlanItemsRecord = v.InferOutput<typeof TreatmentPlanItemsSchema>
export type TreatmentPlanItemsFormData = v.InferOutput<typeof TreatmentPlanItemsFormSchema>
