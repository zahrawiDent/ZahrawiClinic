/**
 * Insurance Claims Schema
 * 
 * Claims submitted to insurance companies
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const InsuranceClaimsDataSchema = v.object({
  // Relations
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients
  patientInsurance: v.pipe(v.string(), v.nonEmpty("Patient insurance is required")), // relation to patient_insurance
  invoice: v.optional(v.string()), // relation to invoices

  // Claim Details
  claimNumber: v.pipe(v.string(), v.nonEmpty("Claim number is required")), // indexed, unique
  claimDate: v.pipe(v.string(), v.nonEmpty("Claim date is required")), // ISO date
  
  // Service Info
  serviceDate: v.pipe(v.string(), v.nonEmpty("Service date is required")), // ISO date
  treatment: v.optional(v.string()), // relation to treatments
  procedureCodes: v.optional(v.array(v.string())), // CPT/CDT codes
  diagnosisCodes: v.optional(v.array(v.string())), // ICD codes

  // Amounts
  claimedAmount: v.pipe(v.number(), v.minValue(0, "Claimed amount must be positive")),
  approvedAmount: v.optional(v.number()),
  paidAmount: v.optional(v.number()),
  patientResponsibility: v.optional(v.number()),

  // Status Tracking
  status: v.picklist([
    "draft",
    "submitted",
    "pending",
    "under_review",
    "approved",
    "partially_approved",
    "denied",
    "paid",
    "appealed"
  ]),
  submittedDate: v.optional(v.string()), // ISO date
  processedDate: v.optional(v.string()), // ISO date
  paidDate: v.optional(v.string()), // ISO date

  // Denial/Appeal
  denialReason: v.optional(v.string()),
  appealDate: v.optional(v.string()), // ISO date
  appealNotes: v.optional(v.string()),

  // Provider Info
  providerName: v.optional(v.string()),
  providerNPI: v.optional(v.string()), // National Provider Identifier

  // Tracking
  checkNumber: v.optional(v.string()),
  eobReceived: v.optional(v.boolean()), // Explanation of Benefits

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const InsuranceClaimsSchema = v.intersect([BaseRecordSchema, InsuranceClaimsDataSchema])

// Schema for creating/updating (without base record fields)
export const InsuranceClaimsFormSchema = InsuranceClaimsDataSchema

// Types
export type InsuranceClaimsRecord = v.InferOutput<typeof InsuranceClaimsSchema>
export type InsuranceClaimsFormData = v.InferOutput<typeof InsuranceClaimsFormSchema>
