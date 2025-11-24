/**
 * Calendar Utilities
 * 
 * Helper functions for time calculations, validations, and calendar operations
 */

import type {
  TimeSlot,
  BusinessHours,
  CalendarAppointment,
  CalendarConfig,
  ValidationResult,
  DragState,
} from '../types/calendar'

/**
 * Default calendar configuration
 */
export const DEFAULT_CONFIG: CalendarConfig = {
  businessHours: {
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  },
  slotIntervalMinutes: 15,
  minAppointmentDuration: 15,
  maxAppointmentDuration: 240, // 4 hours
  slotHeightPx: 60, // 60px per 15-min slot = 240px per hour
}

/**
 * Generate time slots for a day based on business hours
 */
export function generateTimeSlots(date: Date, businessHours: BusinessHours): TimeSlot[] {
  const slots: TimeSlot[] = []
  const { startHour, startMinute, endHour, endMinute } = businessHours

  let currentHour = startHour
  let currentMinute = startMinute

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timestamp = new Date(date)
    timestamp.setHours(currentHour, currentMinute, 0, 0)

    slots.push({
      hour: currentHour,
      minute: currentMinute,
      timestamp,
    })

    // Increment by 15 minutes
    currentMinute += 15
    if (currentMinute >= 60) {
      currentMinute = 0
      currentHour++
    }
  }

  return slots
}

/**
 * Format time slot as display string (e.g., "09:00 AM")
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const hour = slot.hour === 0 ? 12 : slot.hour > 12 ? slot.hour - 12 : slot.hour
  const minute = slot.minute.toString().padStart(2, '0')
  const period = slot.hour >= 12 ? 'PM' : 'AM'
  return `${hour}:${minute} ${period}`
}

/**
 * Format time as short string (e.g., "9:00a")
 */
export function formatTimeShort(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const period = hours >= 12 ? 'p' : 'a'
  const minuteStr = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''
  return `${hour}${minuteStr}${period}`
}

/**
 * Calculate minutes from start of day
 */
export function getMinutesFromDayStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Calculate pixel position from top of calendar for a given time
 */
export function getPixelPosition(
  date: Date,
  businessHours: BusinessHours,
  slotHeightPx: number
): number {
  const startMinutes = businessHours.startHour * 60 + businessHours.startMinute
  const minutes = getMinutesFromDayStart(date)
  const minutesFromStart = minutes - startMinutes
  
  // Each 15-minute slot has height slotHeightPx
  return (minutesFromStart / 15) * slotHeightPx
}

/**
 * Calculate time from pixel position
 */
