/**
 * Todos Schema
 * 
 * Task management for office and clinical tasks
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const TaskDataSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty("Title is required")),
  description: v.optional(v.string()),
  completed: v.boolean(),
  priority: v.optional(v.picklist(['low', 'medium', 'high', 'urgent'])),
  dueDate: v.optional(v.string()),
  assignedTo: v.optional(v.string()), // relation to users
  relatedPatient: v.optional(v.string()), // relation to patients
  category: v.optional(v.picklist(['administrative', 'clinical', 'follow_up', 'billing', 'other'])),
})

// Full schema with base record fields (for API responses)
export const TaskSchema = v.intersect([BaseRecordSchema, TaskDataSchema])

// Schema for creating/updating (without base record fields)
export const TaskFormSchema = TaskDataSchema

// Types
export type TaskRecord = v.InferOutput<typeof TaskSchema>
export type TaskFormData = v.InferOutput<typeof TaskFormSchema>
