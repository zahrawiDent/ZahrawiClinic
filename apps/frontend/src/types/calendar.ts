/**
 * Calendar Types
 * 
 * Type definitions for the dental appointment calendar component
 */

import type { AppointmentStatus, AppointmentType } from './schemas/appointments'

/**
 * Time slot representation (15-minute intervals)
 */
export interface TimeSlot {
  hour: number
  minute: number
  timestamp: Date
}

/**
 * Business hours configuration
 */
export interface BusinessHours {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

/**
 * Calendar appointment with extended display properties
 */
export interface CalendarAppointment {
  id: string
  patientId: string
  patientName: string
  dentistId: string
  startTime: Date
  endTime: Date
  duration: number // minutes
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  room?: string
  // Display properties
  top: number // pixels from top of calendar
  height: number // pixels
  color: string
}

/**
 * Dentist with availability info
 */
export interface CalendarDentist {
  id: string
  firstName: string
  lastName: string
  name: string // computed full name
  avatar?: string
  role: string
  availableForAppointments: boolean
  color: string // assigned color for calendar
}

/**
 * Drag operation types
 */
export type DragOperation = 'create' | 'move' | 'resize-top' | 'resize-bottom'

/**
 * Drag state during active drag operation
 */
export interface DragState {
  operation: DragOperation
  appointmentId?: string
  dentistId: string
  startSlot: TimeSlot
  endSlot: TimeSlot
  initialStartTime?: Date
  initialEndTime?: Date
  mouseStartY: number
  currentMouseY: number
}

/**
 * Validation result for appointment changes
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Calendar configuration
 */
export interface CalendarConfig {
  businessHours: BusinessHours
  slotIntervalMinutes: number
  minAppointmentDuration: number // minutes
  maxAppointmentDuration: number // minutes
  slotHeightPx: number // height of each 15-min slot
}

/**
 * Appointment change event data
 */
export interface AppointmentChangeEvent {
  appointmentId: string
  oldStartTime: Date
  oldEndTime: Date
  oldDentistId: string
  newStartTime: Date
  newEndTime: Date
  newDentistId: string
}

/**
 * Time selection for creating new appointment
 */
export interface TimeSelection {
  dentistId: string
  startTime: Date
  endTime: Date
}
