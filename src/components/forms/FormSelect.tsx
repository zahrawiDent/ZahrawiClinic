/**
 * FormSelect - Reusable select/dropdown component
 */

import { type JSX, For } from 'solid-js'
import { FormField } from './FormField'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface FormSelectProps {
  field: any
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  options: SelectOption[]
  class?: string
}

export function FormSelect(props: FormSelectProps) {
  const handleChange: JSX.EventHandler<HTMLSelectElement, Event> = (e) => {
    const value = e.currentTarget.value
    props.field.handleChange(value === '' ? undefined : value)
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
      <select
        id={props.field.name}
        name={props.field.name}
        value={props.field.state.value ?? ''}
        onChange={handleChange}
        onBlur={props.field.handleBlur}
        disabled={props.disabled}
        aria-invalid={hasErrors()}
        class={`
          w-full px-3 py-2 
          border rounded-lg shadow-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${hasErrors() 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
          }
        `}
      >
        <option value="" disabled={props.required}>
          {props.placeholder || 'Select an option'}
        </option>
        <For each={props.options}>
          {(option) => (
            <option value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          )}
        </For>
      </select>
    </FormField>
  )
}
