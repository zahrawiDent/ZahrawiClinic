/**
 * AppointmentBlock Component
 * Displays an individual appointment in the calendar with drag and resize support
 */

import { type Component } from 'solid-js'
import type { AppointmentBlock as AppointmentBlockType } from '../../types/appointments-calendar'
import { APPOINTMENT_COLORS, STATUS_COLORS } from '../../types/appointments-calendar'
import { getPatientName, formatTime, pxPerMinute } from '../../utils/appointment-calendar'
import { parseISO, format } from 'date-fns'
import { withPointer, withPointer2D } from '../../utils/pointer'

interface AppointmentBlockProps {
  appointment: AppointmentBlockType
  style?: Record<string, string>
  draggable?: boolean
  resizable?: boolean
  onClick?: (id: string) => void
  onDragMove2D?: (dxPx: number, dyPx: number, ev: PointerEvent) => void
  onResize?: (dyPx: number, ev: PointerEvent) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onResizeStart?: () => void
  onResizeEnd?: () => void
  tabIndex?: number
  setRef?: (el: HTMLDivElement) => void
}

export const AppointmentBlock: Component<AppointmentBlockProps> = (props) => {
  const pxPerMin = pxPerMinute()
  let didDrag = false
  
  const computedStyle = () => {
    if (props.style) {
      return props.style
    }
    
    const top = props.appointment.startMinutes * pxPerMin
    const height = props.appointment.durationMinutes * pxPerMin
    const lane = props.appointment.lane ?? 0
    const left = lane > 0 ? `${lane * 10}px` : '0'
    const width = lane > 0 ? `calc(100% - ${lane * 10}px)` : '100%'
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      left,
      width,
    }
  }
  
  const colorClass = () => APPOINTMENT_COLORS[props.appointment.type] || 'bg-gray-500'
  const statusClass = () => STATUS_COLORS[props.appointment.status] || ''
  
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (didDrag) {
      didDrag = false
      return
    }
    props.onClick?.(props.appointment.id)
  }
  
  const handlePointerDown = (pe: PointerEvent) => {
    if (!props.draggable) return
    pe.stopPropagation()
    
    let started = false
    
    if (props.onDragMove2D) {
      withPointer2D((dx, dy, ev) => {
        if (!started) {
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            didDrag = true
            started = true
            props.onDragStart?.()
          } else {
            return
          }
        }
        props.onDragMove2D!(dx, dy, ev)
      }, () => {
        setTimeout(() => (didDrag = false), 0)
        if (started) props.onDragEnd?.()
      })(pe)
    }
  }
  
  const handleResizePointerDown = (pe: PointerEvent) => {
    pe.stopPropagation()
    props.onResizeStart?.()
    withPointer((dy, ev) => props.onResize?.(dy, ev), () => props.onResizeEnd?.())(pe)
  }
  
  const s = () => parseISO(props.appointment.start_time)
  const e = () => {
    const start = parseISO(props.appointment.start_time)
    return new Date(start.getTime() + props.appointment.duration * 60000)
  }
  
  return (
    <div
      class={`absolute rounded border-2 p-2 text-white text-sm transition-all hover:shadow-lg hover:z-10 select-none ${colorClass()} ${statusClass()} ${props.draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      style={computedStyle()}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      tabindex={props.tabIndex}
      ref={props.setRef}
      data-appt-id={props.appointment.id}
      title={`${getPatientName(props.appointment)}\n${format(s(), 'p')} – ${format(e(), 'p')}${props.appointment.notes ? '\n' + props.appointment.notes : ''}`}
    >
      <div class="font-semibold truncate">
        {getPatientName(props.appointment)}
      </div>
      <div class="text-xs opacity-90 truncate">
        {formatTime(s())}
      </div>
      <div class="text-xs opacity-75 truncate">
        {props.appointment.type}
      </div>
      {props.appointment.room && (
        <div class="text-xs opacity-75">
          Room: {props.appointment.room}
        </div>
      )}
      
      {/* Resize handle */}
      {props.resizable && (
        <div
          class="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
          title="Drag to resize"
          onPointerDown={handleResizePointerDown}
        />
      )}
    </div>
  )
}

