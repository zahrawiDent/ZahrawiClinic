import CalendarNav from '@/calendar/CalendarNav'
import DayView from '@/calendar/DayView'
import { createFileRoute } from '@tanstack/solid-router'
import { state } from '@/calendar/lib/calStore'
import { createSignal } from 'solid-js'

export const Route = createFileRoute('/_authenticated/appointments')({
  component: RouteComponent,
})


function RouteComponent() {
  const [open, setOpen] = createSignal(false)
  const [editing, setEditing] = createSignal<any>(null)

  function onEventClick(id: string, patch?: Partial<{ start: string; end: string }>) {
    // Find the event by its id
    const ev = state.events.find((e: any) => e.id === id)
    if (!ev) return
    // Prefill with the clicked event's times if provided via patch
    const initial = { ...ev, ...(patch ?? {}) }
    setEditing(initial)
    setOpen(true)
  }
  return <div>
    <CalendarNav />
    <DayView
      onEventClick={onEventClick}
      onSlotClick={(startISO, endISO) => {
        setEditing({ start: startISO, end: endISO })
        setOpen(true)
      }}
    />
  </div>
}
