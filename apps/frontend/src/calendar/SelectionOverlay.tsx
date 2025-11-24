/**
 * SelectionOverlay
 * ----------------
 * Visual overlay used while the user is selecting a time range in Day/Week views.
 *
 * Renders:
 * - A translucent blue rectangle between start and end minutes
 * - Two small labels: start time at the top and end time at the bottom
 *
 * This component is purely presentational; the parent supplies the minutes to render
 * and the label formatting function.
 */
import { SNAP_MIN } from './lib/timeGrid'

type SelectionOverlayProps = {
  startMins: number
  endMins: number
  pxPerMin: number
  // Returns a label string for a given minutes-from-midnight value
  labelFor: (mins: number) => string
}

export default function SelectionOverlay(props: SelectionOverlayProps) {
  const start = Math.min(props.startMins, props.endMins)
  const end = Math.max(props.startMins, props.endMins)
  const top = start * props.pxPerMin
  const height = Math.max(SNAP_MIN, Math.abs(end - start)) * props.pxPerMin

  return (
    <div class="absolute inset-x-0 z-30 pointer-events-none">
      <div
        class="absolute left-0 right-0 border rounded-sm"
        style={{ top: `${top}px`, height: `${height}px`, 'background-color': 'var(--color-info-bg)', opacity: '0.3', 'border-color': 'var(--color-info-border)' }}
      />
      <div
        class="absolute left-2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border shadow-sm"
        style={{ top: `${top}px`, color: 'var(--color-info-text)', 'background-color': 'var(--color-bg-primary)', 'border-color': 'var(--color-info-border)' }}
      >
        {props.labelFor(start)}
      </div>
      <div
        class="absolute left-2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border shadow-sm"
        style={{ top: `${top + height}px`, color: 'var(--color-info-text)', 'background-color': 'var(--color-bg-primary)', 'border-color': 'var(--color-info-border)' }}
      >
        {props.labelFor(end)}
      </div>
    </div>
  )
}
