/**
 * Central Schema Exports
 * 
 * Import schemas from here instead of individual files for convenience.
 * This provides a single import point for all collection schemas.
 * 
 * @example
 * // Import specific schemas
 * import { TodoSchema, TodoFormSchema } from '@/types/schemas'
 * 
 * // Import all from one collection
 * import * as TodoSchemas from '@/types/schemas/todos'
 */

// Base Record Schema
export * from './base'

// Auth
export * from './auth'
export * from './users'

// Patient Management
export * from './patients'
export * from './addresses'
export * from './emergency-contacts'
export * from './patient-insurance'
export * from './medical-history'

// Appointments & Scheduling
export * from './appointments'

// Clinical
export * from './treatments'
export * from './treatments-catalog'
export * from './treatment-plans'
export * from './treatment-plan-items'
export * from './dental-chart'
export * from './prescriptions'

// Financial
export * from './invoices'
export * from './invoice-items'
export * from './payments'
export * from './insurance-claims'

// Operations
export * from './inventory'
export * from './staff'

// Task Management
export * from './tasks'
