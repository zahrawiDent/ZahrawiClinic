import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { Show } from "solid-js"
import { Button, FormCard } from "@/components/forms"
import { isSuperuser } from "@/lib/auth-helpers"

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const user = auth.user
  const isSuper = isSuperuser()

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            My Profile
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            View and manage your account information
          </p>
          <Show when={isSuper}>
            <div class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />
              </svg>
              Administrator
            </div>
          </Show>
        </div>

        <Show when={user()}>
          {(userData) => (
            <FormCard>
              <div class="space-y-6">
                {/* Profile Information */}
                <div>
                  <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Account Information
                  </h2>

                  <div class="space-y-4">
                    <Show when={isSuper} fallback={
                      <>
                        <div>
                          <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Username
                          </label>
                          <p class="text-[var(--color-text-primary)]">
                            {userData().username || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Email
                          </label>
                          <p class="text-[var(--color-text-primary)]">
                            {userData().email || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Full Name
                          </label>
                          <p class="text-[var(--color-text-primary)]">
                            {userData().name || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Role
                          </label>
                          <p class="text-[var(--color-text-primary)]">
                            {userData().role || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Email Verified
                          </label>
                          <p class="text-[var(--color-text-primary)]">
                            {userData().verified ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </>
                    }>
                      {/* Superuser Profile Display */}
                      <div>
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          Email
                        </label>
                        <p class="text-[var(--color-text-primary)]">
                          {userData().email || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          Account Type
                        </label>
                        <p class="text-[var(--color-text-primary)] font-semibold">
                          System Administrator
                        </p>
                      </div>
                    </Show>
                  </div>
                </div>

                {/* Actions */}
                <div class="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate({ to: '/profile/edit' })}
                  >
                    Edit Profile
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate({ to: '/dashboard' })}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </FormCard>
          )}
        </Show>
      </div>
    </div>
  )
}
