import { Show, splitProps, type JSX } from "solid-js"

type TextareaProps = {
  name: string
  label?: string
  placeholder?: string
  value?: string
  errors?: string[]
  required?: boolean
  rows?: number
  maxLength?: number
  ref?: (element: HTMLTextAreaElement) => void
  onInput?: JSX.EventHandler<HTMLTextAreaElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLTextAreaElement, Event>
  onBlur?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>
}

export function Textarea(props: TextareaProps) {
  const [local, textareaProps] = splitProps(props, ['label', 'errors', 'placeholder', 'required', 'rows', 'maxLength', 'value'])
  
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
      <textarea
        {...textareaProps}
        id={props.name}
        value={local.value ?? ''}
        placeholder={local.placeholder}
        rows={local.rows || 4}
        maxLength={local.maxLength}
        aria-invalid={!!local.errors?.[0]}
        aria-errormessage={`${props.name}-error`}
        class={`
          w-full px-4 py-2.5 rounded-lg
          bg-[var(--color-bg-primary)] 
          border transition-all duration-200
          text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-tertiary)]
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-y
          ${local.errors?.[0]
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
            : 'border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)] focus:ring-[var(--color-border-focus)]/20'
          }
        `}
      />
      <Show when={local.maxLength && local.value}>
        <div class="text-xs text-[var(--color-text-tertiary)] text-right">
          {local.value!.length} / {local.maxLength}
        </div>
      </Show>
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
    </div>
  )
}
