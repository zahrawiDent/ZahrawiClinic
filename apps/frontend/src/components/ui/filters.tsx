import { For, Show } from "solid-js"

export interface FilterOption {
  value: string
  label: string
  icon?: string
  count?: number
}

interface FilterGroupProps {
  label: string
  options: FilterOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  class?: string
}

/**
 * Reusable filter group component with chip/pill-based UI
 * Supports both single and multiple selection modes
 */
export function FilterGroup(props: FilterGroupProps) {
  const isActive = (optionValue: string): boolean => {
    if (props.multiple && Array.isArray(props.value)) {
      return props.value.includes(optionValue)
    }
    return props.value === optionValue
  }

  const handleClick = (optionValue: string) => {
    if (props.multiple && Array.isArray(props.value)) {
      const newValue = isActive(optionValue)
        ? props.value.filter((v) => v !== optionValue)
        : [...props.value, optionValue]
      props.onChange(newValue)
    } else {
      // For single selection, clicking active item clears the filter
      props.onChange(isActive(optionValue) ? "" : optionValue)
    }
  }

  return (
    <div class={props.class}>
      <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
        {props.label}
      </label>
      <div class="flex flex-wrap gap-2">
        <For each={props.options}>
          {(option) => {
            const active = isActive(option.value)
            return (
              <button
                type="button"
                onClick={() => handleClick(option.value)}
                class={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-[var(--color-brand-primary)] text-white shadow-md"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                  }
                `}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span
                    class={`
                      ml-1 px-1.5 py-0.5 rounded-full text-xs
                      ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
                      }
                    `}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            )
          }}
        </For>
      </div>
    </div>
  )
}

interface QuickFilterBarProps {
  filters: {
    label: string
    options: FilterOption[]
    value: string | string[]
    onChange: (value: string | string[]) => void
    multiple?: boolean
  }[]
  onReset?: () => void
  class?: string
}

/**
 * Quick filter bar that displays multiple filter groups horizontally
 * Perfect for page headers with filtering needs
 */
export function QuickFilterBar(props: QuickFilterBarProps) {
  const hasActiveFilters = () => {
    return props.filters.some((filter) => {
      if (Array.isArray(filter.value)) {
        return filter.value.length > 0
      }
      return filter.value !== ""
    })
  }

  return (
    <div class={`space-y-4 ${props.class || ""}`}>
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h3>
        <Show when={hasActiveFilters() && props.onReset}>
          <button
            type="button"
            onClick={props.onReset}
            class="text-sm text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] font-medium transition-colors"
          >
            Clear all
          </button>
        </Show>
      </div>
      <div class="space-y-3">
        <For each={props.filters}>
          {(filter) => (
            <FilterGroup
              label={filter.label}
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              multiple={filter.multiple}
            />
          )}
        </For>
      </div>
    </div>
  )
}
