import CalendarNav from '@/calendar/CalendarNav'
import DayView from '@/calendar/DayView'
import { createFileRoute } from '@tanstack/solid-router'
import { state, actions } from '@/calendar/lib/calStore'
import { createSignal, For, Show } from 'solid-js'

export const Route = createFileRoute('/_authenticated/appointments')({
  component: RouteComponent,
})

function isoToLocalInput(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RouteComponent() {
  const [open, setOpen] = createSignal(false)
  const [editing, setEditing] = createSignal<any>(null)

  function onEventClick(id: string, patch?: Partial<{ start: string; end: string }>) {
    const ev = state.events.find((e: any) => e.id === id)
    if (!ev) return
    const initial = { ...ev, ...(patch ?? {}) }
    setEditing(initial)
    setOpen(true)
  }

  function onSlotClick(startISO: string, endISO: string) {
    setEditing({ id: `evt-${Date.now()}`, title: 'New appointment', start: startISO, end: endISO, color: '#2563eb' })
    setOpen(true)
  }

  function addSample() {
    const base = new Date(state.viewDate)
    base.setHours(10, 0, 0, 0)
    const end = new Date(base)
    end.setMinutes(base.getMinutes() + 60)
    const ev = { id: `evt-${Date.now()}`, title: 'Sample consult', start: base.toISOString(), end: end.toISOString(), color: '#2563eb' }
    actions.add(ev)
  }

  function moveSelected(deltaMins: number) {
    const ed = editing()
    if (!ed?.id) return
    const s = new Date(ed.start)
    const e = new Date(ed.end)
    s.setMinutes(s.getMinutes() + deltaMins)
    e.setMinutes(e.getMinutes() + deltaMins)
    actions.update(ed.id, { start: s.toISOString(), end: e.toISOString() })
    setEditing({ ...ed, start: s.toISOString(), end: e.toISOString() })
  }

  function resizeSelected(deltaMins: number) {
    const ed = editing()
    if (!ed?.id) return
    const e = new Date(ed.end)
    e.setMinutes(e.getMinutes() + deltaMins)
    actions.update(ed.id, { end: e.toISOString() })
    setEditing({ ...ed, end: e.toISOString() })
  }

  function removeSelected() {
    const ed = editing()
    if (!ed?.id) return
    actions.remove(ed.id)
    setEditing(null)
    setOpen(false)
  }

  function saveEditing(updated: any) {
    if (!updated) return
    if (updated.id && state.events.find((e) => e.id === updated.id)) {
      actions.update(updated.id, { title: updated.title, start: updated.start, end: updated.end, color: updated.color })
    } else {
      actions.add(updated)
    }
    setOpen(false)
    setEditing(null)
  }

  return (
    <div class="flex flex-col md:flex-row">
      <div class="flex-1">
        <CalendarNav />
        <DayView onEventClick={onEventClick} onSlotClick={onSlotClick} />
      </div>
      <aside class="w-full md:w-80 border-l border-[var(--color-border-primary)] p-4 bg-[var(--color-bg-primary)]">
        <h3 class="text-lg font-medium mb-2">Calendar Examples</h3>
        <p class="text-sm text-[var(--color-text-secondary)] mb-4">Use the calendar to add, drag, or resize events. The controls here demonstrate the same operations programmatically.</p>
        <div class="space-y-2 mb-4">
          <button class="w-full px-3 py-2 rounded-md bg-[var(--color-brand-primary)] text-white" onClick={addSample}>Add sample appointment</button>
          <button class="w-full px-3 py-2 rounded-md border" onClick={() => moveSelected(30)}>Move selected +30m</button>
          <button class="w-full px-3 py-2 rounded-md border" onClick={() => moveSelected(-30)}>Move selected -30m</button>
          <button class="w-full px-3 py-2 rounded-md border" onClick={() => resizeSelected(30)}>Extend selected +30m</button>
          <button class="w-full px-3 py-2 rounded-md border" onClick={() => resizeSelected(-30)}>Shorten selected -30m</button>
          <button class="w-full px-3 py-2 rounded-md border text-red-600" onClick={removeSelected}>Delete selected</button>
        </div>

        <h4 class="text-sm font-medium mb-2">Events</h4>
        <div class="space-y-2 max-h-64 overflow-auto">
          <For each={state.events} fallback={<div class="text-sm text-[var(--color-text-secondary)]">No events</div>}>
            {(ev: any) => (
              <div class="p-2 rounded-md border flex items-center justify-between" style={{ 'border-color': 'var(--color-border-primary)' }}>
                <div>
                  <div class="font-medium">{ev.title}</div>
                  <div class="text-xs text-[var(--color-text-tertiary)]">{new Date(ev.start).toLocaleString()} — {new Date(ev.end).toLocaleString()}</div>
                </div>
                <div class="flex flex-col items-end space-y-1">
                  <button class="text-sm px-2 py-1 rounded bg-[var(--color-bg-tertiary)]" onClick={() => { setEditing(ev); setOpen(true) }}>Edit</button>
                </div>
              </div>
            )}
          </For>
        </div>
      </aside>

      <Show when={open()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40" onClick={() => { setOpen(false); setEditing(null) }} />
          <div class="relative bg-[var(--color-bg-primary)] rounded-lg p-4 w-full max-w-lg border" style={{ 'border-color': 'var(--color-border-primary)' }}>
            <h3 class="text-lg font-medium mb-2">{editing()?.id ? 'Edit appointment' : 'New appointment'}</h3>
            <div class="space-y-2">
              <label class="block text-sm">Title</label>
              <input class="w-full border rounded px-2 py-1" value={editing()?.title ?? ''} onInput={(e: any) => setEditing({ ...editing(), title: e.currentTarget.value })} />

              <label class="block text-sm">Start</label>
              <input type="datetime-local" class="w-full border rounded px-2 py-1" value={isoToLocalInput(editing()?.start)} onInput={(e: any) => setEditing({ ...editing(), start: new Date(e.currentTarget.value).toISOString() })} />

              <label class="block text-sm">End</label>
              <input type="datetime-local" class="w-full border rounded px-2 py-1" value={isoToLocalInput(editing()?.end)} onInput={(e: any) => setEditing({ ...editing(), end: new Date(e.currentTarget.value).toISOString() })} />

              <div class="flex items-center justify-end space-x-2 mt-4">
                <button class="px-3 py-1 rounded border" onClick={() => { setOpen(false); setEditing(null) }}>Cancel</button>
                <button class="px-3 py-1 rounded bg-[var(--color-brand-primary)] text-white" onClick={() => saveEditing(editing())}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
