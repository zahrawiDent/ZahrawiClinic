/**
 * Addresses Schema
 * 
 * Physical addresses for patients
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const AddressesDataSchema = v.object({
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients

  // Address Type
  addressType: v.optional(v.picklist(["home", "work", "billing", "other"])),
  isPrimary: v.optional(v.boolean()), // default address for patient

  // Address Components
  street: v.pipe(v.string(), v.nonEmpty("Street address is required")),
  street2: v.optional(v.string()), // apartment, suite, etc.
  city: v.pipe(v.string(), v.nonEmpty("City is required")),
  state: v.optional(v.string()), // state/province
  postalCode: v.pipe(v.string(), v.nonEmpty("Postal code is required")),
  country: v.pipe(v.string(), v.nonEmpty("Country is required")),

  // Metadata
  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const AddressesSchema = v.intersect([BaseRecordSchema, AddressesDataSchema])

// Schema for creating/updating (without base record fields)
export const AddressesFormSchema = AddressesDataSchema

// Types
export type AddressesRecord = v.InferOutput<typeof AddressesSchema>
export type AddressesFormData = v.InferOutput<typeof AddressesFormSchema>
