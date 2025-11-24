/**
 * DayView
 * -------
 * Renders a single day's time grid (via TimeGrid) along with interactive event blocks.
 *
 * Responsibilities
 * - Expand recurring events to concrete occurrences that overlap the anchor day
 * - Compute collision-aware lanes so overlapping events sit side-by-side
 * - Provide drag-to-move within the day and resize within the day with snapping
 * - Provide drag-to-select on empty time to quickly create an event
 * - Support keyboard roving focus and nudge operations
 * - Provide instant visual feedback during drag/resize using a local preview store
 *
 * Visual + chrome
 * - Header, hour labels, hover indicator, "now" line, and a subtle "today" background are
 *   handled by TimeGrid/NowIndicator.
 *
 * Interactions
 * - Dragging: preview.startMins updates on pointer move; on release we commit a single update.
 * - Resizing: preview.endMins updates on pointer move; on release we commit a single update.
 * - Edge navigation: while dragging near the left/right edges of the time pane, the anchor day
 *   auto-advances backward/forward, and a fixed-position preview overlay keeps the item visible.
 * - Selection: click-and-drag paints a selection overlay; a simple click creates a 60-minute
 *   event starting at the snapped minute.
 * - Keyboard: Ctrl+ArrowUp/Down roving focus across blocks; Enter opens; Delete removes; Arrow
 *   keys nudge move/resize by SNAP_MIN on the appropriate start/end segment.
 *
 * Data flow
 * ---------
 *  state.events ──expandEventsForRange──▶ occurrences
 *        │                                 │
 *        └───────────── filter ◀───────────┘ (query/category + day-overlap)
 *                                  │
 *                           segments (startMins/endMins per occurrence)
 *                                  │
 *                       assignLanes (stable lane index per segment)
 *                                  │
 *                              render EventBlock(s)
 *
 * Coordinate system (shared with TimeGrid)
 * ----------------------------------------
 *  y(px) = minutesFromMidnight * (ROW_H / 60)
 *  height(px) = durationMins * (ROW_H / 60)
 */
import { parseISO, isSameDay, startOfDay, endOfDay } from 'date-fns'
import { state, actions } from './lib/calStore'
import EventBlock from './EventBlock'
import { assignLanes } from './lib/lanes'
import TimeGrid from './TimeGrid'
import SelectionOverlay from './SelectionOverlay'
import { createSignal, Show } from 'solid-js'
import { ROW_H, pxPerMinute, snapMins, SNAP_MIN, absMinsToGridMins, gridMinsToAbsMins } from './lib/timeGrid'
import { createPreviewState } from './lib/dragPreview'
import { createAutoScroll } from './lib/autoScroll'
import { computeMoveWithinDay, computeResizeWithinDay } from './lib/eventUpdates'
import type { EventItem } from './lib/types'

type DayViewProps = {
  // Fired when an EventBlock is clicked
  onEventClick?: (id: string, patch?: Partial<EventItem>) => void
  // Fired when the user clicks or drag-selects empty space to create a new event
  onSlotClick?: (startISO: string, endISO: string) => void
}

