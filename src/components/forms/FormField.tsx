/**
 * FormField - Base wrapper component for all form fields
 * 
 * Provides consistent styling, error handling, and label management.
 */

import { Show, type JSX } from 'solid-js'

export interface FormFieldProps {
  field: any
  label?: string
  description?: string
  required?: boolean
  children: JSX.Element
  class?: string
}

export function FormField(props: FormFieldProps) {
  const hasErrors = () => props.field.state.meta.errors.length > 0
  const shouldShowError = () => hasErrors() && props.field.state.meta.isTouched

  return (
    <div class={props.class}>
      <Show when={props.label}>
        <label
          for={props.field.name}
          class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {props.label}
          <Show when={props.required}>
            <span class="text-red-500 ml-1">*</span>
          </Show>
        </label>
      </Show>

      <Show when={props.description}>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {props.description}
        </p>
      </Show>

      {props.children}

      <Show when={shouldShowError()}>
        <p class="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
          {props.field.state.meta.errors.join(', ')}
        </p>
      </Show>
    </div>
  )
}
