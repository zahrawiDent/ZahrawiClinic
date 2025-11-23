/**
 * Route Guards
 * Authorization checks for route protection
 */

import { redirect } from "@tanstack/solid-router"
import type { RouterContext } from "@/index"
import { isSuperuser } from "./auth-helpers"
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
  if (!isSuperuser()) {
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
  // Allow superusers
  if (isSuperuser()) {
    return
  }

  // Check role for regular users
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const authModel = pb.authStore.record as any

  if (!authModel?.role || !roles.includes(authModel.role)) {
    throw new Error(`Unauthorized: Requires superuser or one of: ${roles.join(', ')}`)
  }
}

