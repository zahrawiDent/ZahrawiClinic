import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">
          Configure application settings and preferences
        </p>
      </div>

      <div class="bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-primary)] p-6">
        <p class="text-[var(--color-text-secondary)]">
          Settings panel coming soon...
        </p>
      </div>
    </div>
  )
}
