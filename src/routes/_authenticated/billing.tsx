import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
})

function BillingPage() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">Billing</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">
          Manage invoices, payments, and financial records
        </p>
      </div>

      <div class="bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-primary)] p-6">
        <p class="text-[var(--color-text-secondary)]">
          Billing system coming soon...
        </p>
      </div>
    </div>
  )
}
