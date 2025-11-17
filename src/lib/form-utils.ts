/**
 * Form Utilities and Valibot Adapter for TanStack Solid Form
 * 
 * This module provides utilities for integrating Valibot validation
 * with TanStack Solid Form.
 */

import * as v from 'valibot'

/**
 * Converts a Valibot schema into a TanStack Form validator
 * 
 * @example
 * ```tsx
 * const schema = v.pipe(v.string(), v.email())
 * 
 * <form.Field
 *   name="email"
 *   validators={{ onChange: valibotValidator(schema) }}
 * />
 * ```
 */
export function valibotValidator<TData>(
  schema: v.BaseSchema<TData, any, any>
) {
  return ({ value }: { value: TData }) => {
    const result = v.safeParse(schema, value)
    return result.success 
      ? undefined 
      : result.issues.map((issue) => issue.message).join(', ')
  }
}

/**
 * Async version of valibotValidator for schemas with async validations
 * 
 * @example
 * ```tsx
 * const schema = v.pipeAsync(
 *   v.string(),
 *   v.email(),
 *   v.checkAsync(isEmailUnique, 'Email already exists')
 * )
 * 
 * <form.Field
 *   name="email"
 *   validators={{ 
 *     onChangeAsync: valibotValidatorAsync(schema),
 *     onChangeAsyncDebounceMs: 500
 *   }}
 * />
 * ```
 */
export function valibotValidatorAsync<TData>(
  schema: v.BaseSchema<TData, any, any> | v.BaseSchemaAsync<TData, any, any>
) {
  return async ({ value }: { value: TData }) => {
    const result = await v.safeParseAsync(schema, value)
    return result.success 
      ? undefined 
      : result.issues.map((issue) => issue.message).join(', ')
  }
}
