/**
 * Payments Schema
 * 
 * Payment records for invoices
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const PaymentsDataSchema = v.object({
  invoice: v.pipe(v.string(), v.nonEmpty("Invoice is required")), // relation to invoices
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients

  // Payment Details
  amount: v.pipe(v.number(), v.minValue(0, "Amount must be positive")),
  paymentDate: v.pipe(v.string(), v.nonEmpty("Payment date is required")), // ISO date
  paymentMethod: v.picklist([
    "cash",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "insurance",
    "check",
    "other"
  ]),

  // Transaction info
  transactionId: v.optional(v.string()),
  reference: v.optional(v.string()),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const PaymentsSchema = v.intersect([BaseRecordSchema, PaymentsDataSchema])

// Schema for creating/updating (without base record fields)
export const PaymentsFormSchema = PaymentsDataSchema

// Types
export type PaymentsRecord = v.InferOutput<typeof PaymentsSchema>
export type PaymentsFormData = v.InferOutput<typeof PaymentsFormSchema>
