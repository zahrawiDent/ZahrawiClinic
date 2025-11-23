import { Show, splitProps, type JSX, For } from "solid-js"

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectProps = {
  name: string
  label?: string
  placeholder?: string
  value?: string
  errors?: string[]
  required?: boolean
  disabled?: boolean
  options: SelectOption[]
  ref?: (element: HTMLSelectElement) => void
  onInput?: JSX.EventHandler<HTMLSelectElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLSelectElement, Event>
  onBlur?: JSX.EventHandler<HTMLSelectElement, FocusEvent>
}

export function Select(props: SelectProps) {
  const [local, selectProps] = splitProps(props, ['label', 'errors', 'placeholder', 'required', 'options', 'value'])

  return (
    <div class="space-y-2">
      <Show when={local.label}>
        <label
          for={props.name}
          class="block text-sm font-medium text-[var(--color-text-primary)] transition-colors"
        >
          {local.label}
          <Show when={local.required}>
            <span class="text-[var(--color-error)] ml-1">*</span>
          </Show>
        </label>
      </Show>
      <div class="relative">
        <select
          {...selectProps}
          id={props.name}
          aria-invalid={!!local.errors?.[0]}
          aria-errormessage={`${props.name}-error`}
          class={`
            w-full px-4 py-2.5 rounded-lg
            bg-[var(--color-bg-primary)] 
            border transition-all duration-200
            text-[var(--color-text-primary)]
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            ${local.errors?.[0]
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
              : 'border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)] focus:ring-[var(--color-border-focus)]/20'
            }
          `}
        >
          <Show when={local.placeholder}>
            <option value="" disabled selected={!local.value}>
              {local.placeholder}
            </option>
          </Show>
          <For each={local.options}>
            {(option) => (
              <option value={option.value} disabled={option.disabled} selected={option.value === local.value}>
                {option.label}
              </option>
            )}
          </For>
        </select>
        {/* Dropdown Arrow */}
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <Show when={local.errors?.[0]}>
        <div
          id={`${props.name}-error`}
          class="text-sm text-[var(--color-error-text)] flex items-center gap-1.5"
          role="alert"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {local.errors?.[0]}
        </div>
      </Show>
    </div >
  )
}
