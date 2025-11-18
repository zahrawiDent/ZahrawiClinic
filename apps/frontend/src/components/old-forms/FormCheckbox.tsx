/**
 * FormCheckbox - Reusable checkbox component
 */

import { type JSX, Show } from 'solid-js'

export interface FormCheckboxProps {
  field: any
  label?: string
  description?: string
  disabled?: boolean
  class?: string
}

export function FormCheckbox(props: FormCheckboxProps) {
  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    props.field.handleChange(e.currentTarget.checked)
  }

  const shouldShowError = () => 
    props.field.state.meta.errors.length > 0 && props.field.state.meta.isTouched

  return (
    <div class={props.class}>
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          id={props.field.name}
          name={props.field.name}
          type="checkbox"
          checked={props.field.state.value ?? false}
          onChange={handleChange}
          onBlur={props.field.handleBlur}
          disabled={props.disabled}
          aria-invalid={props.field.state.meta.errors.length > 0}
          class="mt-1 w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div class="flex-1">
          <Show when={props.label}>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {props.label}
            </span>
          </Show>
          <Show when={props.description}>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {props.description}
            </p>
          </Show>
          <Show when={shouldShowError()}>
            <p class="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
              {props.field.state.meta.errors.join(', ')}
            </p>
          </Show>
        </div>
      </label>
    </div>
  )
}
