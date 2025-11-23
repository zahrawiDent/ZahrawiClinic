import { createFileRoute, Link } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { For, Show, Suspense, createMemo } from "solid-js"
import { useCollection, useRealtimeCollection } from "@/lib/queries"
import { PageLayout, PageContainer, Card, StatsCard } from "@/components/ui"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const auth = useAuth()

  // Fetch data with realtime sync
  const patients = useCollection("patients", { sort: "-created" })
  const appointments = useCollection("appointments", { sort: "-start_time" })
  const todos = useCollection("todos", { sort: "-created", filter: "completed = false" })

  // Enable realtime updates
  useRealtimeCollection("patients")
  useRealtimeCollection("appointments")
  useRealtimeCollection("todos")

  // Calculate stats
  const stats = createMemo(() => {
    const totalPatients = patients.data?.totalItems ?? 0
    const totalAppointments = appointments.data?.items?.length ?? 0
    const pendingTodos = todos.data?.items?.filter((t: any) => !t.completed).length ?? 0

    // Count today's appointments
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.data?.items?.filter((apt: any) => {
      const aptDate = new Date(apt.start_time).toISOString().split('T')[0]
      return aptDate === today
    }).length ?? 0

    return {
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingTodos,
    }
  })

  // Get recent patients (last 5)
  const recentPatients = createMemo(() => patients.data?.items?.slice(0, 5) ?? [])

  // Get upcoming appointments (next 5)
  const upcomingAppointments = createMemo(() => {
    const now = new Date()
    return appointments.data?.items
      ?.filter((apt: any) => new Date(apt.start_time) > now)
      ?.slice(0, 5) ?? []
  })

  // Get urgent todos (high/urgent priority, not completed)
  const urgentTodos = createMemo(() => {
    return todos.data?.items
      ?.filter((todo: any) =>
        !todo.completed &&
        (todo.priority === 'high' || todo.priority === 'urgent')
      )
      ?.slice(0, 5) ?? []
  })

  return (
    <PageLayout>
      <PageContainer size="xl">
        <div class="space-y-6">
          {/* Welcome Header */}
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                Welcome back, {auth.user()?.name || auth.user()?.email || 'Doctor'}! 👋
              </h1>
              <p class="text-[var(--color-text-secondary)]">
                Here's what's happening in your clinic today
              </p>
            </div>
            <Show when={auth.isAdmin()}>
              <div class="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-sm font-semibold text-purple-500">Admin</span>
                </div>
              </div>
            </Show>
          </div>

          {/* Stats Grid */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Suspense fallback={<StatsCard value="—" label="Total Patients" />}>
              <StatsCard
                value={stats().totalPatients}
                label="Total Patients"
                color="blue"
              />
            </Suspense>

            <Suspense fallback={<StatsCard value="—" label="Today's Appointments" />}>
              <StatsCard
                value={stats().todayAppointments}
                label="Today's Appointments"
                color="green"
              />
            </Suspense>

            <Suspense fallback={<StatsCard value="—" label="All Appointments" />}>
              <StatsCard
                value={stats().totalAppointments}
                label="All Appointments"
                color="purple"
              />
            </Suspense>

            <Suspense fallback={<StatsCard value="—" label="Pending Tasks" />}>
              <StatsCard
                value={stats().pendingTodos}
                label="Pending Tasks"
                color="orange"
              />
            </Suspense>
          </div>

          {/* Quick Actions */}
          <Card>
            <h2 class="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/patients/new"
                class="group relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-blue-500 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-1">New Patient</h3>
                    <p class="text-sm text-blue-700 dark:text-blue-300">Add a new patient record</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/appointments"
                class="group relative overflow-hidden p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-green-500 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-green-900 dark:text-green-100 mb-1">Schedule</h3>
                    <p class="text-sm text-green-700 dark:text-green-300">Book an appointment</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/patients"
                class="group relative overflow-hidden p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-purple-500 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-purple-900 dark:text-purple-100 mb-1">View Patients</h3>
                    <p class="text-sm text-purple-700 dark:text-purple-300">Browse all records</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/tasks/new"
                class="group relative overflow-hidden p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-orange-500 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-orange-900 dark:text-orange-100 mb-1">New Task</h3>
                    <p class="text-sm text-orange-700 dark:text-orange-300">Create a new todo</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>

          {/* Content Grid */}
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Patients */}
            <Card class="lg:col-span-1">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Recent Patients
                </h2>
                <Link
                  to="/patients"
                  class="text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>
              <Suspense fallback={
                <div class="text-sm text-[var(--color-text-secondary)] text-center py-8">
                  Loading patients...
                </div>
              }>
                <Show
                  when={recentPatients().length > 0}
                  fallback={
                    <div class="text-center py-8">
                      <div class="w-16 h-16 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p class="text-sm text-[var(--color-text-secondary)] mb-3">No patients yet</p>
                      <Link
                        to="/patients/new"
                        class="inline-block text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                      >
                        Add your first patient
                      </Link>
                    </div>
                  }
                >
                  <div class="space-y-3">
                    <For each={recentPatients()}>
                      {(patient: any) => (
                        <Link
                          to="/patients/$id"
                          params={{ id: patient.id }}
                          class="block p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded-lg hover:border-[var(--color-brand-primary)] hover:shadow-md transition-all group"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {(patient.firstName?.[0] || patient.name?.[0] || '?').toUpperCase()}
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors truncate">
                                {patient.firstName && patient.lastName
                                  ? `${patient.firstName} ${patient.lastName}`
                                  : patient.name || 'Unknown Patient'}
                              </div>
                              <div class="text-xs text-[var(--color-text-secondary)]">
                                {new Date(patient.created).toLocaleDateString()}
                              </div>
                            </div>
                            <svg class="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-primary)] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      )}
                    </For>
                  </div>
                </Show>
              </Suspense>
            </Card>

            {/* Upcoming Appointments */}
            <Card class="lg:col-span-1">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming
                </h2>
                <Link
                  to="/appointments"
                  class="text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>
              <Suspense fallback={
                <div class="text-sm text-[var(--color-text-secondary)] text-center py-8">
                  Loading appointments...
                </div>
              }>
                <Show
                  when={upcomingAppointments().length > 0}
                  fallback={
                    <div class="text-center py-8">
                      <div class="w-16 h-16 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p class="text-sm text-[var(--color-text-secondary)] mb-3">No upcoming appointments</p>
                      <Link
                        to="/appointments"
                        class="inline-block text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                      >
                        Schedule an appointment
                      </Link>
                    </div>
                  }
                >
                  <div class="space-y-3">
                    <For each={upcomingAppointments()}>
                      {(appointment: any) => (
                        <div class="p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded-lg">
                          <div class="flex items-start justify-between mb-2">
                            <div class="flex-1">
                              <div class="font-medium text-[var(--color-text-primary)] text-sm">
                                {new Date(appointment.start_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div class="text-xs text-[var(--color-text-secondary)]">
                                {new Date(appointment.start_time).toLocaleDateString()}
                              </div>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                              {appointment.status || 'scheduled'}
                            </span>
                          </div>
                          <div class="text-sm text-[var(--color-text-secondary)]">
                            {appointment.type || 'Appointment'}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </Suspense>
            </Card>

            {/* Urgent Tasks */}
            <Card class="lg:col-span-1">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Urgent Tasks
                </h2>
                <Link
                  to="/tasks"
                  class="text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>
              <Suspense fallback={
                <div class="text-sm text-[var(--color-text-secondary)] text-center py-8">
                  Loading tasks...
                </div>
              }>
                <Show
                  when={urgentTodos().length > 0}
                  fallback={
                    <div class="text-center py-8">
                      <div class="w-16 h-16 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p class="text-sm text-[var(--color-text-secondary)] mb-3">No urgent tasks</p>
                      <p class="text-xs text-[var(--color-text-secondary)]">You're all caught up! 🎉</p>
                    </div>
                  }
                >
                  <div class="space-y-3">
                    <For each={urgentTodos()}>
                      {(todo: any) => (
                        <Link
                          to="/tasks/$id"
                          params={{ id: todo.id }}
                          class="block p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded-lg hover:border-orange-500 hover:shadow-md transition-all group"
                        >
                          <div class="flex items-start gap-3">
                            <div class="mt-0.5">
                              <div class={`w-2 h-2 rounded-full ${todo.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500'
                                }`} />
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="font-medium text-[var(--color-text-primary)] group-hover:text-orange-500 transition-colors truncate text-sm">
                                {todo.title}
                              </div>
                              <div class="flex items-center gap-2 mt-1">
                                <span class={`px-2 py-0.5 text-xs font-medium rounded ${todo.priority === 'urgent'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                  }`}>
                                  {todo.priority}
                                </span>
                                <Show when={todo.dueDate}>
                                  <span class="text-xs text-[var(--color-text-secondary)]">
                                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                                  </span>
                                </Show>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}
                    </For>
                  </div>
                </Show>
              </Suspense>
            </Card>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
