/**
 * Appointments Integration
 * ------------------------
 * Bridge between the calendar UI and PocketBase appointments collection.
 * 
 * Features:
 * - Transforms PocketBase appointment records to calendar EventItems
 * - Real-time subscription for live updates
 * - Conflict detection across dentist schedules
 * - Color coding by appointment type and status
 */

import { createEffect, onCleanup } from 'solid-js'
import type { AppointmentsRecord } from '@/types/schemas/appointments'
import type { EventItem } from './types'
import { pb } from '@/lib/pocketbase'
import { actions } from './calStore'

/**
 * Color palette for appointment types
 */
const APPOINTMENT_TYPE_COLORS: Record<string, string> = {
    checkup: '#10b981',      // green
    cleaning: '#3b82f6',     // blue
    filling: '#f59e0b',      // amber
    extraction: '#ef4444',   // red
    root_canal: '#8b5cf6',   // purple
    crown: '#ec4899',        // pink
    consultation: '#06b6d4', // cyan
    emergency: '#dc2626',    // dark red
    other: '#6b7280',        // gray
}

/**
 * Opacity levels for appointment statuses
 */
const STATUS_OPACITY: Record<string, number> = {
    scheduled: 1,
    confirmed: 1,
    completed: 0.5,
    cancelled: 0.3,
    no_show: 0.4,
}

/**
 * Transform a PocketBase appointment record to a calendar EventItem
 */
export function appointmentToEvent(apt: AppointmentsRecord): EventItem {
    const startDate = new Date(apt.start_time)
    const endDate = new Date(startDate.getTime() + apt.duration * 60000)

    const baseColor = APPOINTMENT_TYPE_COLORS[apt.type] || '#6b7280'

    return {
        id: apt.id,
        title: apt.type.charAt(0).toUpperCase() + apt.type.slice(1).replace('_', ' '),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        color: baseColor,
        category: apt.type as any, // Store type in category for filtering
        // Store full appointment data for quick access
        notes: JSON.stringify({
            patient: apt.patient,
            dentist: apt.dentist,
            status: apt.status,
            room: apt.room,
            notes: apt.notes,
            treatmentPlan: apt.treatmentPlan,
            originalRecord: apt,
        }),
    }
}

/**
 * Transform a calendar EventItem back to appointment update data
 */
export function eventToAppointment(event: EventItem): Partial<AppointmentsRecord> {
    const startDate = new Date(event.start)
    const endDate = new Date(event.end)
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

    // Extract stored data if available
    let storedData: any = {}
    try {
        if (event.notes) {
            storedData = JSON.parse(event.notes)
        }
    } catch { }

    return {
        start_time: startDate.toISOString(),
        duration: Math.max(15, duration), // Minimum 15 minutes
        ...(storedData.patient && { patient: storedData.patient }),
        ...(storedData.dentist && { dentist: storedData.dentist }),
        ...(storedData.status && { status: storedData.status }),
        ...(storedData.room && { room: storedData.room }),
        ...(storedData.notes && { notes: storedData.notes }),
        ...(storedData.treatmentPlan && { treatmentPlan: storedData.treatmentPlan }),
    }
}

/**
 * Load appointments from PocketBase for a given date range
 */
export async function loadAppointments(startDate: Date, endDate: Date): Promise<EventItem[]> {
    try {
        const records = await pb.collection('appointments').getFullList<AppointmentsRecord>({
            filter: `start_time >= "${startDate.toISOString()}" && start_time <= "${endDate.toISOString()}"`,
            sort: 'start_time',
            expand: 'patient,dentist',
        })

        return records.map(appointmentToEvent)
    } catch (error) {
        console.error('Failed to load appointments:', error)
        return []
    }
}

/**
 * Create a new appointment in PocketBase
 */
export async function createAppointment(
    data: Partial<AppointmentsRecord>
): Promise<AppointmentsRecord | null> {
    try {
        const record = await pb.collection('appointments').create<AppointmentsRecord>(data)
        return record
    } catch (error) {
        console.error('Failed to create appointment:', error)
        return null
    }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
    id: string,
    data: Partial<AppointmentsRecord>
): Promise<AppointmentsRecord | null> {
    try {
        const record = await pb.collection('appointments').update<AppointmentsRecord>(id, data)
        return record
    } catch (error) {
        console.error('Failed to update appointment:', error)
        return null
    }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: string): Promise<boolean> {
    try {
        await pb.collection('appointments').delete(id)
        return true
    } catch (error) {
        console.error('Failed to delete appointment:', error)
        return false
    }
}

/**
 * Check for scheduling conflicts
 */
export async function checkConflicts(
    dentistId: string,
    startTime: string,
    duration: number,
    excludeId?: string
): Promise<AppointmentsRecord[]> {
    try {
        const start = new Date(startTime)
        const end = new Date(start.getTime() + duration * 60000)

        const filter = [
            `dentist = "${dentistId}"`,
            `start_time < "${end.toISOString()}"`,
            `status != "cancelled"`,
            `status != "no_show"`,
        ]

        if (excludeId) {
            filter.push(`id != "${excludeId}"`)
        }

        const conflicts = await pb.collection('appointments').getFullList<AppointmentsRecord>({
            filter: filter.join(' && '),
        })

        // Filter by actual time overlap
        return conflicts.filter(apt => {
            const aptStart = new Date(apt.start_time)
            const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000)
            return aptStart < end && aptEnd > start
        })
    } catch (error) {
        console.error('Failed to check conflicts:', error)
        return []
    }
}

/**
 * Subscribe to real-time appointment updates
 * Returns unsubscribe function
 */
export function subscribeToAppointments(
    onUpdate: (event: EventItem, action: 'create' | 'update' | 'delete') => void
): () => void {
    pb.collection('appointments').subscribe<AppointmentsRecord>('*', (e) => {
        const event = appointmentToEvent(e.record)

        if (e.action === 'create') {
            onUpdate(event, 'create')
        } else if (e.action === 'update') {
            onUpdate(event, 'update')
        } else if (e.action === 'delete') {
            onUpdate(event, 'delete')
        }
    })

    return () => {
        pb.collection('appointments').unsubscribe('*')
    }
}

/**
 * Setup real-time sync for calendar
 */
export function setupRealtimeSync() {
    createEffect(() => {
        const unsubscribe = subscribeToAppointments((event, action) => {
            if (action === 'create') {
                actions.add(event)
            } else if (action === 'update') {
                actions.update(event.id, event)
            } else if (action === 'delete') {
                actions.remove(event.id)
            }
        })

        onCleanup(unsubscribe)
    })
}
