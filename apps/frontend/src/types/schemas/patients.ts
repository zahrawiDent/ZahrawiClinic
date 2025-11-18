/**
 * Patients Schema
 * 
 * Core patient information for the dental practice
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const PatientsDataSchema = v.object({
  // Basic Information
  firstName: v.pipe(v.string(), v.nonEmpty("First name is required")),
  lastName: v.pipe(v.string(), v.nonEmpty("Last name is required")),
  dateOfBirth: v.optional(v.string()), // ISO date
  gender: v.picklist(["male", "female"]),

  // Contact Information
  email: v.optional(v.pipe(v.string(), v.email())),
  phone: v.optional(v.string()),
  mobile: v.optional(v.string()),

  // Address (normalized - relation)
  primaryAddress: v.optional(v.string()), // relation to addresses

  // Practice Management
  primaryDentist: v.optional(v.string()), // relation to users
  status: v.optional(v.picklist(["active", "inactive", "archived"])),
  notes: v.optional(v.string()),

  // Insurance (normalized - relation)
  primaryInsurance: v.optional(v.string()), // relation to patient_insurance

  // Emergency Contact (normalized - relation)
  emergencyContact: v.optional(v.string()), // relation to emergency_contacts
})

// Full schema with base record fields (for API responses)
export const PatientsSchema = v.intersect([BaseRecordSchema, PatientsDataSchema])

// Schema for creating/updating (without base record fields)
export const PatientsFormSchema = PatientsDataSchema

// Types
export type PatientsRecord = v.InferOutput<typeof PatientsSchema>
export type PatientsFormData = v.InferOutput<typeof PatientsFormSchema>
