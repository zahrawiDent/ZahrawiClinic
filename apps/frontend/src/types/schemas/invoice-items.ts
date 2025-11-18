/**
 * Invoice Items Schema
 * 
 * Line items for invoices (treatments, services, products)
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const InvoiceItemsDataSchema = v.object({
  invoice: v.pipe(v.string(), v.nonEmpty("Invoice is required")), // relation to invoices

  // Item Details
  description: v.pipe(v.string(), v.nonEmpty("Description is required")),
  quantity: v.pipe(v.number(), v.minValue(1, "Quantity must be at least 1")),
  unitPrice: v.pipe(v.number(), v.minValue(0, "Unit price must be positive")),
  total: v.number(), // calculated: quantity * unitPrice

  // Optional Relations
  treatmentType: v.optional(v.string()), // relation to treatments_catalog
  treatment: v.optional(v.string()), // relation to treatments

  // Tax & Discount
  taxRate: v.optional(v.number()), // percentage
  discountAmount: v.optional(v.number()),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const InvoiceItemsSchema = v.intersect([BaseRecordSchema, InvoiceItemsDataSchema])

// Schema for creating/updating (without base record fields)
export const InvoiceItemsFormSchema = InvoiceItemsDataSchema

// Types
export type InvoiceItemsRecord = v.InferOutput<typeof InvoiceItemsSchema>
export type InvoiceItemsFormData = v.InferOutput<typeof InvoiceItemsFormSchema>
