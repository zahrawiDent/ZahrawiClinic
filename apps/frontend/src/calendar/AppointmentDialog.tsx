/**
 * AppointmentDialog
 * ------------------
 * Comprehensive appointment creation/editing modal for dental practices.
 * 
 * Features:
 * - Patient search and selection
 * - Dentist assignment
 * - Treatment type selection with color coding
 * - Status management
 * - Date/time picker with conflict warnings
 * - Duration presets (15, 30, 45, 60, 90, 120 minutes)
 * - Room/chair assignment
 * - Notes and treatment plan linking
 * - Real-time validation
 */

import { createSignal, createEffect, Show, For } from 'solid-js'
import type { AppointmentsRecord } from '@/types/schemas/appointments'
import type { PatientsRecord } from '@/types/schemas'
import type { UsersRecord } from '@/types/schemas'
import { APPOINTMENT_TYPE, APPOINTMENT_STATUS } from '@/types/schemas/appointments'
import { checkConflicts, createAppointment, updateAppointment, deleteAppointment } from './lib/appointments-integration'
import { pb } from '@/lib/pocketbase'

type AppointmentDialogProps = {
    isOpen: boolean
    appointmentId?: string | null
    initialStart?: string
    initialEnd?: string
    dentistId?: string
    onClose: () => void
    onSave: (appointment: AppointmentsRecord) => void
    onDelete?: (id: string) => void
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120] // minutes

