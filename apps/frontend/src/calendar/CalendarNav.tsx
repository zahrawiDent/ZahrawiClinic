/**
 * CalendarNav
 * -----------
 * Top navigation bar for the calendar UI.
 *
 * Features
 * - Previous/Next navigation relative to the current view (month/week/day)
 * - "Today" shortcut to jump the anchor date to the current day
 * - Current anchor date label with format adapted to the active view
 * - Week-start selector (Sunday..Saturday)
 * - View switcher (Month / Week / Day)
 *
 * State integration
 * - Uses a typed SolidJS store for viewDate, viewMode, and weekStartsOn
 */
import { addWeeks, addDays, parseISO } from 'date-fns'
import type { ViewMode, WeekStartDay } from './lib/types'

import { For } from 'solid-js';
import { state, setState } from './lib/calStore'
import { format } from 'date-fns';



export default function CalendarNav(props: { onOpenSettings?: () => void; onOpenCheats?: () => void } = {}) {
  const date = () => parseISO(state.viewDate)

  /**
   * Navigate the calendar forward or backward based on the current view mode
   * 
   * @param delta - Number of time units to shift. Positive moves forward, negative moves backward.
   *                The time unit depends on the current viewMode:
   *                - 'week' mode: shifts by weeks
   *                - 'day' mode: shifts by days
   * 
   * @example
   * ```ts
   * shift(-1)  // Go back 1 week (in week view) or 1 day (in day view)
   * shift(1)   // Go forward 1 week (in week view) or 1 day (in day view)
   * ```
   */
  function shift(delta: number) {
    const d = date()
    const next =
      state.viewMode === 'week'
        ? addWeeks(d, delta)
        : addDays(d, delta)
    setState('viewDate', next.toISOString())
  }

  const VIEW_OPTIONS: { value: ViewMode; label: string; icon: string }[] = [
    { value: 'week', label: 'Week', icon: '📆' },
    { value: 'day', label: 'Day', icon: '📋' }
  ];

  return (
    <div class="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-primary)] px-4 py-3">
      <div class="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div class="flex items-center space-x-4">
          <button
            onClick={() => shift(-1)}
            class="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-primary)]"
            title="Previous"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => shift(1)}
            class="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-primary)]"
            title="Next"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setState('viewDate', new Date().toISOString())}
            class="px-3 py-1.5 text-sm font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] hover:bg-[var(--color-info-bg)] rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Center - Date display */}
        <div class="flex-1 text-center">
          <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">
            {format(date(), state.viewMode === 'week' ? 'wo, yyyy' : 'EEE, MMMM d, yyyy')}
          </h1>
        </div>

        {/* Right side - Week Start Day Selector and View switcher */}
        <div class="flex items-center space-x-3">
          {/* Help / Cheat Sheet */}
          <button
            class="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-primary)]"
            title="Keyboard shortcuts ( ?)"
            onClick={() => props.onOpenCheats?.()}
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
            </svg>
          </button>
          {/* Settings button (compact) */}
          <button
            class="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-[var(--color-text-primary)]"
            title="Settings"
            onClick={() => props.onOpenSettings?.()}
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
          </button>
          {/* Week Start Day Selector */}
          <div class="flex items-center space-x-2">
            <label for="week-start" class="text-sm font-medium text-[var(--color-text-secondary)] hidden sm:inline">
              Week starts:
            </label>
            <select
              id="week-start"
              value={state.weekStartsOn}
              onChange={(e) => setState('weekStartsOn', parseInt(e.target.value) as WeekStartDay)}
              class="text-sm border border-[var(--color-border-primary)] rounded-md px-2 py-1 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          <div class="flex items-center space-x-1 bg-[var(--color-bg-secondary)] rounded-lg p-1">
            <For each={VIEW_OPTIONS}>
              {(option) => (
                <button
                  onClick={() => setState('viewMode', option.value)}
                  class={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${state.viewMode === option.value
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                  title={option.label}
                >
                  <span class="mr-1">{option.icon}</span>
                  <span class="hidden sm:inline">{option.label}</span>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
