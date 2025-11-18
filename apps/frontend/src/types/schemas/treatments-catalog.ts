/**
 * Treatments Catalog Schema
 * 
 * Standardized treatment definitions
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const TreatmentsCatalogDataSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Treatment name is required")),
  description: v.optional(v.string()),
  default_price: v.number(),
  category: v.optional(v.string()), // e.g., "preventive", "restorative", "surgical"
  code: v.optional(v.string()), // procedure code (CPT, CDT, etc.)
  insuranceCoverage: v.optional(v.number()), // typical insurance coverage percentage
  estimatedDuration: v.optional(v.number()), // in minutes
})

// Full schema with base record fields (for API responses)
export const TreatmentsCatalogSchema = v.intersect([BaseRecordSchema, TreatmentsCatalogDataSchema])

// Schema for creating/updating (without base record fields)
export const TreatmentsCatalogFormSchema = TreatmentsCatalogDataSchema

// Types
export type TreatmentsCatalogRecord = v.InferOutput<typeof TreatmentsCatalogSchema>
export type TreatmentsCatalogFormData = v.InferOutput<typeof TreatmentsCatalogFormSchema>
