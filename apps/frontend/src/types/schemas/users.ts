/**
 * Users Schema
 * 
 * Built-in PocketBase auth collection
 */

import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// Data fields (without base record fields)
export const UsersDataSchema = v.object({
  email: v.optional(v.string()),
  username: v.optional(v.string()),
  verified: v.optional(v.boolean()),
  emailVisibility: v.optional(v.boolean()),
  name: v.optional(v.string()),
  avatar: v.optional(v.string()),
  role: v.picklist(['Dentist', "Receptionist"]),
  // Add your custom fields here
})

// Full schema with base record fields (for API responses)
export const UsersSchema = v.intersect([BaseRecordSchema, UsersDataSchema])

// Schema for creating/updating (without base record fields)
export const UsersFormSchema = UsersDataSchema

// Types
export type UsersRecord = v.InferOutput<typeof UsersSchema>
export type UsersFormData = v.InferOutput<typeof UsersFormSchema>
