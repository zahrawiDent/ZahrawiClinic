import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_authenticated/medical-records")({
  component: MedicalRecordsPage,
})

function MedicalRecordsPage() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">Medical Records</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">
          Access and manage patient medical records
        </p>
      </div>

      <div class="bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-primary)] p-6">
        <p class="text-[var(--color-text-secondary)]">
          Medical records system coming soon...
        </p>
      </div>
    </div>
  )
}
