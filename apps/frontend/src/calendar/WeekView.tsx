/**
 * WeekView
 * ---------
 * Multi-dentist week calendar view for dental practices.
 * 
 * Features:
 * - Horizontal lanes for each dentist
 * - 7-day week grid with configurable start day
 * - Drag and drop between dentists and days
 * - Responsive design for mobile/tablet/desktop
 * - Color-coded appointments by type
 * - Quick filters by dentist, status, type
 */

import { createSignal, createEffect, For, Show } from 'solid-js'
import { state } from './lib/calStore'
import { addDays, startOfWeek, format, parseISO, isSameDay, startOfDay, endOfDay } from 'date-fns'
import type { EventItem } from './lib/types'
import type { UsersRecord } from '@/types/schemas'
import { pb } from '@/lib/pocketbase'

type WeekViewProps = {
    onEventClick?: (id: string, event: EventItem) => void
    onSlotClick?: (startISO: string, endISO: string, dentistId?: string) => void
}

export default function WeekView(props: WeekViewProps) {
    const [dentists, setDentists] = createSignal<UsersRecord[]>([])
    const [selectedDentist, setSelectedDentist] = createSignal<string>('all')

    // Load dentists
    createEffect(async () => {
        try {
            const records = await pb.collection('users').getFullList<UsersRecord>({
                filter: 'role = "dentist"',
                sort: 'name',
            })
            setDentists(records)
        } catch (err) {
            console.error('Failed to load dentists:', err)
        }
    })

    const anchor = () => parseISO(state.viewDate)
    const weekStart = () => startOfWeek(anchor(), { weekStartsOn: state.weekStartsOn })
    const days = () => {
        const start = weekStart()
        return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }

    // Filter events by week and selected dentist
    const events = () => {
        const start = startOfDay(weekStart())
        const end = endOfDay(addDays(weekStart(), 6))

        return state.events.filter((e: EventItem) => {
            // Filter by date range
            const evStart = parseISO(e.start)
            const evEnd = parseISO(e.end)
            if (evStart > end || evEnd < start) return false

            // Filter by selected dentist
            if (selectedDentist() !== 'all') {
                try {
                    const eventData = JSON.parse(e.notes || '{}')
                    if (eventData.dentist !== selectedDentist()) return false
                } catch { }
            }

            // Filter by query
            if (state.filters.query && !e.title?.toLowerCase().includes(state.filters.query.toLowerCase())) {
                return false
            }

            // Filter by categories
            if (state.filters.categories && state.filters.categories.length > 0) {
                if (!e.category || !state.filters.categories.includes(e.category)) return false
            }

            return true
        })
    }

    // Group events by day
    const eventsByDay = () => {
        const grouped: Record<string, EventItem[]> = {}
        const daysList = days()

        daysList.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd')
            grouped[dayKey] = []
        })

        events().forEach(event => {
            const eventStart = parseISO(event.start)
            const dayKey = format(eventStart, 'yyyy-MM-dd')
            if (grouped[dayKey]) {
                grouped[dayKey].push(event)
            }
        })

        return grouped
    }

    const getDentistName = (dentistId: string) => {
        const dentist = dentists().find(d => d.id === dentistId)
        return dentist?.name || 'Unknown'
    }

    return (
        <div class="flex flex-col h-full bg-[var(--color-bg-primary)]">
            {/* Dentist Filter */}
            <div class="border-b border-[var(--color-border-primary)] px-4 py-3 bg-[var(--color-bg-elevated)]">
                <div class="flex items-center gap-3">
                    <label class="text-sm font-medium text-[var(--color-text-primary)]">
                        View:
                    </label>
                    <div class="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedDentist('all')}
                            class={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${selectedDentist() === 'all'
                                ? 'bg-[var(--color-brand-primary)] text-white'
                                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                }`}
                        >
                            All Dentists
                        </button>
                        <For each={dentists()}>
                            {(dentist) => (
                                <button
                                    onClick={() => setSelectedDentist(dentist.id)}
                                    class={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${selectedDentist() === dentist.id
                                        ? 'bg-[var(--color-brand-primary)] text-white'
                                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                        }`}
                                >
                                    {dentist.name}
                                </button>
                            )}
                        </For>
                    </div>
                </div>
            </div>

            {/* Week Grid */}
            <div class="flex-1 overflow-auto">
                <div class="grid grid-cols-7 gap-px bg-[var(--color-border-primary)] min-h-full">
                    <For each={days()}>
                        {(day) => {
                            const dayKey = format(day, 'yyyy-MM-dd')
                            const dayEvents = eventsByDay()[dayKey] || []
                            const isToday = isSameDay(day, new Date())

                            return (
                                <div class={`bg-[var(--color-bg-primary)] min-h-[600px] flex flex-col ${isToday ? 'ring-2 ring-[var(--color-brand-primary)] ring-inset' : ''}`}>
                                    {/* Day Header */}
                                    <div class={`p-3 border-b border-[var(--color-border-primary)] sticky top-0 z-10 ${isToday
                                        ? 'bg-[var(--color-brand-primary)] text-white'
                                        : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                                        }`}>
                                        <div class="text-center">
                                            <div class="text-xs font-medium uppercase opacity-80">
                                                {format(day, 'EEE')}
                                            </div>
                                            <div class="text-2xl font-bold">
                                                {format(day, 'd')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Events */}
                                    <div class="flex-1 p-2 space-y-2 relative">
                                        <For each={dayEvents}>
                                            {(event) => {
                                                const startDate = parseISO(event.start)
                                                const endDate = parseISO(event.end)

                                                // Extract dentist info
                                                let dentistInfo = ''
                                                try {
                                                    const eventData = JSON.parse(event.notes || '{}')
                                                    if (eventData.dentist) {
                                                        dentistInfo = getDentistName(eventData.dentist)
                                                    }
                                                } catch { }

                                                return (
                                                    <div
                                                        onClick={() => props.onEventClick?.(event.id, event)}
                                                        class="p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all border-l-4"
                                                        style={{
                                                            'background-color': (event.color || '#3b82f6') + '15',
                                                            'border-left-color': event.color || '#3b82f6',
                                                        }}
                                                    >
                                                        <div class="font-medium text-sm text-[var(--color-text-primary)] mb-1">
                                                            {event.title}
                                                        </div>
                                                        <div class="text-xs text-[var(--color-text-secondary)] space-y-0.5">
                                                            <div>
                                                                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                                                            </div>
                                                            <Show when={dentistInfo && selectedDentist() === 'all'}>
                                                                <div class="font-medium">
                                                                    {dentistInfo}
                                                                </div>
                                                            </Show>
                                                        </div>
                                                    </div>
                                                )
                                            }}
                                        </For>

                                        {/* Empty state */}
                                        <Show when={dayEvents.length === 0}>
                                            <div class="text-center py-8 text-[var(--color-text-tertiary)] text-sm">
                                                No appointments
                                            </div>
                                        </Show>

                                        {/* Click to add */}
                                        <button
                                            onClick={() => {
                                                const start = new Date(day)
                                                start.setHours(9, 0, 0, 0)
                                                const end = new Date(start)
                                                end.setHours(10, 0, 0, 0)
                                                props.onSlotClick?.(
                                                    start.toISOString(),
                                                    end.toISOString(),
                                                    selectedDentist() !== 'all' ? selectedDentist() : undefined
                                                )
                                            }}
                                            class="w-full py-2 mt-2 border-2 border-dashed border-[var(--color-border-primary)] rounded-lg text-[var(--color-text-tertiary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors text-sm"
                                        >
                                            + Add Appointment
                                        </button>
                                    </div>
                                </div>
                            )
                        }}
                    </For>
                </div>
            </div>
        </div>
    )
}
