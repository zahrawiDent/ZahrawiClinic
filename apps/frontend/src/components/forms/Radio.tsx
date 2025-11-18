import { splitProps, type JSX, For } from "solid-js"

export type RadioOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type RadioGroupProps = {
  name: string
  label?: string
  value: string | undefined
  error: string
  required?: boolean
  options: RadioOption[]
  inline?: boolean
  ref: (element: HTMLInputElement) => void
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
}

export function RadioGroup(props: RadioGroupProps) {
  const [, inputProps] = splitProps(props, ['label', 'error', 'required', 'options', 'inline', 'value'])
  
  return (
    <div class="space-y-2">
      {props.label && (
        <label
          class="block text-sm font-medium text-[var(--color-text-primary)] transition-colors"
        >
          {props.label}
          {props.required && <span class="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <div class={props.inline ? 'flex items-center gap-6' : 'space-y-3'}>
        <For each={props.options}>
          {(option) => (
            <div class="flex items-start gap-3 group">
              <div class="relative flex items-center pt-0.5">
                <input
                  {...inputProps}
                  id={`${props.name}-${option.value}`}
                  type="radio"
                  value={option.value}
                  checked={props.value === option.value}
                  disabled={option.disabled}
                  class="peer w-5 h-5 rounded-full border-2 cursor-pointer appearance-none border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)]/30 transition-all duration-200 hover:border-[var(--color-brand-primary)] checked:border-[var(--color-brand-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {/* Radio Dot */}
                <div class="absolute w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)] left-1.5 top-1.5 opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              <div class="flex-1">
                <label
                  for={`${props.name}-${option.value}`}
                  class="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer select-none group-hover:text-[var(--color-brand-primary)] transition-colors"
                >
                  {option.label}
                </label>
                {option.description && (
                  <p class="text-xs text-[var(--color-text-tertiary)] mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </For>
      </div>
      {props.error && (
        <div
          id={`${props.name}-error`}
          class="text-sm text-[var(--color-error-text)] flex items-center gap-1.5"
          role="alert"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {props.error}
        </div>
      )}
    </div>
  )
}
