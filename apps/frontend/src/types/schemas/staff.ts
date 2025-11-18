/**
 * Staff Schema
 * 
 * Clinic staff members (dentists, hygienists, assistants, admin)
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const StaffDataSchema = v.object({
  // User account relation
  userId: v.optional(v.string()), // relation to users (if they have login)

  // Personal Info
  firstName: v.pipe(v.string(), v.nonEmpty("First name is required")),
  lastName: v.pipe(v.string(), v.nonEmpty("Last name is required")),
  email: v.optional(v.pipe(v.string(), v.email("Invalid email format"))),
  phone: v.optional(v.string()),

  // Employment
  role: v.pipe(
    v.picklist([
      "dentist",
      "hygienist",
      "dental_assistant",
      "receptionist",
      "manager",
      "lab_technician",
      "other"
    ]),
    v.nonEmpty("Role is required")
  ),
  employmentType: v.optional(v.picklist(["full_time", "part_time", "contract", "intern"])),
  hireDate: v.optional(v.string()), // ISO date
  endDate: v.optional(v.string()), // ISO date (if no longer employed)

  // Professional Details
  licenseNumber: v.optional(v.string()),
  licenseExpiry: v.optional(v.string()), // ISO date
  specialization: v.optional(v.string()),
  certifications: v.optional(v.array(v.string())),

  // Scheduling
  workSchedule: v.optional(v.string()), // JSON or text description
  availableForAppointments: v.optional(v.boolean()),

  // Status
  status: v.optional(v.picklist(["active", "on_leave", "inactive", "terminated"])),

  // Emergency Contact
  emergencyContactName: v.optional(v.string()),
  emergencyContactPhone: v.optional(v.string()),

  notes: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const StaffSchema = v.intersect([BaseRecordSchema, StaffDataSchema])

// Schema for creating/updating (without base record fields)
export const StaffFormSchema = StaffDataSchema

// Types
export type StaffRecord = v.InferOutput<typeof StaffSchema>
export type StaffFormData = v.InferOutput<typeof StaffFormSchema>
