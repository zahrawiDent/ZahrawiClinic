/**
 * Base Schema
 * 
 * Common schema elements used across all collections
 */

import * as v from 'valibot'
import type { RecordModel } from 'pocketbase'

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string

/**
 * Base schema for all PocketBase records
 * Every record has these fields by default (managed by PocketBase)
 */
export const BaseRecordSchema = v.object({
  id: v.string(),
  created: v.string(), // ISO timestamp
  updated: v.string(), // ISO timestamp
})

export type BaseRecord = v.InferOutput<typeof BaseRecordSchema> & RecordModel
