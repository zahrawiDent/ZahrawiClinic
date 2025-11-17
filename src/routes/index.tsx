import { createFileRoute, Link } from "@tanstack/solid-router"
import { For, Show, Suspense } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { useCollection } from "@/lib/queries"
import { PageLayout, PageContainer, PageHeader, Card, StatsCard } from "@/components/ui"

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const auth = useAuth()

  // Lightweight counts for dashboard cards
  const patients = useCollection("patients", { sort: "-created" })
  const todos = useCollection("todos", { sort: "-created" })

  return (
    <PageLayout>
      <PageContainer size="lg">
        <div class="mb-6 pt-6">
          <PageHeader
            title="Clinic Dashboard"
            subtitle="Quick access to common tasks and an overview of your practice"
            action={
              <div class="text-sm text-[var(--color-text-secondary)]">
                Welcome{auth.user()?.name ? `, ${auth.user()?.name}` : ''}
              </div>
            }
          />

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Suspense>
              <Show when={!patients.isLoading && patients.data} fallback={<StatsCard value="—" label="Patients" />}>
                {(data) => (
                  <StatsCard value={data().items?.length ?? 0} label="Patients" color="blue" />
                )}
              </Show>
            </Suspense>

            <Suspense>
              <Show when={!todos.isLoading && todos.data} fallback={<StatsCard value="—" label="Open Tasks" />}>
                {(data) => (
                  <StatsCard value={data().items?.filter((t:any)=>!t.completed).length ?? 0} label="Open Tasks" color="green" />
                )}
              </Show>
            </Suspense>

            <StatsCard value="—" label="Open Invoices" color="orange" />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <Card class="mb-4">
                <h2 class="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">Shortcuts</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/patients" class="block p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded hover:shadow transition">
                    <div class="font-medium">📋 Patients</div>
                    <div class="text-sm text-[var(--color-text-secondary)]">View and manage patient records</div>
                  </Link>
                  <Link to="/patients/new" class="block p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded hover:shadow transition">
                    <div class="font-medium">➕ New Patient</div>
                    <div class="text-sm text-[var(--color-text-secondary)]">Quickly add a patient</div>
                  </Link>
                  <Link to="/patients" class="block p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded hover:shadow transition">
                    <div class="font-medium">📅 Appointments</div>
                    <div class="text-sm text-[var(--color-text-secondary)]">Today's schedule and booking</div>
                  </Link>
                  <Link to="/todos" class="block p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded hover:shadow transition">
                    <div class="font-medium">✅ Tasks</div>
                    <div class="text-sm text-[var(--color-text-secondary)]">Office tasks and follow-ups</div>
                  </Link>
                </div>
              </Card>

              <Card>
                <h2 class="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">Upcoming Items</h2>
                <Suspense fallback={<div class="text-sm text-[var(--color-text-secondary)] p-4">Loading...</div>}>
                  <Show when={!patients.isLoading && patients.data} fallback={<div class="p-4 text-sm text-[var(--color-text-secondary)]">No data</div>}>
                    {(data) => (
                      <div class="space-y-3">
                        <div class="text-sm text-[var(--color-text-secondary)]">Recent patients</div>
                        <div class="divide-y divide-[var(--color-border-primary)]">
                          <For each={data().items?.slice(0,6)} fallback={<div class="p-4 text-sm text-[var(--color-text-secondary)]">No recent patients</div>}>
                            {(p:any) => (
                              <div class="p-3 flex items-center justify-between">
                                <div>
                                  <div class="font-medium text-[var(--color-text-primary)]">
                                    {p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || p.id}
                                  </div>
                                  <div class="text-xs text-[var(--color-text-secondary)]">Created: {new Date(p.created).toLocaleDateString()}</div>
                                </div>
                                <Link to="/patients/$id" params={{ id: p.id }} class="text-sm text-[var(--color-brand-primary)] hover:underline">View</Link>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </Show>
                </Suspense>
              </Card>
            </div>

            <div>
              <Card>
                <h2 class="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">Quick Actions</h2>
                <div class="flex flex-col space-y-3">
                  <Link to="/patients/new" class="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded text-center">Add Patient</Link>
                  <Link to="/patients/new" class="px-4 py-2 bg-[var(--color-accent-purple)] text-white rounded text-center">New Appointment</Link>
                  <Link to="/todos/new" class="px-4 py-2 bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded text-center">Create Task</Link>
                </div>
              </Card>

              <Card class="mt-4">
                <h3 class="text-sm font-medium mb-2 text-[var(--color-text-primary)]">Help & Tips</h3>
                <div class="text-xs text-[var(--color-text-secondary)]">
                  Use the shortcuts to quickly create patients, schedule appointments, and manage billing. Add collections like <code>appointments</code> or <code>invoices</code> to enable more dashboard data.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
