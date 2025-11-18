import { splitProps, type JSX } from "solid-js"

type CheckboxProps = {
  name: string
  label?: string
  checked: boolean
  ref: (element: HTMLInputElement) => void
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
}

export function Checkbox(props: CheckboxProps) {
  const [, inputProps] = splitProps(props, ['label', 'checked'])
  return (
    <div class="flex items-start gap-3 group">
      <div class="relative flex items-center pt-0.5">
        <input
          {...inputProps}
          id={props.name}
          type="checkbox"
          checked={props.checked}
          class="peer w-5 h-5 rounded-md border-2 cursor-pointer appearance-none border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)]/30 transition-all duration-200 hover:border-[var(--color-brand-primary)] checked:bg-[var(--color-brand-primary)] checked:border-[var(--color-brand-primary)] hover:shadow-sm"
        />
        {/* Checkmark Icon */}
        <svg
          class="absolute w-3.5 h-3.5 pointer-events-none left-0.5 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      {props.label && (
        <label
          for={props.name}
          class="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer select-none group-hover:text-[var(--color-brand-primary)] transition-colors"
        >
          {props.label}
        </label>
      )}
    </div>
  )
}
