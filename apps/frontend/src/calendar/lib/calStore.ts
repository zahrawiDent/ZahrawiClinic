/**
 * Calendar Store
 * --------------
 * Global state management for the calendar Component
 * 
 * This store manages the calendar view configuration and navigation state,
 * providing a reactive single source of truth for all calendar components.
 * Persists viewMode and weekStartsOn preferences to localStorage.
 * 
 * @module calStore
 */

import { createStore } from "solid-js/store";
import { createEffect, on } from "solid-js";
import type { ViewMode, WeekStartDay } from "./types";

/**
 * Calendar state interface
 * 
 * @interface CalendarState
 * @property {string} viewDate - ISO 8601 string representing the current anchor date for the calendar view
 * @property {ViewMode} viewMode - Current calendar view mode ('week' or 'day')
 * @property {WeekStartDay} weekStartsOn - First day of the week (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
import type { EventItem, Filters } from './types'

interface CalendarState {
  /** ISO 8601 date string representing the current viewing date anchor */
  viewDate: string;
  /** Current calendar view mode */
  viewMode: ViewMode;
  /** First day of the week (0=Sunday through 6=Saturday) */
  weekStartsOn: WeekStartDay;
  /** Events for the calendar */
  events: EventItem[];
  /** Filters for event display */
  filters: Filters;
  /** Start hour for the day view */
  dayStartHour?: number;
}

/**
 * LocalStorage keys for persisting calendar preferences
 */
const STORAGE_KEYS = {
  VIEW_MODE: 'calendar:viewMode',
  WEEK_STARTS_ON: 'calendar:weekStartsOn',
} as const;

/**
 * Load saved view mode from localStorage
 */
function loadViewMode(): ViewMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (saved === 'week' || saved === 'day') {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to load viewMode from localStorage:', e);
  }
  return 'day';
}

/**
 * Load saved week start day from localStorage
 */
function loadWeekStartsOn(): WeekStartDay {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEK_STARTS_ON);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 0 && parsed <= 6) {
        return parsed as WeekStartDay;
      }
    }
  } catch (e) {
    console.warn('Failed to load weekStartsOn from localStorage:', e);
  }
  return 0;
}

/**
 * Global calendar state store
 * 
 * Initial state:
 * - viewDate: Current date/time as ISO string
 * - viewMode: Loaded from localStorage or 'day' (default)
 * - weekStartsOn: Loaded from localStorage or 0 (Sunday)
 * 
 * @example
 * ```ts
 * import { state, setState } from './lib/calStore';
 * 
 * // Read state
 * console.log(state.viewDate);
 * 
 * // Update state (automatically syncs to localStorage)
 * setState('viewMode', 'week');
 * setState('weekStartsOn', 1); // Monday
 * setState('viewDate', new Date('2025-01-01').toISOString());
 * ```
 */
export const [state, setState] = createStore<CalendarState>({
  viewDate: new Date().toISOString(),
  viewMode: loadViewMode(),
  weekStartsOn: loadWeekStartsOn(),
  events: [],
  filters: {},
  dayStartHour: 0,
});

export const actions = {
  add(event: EventItem) {
    setState('events', (evts) => [...evts, event])
    return event
  },
  update(id: string, patch: Partial<EventItem>) {
    setState('events', (evts) => evts.map(e => e.id === id ? { ...e, ...patch } : e))
  },
  remove(id: string) {
    setState('events', (evts) => evts.filter(e => e.id !== id))
  },
  setFilters(filters: Filters) {
    setState('filters', filters)
  },
  setViewDate(viewDate: string) {
    setState('viewDate', viewDate)
  }
}

/**
 * Persist viewMode to localStorage whenever it changes
 */
createEffect(on(
  () => state.viewMode,
  (viewMode) => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    } catch (e) {
      console.warn('Failed to save viewMode to localStorage:', e);
    }
  }
));

/**
 * Persist weekStartsOn to localStorage whenever it changes
 */
createEffect(on(
  () => state.weekStartsOn,
  (weekStartsOn) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEK_STARTS_ON, weekStartsOn.toString());
    } catch (e) {
      console.warn('Failed to save weekStartsOn to localStorage:', e);
    }
  }
));
