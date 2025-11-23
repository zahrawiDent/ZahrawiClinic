/**
 * FormInput - Reusable text input component with type safety
 * 
 * @example
 * ```tsx
 * <form.Field name="email" validators={validators.email}>
 *   {(field) => (
 *     <FormInput
 *       field={field()}
 *       label="Email"
 *       type="email"
 *       placeholder="user@example.com"
 *       required
 *     />
 *   )}
 * </form.Field>
 * ```
 */

import { type JSX } from 'solid-js'
import { FormField } from './FormField'

export type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search' 
  | 'date' 
  | 'time' 
  | 'datetime-local'
  | 'month'
  | 'week'

export interface FormInputProps {
  /** TanStack Form field object */
  field: any
  /** Label text displayed above the input */
  label?: string
  /** Helper text displayed below the label */
  description?: string
  /** Whether the field is required (adds asterisk to label) */
  required?: boolean
  /** Input type - defaults to 'text' */
  type?: InputType
  /** Placeholder text */
  placeholder?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  class?: string
  /** HTML autocomplete attribute */
  autoComplete?: string
  /** Minimum value (for number/date types) */
  min?: number | string
  /** Maximum value (for number/date types) */
  max?: number | string
  /** Step value (for number types) */
  step?: number | string
  /** Pattern validation (regex) */
  pattern?: string
}

export function FormInput(props: FormInputProps) {
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const value = props.type === 'number' 
      ? e.currentTarget.valueAsNumber 
      : e.currentTarget.value
    props.field.handleChange(value)
  }

  const hasErrors = () => props.field.state.meta.errors.length > 0

  return (
    <FormField
      field={props.field}
      label={props.label}
      description={props.description}
      required={props.required}
      class={props.class}
    >
      <input
        id={props.field.name}
        name={props.field.name}
        type={props.type || 'text'}
        value={props.field.state.value ?? ''}
        onInput={handleInput}
        onBlur={props.field.handleBlur}
        placeholder={props.placeholder}
        disabled={props.disabled}
        autocomplete={props.autoComplete}
        min={props.min}
        max={props.max}
        step={props.step}
        pattern={props.pattern}
        aria-invalid={hasErrors()}
        aria-required={props.required}
        class={`
          w-full px-3 py-2 
          border rounded-lg shadow-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${hasErrors() 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
          }
        `}
      />
    </FormField>
  )
}
