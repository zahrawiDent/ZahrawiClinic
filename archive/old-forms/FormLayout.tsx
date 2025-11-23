/**
 * Form Layout Components
 * 
 * Provides consistent layout and structure for forms throughout the app.
 */

import { type JSX, type ParentProps, Show } from 'solid-js'

/**
 * FormContainer - Main wrapper for forms
 */
export interface FormContainerProps extends ParentProps {
  title?: string
  description?: string
  onSubmit?: JSX.EventHandler<HTMLFormElement, SubmitEvent>
  class?: string
}

export function FormContainer(props: FormContainerProps) {
  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    props.onSubmit?.(e)
  }

  return (
    <div class={props.class}>
      <Show when={props.title || props.description}>
        <div class="mb-6">
          <Show when={props.title}>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {props.title}
            </h2>
          </Show>
          <Show when={props.description}>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {props.description}
            </p>
          </Show>
        </div>
      </Show>

      <form onSubmit={handleSubmit} class="space-y-6">
        {props.children}
      </form>
    </div>
  )
}

/**
 * FormGroup - Groups related form fields together
 */
export interface FormGroupProps extends ParentProps {
  title?: string
  description?: string
  class?: string
  columns?: 1 | 2 | 3 | 4
}

export function FormGroup(props: FormGroupProps) {
  const gridClass = () => {
    const cols = props.columns ?? 1
    switch (cols) {
      case 2: return 'grid grid-cols-1 md:grid-cols-2 gap-4'
      case 3: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      case 4: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
      default: return 'space-y-4'
    }
  }

  return (
    <div class={props.class}>
      <Show when={props.title || props.description}>
        <div class="mb-4">
          <Show when={props.title}>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {props.title}
            </h3>
          </Show>
          <Show when={props.description}>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {props.description}
            </p>
          </Show>
        </div>
      </Show>

      <div class={gridClass()}>
        {props.children}
      </div>
    </div>
  )
}

/**
 * FormActions - Container for form action buttons
 */
export interface FormActionsProps extends ParentProps {
  class?: string
  align?: 'left' | 'center' | 'right' | 'between'
}

export function FormActions(props: FormActionsProps) {
  const alignClass = () => {
    switch (props.align ?? 'right') {
      case 'left': return 'justify-start'
      case 'center': return 'justify-center'
      case 'between': return 'justify-between'
      default: return 'justify-end'
    }
  }

  return (
    <div class={`flex gap-3 ${alignClass()} ${props.class || ''}`}>
      {props.children}
    </div>
  )
}

/**
 * FormDivider - Visual separator between form sections
 */
export interface FormDividerProps {
  class?: string
}

export function FormDivider(props: FormDividerProps) {
  return (
    <hr class={`border-gray-200 dark:border-gray-700 ${props.class || ''}`} />
  )
}
