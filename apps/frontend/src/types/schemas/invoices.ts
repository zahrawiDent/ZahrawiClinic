/**
 * Invoices Schema
 * 
 * Billing headers (line items stored in invoice_items)
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const InvoicesDataSchema = v.object({
  patient: v.string(), // relation to patients
  appointment: v.optional(v.string()), // relation to appointments

  // Invoice Details
  invoiceNumber: v.pipe(v.string(), v.nonEmpty("Invoice number is required")), // indexed, unique
  invoiceDate: v.string(), // ISO date
  dueDate: v.optional(v.string()),

  // Totals (calculated from invoice_items)
  subtotal: v.number(),
  tax: v.optional(v.number()),
  discount: v.optional(v.number()),
  total: v.number(),

  // Status
  status: v.picklist(["draft", "sent", "paid", "partial", "overdue", "cancelled"]),

  // Insurance
  insuranceClaim: v.optional(v.string()), // relation to insurance_claims
  insuranceAmount: v.optional(v.number()),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const InvoicesSchema = v.intersect([BaseRecordSchema, InvoicesDataSchema])

// Schema for creating/updating (without base record fields)
export const InvoicesFormSchema = InvoicesDataSchema

// Types
export type InvoicesRecord = v.InferOutput<typeof InvoicesSchema>
export type InvoicesFormData = v.InferOutput<typeof InvoicesFormSchema>
