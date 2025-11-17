/**
 * Common Validation Schemas
 * 
 * Reusable Valibot schemas for common validation patterns.
 * These can be composed together to create complex validations.
 * 
 * @example
 * ```tsx
 * import * as v from 'valibot'
 * import { emailSchema, phoneSchema } from '~/lib/validation-schemas'
 * 
 * const userSchema = v.object({
 *   email: emailSchema,
 *   phone: phoneSchema,
 * })
 * ```
 */

import * as v from 'valibot'

// ============================================================================
// String Validations
// ============================================================================

/**
 * Required string (non-empty)
 */
export const requiredStringSchema = v.pipe(
  v.string(),
  v.nonEmpty('This field is required.')
)

/**
 * Optional string (can be empty or undefined)
 */
export const optionalStringSchema = v.optional(v.string(), '')

/**
 * Email validation
 */
export const emailSchema = v.pipe(
  v.string(),
  v.nonEmpty('Email is required.'),
  v.email('Please enter a valid email address.'),
  v.maxLength(100, 'Email is too long.')
)

/**
 * Optional email
 */
export const optionalEmailSchema = v.optional(
  v.pipe(
    v.string(),
    v.email('Please enter a valid email address.'),
    v.maxLength(100, 'Email is too long.')
  )
)

/**
 * Phone number validation (basic pattern)
 */
export const phoneSchema = v.pipe(
  v.string(),
  v.nonEmpty('Phone number is required.'),
  v.regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number.'),
  v.minLength(10, 'Phone number must be at least 10 digits.'),
  v.maxLength(20, 'Phone number is too long.')
)

/**
 * Optional phone number
 */
export const optionalPhoneSchema = v.optional(
  v.pipe(
    v.string(),
    v.regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number.'),
    v.minLength(10, 'Phone number must be at least 10 digits.'),
    v.maxLength(20, 'Phone number is too long.')
  )
)

/**
 * URL validation
 */
export const urlSchema = v.pipe(
  v.string(),
  v.nonEmpty('URL is required.'),
  v.url('Please enter a valid URL.')
)

/**
 * Password validation (min 8 chars, with complexity requirements)
 */
export const passwordSchema = v.pipe(
  v.string(),
  v.nonEmpty('Password is required.'),
  v.minLength(8, 'Password must be at least 8 characters.'),
  v.regex(/[A-Z]/, 'Password must contain at least one uppercase letter.'),
  v.regex(/[a-z]/, 'Password must contain at least one lowercase letter.'),
  v.regex(/[0-9]/, 'Password must contain at least one number.')
)

/**
 * Name validation (letters, spaces, hyphens only)
 */
export const nameSchema = v.pipe(
  v.string(),
  v.nonEmpty('Name is required.'),
  v.regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, and hyphens.'),
  v.minLength(2, 'Name must be at least 2 characters.'),
  v.maxLength(50, 'Name is too long.')
)

/**
 * Address validation
 */
export const addressSchema = v.pipe(
  v.string(),
  v.nonEmpty('Address is required.'),
  v.minLength(5, 'Address must be at least 5 characters.'),
  v.maxLength(200, 'Address is too long.')
)

// ============================================================================
// Number Validations
// ============================================================================

/**
 * Positive number
 */
export const positiveNumberSchema = v.pipe(
  v.number(),
  v.minValue(0, 'Value must be positive.')
)

/**
 * Positive integer
 */
export const positiveIntegerSchema = v.pipe(
  v.number(),
  v.integer('Value must be a whole number.'),
  v.minValue(0, 'Value must be positive.')
)

/**
 * Age validation (0-150)
 */
export const ageSchema = v.pipe(
  v.number(),
  v.integer('Age must be a whole number.'),
  v.minValue(0, 'Age must be at least 0.'),
  v.maxValue(150, 'Please enter a valid age.')
)

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = v.pipe(
  v.number(),
  v.minValue(0, 'Percentage must be at least 0.'),
  v.maxValue(100, 'Percentage cannot exceed 100.')
)

/**
 * Price/Money validation
 */
export const priceSchema = v.pipe(
  v.number(),
  v.minValue(0, 'Price must be positive.')
)

// ============================================================================
// Date Validations
// ============================================================================

/**
 * Date in the past
 */
export const pastDateSchema = v.pipe(
  v.date(),
  v.maxValue(new Date(), 'Date cannot be in the future.')
)

/**
 * Date in the future
 */
export const futureDateSchema = v.pipe(
  v.date(),
  v.minValue(new Date(), 'Date must be in the future.')
)

/**
 * Date of birth (reasonable range)
 */
export const dateOfBirthSchema = v.pipe(
  v.date(),
  v.maxValue(new Date(), 'Date of birth cannot be in the future.'),
  v.minValue(
    new Date(new Date().getFullYear() - 150, 0, 1),
    'Please enter a valid date of birth.'
  )
)

// ============================================================================
// Boolean Validations
// ============================================================================

/**
 * Required checkbox (must be true)
 */
export const requiredCheckboxSchema = v.pipe(
  v.boolean(),
  v.literal(true, 'You must accept this.')
)

// ============================================================================
// Common Object Schemas
// ============================================================================

/**
 * Contact information schema
 */
export const contactInfoSchema = v.object({
  email: emailSchema,
  phone: phoneSchema,
})

/**
 * Person name schema
 */
export const personNameSchema = v.object({
  firstName: nameSchema,
  lastName: nameSchema,
})

/**
 * Full address schema
 */
export const fullAddressSchema = v.object({
  street: addressSchema,
  city: v.pipe(v.string(), v.nonEmpty('City is required.')),
  state: v.pipe(v.string(), v.nonEmpty('State is required.')),
  zipCode: v.pipe(
    v.string(),
    v.nonEmpty('ZIP code is required.'),
    v.regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code.')
  ),
  country: v.pipe(v.string(), v.nonEmpty('Country is required.')),
})

// ============================================================================
// Dental-Specific Schemas
// ============================================================================

/**
 * Patient name schema
 */
export const patientNameSchema = personNameSchema

/**
 * Dental insurance number
 */
export const insuranceNumberSchema = v.pipe(
  v.string(),
  v.nonEmpty('Insurance number is required.'),
  v.minLength(5, 'Insurance number must be at least 5 characters.'),
  v.maxLength(50, 'Insurance number is too long.')
)

/**
 * Tooth number validation (1-32 for permanent teeth)
 */
export const toothNumberSchema = v.pipe(
  v.number(),
  v.integer('Tooth number must be a whole number.'),
  v.minValue(1, 'Tooth number must be between 1 and 32.'),
  v.maxValue(32, 'Tooth number must be between 1 and 32.')
)

/**
 * Treatment code schema
 */
export const treatmentCodeSchema = v.pipe(
  v.string(),
  v.nonEmpty('Treatment code is required.'),
  v.regex(/^[A-Z0-9\-]+$/, 'Treatment code must contain only uppercase letters, numbers, and hyphens.')
)
