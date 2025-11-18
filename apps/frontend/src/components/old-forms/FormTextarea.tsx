/**
 * FormTextarea - Reusable textarea component
 */

import { type JSX } from 'solid-js'
import { FormField } from './FormField'

export interface FormTextareaProps {
  field: any
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  rows?: number
  class?: string
  maxLength?: number
}

export function FormTextarea(props: FormTextareaProps) {
  const handleInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent> = (e) => {
    props.field.handleChange(e.currentTarget.value)
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
      <textarea
        id={props.field.name}
        name={props.field.name}
        value={props.field.state.value ?? ''}
        onInput={handleInput}
        onBlur={props.field.handleBlur}
        placeholder={props.placeholder}
        disabled={props.disabled}
        rows={props.rows || 4}
        maxLength={props.maxLength}
        aria-invalid={hasErrors()}
        class={`
          w-full px-3 py-2 
          border rounded-lg shadow-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-vertical
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
