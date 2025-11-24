/**
 * WeekView Component
 * Seven-column calendar showing appointments for a week with drag interactions
 */

import { type Component, For, createMemo, createSignal, Show } from 'solid-js'
import { format, parseISO, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns'
import type { AppointmentItem } from '../../types/appointments-calendar'
import {
  weekRange,
  appointmentToBlock,
  assignLanes,
  ROW_H,
  SNAP_MIN,
  pxPerMinute,
  minutesToTime,
} from '../../utils/appointment-calendar'
import { TimeGrid } from './TimeGrid'
import { AppointmentBlock } from './AppointmentBlock'
import { SelectionOverlay } from './SelectionOverlay'

interface WeekViewProps {
  viewDate: string
  appointments: AppointmentItem[]
  weekStartsOn?: 0 | 1
  onAppointmentClick?: (id: string) => void
  onTimeSlotClick?: (startISO: string, endISO: string) => void
  onAppointmentMove?: (id: string, newStartISO: string, newDuration: number) => void
  onAppointmentResize?: (id: string, newDuration: number) => void
}

export const WeekView: Component<WeekViewProps> = (props) => {
  const anchor = () => parseISO(props.viewDate)
  const days = () => weekRange(anchor(), props.weekStartsOn ?? 1)
  const pxPerMin = pxPerMinute()
  
  // Selection state for drag-to-create
  const [selectRange, setSelectRange] = createSignal<{
    dayIndex: number
    start: number
    end: number
  } | null>(null)
  
  // Dragging state for move/resize
  const [dragging, setDragging] = createSignal<{
    id: string
    dayIndex: number
  } | null>(null)
  
  // Preview state for visual feedback during drag
  const [preview, setPreview] = createSignal<Record<string, {
    startMins?: number
    endMins?: number
    dayIndex?: number
  }>>({})
  
  let columnEls: Array<HTMLDivElement | null> = []
  
  // Group appointments by day
  const appointmentsByDay = createMemo(() => {
    const grouped: Record<string, AppointmentItem[]> = {}
    const rangeStart = startOfWeek(anchor(), { weekStartsOn: props.weekStartsOn ?? 1 })
    const rangeEnd = endOfWeek(anchor(), { weekStartsOn: props.weekStartsOn ?? 1 })
    
    props.appointments.forEach((apt) => {
      const aptDate = parseISO(apt.start_time)
      if (aptDate >= rangeStart && aptDate <= rangeEnd) {
        const dayKey = format(aptDate, 'yyyy-MM-dd')
        if (!grouped[dayKey]) {
          grouped[dayKey] = []
        }
        grouped[dayKey].push(apt)
      }
    })
    
    return grouped
  })
  
  // Helper: Get day index from client X position
  const getDayIndexFromClientX = (clientX: number): number => {
    for (let i = 0; i < columnEls.length; i++) {
      const el = columnEls[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) return i
    }
    return 0
  }
  
  // Helper: Get minutes from client Y position
  const minsFromClientY = (clientY: number, dayIndex: number): number => {
    const el = columnEls[dayIndex]
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const y = clientY - rect.top
    const mins = (y / pxPerMin)
    return Math.max(0, Math.min(24 * 60, mins))
  }
  
  // Snap to 15 minutes
  const snap = (mins: number) => Math.round(mins / SNAP_MIN) * SNAP_MIN
  
  // Handle time slot selection (drag to create)
  const handleColumnPointerDown = (dayIndex: number, pe: PointerEvent) => {
    const target = pe.target as HTMLElement
    // Don't start selection if clicking on an appointment
    if (target.dataset.apptId || target.closest('[data-appt-id]')) return
    
    const startMins = snap(minsFromClientY(pe.clientY, dayIndex))
    setSelectRange({ dayIndex, start: startMins, end: startMins })
    
    const el = pe.currentTarget as HTMLElement
    el.setPointerCapture(pe.pointerId)
    
    const handleMove = (e: PointerEvent) => {
      const endMins = snap(minsFromClientY(e.clientY, dayIndex))
      setSelectRange({ dayIndex, start: startMins, end: endMins })
    }
    
    const handleUp = () => {
      el.removeEventListener('pointermove', handleMove as any)
      el.removeEventListener('pointerup', handleUp as any)
      
      const range = selectRange()
      if (range) {
        const start = Math.min(range.start, range.end)
        const end = Math.max(range.start, range.end)
        
        // Only trigger if meaningful range (at least 15 minutes)
        if (end - start >= SNAP_MIN) {
          const day = addDays(days()[dayIndex], 0)
          day.setHours(0, 0, 0, 0)
          const startDate = new Date(day.getTime() + start * 60000)
          const endDate = new Date(day.getTime() + end * 60000)
          props.onTimeSlotClick?.(startDate.toISOString(), endDate.toISOString())
        }
      }
      
      setSelectRange(null)
    }
    
    el.addEventListener('pointermove', handleMove as any)
    el.addEventListener('pointerup', handleUp as any)
  }
  
  // Handle appointment drag (move)
  const handleAppointmentDrag = (
    block: import('../../types/appointments-calendar').AppointmentBlock,
    _startDayIndex: number,
    _dx: number,
    dy: number,
    ev: PointerEvent
  ) => {
    const targetDayIndex = getDayIndexFromClientX(ev.clientX)
    const startMins = block.startMinutes + (dy / pxPerMin)
    const snappedMins = snap(startMins)
    
    setPreview({
      [block.id]: {
        startMins: snappedMins,
        dayIndex: targetDayIndex,
      },
    })
  }
  
  // Handle appointment resize
  const handleAppointmentResize = (
    block: import('../../types/appointments-calendar').AppointmentBlock, 
    dy: number
  ) => {
    const newDuration = block.durationMinutes + (dy / pxPerMin)
    const snappedDuration = Math.max(SNAP_MIN, snap(newDuration))
    
    setPreview({
      [block.id]: {
        endMins: block.startMinutes + snappedDuration,
      },
    })
  }
  
  // Finalize appointment move
  const finalizeMove = (
    block: import('../../types/appointments-calendar').AppointmentBlock
  ) => {
    const p = preview()[block.id]
    if (!p) return
    
    const targetDayIndex = p.dayIndex ?? 0
    const targetDay = days()[targetDayIndex]
    const newStartMins = p.startMins ?? block.startMinutes
    
    const newStart = new Date(targetDay)
    newStart.setHours(0, 0, 0, 0)
    newStart.setMinutes(newStartMins)
    
    props.onAppointmentMove?.(block.id, newStart.toISOString(), block.duration)
    
    setPreview({})
    setDragging(null)
  }
  
  // Finalize appointment resize
  const finalizeResize = (
    block: import('../../types/appointments-calendar').AppointmentBlock
  ) => {
    const p = preview()[block.id]
    if (!p || !p.endMins) return
    
    const newDuration = p.endMins - block.startMinutes
    props.onAppointmentResize?.(block.id, newDuration)
    
    setPreview({})
  }
  
  return (
    <div class="flex flex-col h-full">
      {/* Header with day labels */}
      <div class="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-gray-200 border-b">
        <div class="bg-white p-2"></div>
        <For each={days()}>
          {(day) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div
                class={`p-3 text-center text-sm font-medium ${
                  isToday ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
                }`}
              >
                <div>{format(day, 'EEE')}</div>
                <div class={`text-2xl ${isToday ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            )
          }}
        </For>
      </div>
      
      {/* Time grid with appointments */}
      <div class="flex-1 overflow-auto">
        <div class="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-gray-200">
          {/* Time labels column */}
          <div class="bg-white">
            <TimeGrid />
          </div>
          
          {/* Day columns */}
          <For each={days()}>
            {(day, dayIndex) => {
              const dayKey = format(day, 'yyyy-MM-dd')
              const dayAppointments = appointmentsByDay()[dayKey] || []
              const blocks = assignLanes(dayAppointments.map(appointmentToBlock))
              
              return (
                <div 
                  class="bg-white relative cursor-crosshair touch-none" 
                  style={{ height: `${ROW_H * 24}px` }}
                  ref={(el) => (columnEls[dayIndex()] = el)}
                  onPointerDown={(pe) => handleColumnPointerDown(dayIndex(), pe)}
                >
                  {/* Grid lines */}
                  <For each={Array.from({ length: 24 })}>
                    {() => (
                      <div
                        class="border-b border-gray-100"
                        style={{ height: `${ROW_H}px` }}
                      />
                    )}
                  </For>
                  
                  {/* Selection overlay */}
                  <Show when={selectRange()?.dayIndex === dayIndex()}>
                    <SelectionOverlay
                      startMins={selectRange()!.start}
                      endMins={selectRange()!.end}
                      pxPerMin={pxPerMin}
                      labelFor={(mins) => minutesToTime(mins)}
                    />
                  </Show>
                  
                  {/* Appointments */}
                  <For each={blocks}>
                    {(block) => {
                      const isDraggingThis = dragging()?.id === block.id
                      const p = preview()[block.id]
                      
                      // Calculate display position
                      const displayStartMins = p?.startMins ?? block.startMinutes
                      const displayEndMins = p?.endMins ?? (block.startMinutes + block.durationMinutes)
                      const displayDayIndex = p?.dayIndex ?? dayIndex()
                      
                      // If dragging to another column, render there
                      if (isDraggingThis && displayDayIndex !== dayIndex()) {
                        return null
                      }
                      
                      const top = displayStartMins * pxPerMin
                      const height = Math.max(24, (displayEndMins - displayStartMins) * pxPerMin)
                      const lane = block.lane ?? 0
                      const gutter = 4
                      const widthPct = 100 / (Math.max(...blocks.map(b => (b.lane ?? 0) + 1)))
                      const leftPct = widthPct * lane
                      
                      return (
                        <AppointmentBlock
                          appointment={block}
                          draggable={true}
                          resizable={true}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `calc(${leftPct}% + ${gutter}px)`,
                            width: `calc(${widthPct}% - ${gutter * 2}px)`,
                            transition: 'top 120ms ease, height 120ms ease',
                          }}
                          onClick={props.onAppointmentClick}
                          onDragMove2D={(dx, dy, ev) => {
                            setDragging({ id: block.id, dayIndex: dayIndex() })
                            handleAppointmentDrag(block, dayIndex(), dx, dy, ev)
                          }}
                          onResize={(dy) => handleAppointmentResize(block, dy)}
                          onDragStart={() => setDragging({ id: block.id, dayIndex: dayIndex() })}
                          onDragEnd={() => finalizeMove(block)}
                          onResizeEnd={() => finalizeResize(block)}
                        />
                      )
                    }}
                  </For>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </div>
  )
}
