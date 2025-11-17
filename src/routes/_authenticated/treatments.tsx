import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_authenticated/treatments")({
  component: TreatmentsPage,
})

function TreatmentsPage() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">Treatments</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">
          Browse and manage dental treatments
        </p>
      </div>

      <div class="bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-primary)] p-6">
        <p class="text-[var(--color-text-secondary)]">
          Treatments catalog coming soon...
        </p>
      </div>
    </div>
  )
}