export function getTimeFromPixel(
  pixelY: number,
  date: Date,
  businessHours: BusinessHours,
  slotHeightPx: number
): Date {
  const startMinutes = businessHours.startHour * 60 + businessHours.startMinute
  const minutesFromStart = (pixelY / slotHeightPx) * 15
  const totalMinutes = startMinutes + minutesFromStart

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Snap time to nearest 15-minute interval
 */
export function snapToInterval(date: Date, intervalMinutes = 15): Date {
  const minutes = date.getMinutes()
  const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes
  
  const result = new Date(date)
  result.setMinutes(roundedMinutes, 0, 0)
  
  // Handle hour overflow
  if (roundedMinutes >= 60) {
    result.setHours(result.getHours() + 1, roundedMinutes - 60, 0, 0)
  }
  
  return result
}

/**
 * Check if time is within business hours
 */
export function isWithinBusinessHours(date: Date, businessHours: BusinessHours): boolean {
  const minutes = getMinutesFromDayStart(date)
  const startMinutes = businessHours.startHour * 60 + businessHours.startMinute
  const endMinutes = businessHours.endHour * 60 + businessHours.endMinute

  return minutes >= startMinutes && minutes < endMinutes
}

/**
 * Check if two appointments overlap
 */
export function appointmentsOverlap(
  a1: { startTime: Date; endTime: Date; dentistId: string },
  a2: { startTime: Date; endTime: Date; dentistId: string }
): boolean {
  // Only check overlap if same dentist
  if (a1.dentistId !== a2.dentistId) return false

  const a1Start = a1.startTime.getTime()
  const a1End = a1.endTime.getTime()
  const a2Start = a2.startTime.getTime()
  const a2End = a2.endTime.getTime()

  return a1Start < a2End && a2Start < a1End
}

/**
 * Calculate appointment display properties (top position and height)
 */
export function calculateAppointmentPosition(
  startTime: Date,
  endTime: Date,
  businessHours: BusinessHours,
  slotHeightPx: number
): { top: number; height: number } {
  const top = getPixelPosition(startTime, businessHours, slotHeightPx)
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
  const height = (duration / 15) * slotHeightPx

  return { top, height }
}

/**
 * Validate appointment times and constraints
 */
export function validateAppointment(
  startTime: Date,
  endTime: Date,
  dentistId: string,
  existingAppointments: CalendarAppointment[],
  config: CalendarConfig,
  excludeAppointmentId?: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check end time is after start time
  if (endTime <= startTime) {
    errors.push('End time must be after start time')
  }

  // Check duration
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  if (duration < config.minAppointmentDuration) {
    errors.push(`Appointment must be at least ${config.minAppointmentDuration} minutes`)
  }
  if (duration > config.maxAppointmentDuration) {
    errors.push(`Appointment cannot exceed ${config.maxAppointmentDuration} minutes`)
  }

  // Check business hours
  if (!isWithinBusinessHours(startTime, config.businessHours)) {
    errors.push('Start time is outside business hours')
  }
  if (!isWithinBusinessHours(endTime, config.businessHours)) {
    // Check if end time is exactly at the end of business hours
    const endMinutes = getMinutesFromDayStart(endTime)
    const businessEndMinutes = config.businessHours.endHour * 60 + config.businessHours.endMinute
    if (endMinutes > businessEndMinutes) {
      errors.push('End time is outside business hours')
    }
  }

  // Check for overlaps
  const overlappingAppointments = existingAppointments.filter(apt => {
    if (excludeAppointmentId && apt.id === excludeAppointmentId) return false
    return appointmentsOverlap(
      { startTime, endTime, dentistId },
      { startTime: apt.startTime, endTime: apt.endTime, dentistId: apt.dentistId }
    )
  })

  if (overlappingAppointments.length > 0) {
    errors.push('Appointment overlaps with existing appointments')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get appointment color based on status
 */
export function getAppointmentColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'oklch(0.7 0.15 220)', // Blue
    confirmed: 'oklch(0.65 0.18 160)', // Green
    'in-progress': 'oklch(0.7 0.18 60)', // Yellow
    completed: 'oklch(0.55 0.15 180)', // Teal
    cancelled: 'oklch(0.65 0.08 0)', // Gray
    no_show: 'oklch(0.65 0.18 20)', // Red
  }
  return colors[status] || colors.scheduled
}

/**
 * Get appointment type display name
 */
export function getAppointmentTypeName(type: string): string {
  const names: Record<string, string> = {
    checkup: 'Check-up',
    cleaning: 'Cleaning',
    filling: 'Filling',
    extraction: 'Extraction',
    root_canal: 'Root Canal',
    crown: 'Crown',
    consultation: 'Consultation',
    emergency: 'Emergency',
    other: 'Other',
  }
  return names[type] || type
}

/**
 * Get dentist color (for column header)
 */
export function getDentistColor(index: number): string {
  const colors = [
    'oklch(0.65 0.18 220)', // Blue
    'oklch(0.65 0.18 160)', // Green
    'oklch(0.65 0.18 280)', // Purple
    'oklch(0.65 0.18 60)', // Yellow
    'oklch(0.65 0.18 20)', // Red
    'oklch(0.65 0.18 180)', // Cyan
  ]
  return colors[index % colors.length]
}

/**
 * Calculate current time position
 */
export function getCurrentTimePosition(
  businessHours: BusinessHours,
  slotHeightPx: number
): number | null {
  const now = new Date()
  if (!isWithinBusinessHours(now, businessHours)) {
    return null
  }
  return getPixelPosition(now, businessHours, slotHeightPx)
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}min`
}

/**
 * Calculate drag preview position from drag state
 */
export function calculateDragPreview(
  dragState: DragState
): { startTime: Date; endTime: Date } {
  const { operation, startSlot, endSlot, initialStartTime, initialEndTime } = dragState

  if (operation === 'create') {
    return {
      startTime: startSlot.timestamp < endSlot.timestamp ? startSlot.timestamp : endSlot.timestamp,
      endTime: startSlot.timestamp < endSlot.timestamp ? endSlot.timestamp : startSlot.timestamp,
    }
  }

  if (operation === 'move' && initialStartTime && initialEndTime) {
    const deltaMinutes = (endSlot.timestamp.getTime() - startSlot.timestamp.getTime()) / (1000 * 60)
    const newStartTime = new Date(initialStartTime.getTime() + deltaMinutes * 60 * 1000)
    const duration = (initialEndTime.getTime() - initialStartTime.getTime()) / (1000 * 60)
    const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000)
    
    return { startTime: newStartTime, endTime: newEndTime }
  }

  if (operation === 'resize-top' && initialEndTime) {
    return {
      startTime: endSlot.timestamp,
      endTime: initialEndTime,
    }
  }

  if (operation === 'resize-bottom' && initialStartTime) {
    return {
      startTime: initialStartTime,
      endTime: endSlot.timestamp,
    }
  }

  return {
    startTime: startSlot.timestamp,
    endTime: endSlot.timestamp,
  }
}
