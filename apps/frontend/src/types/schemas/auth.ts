/**
 * Auth Schemas
 * 
 * Login and signup form validation schemas
 */

import * as v from 'valibot'

// Login Schema
export const LoginFormSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email is required"),
    v.email("Please enter a valid email address")
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password is required")
  ),
})

// Signup Schema
export const SignupFormSchema = v.pipe(
  v.object({
    name: v.optional(v.pipe(
      v.string(),
      v.trim(),
      v.minLength(2, "Name must be at least 2 characters")
    )),
    email: v.pipe(
      v.string(),
      v.nonEmpty("Email is required"),
      v.email("Please enter a valid email address")
    ),
    password: v.pipe(
      v.string(),
      v.nonEmpty("Password is required"),
      v.minLength(8, "Password must be at least 8 characters")
    ),
    passwordConfirm: v.pipe(
      v.string(),
      v.nonEmpty("Please confirm your password")
    ),
    avatar: v.optional(v.any()), // File input
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['passwordConfirm']],
      (input) => input.password === input.passwordConfirm,
      "Passwords do not match"
    ),
    ['passwordConfirm']
  )
)

// Types
export type LoginFormData = v.InferOutput<typeof LoginFormSchema>
export type SignupFormData = v.InferOutput<typeof SignupFormSchema>
