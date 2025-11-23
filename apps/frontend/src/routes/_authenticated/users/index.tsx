import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCollection } from "@/lib/queries"
import { Show, For } from "solid-js"
import { Button } from "@/components/forms"
import { requireSuperuser } from "@/lib/route-guards"

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersListPage,
  beforeLoad: requireSuperuser,
})

function UsersListPage() {
  const navigate = useNavigate()
  const users = useCollection('users', {
    sort: '-created',
  })

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Users Management
            </h1>
            <p class="text-[var(--color-text-secondary)]">
              Manage user accounts and permissions
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => navigate({ to: '/users/new' })}
          >
            + Add User
          </Button>
        </div>

        <div class="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-border)]">
          <Show
            when={!users.isLoading && users.data}
            fallback={
              <div class="p-8 text-center text-[var(--color-text-secondary)]">
                Loading users...
              </div>
            }
          >
            <Show
              when={users.data && users.data.items.length > 0}
              fallback={
                <div class="p-8 text-center text-[var(--color-text-secondary)]">
                  No users found
                </div>
              }
            >
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Username
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Name
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Email
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Role
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[var(--color-border)]">
                    <For each={users.data?.items}>
                      {(user) => (
                        <tr class="hover:bg-[var(--color-bg-secondary)] transition-colors">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-[var(--color-text-primary)]">
                              {user.username}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-[var(--color-text-primary)]">
                              {user.name || 'N/A'}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-[var(--color-text-primary)]">
                              {user.email || 'N/A'}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.role}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span
                              class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.verified
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                            >
                              {user.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate({ to: '/users/$id/edit', params: { id: user.id } })}
                              class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  )
}
