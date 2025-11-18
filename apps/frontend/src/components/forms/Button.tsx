import { splitProps, Show, type JSX, type Component } from "solid-js"

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: () => void
  class?: string
  children?: JSX.Element
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'variant',
    'size',
    'type',
    'disabled',
    'loading',
    'fullWidth',
    'class'
  ])

  const variantClasses = () => {
    switch (local.variant || 'primary') {
      case 'primary':
        return `
          bg-[var(--color-brand-primary)] 
          text-[var(--color-text-inverse)]
          hover:bg-[var(--color-brand-primary-hover)]
          focus:ring-[var(--color-brand-primary)]
          shadow-sm hover:shadow
        `
      case 'secondary':
        return `
          bg-[var(--color-bg-secondary)]
          text-[var(--color-text-primary)]
          border border-[var(--color-border-primary)]
          hover:bg-[var(--color-bg-tertiary)]
          focus:ring-[var(--color-border-focus)]
        `
      case 'danger':
        return `
          bg-[var(--color-error)]
          text-[var(--color-text-inverse)]
          hover:bg-[var(--color-error-hover)]
          focus:ring-[var(--color-error)]
          shadow-sm hover:shadow
        `
      case 'success':
        return `
          bg-[var(--color-success)]
          text-[var(--color-text-inverse)]
          hover:bg-[var(--color-success-hover)]
          focus:ring-[var(--color-success)]
          shadow-sm hover:shadow
        `
      case 'ghost':
        return `
          bg-transparent
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-secondary)]
          hover:text-[var(--color-text-primary)]
          focus:ring-[var(--color-border-focus)]
        `
    }
  }

  const sizeClasses = () => {
    switch (local.size || 'md') {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'md':
        return 'px-6 py-2.5 text-base'
      case 'lg':
        return 'px-8 py-3 text-lg'
    }
  }

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
  `

  const widthClass = local.fullWidth ? 'w-full' : 'flex-1 sm:flex-none'

  return (
    <button
      type={local.type || 'button'}
      disabled={local.disabled || local.loading}
      class={`${baseClasses} ${variantClasses()} ${sizeClasses()} ${widthClass} ${local.class || ''}`}
      {...others}
    >
      <Show when={local.loading}>
        <svg class="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </Show>
      {local.children}
    </button>
  )
}
