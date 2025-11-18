/**
 * Appointments Schema
 * 
 * Scheduling and appointment management
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Enums
export const APPOINTMENT_STATUS = {
  scheduled: "scheduled",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no_show",
} as const

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS]

export const APPOINTMENT_TYPE = {
  checkup: "checkup",
  cleaning: "cleaning",
  filling: "filling",
  extraction: "extraction",
  root_canal: "root_canal",
  crown: "crown",
  consultation: "consultation",
  emergency: "emergency",
  other: "other",
} as const

export type AppointmentType = (typeof APPOINTMENT_TYPE)[keyof typeof APPOINTMENT_TYPE]

// Data fields (without base record fields)
export const AppointmentsDataSchema = v.object({
  patient: v.string(), // relation to patients (required)
  dentist: v.string(), // relation to users (required)

  // Scheduling
  start_time: v.string(), // ISO date
  duration: v.number(), // in minutes
  status: v.picklist(Object.values(APPOINTMENT_STATUS)),

  // Appointment Details
  type: v.picklist(Object.values(APPOINTMENT_TYPE)),
  treatmentPlan: v.optional(v.string()), // relation to treatment_plans
  room: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Completion
  completedAt: v.optional(v.string()),
  cancelledAt: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),
})

// Full schema with base record fields (for API responses)
export const AppointmentsSchema = v.intersect([BaseRecordSchema, AppointmentsDataSchema])

// Schema for creating/updating (without base record fields)
export const AppointmentsFormSchema = AppointmentsDataSchema

// Types
export type AppointmentsRecord = v.InferOutput<typeof AppointmentsSchema>
export type AppointmentsFormData = v.InferOutput<typeof AppointmentsFormSchema>
