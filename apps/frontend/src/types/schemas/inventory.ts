/**
 * Inventory Schema
 * 
 * Dental supplies and equipment inventory tracking
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const InventoryDataSchema = v.object({
  // Item Details
  itemName: v.pipe(v.string(), v.nonEmpty("Item name is required")),
  itemCode: v.optional(v.string()), // SKU or internal code
  category: v.optional(v.picklist([
    "consumables",
    "instruments",
    "equipment",
    "medications",
    "materials",
    "office_supplies",
    "other"
  ])),

  // Quantity
  currentStock: v.pipe(v.number(), v.minValue(0, "Stock cannot be negative")),
  minStock: v.optional(v.number()), // reorder threshold
  maxStock: v.optional(v.number()),
  unit: v.optional(v.string()), // e.g., "pieces", "boxes", "liters"

  // Pricing
  unitCost: v.optional(v.number()),
  sellingPrice: v.optional(v.number()),

  // Supplier Info
  supplier: v.optional(v.string()),
  supplierCode: v.optional(v.string()),

  // Tracking
  lastRestocked: v.optional(v.string()), // ISO date
  expirationDate: v.optional(v.string()), // ISO date
  batchNumber: v.optional(v.string()),

  // Location
  storageLocation: v.optional(v.string()),

  // Status
  status: v.optional(v.picklist(["in_stock", "low_stock", "out_of_stock", "discontinued"])),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const InventorySchema = v.intersect([BaseRecordSchema, InventoryDataSchema])

// Schema for creating/updating (without base record fields)
export const InventoryFormSchema = InventoryDataSchema

// Types
export type InventoryRecord = v.InferOutput<typeof InventorySchema>
export type InventoryFormData = v.InferOutput<typeof InventoryFormSchema>
