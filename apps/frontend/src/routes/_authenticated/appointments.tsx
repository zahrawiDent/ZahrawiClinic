import CalendarNav from '@/calendar/CalendarNav'
import DayView from '@/calendar/DayView'
import WeekView from '@/calendar/WeekView'
import AppointmentDialog from '@/calendar/AppointmentDialog'
import { createFileRoute } from '@tanstack/solid-router'
import { state, actions } from '@/calendar/lib/calStore'
import { createSignal, onMount, Show, createEffect } from 'solid-js'
import { loadAppointments, setupRealtimeSync, appointmentToEvent } from '@/calendar/lib/appointments-integration'
import type { AppointmentsRecord } from '@/types/schemas/appointments'
import type { EventItem } from '@/calendar/lib/types'
import { addDays, startOfWeek, endOfWeek } from 'date-fns'

export const Route = createFileRoute('/_authenticated/appointments')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const [dialogOpen, setDialogOpen] = createSignal(false)
  const [editingAppointmentId, setEditingAppointmentId] = createSignal<string | null>(null)
  const [initialStart, setInitialStart] = createSignal<string | null>(null)
  const [initialEnd, setInitialEnd] = createSignal<string | null>(null)
  const [selectedDentist, setSelectedDentist] = createSignal<string | undefined>(undefined)
  const [loading, setLoading] = createSignal(true)

  // Setup real-time sync
  onMount(() => {
    setupRealtimeSync()
  })

  // Load appointments when view date or mode changes
  createEffect(async () => {
    setLoading(true)

    const viewDate = new Date(state.viewDate)
    let startDate: Date
    let endDate: Date

    if (state.viewMode === 'week') {
      startDate = startOfWeek(viewDate, { weekStartsOn: state.weekStartsOn })
      endDate = endOfWeek(viewDate, { weekStartsOn: state.weekStartsOn })
    } else {
      // Day view - load a week around the current day for better UX
      startDate = addDays(viewDate, -3)
      endDate = addDays(viewDate, 3)
    }

    const events = await loadAppointments(startDate, endDate)

    // Clear existing events and add loaded ones
    actions.clearEvents()
    events.forEach(event => {
      actions.add(event)
    })

    setLoading(false)
  })

  const handleEventClick = (id: string, event: EventItem) => {
    setEditingAppointmentId(id)
    setInitialStart(event.start)
    setInitialEnd(event.end)
    setSelectedDentist(undefined)
    setDialogOpen(true)
  }

  const handleSlotClick = (startISO: string, endISO: string, dentistId?: string) => {
    setEditingAppointmentId(null)
    setInitialStart(startISO)
    setInitialEnd(endISO)
    setSelectedDentist(dentistId)
    setDialogOpen(true)
  }

  const handleSave = (appointment: AppointmentsRecord) => {
    const event = appointmentToEvent(appointment)

    if (editingAppointmentId()) {
      // Update existing
      actions.update(appointment.id, event)
    } else {
      // Add new
      actions.add(event)
    }
  }

  const handleDelete = (id: string) => {
    actions.remove(id)
  }

  const handleNewAppointment = () => {
    setEditingAppointmentId(null)
    setInitialStart(null)
    setInitialEnd(null)
    setSelectedDentist(undefined)
    setDialogOpen(true)
  }

  return (
    <div class="flex flex-col h-screen bg-[var(--color-bg-primary)]">
      <CalendarNav onNewAppointment={handleNewAppointment} />

      <div class="flex-1 overflow-hidden">
        <Show when={!loading()} fallback={
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="w-16 h-16 border-4 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-[var(--color-text-secondary)]">Loading appointments...</p>
            </div>
          </div>
        }>
          <Show when={state.viewMode === 'day'} fallback={
            <WeekView
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          }>
            <DayView
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          </Show>
        </Show>
      </div>

      <AppointmentDialog
        isOpen={dialogOpen()}
        appointmentId={editingAppointmentId()}
        initialStart={initialStart() || undefined}
        initialEnd={initialEnd() || undefined}
        dentistId={selectedDentist()}
        onClose={() => {
          setDialogOpen(false)
          setEditingAppointmentId(null)
          setInitialStart(null)
          setInitialEnd(null)
          setSelectedDentist(undefined)
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