function isoToLocalInput(iso?: string) {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localInputToISO(input: string): string {
    return new Date(input).toISOString()
}

export default function AppointmentDialog(props: AppointmentDialogProps) {
    const [loading, setLoading] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)
    const [conflicts, setConflicts] = createSignal<AppointmentsRecord[]>([])

    // Form state
    const [patientId, setPatientId] = createSignal('')
    const [dentistId, setDentistId] = createSignal(props.dentistId || '')
    const [startTime, setStartTime] = createSignal(props.initialStart || new Date().toISOString())
    const [duration, setDuration] = createSignal(60)
    const [endTime, setEndTime] = createSignal<string | null>(null) // null means use duration
    const [type, setType] = createSignal<keyof typeof APPOINTMENT_TYPE>('checkup')
    const [status, setStatus] = createSignal<keyof typeof APPOINTMENT_STATUS>('scheduled')
    const [room, setRoom] = createSignal('')
    const [notes, setNotes] = createSignal('')

    // Search state
    const [patientSearch, setPatientSearch] = createSignal('')
    const [patients, setPatients] = createSignal<PatientsRecord[]>([])
    const [dentists, setDentists] = createSignal<UsersRecord[]>([])
    const [showPatientDropdown, setShowPatientDropdown] = createSignal(false)

    // Reset form when dialog opens or props change
    createEffect(async () => {
        // React to prop changes
        const aptId = props.appointmentId
        const initialStart = props.initialStart
        const initialEnd = props.initialEnd
        const dentist = props.dentistId
        const isOpen = props.isOpen

        if (!isOpen) return

        // Clear form first
        setError(null)
        setPatientSearch('')
        setShowPatientDropdown(false)

        if (aptId) {
            // Editing existing appointment
            try {
                const apt = await pb.collection('appointments').getOne<AppointmentsRecord>(aptId)
                setPatientId(apt.patient)
                setDentistId(apt.dentist)
                setStartTime(apt.start_time)
                setDuration(apt.duration)
                setType(apt.type as any)
                setStatus(apt.status as any)
                setRoom(apt.room || '')
                setNotes(apt.notes || '')
            } catch (err) {
                setError('Failed to load appointment')
            }
        } else {
            // Creating new appointment
            setPatientId('')
            setDentistId(dentist || '')
            setType('checkup')
            setStatus('scheduled')
            setRoom('')
            setNotes('')

            // Set time from slot selection
            if (initialStart && initialEnd) {
                const start = new Date(initialStart)
                const end = new Date(initialEnd)
                const durationMins = Math.round((end.getTime() - start.getTime()) / 60000)
                setStartTime(initialStart)
                setEndTime(initialEnd) // Use end time instead of duration
                setDuration(Math.max(15, durationMins)) // Keep duration for display
            } else {
                setStartTime(new Date().toISOString())
                setDuration(60)
                setEndTime(null) // Use duration mode
            }
        }
    })

    // Load dentists
    createEffect(async () => {
        try {
            const records = await pb.collection('users').getFullList<UsersRecord>({
                filter: 'role = "Dentist"',
                sort: 'name',
            })
            setDentists(records)
        } catch (err) {
            console.error('Failed to load dentists:', err)
        }
    })

    // Search patients
    createEffect(async () => {
        const query = patientSearch().trim()
        if (query.length < 2) {
            setPatients([])
            return
        }

        try {
            const records = await pb.collection('patients').getFullList<PatientsRecord>({
                filter: `firstName ~ "${query}" || lastName ~ "${query}" || email ~ "${query}"`,
                sort: 'firstName,lastName',
                limit: 10,
            })
            setPatients(records)
            setShowPatientDropdown(true)
        } catch (err) {
            console.error('Failed to search patients:', err)
        }
    })

    // Check for conflicts
    createEffect(async () => {
        const dentist = dentistId()
        const start = startTime()
        const dur = duration()

        if (!dentist || !start || !dur) return

        const conflictList = await checkConflicts(dentist, start, dur, props.appointmentId || undefined)
        setConflicts(conflictList)
    })

    // Get selected patient name
    const selectedPatientName = () => {
        const id = patientId()
        if (!id) return ''
        const patient = patients().find(p => p.id === id)
        if (patient) return `${patient.firstName} ${patient.lastName}`
        return id // Fallback to ID if not in search results
    }

    const handleSave = async () => {
        setLoading(true)
        setError(null)

        // Validation
        if (!patientId()) {
            setError('Please select a patient')
            setLoading(false)
            return
        }
        if (!dentistId()) {
            setError('Please select a dentist')
            setLoading(false)
            return
        }

        // Calculate duration from endTime if it's set
        let finalDuration = duration()
        if (endTime()) {
            const start = new Date(startTime())
            const end = new Date(endTime()!)
            finalDuration = Math.round((end.getTime() - start.getTime()) / 60000)
        }

        const data: Partial<AppointmentsRecord> = {
            patient: patientId(),
            dentist: dentistId(),
            start_time: startTime(),
            duration: finalDuration,
            type: type() as any,
            status: status() as any,
            room: room() || undefined,
            notes: notes() || undefined,
        }

        try {
            let result: AppointmentsRecord | null

            if (props.appointmentId) {
                // Update existing
                result = await updateAppointment(props.appointmentId, data)
            } else {
                // Create new
                result = await createAppointment(data as any)
            }

            if (result) {
                props.onSave(result)
                props.onClose()
            } else {
                setError('Failed to save appointment')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save appointment')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!props.appointmentId || !props.onDelete) return

        if (!confirm('Are you sure you want to delete this appointment?')) return

        setLoading(true)
        const success = await deleteAppointment(props.appointmentId)

        if (success) {
            props.onDelete(props.appointmentId)
            props.onClose()
        } else {
            setError('Failed to delete appointment')
        }

        setLoading(false)
    }

    const TYPE_COLORS: Record<string, string> = {
        checkup: '#10b981',
        cleaning: '#3b82f6',
        filling: '#f59e0b',
        extraction: '#ef4444',
        root_canal: '#8b5cf6',
        crown: '#ec4899',
        consultation: '#06b6d4',
        emergency: '#dc2626',
        other: '#6b7280',
    }

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => props.onClose()}
                />

                {/* Dialog */}
                <div class="relative bg-[var(--color-bg-primary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--color-border-primary)]">
                    {/* Header */}
                    <div class="sticky top-0 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-primary)] px-6 py-4 flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-[var(--color-text-primary)]">
                            {props.appointmentId ? 'Edit Appointment' : 'New Appointment'}
                        </h2>
                        <button
                            onClick={() => props.onClose()}
                            class="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div class="p-6 space-y-6">
                        {/* Error Message */}
                        <Show when={error()}>
                            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                                {error()}
                            </div>
                        </Show>

                        {/* Conflict Warning */}
                        <Show when={conflicts().length > 0}>
                            <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                                <strong>⚠️ Scheduling Conflict:</strong> This time slot overlaps with {conflicts().length} other appointment{conflicts().length > 1 ? 's' : ''}.
                            </div>
                        </Show>

                        {/* Patient Selection */}
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                Patient <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input
                                    type="text"
                                    value={selectedPatientName() || patientSearch()}
                                    onInput={(e) => {
                                        setPatientSearch(e.currentTarget.value)
                                        setPatientId('')
                                    }}
                                    onFocus={() => setShowPatientDropdown(true)}
                                    placeholder="Search by name or email..."
                                    class="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                                />

                                <Show when={showPatientDropdown() && patients().length > 0}>
                                    <div class="absolute z-10 w-full mt-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-lg shadow-lg max-h-60 overflow-auto">
                                        <For each={patients()}>
                                            {(patient) => (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPatientId(patient.id)
                                                        setPatientSearch('')
                                                        setShowPatientDropdown(false)
                                                    }}
                                                    class="w-full px-4 py-3 text-left hover:bg-[var(--color-bg-tertiary)] transition-colors border-b border-[var(--color-border-primary)] last:border-0"
                                                >
                                                    <div class="font-medium text-[var(--color-text-primary)]">
                                                        {patient.firstName} {patient.lastName}
                                                    </div>
                                                    <div class="text-sm text-[var(--color-text-secondary)]">
                                                        {patient.email} • {patient.phone}
                                                    </div>
                                                </button>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </div>
                        </div>

                        {/* Dentist Selection */}
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                Dentist <span class="text-red-500">*</span>
                            </label>
                            <select
                                value={dentistId()}
                                onChange={(e) => setDentistId(e.currentTarget.value)}
                                class="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                            >
                                <option value="">Select a dentist...</option>
                                <For each={dentists()}>
                                    {(dentist) => (
                                        <option value={dentist.id}>{dentist.name}</option>
                                    )}
                                </For>
                            </select>
                        </div>

                        {/* Date and Time */}
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                    Start Time <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={isoToLocalInput(startTime())}
                                    onInput={(e) => setStartTime(localInputToISO(e.currentTarget.value))}
                                    class="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                                />
                            </div>

                            <div class="space-y-2">
                                <Show when={endTime() !== null} fallback={
                                    <>
                                        <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                            Duration (minutes) <span class="text-red-500">*</span>
                                        </label>
                                        <div class="flex gap-2">
                                            <For each={DURATION_PRESETS}>
                                                {(preset) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDuration(preset)}
                                                        class={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${duration() === preset
                                                            ? 'bg-[var(--color-brand-primary)] text-white'
                                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                                            }`}
                                                    >
                                                        {preset}
                                                    </button>
                                                )}
                                            </For>
                                        </div>
                                    </>
                                }>
                                    <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                        End Time <span class="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={isoToLocalInput(endTime()!)}
                                        onInput={(e) => setEndTime(localInputToISO(e.currentTarget.value))}
                                        class="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                                    />
                                </Show>
                            </div>
                        </div>

                        {/* Appointment Type */}
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                Treatment Type <span class="text-red-500">*</span>
                            </label>
                            <div class="grid grid-cols-3 gap-2">
                                <For each={Object.keys(APPOINTMENT_TYPE) as (keyof typeof APPOINTMENT_TYPE)[]}>
                                    {(typeKey) => (
                                        <button
                                            type="button"
                                            onClick={() => setType(typeKey)}
                                            class={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${type() === typeKey
                                                ? 'border-current shadow-md'
                                                : 'border-transparent'
                                                }`}
                                            style={{
                                                'background-color': type() === typeKey ? TYPE_COLORS[typeKey] + '20' : 'var(--color-bg-secondary)',
                                                'color': type() === typeKey ? TYPE_COLORS[typeKey] : 'var(--color-text-primary)',
                                            }}
                                        >
                                            {APPOINTMENT_TYPE[typeKey].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Status */}
                        <Show when={props.appointmentId}>
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                    Status
                                </label>
                                <div class="flex gap-2">
                                    <For each={Object.keys(APPOINTMENT_STATUS) as (keyof typeof APPOINTMENT_STATUS)[]}>
                                        {(statusKey) => (
                                            <button
                                                type="button"
                                                onClick={() => setStatus(statusKey)}
                                                class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status() === statusKey
                                                    ? 'bg-[var(--color-brand-primary)] text-white'
                                                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                                    }`}
                                            >
                                                {APPOINTMENT_STATUS[statusKey].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </Show>

                        {/* Room/Chair */}
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                Room/Chair
                            </label>
                            <input
                                type="text"
                                value={room()}
                                onInput={(e) => setRoom(e.currentTarget.value)}
                                placeholder="e.g., Chair 3, Room A..."
                                class="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                            />
                        </div>

                        {/* Notes */}
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[var(--color-text-primary)]">
                                Notes
                            </label>
                            <textarea
                                value={notes()}
                                onInput={(e) => setNotes(e.currentTarget.value)}
                                placeholder="Additional notes..."
                                rows={3}
                                class="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div class="sticky bottom-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-primary)] px-6 py-4 flex items-center justify-between">
                        <div>
                            <Show when={props.appointmentId && props.onDelete}>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading()}
                                    class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Delete
                                </button>
                            </Show>
                        </div>

                        <div class="flex gap-3">
                            <button
                                onClick={() => props.onClose()}
                                disabled={loading()}
                                class="px-4 py-2 rounded-lg border border-[var(--color-border-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading()}
                                class="px-6 py-2 rounded-lg bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {loading() ? 'Saving...' : 'Save Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    )
}
