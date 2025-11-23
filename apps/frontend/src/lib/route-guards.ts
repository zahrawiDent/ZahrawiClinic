import { redirect } from "@tanstack/solid-router"
import type { RouterContext } from "@/index"
import { pb } from "./pocketbase"

/**
 * Route guard for pages that require the user to be logged OUT
 * (e.g., login, signup)
 * 
 * If user is authenticated, redirects to dashboard
 */
export const requireGuest = (context: RouterContext) => {
  if (context.auth.isAuthenticated()) {
    throw redirect({
      to: "/dashboard",
    })
  }
}

/**
 * Route guard for pages that require superuser access
 * 
 * Throws an error if user is not a superuser
 */
export const requireSuperuser = () => {
  const authModel = pb.authStore.record

  if (!authModel?.collectionName || authModel.collectionName !== '_superusers') {
    throw new Error('Unauthorized: Superuser access required')
  }
}

/**
 * Route guard for pages that require specific user role(s)
 * 
 * @param allowedRoles - Single role or array of allowed roles
 * @example
 * beforeLoad: () => requireRole('Dentist')
 * beforeLoad: () => requireRole(['Dentist', 'Receptionist'])
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const authModel = pb.authStore.record as any

  if (!authModel?.role) {
    throw new Error('Unauthorized: User role not found')
  }

  if (!roles.includes(authModel.role)) {
    throw new Error(`Unauthorized: Requires one of: ${roles.join(', ')}`)
  }
}

/**
 * Route guard that allows either superusers or specific user roles
 * 
 * @param allowedRoles - Single role or array of allowed roles
 * @example
 * beforeLoad: () => requireSuperuserOrRole('Dentist')
 * beforeLoad: () => requireSuperuserOrRole(['Dentist', 'Receptionist'])
 */
export const requireSuperuserOrRole = (allowedRoles: string | string[]) => {
  const authModel = pb.authStore.record as any

  // Allow superusers
  if (authModel?.collectionName === '_superusers') {
    return
  }

  // Check role
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!authModel?.role || !roles.includes(authModel.role)) {
    throw new Error(`Unauthorized: Requires superuser or one of: ${roles.join(', ')}`)
  }
}

/**
 * Check if current user is a superuser
 */
export const isSuperuser = (): boolean => {
  const authModel = pb.authStore.record
  return authModel?.collectionName === '_superusers'
}

/**
 * Check if current user has a specific role
 */
export const hasRole = (role: string): boolean => {
  const authModel = pb.authStore.record as any
  return authModel?.role === role
}

/**
 * Get current user's role
 */
export const getCurrentRole = (): string | null => {
  const authModel = pb.authStore.record as any
  return authModel?.role || null
}

/**
 * Get current user's collection name
 * Useful for determining which collection to update
 */
export const getCurrentUserCollection = (): string => {
  const authModel = pb.authStore.model as any
  return authModel?.collectionName || 'users'
}
