/**
 * Centralized role and user type constants
 * Single source of truth for all role-related configuration
 */

// User roles available in the system
export const USER_ROLES = {
  DENTIST: 'Dentist',
  RECEPTIONIST: 'Receptionist',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// All available roles as an array
export const ALL_ROLES = Object.values(USER_ROLES)

// Role options for select inputs
export const ROLE_OPTIONS = ALL_ROLES.map(role => ({
  value: role,
  label: role,
}))

// Collection names
export const COLLECTIONS = {
  SUPERUSERS: '_superusers',
  USERS: 'users',
} as const

// User type helpers
export const USER_TYPES = {
  SUPERUSER: 'superuser',
  REGULAR: 'regular',
} as const

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]