export default function DayView(props: DayViewProps) {
  // use state and actions from calStore
  // The day the user is currently looking at
  const anchor = () => parseISO(state.viewDate)


  // Filter events directly from state.events
  // Simple event filtering: by query and categories, then by overlap with today
  const events = () =>
    state.events.filter((e: EventItem) => {
      // Filter by query
      if (state.filters.query && !e.title?.toLowerCase().includes(state.filters.query.toLowerCase())) return false;
      // Filter by categories
      if (state.filters.categories && state.filters.categories.length > 0 && (!e.category || !state.filters.categories.includes(e.category))) return false;
      // Filter by overlap with today
      const s = parseISO(e.start)
      const en = parseISO(e.end)
      return s < endOfDay(anchor()) && en > startOfDay(anchor())
    });

  const pxPerMin = pxPerMinute()
  const startHour = () => state.dayStartHour ?? 0

  const snap = (mins: number) => snapMins(mins)

  // Shared preview state (visual-only) and auto-scroll
  const { preview, setStart: setPreviewStart, setEnd: setPreviewEnd, clearStart: clearPreviewStart, clearEnd: clearPreviewEnd } = createPreviewState(snap, SNAP_MIN)
  // Pass a getter to the autoScroll util so it can discover and scroll the appropriate
  // scrollable ancestor (e.g., the main `overflow-auto` container) instead of the window.
  const { start: startAuto, stop: stopAuto } = createAutoScroll(() => rightPaneRef)
  // Track active drag baseId and edge navigation
  const [dragging, setDragging] = createSignal<string | null>(null)
  let edgeTimer: number | null = null
  const EDGE_PX = 32
  const startEdgeNav = (dir: -1 | 1) => {
    if (edgeTimer != null) return
    edgeTimer = window.setInterval(() => {
      const cur = parseISO(state.viewDate)
      const next = new Date(cur)
      next.setDate(cur.getDate() + dir)
      actions.setViewDate(next.toISOString())
    }, 450) as any
  }
  const stopEdgeNav = () => {
    if (edgeTimer != null) {
      window.clearInterval(edgeTimer)
      edgeTimer = null
    }
  }

  function moveEvent(id: string, newStartMins: number) {
    // Move the base event (series source) within the anchor day.
    const ev = state.events.find((e) => e.id === id)
    if (!ev) return
    const patch = computeMoveWithinDay(ev, anchor(), newStartMins, snap, SNAP_MIN)
    actions.update(id, patch)
    console.log('##############################')
    console.log('move patch', patch)
  }

  function resizeEvent(id: string, newEndMins: number) {
    // Resize the base event's end within the day with snapping and minimum length.
    const ev = state.events.find((e) => e.id === id)
    if (!ev) return
    const patch = computeResizeWithinDay(ev, anchor(), newEndMins, snap, SNAP_MIN)
    actions.update(id, patch)
    console.log('##############################')
    console.log('resize patch', patch)
  }

  // using shared withPointer from utils/pointer

  let rightPaneRef: HTMLDivElement | null = null
  const minsFromClientY = (clientY: number) => {
    // Convert a pointer Y (viewport) to minutes from the top of the right pane.
    const el = rightPaneRef
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const y = clientY - rect.top
    // y -> grid minutes, then map to absolute minutes
    const grid = y / (ROW_H / 60)
    return gridMinsToAbsMins(grid, startHour())
  }

  // Drag-to-select range state (reactive)
  const [selectRange, setSelectRange] = createSignal<{ start: number; end: number } | null>(null)

  // Auto-scroll now handled by shared util

  return (
    <TimeGrid anchor={anchor()} setRightPaneRef={(el) => (rightPaneRef = el)}>
      {/* collision-aware stacking: compute segments and lanes */}
      {(() => {
        const day = anchor()
        // Collect refs for roving focus
        const blockRefs: HTMLDivElement[] = []
        const focusNeighbor = (currentId: string, dir: -1 | 1) => {
          const idx = blockRefs.findIndex((el) => el?.dataset?.evid === currentId)
          const next = idx + dir
          const el = blockRefs[next]
          if (el && typeof el.focus === 'function') el.focus()
        }
        const segs = events()
          .map((e) => {
            const sAbs = parseISO(e.start)
            const eAbs = parseISO(e.end)
            // For multi-day events, clamp the visual segment to this day only.
            const startAbs = Math.max(0, isSameDay(sAbs, day) ? sAbs.getHours() * 60 + sAbs.getMinutes() : 0)
            const endAbs = Math.min(24 * 60, isSameDay(eAbs, day) ? eAbs.getHours() * 60 + eAbs.getMinutes() : 24 * 60)
            // Use the occurrence id (unique) for lane stacking to avoid collisions for recurring series
            return { e, id: e.id, startAbs, endAbs }
          })
          .filter((seg) => seg.endAbs > seg.startAbs)
          .sort((a, b) => a.startAbs - b.startAbs || a.endAbs - b.endAbs)

        const { sorted, laneIndexById, laneCount } = assignLanes(segs.map(s => ({ id: s.id, startMins: s.startAbs, endMins: s.endAbs, data: s })))
        const gutter = 4

        return sorted.map(({ data }) => {
          const { e, id, startAbs, endAbs } = data
          const p = preview()[e.id]
          // Visual overrides: drag sets startMins (top), resize sets endMins (height)
          const dispStartAbs = p?.startMins != null ? p.startMins : startAbs
          const dispEndAbs = p?.endMins != null ? p.endMins : endAbs
          const top = absMinsToGridMins(dispStartAbs, startHour()) * pxPerMin
          const height = Math.max(ROW_H / 2, (dispEndAbs - startAbs) * pxPerMin)
          const lane = laneIndexById.get(id) ?? 0
          const widthPct = 100 / laneCount
          const leftPct = widthPct * lane
          const sAbs = parseISO(e.start)
          const eAbs = parseISO(e.end)
          const isStartSegment = isSameDay(sAbs, day)
          const isEndSegment = isSameDay(eAbs, day)
          return (
            <EventBlock
              id={id}
              title={e.title}
              color={e.color}
              startISO={e.start}
              endISO={e.end}
              // Only allow editing on non-recurring base events and on the segment that
              // actually starts/ends on this day (avoids cross-day drag confusion).
              draggable={isStartSegment}
              resizable={isEndSegment}
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `calc(${leftPct}% + ${gutter}px)`,
                width: `calc(${widthPct}% - ${gutter * 2}px)`,
                transition: 'top 120ms ease, height 120ms ease, left 120ms ease, width 120ms ease',
                ...({ opacity: dragging() === e.id ? 0 : 1 } as any),
              }}
              onClick={(id) => props.onEventClick?.(id, { start: e.start, end: e.end })}
              onDragMove2D={(_dxPx, _dyPx, ev: any) => {
                // Convert pointer Y to minutes; navigate days when hitting horizontal edges.
                if (!isStartSegment) return
                const abs = minsFromClientY(ev.clientY)
                setPreviewStart(e.id, snap(abs))
                const pane = rightPaneRef
                if (pane) {
                  const rect = pane.getBoundingClientRect()
                  if (ev.clientX > rect.right - EDGE_PX) startEdgeNav(1)
                  else if (ev.clientX < rect.left + EDGE_PX) startEdgeNav(-1)
                  else stopEdgeNav()
                }
              }}
              onDragStart={() => { setDragging(e.id); startAuto() }}
              onDragEnd={async () => {
                // Commit last position using preview and clear it
                const p = preview()[e.id]
                if (p?.startMins != null) {
                  moveEvent(e.id, p.startMins)
                }
                clearPreviewStart(e.id)
                setDragging(null)
                stopAuto()
                stopEdgeNav()
              }}
              onResize={(_dyPx, ev: any) => {
                // Convert pointer Y to minutes and resize the base event's end.
                if (!isEndSegment) return
                const abs = minsFromClientY(ev.clientY)
                setPreviewEnd(e.id, snap(abs))
              }}
              onResizeStart={() => startAuto()}
              onResizeEnd={async () => {
                const p = preview()[e.id]
                if (p?.endMins != null) {
                  resizeEvent(e.id, p.endMins)
                }
                clearPreviewEnd(e.id)
                stopAuto()
              }}
              onKeyDown={(ke: any) => {
                // Keyboard: roving focus, open, delete, and nudge move/resize by SNAP_MIN.
                if (ke.ctrlKey && (ke.key === 'ArrowUp' || ke.key === 'ArrowDown')) {
                  focusNeighbor(id, ke.key === 'ArrowUp' ? -1 : 1)
                  ke.preventDefault();
                  return
                }
                if (ke.key === 'Enter') { props.onEventClick?.(id, { start: e.start, end: e.end }); ke.preventDefault(); return }
                if (ke.key === 'Delete' || ke.key === 'Backspace') { actions.remove(e.id); ke.preventDefault(); return }
                const s = parseISO(e.start)
                const en = parseISO(e.end)
                const sM = s.getHours() * 60 + s.getMinutes()
                const enM = en.getHours() * 60 + en.getMinutes()
                if (ke.key === 'ArrowUp' && isStartSegment) { moveEvent(e.id, sM - SNAP_MIN); ke.preventDefault(); }
                if (ke.key === 'ArrowDown' && isStartSegment) { moveEvent(e.id, sM + SNAP_MIN); ke.preventDefault(); }
                if (ke.key === 'ArrowLeft' && isEndSegment) { resizeEvent(e.id, Math.max(sM + SNAP_MIN, enM - SNAP_MIN)); ke.preventDefault(); }
                if (ke.key === 'ArrowRight' && isEndSegment) { resizeEvent(e.id, enM + SNAP_MIN); ke.preventDefault(); }
              }}
              tabIndex={0}
              setRef={(el) => blockRefs.push(el)}
            />
          )
        })
      })()}
      {/* selection overlay (visual) */}
      {(() => {
        const sel = selectRange()
        if (!sel) return null as any
        return (
          <SelectionOverlay
            startMins={absMinsToGridMins(sel.start, startHour())}
            endMins={absMinsToGridMins(sel.end, startHour())}
            pxPerMin={pxPerMin}
            labelFor={(gridMins) => {
              const d = new Date(anchor())
              d.setHours(0, 0, 0, 0)
              const abs = gridMinsToAbsMins(gridMins, startHour())
              d.setMinutes(abs)
              return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            }}
          />
        )
      })()}
      {/* slot overlay for click or drag-to-select */}
      <div
        class="absolute inset-0 z-0"
        onPointerDown={(ev) => {
          if (!props.onSlotClick) return
          const startRaw = minsFromClientY((ev as any).clientY)
          const startMin = snap(Math.max(0, Math.min(24 * 60 - SNAP_MIN, startRaw)))
          setSelectRange({ start: startMin, end: startMin })
          startAuto()
          const onMove = (e: PointerEvent) => {
            const curRaw = minsFromClientY((e as any).clientY)
            const curMin = snap(Math.max(0, Math.min(24 * 60, curRaw)))
            setSelectRange({ start: startMin, end: curMin })
          }
          const onUp = (e: PointerEvent) => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            stopAuto()
            const endRaw = minsFromClientY((e as any).clientY)
            const endMin = snap(Math.max(0, Math.min(24 * 60, endRaw)))
            const s = Math.min(startMin, endMin)
            const en = Math.max(startMin, endMin)
            const start = new Date(anchor())
            start.setHours(0, 0, 0, 0)
            start.setMinutes(s)
            const end = new Date(anchor())
            end.setHours(0, 0, 0, 0)
            // If there was no drag, default to 60 minutes
            if (en === s) {
              end.setMinutes(Math.min(24 * 60, s + 60))
            } else {
              end.setMinutes(en)
            }
            props.onSlotClick!(start.toISOString(), end.toISOString())
            setSelectRange(null)
          }
          try { (ev.currentTarget as any).setPointerCapture?.((ev as any).pointerId) } catch { }
          window.addEventListener('pointermove', onMove)
          window.addEventListener('pointerup', onUp, { once: true } as any)
        }}
      />

      {/* Drag overlay to persist the moving block across day changes while dragging */}
      <Show when={(() => !!(dragging && dragging()))() as any}>
        {(() => {
          const dragId = dragging() as string | null
          const pane = rightPaneRef as HTMLDivElement | null
          if (!dragId || !pane) return null as any
          const ev = state.events.find((e) => e.id === dragId)
          if (!ev) return null as any
          const p = preview()[dragId]
          const sAbs = parseISO(ev.start)
          const eAbs = parseISO(ev.end)
          const startAbs = sAbs.getHours() * 60 + sAbs.getMinutes()
          const endAbs = eAbs.getHours() * 60 + eAbs.getMinutes()
          const dispStartAbs = p?.startMins != null ? p.startMins : startAbs
          const dispEndAbs = p?.endMins != null ? p.endMins : endAbs
          const top = absMinsToGridMins(dispStartAbs, startHour()) * pxPerMin
          const height = Math.max(ROW_H / 2, (dispEndAbs - startAbs) * pxPerMin)
          const rect = (pane as HTMLDivElement).getBoundingClientRect()
          const gutter = 4
          return (
            <EventBlock
              id={`${dragId}::overlay`}
              title={ev.title}
              color={ev.color}
              startISO={ev.start}
              endISO={ev.end}
              draggable={false}
              resizable={false}
              style={{
                top: `${rect.top + top}px`,
                height: `${height}px`,
                left: `${rect.left + gutter}px`,
                width: `${rect.width - gutter * 2}px`,
                transition: 'none',
                ...({ position: 'fixed' } as any),
              } as any}
              onClick={() => { }}
            />
          )
        })()}
      </Show>

    </TimeGrid>
  )
}
