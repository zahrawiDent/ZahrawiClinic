import { createSignal, createEffect, onCleanup } from "solid-js"

interface SearchBarProps {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
  debounceMs?: number
  class?: string
}

/**
 * Reusable search bar component with debouncing
 * Provides instant visual feedback while debouncing actual search queries
 */
export function SearchBar(props: SearchBarProps) {
  const [localValue, setLocalValue] = createSignal(props.value)
  let timeoutId: number | undefined

  // Update local value when prop changes
  createEffect(() => {
    setLocalValue(props.value)
  })

  const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value
    setLocalValue(value)

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new debounced timeout
    timeoutId = setTimeout(() => {
      props.onSearch(value)
    }, props.debounceMs ?? 300) as unknown as number
  }

  const handleClear = () => {
    setLocalValue("")
    props.onSearch("")
  }

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return (
    <div class={`relative ${props.class || ""}`}>
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          class="w-5 h-5 text-[var(--color-text-tertiary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={localValue()}
        onInput={handleInput}
        placeholder={props.placeholder ?? "Search..."}
        class="w-full pl-10 pr-10 py-2.5 border border-[var(--color-border-primary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all"
      />
      {localValue() && (
        <button
          type="button"
          onClick={handleClear}
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
