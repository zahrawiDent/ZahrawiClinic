/**
 * Patient Insurance Schema
 * 
 * Insurance policy information for patients
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const PatientInsuranceDataSchema = v.object({
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients

  // Insurance Provider
  insuranceProvider: v.pipe(v.string(), v.nonEmpty("Insurance provider is required")),
  policyNumber: v.pipe(v.string(), v.nonEmpty("Policy number is required")),
  groupNumber: v.optional(v.string()),

  // Coverage
  coverageType: v.optional(v.picklist(["individual", "family", "group"])),
  coverageLevel: v.optional(v.picklist(["basic", "standard", "premium"])),

  // Policyholder Info
  policyholderName: v.pipe(v.string(), v.nonEmpty("Policyholder name is required")),
  policyholderRelationship: v.pipe(
    v.picklist(["self", "spouse", "parent", "guardian", "other"]),
    v.nonEmpty("Relationship is required")
  ),
  policyholderDOB: v.optional(v.string()), // ISO date

  // Dates
  effectiveDate: v.optional(v.string()), // ISO date
  expirationDate: v.optional(v.string()), // ISO date

  // Coverage Details
  annualMaximum: v.optional(v.number()), // max coverage per year
  deductible: v.optional(v.number()),
  coPayment: v.optional(v.number()),

  // Coverage Percentages
  preventiveCoverage: v.optional(v.number()), // percentage (e.g., 100)
  basicCoverage: v.optional(v.number()), // percentage
  majorCoverage: v.optional(v.number()), // percentage
  orthodonticCoverage: v.optional(v.number()), // percentage

  // Contact
  insurancePhone: v.optional(v.string()),
  claimsAddress: v.optional(v.string()),

  // Priority
  isPrimary: v.optional(v.boolean()), // primary vs secondary insurance
  priority: v.optional(v.number()), // 1 = primary, 2 = secondary

  // Status
  status: v.optional(v.picklist(["active", "inactive", "pending", "expired"])),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const PatientInsuranceSchema = v.intersect([BaseRecordSchema, PatientInsuranceDataSchema])

// Schema for creating/updating (without base record fields)
export const PatientInsuranceFormSchema = PatientInsuranceDataSchema

// Types
export type PatientInsuranceRecord = v.InferOutput<typeof PatientInsuranceSchema>
export type PatientInsuranceFormData = v.InferOutput<typeof PatientInsuranceFormSchema>
