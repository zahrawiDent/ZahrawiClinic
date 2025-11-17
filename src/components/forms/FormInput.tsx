/**
 * FormInput - Reusable text input component
 */

import { type JSX } from 'solid-js'
import { FormField } from './FormField'

export interface FormInputProps {
  field: any
  label?: string
  description?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'
  placeholder?: string
  disabled?: boolean
  class?: string
  autoComplete?: string
  min?: number | string
  max?: number | string
  step?: number | string
}

export function FormInput(props: FormInputProps) {
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const value = props.type === 'number' ? e.currentTarget.valueAsNumber : e.currentTarget.value
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
        aria-invalid={hasErrors()}
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
