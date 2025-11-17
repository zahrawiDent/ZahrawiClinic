import { useNavigate } from "@tanstack/solid-router"
import { Show } from "solid-js"

/**
 * ⬅️ Back Button Component
 * ========================
 * 
 * A smart back button that:
 * 1. Uses browser history if available (back button navigation)
 * 2. Falls back to a specified route if no history
 * 3. Optionally shows only when there's history
 * 
 * Features:
 * - Browser history aware
 * - Customizable fallback route
 * - Accessible with proper aria labels
 * - Supports custom styling
 * 
 * @example Basic usage
 * <BackButton fallbackTo="/patients" />
 * 
 * @example Custom label
 * <BackButton fallbackTo="/todos" label="Back to List" />
 * 
 * @example Only show if history exists
 * <BackButton fallbackTo="/" showOnlyWithHistory />
 */

interface BackButtonProps {
  /** Route to navigate to if no browser history */
  fallbackTo?: string
  /** Custom label for the button */
  label?: string
  /** Custom icon element */
  icon?: any
  /** Additional CSS classes */
  class?: string
  /** Only render button if browser history exists */
  showOnlyWithHistory?: boolean
  /** Button variant */
  variant?: "default" | "ghost" | "outline"
}

export function BackButton(props: BackButtonProps) {
  const navigate = useNavigate()
  
  const handleBack = () => {
    // Check if we can go back in history
    if (window.history.length > 1 && window.history.state?.key) {
      window.history.back()
    } else if (props.fallbackTo) {
      // Fallback to specified route
      navigate({ to: props.fallbackTo })
    } else {
      // Default fallback to root
      navigate({ to: "/" })
    }
  }
  
  const hasHistory = () => window.history.length > 1
  
  // If showOnlyWithHistory is true and there's no history, don't render
  const shouldRender = () => {
    if (props.showOnlyWithHistory) {
      return hasHistory()
    }
    return true
  }
  
  const variantClasses = () => {
    switch (props.variant) {
      case "ghost":
        return "bg-transparent hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
      case "outline":
        return "bg-transparent border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
      default:
        return "bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-primary)] shadow-sm"
    }
  }
  
  return (
    <Show when={shouldRender()}>
      <button
        onClick={handleBack}
        class={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${variantClasses()} ${props.class || ""}`}
        aria-label={props.label || "Go back"}
      >
        <Show
          when={props.icon}
          fallback={
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        >
          {props.icon}
        </Show>
        {props.label || "Back"}
      </button>
    </Show>
  )
}

/**
 * 🔙 Compact Back Button
 * ======================
 * Icon-only back button for space-constrained areas
 */
export function BackButtonIcon(props: Omit<BackButtonProps, "label">) {
  const navigate = useNavigate()
  
  const handleBack = () => {
    if (window.history.length > 1 && window.history.state?.key) {
      window.history.back()
    } else if (props.fallbackTo) {
      navigate({ to: props.fallbackTo })
    } else {
      navigate({ to: "/" })
    }
  }
  
  return (
    <button
      onClick={handleBack}
      class={`p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition ${props.class || ""}`}
      aria-label="Go back"
      title="Go back"
    >
      <Show
        when={props.icon}
        fallback={
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        }
      >
        {props.icon}
      </Show>
    </button>
  )
}
