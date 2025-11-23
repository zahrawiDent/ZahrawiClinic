/**
 * Auth Helper Functions
 * Utilities for checking user authentication state and permissions
 */

import { pb } from './pocketbase'
import { COLLECTIONS, USER_TYPES, type UserType } from './constants/roles'

/**
 * Check if current user is a superuser
 */
export const isSuperuser = (): boolean => {
  const authModel = pb.authStore.record
  return authModel?.collectionName === COLLECTIONS.SUPERUSERS
}

/**
 * Check if current user has a specific role
 */
export const hasRole = (role: string): boolean => {
  const authModel = pb.authStore.record as any
  return authModel?.role === role
}

/**
 * Get current user's role (returns null for superusers)
 */
export const getCurrentRole = (): string | null => {
  const authModel = pb.authStore.record as any
  return authModel?.role || null
}

/**
 * Get the current user's type (superuser or regular)
 */
export const getUserType = (): UserType => {
  return isSuperuser() ? USER_TYPES.SUPERUSER : USER_TYPES.REGULAR
}

/**
 * Get the collection name for the current user
 */
export const getCurrentUserCollection = (): string => {
  return isSuperuser() ? COLLECTIONS.SUPERUSERS : COLLECTIONS.USERS
}

/**
 * Check if current user can manage other users
 * (Currently only superusers, but can be extended)
 */
export const canManageUsers = (): boolean => {
  return isSuperuser()
}

/**
 * Check if user can access a specific feature
 * Extensible for future permission system
 */
export const canAccess = (feature: string): boolean => {
  if (isSuperuser()) return true
  
  // Add role-based feature access here
  const role = getCurrentRole()
  
  switch (feature) {
    case 'users:manage':
      return false // Only superusers
    case 'reports:view':
      return true // All authenticated users
    case 'billing:manage':
      return role === 'Dentist' || role === 'Receptionist'
    default:
      return false
  }
}
