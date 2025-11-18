/**
 * Emergency Contacts Schema
 * 
 * Emergency contact persons for patients
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const EmergencyContactsDataSchema = v.object({
  patient: v.pipe(v.string(), v.nonEmpty("Patient is required")), // relation to patients

  // Contact Info
  name: v.pipe(v.string(), v.nonEmpty("Name is required")),
  relationship: v.pipe(v.string(), v.nonEmpty("Relationship is required")), // e.g., "spouse", "parent", "sibling"
  
  // Phone Numbers
  primaryPhone: v.pipe(v.string(), v.nonEmpty("Primary phone is required")),
  secondaryPhone: v.optional(v.string()),
  
  // Additional Contact
  email: v.optional(v.pipe(v.string(), v.email("Invalid email format"))),

  // Priority
  isPrimary: v.optional(v.boolean()), // primary emergency contact
  priority: v.optional(v.number()), // 1 = highest priority

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const EmergencyContactsSchema = v.intersect([BaseRecordSchema, EmergencyContactsDataSchema])

// Schema for creating/updating (without base record fields)
export const EmergencyContactsFormSchema = EmergencyContactsDataSchema

// Types
export type EmergencyContactsRecord = v.InferOutput<typeof EmergencyContactsSchema>
export type EmergencyContactsFormData = v.InferOutput<typeof EmergencyContactsFormSchema>
