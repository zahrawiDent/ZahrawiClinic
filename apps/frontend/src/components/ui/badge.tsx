import type { JSX } from "solid-js"

interface BadgeProps {
  children: JSX.Element | string
  variant?: "default" | "success" | "warning" | "error" | "info" | "primary"
  size?: "sm" | "md" | "lg"
  icon?: JSX.Element
  rounded?: "default" | "full"
  class?: string
}

/**
 * Badge Component
 * 
 * A versatile badge component with multiple variants and sizes
 * Supports icons and custom styling
 * 
 * @example
 * <Badge variant="success" icon={<CheckIcon />}>Active</Badge>
 * <Badge variant="primary" rounded="full">New</Badge>
 */
export function Badge(props: BadgeProps) {
  const baseClasses = "inline-flex items-center gap-2 font-medium transition-colors"

  const variantClasses = () => {
    switch (props.variant) {
      case "success":
        return "bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-text)]"
      case "warning":
        return "bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning-text)]"
      case "error":
        return "bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-text)]"
      case "info":
        return "bg-[var(--color-info-bg)] border border-[var(--color-info-border)] text-[var(--color-info-text)]"
      case "primary":
        return "bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)]"
      default:
        return "bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[var(--color-text-secondary)]"
    }
  }

  const sizeClasses = () => {
    switch (props.size) {
      case "sm":
        return "px-2 py-1 text-xs"
      case "lg":
        return "px-5 py-2.5 text-base"
      default:
        return "px-4 py-2 text-sm"
    }
  }

  const roundedClasses = () => {
    return props.rounded === "full" ? "rounded-full" : "rounded-lg"
  }

  return (
    <span
      class={`${baseClasses} ${variantClasses()} ${sizeClasses()} ${roundedClasses()} ${props.class || ""}`}
    >
      {props.icon && <span class="flex-shrink-0">{props.icon}</span>}
      <span>{props.children}</span>
    </span>
  )
}
