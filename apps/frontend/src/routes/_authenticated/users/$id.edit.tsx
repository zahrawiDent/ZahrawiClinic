import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useRecord, useUpdateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form, reset } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Select, Button, FormCard } from "@/components/forms"
import { UsersFormSchema } from "@/types/schemas/users"
import { Show, createEffect, createSignal } from "solid-js"
import { requireSuperuser } from "@/lib/route-guards"
import { ROLE_OPTIONS } from "@/lib/constants/roles"

export const Route = createFileRoute('/_authenticated/users/$id/edit')({
  component: EditUserPage,
  beforeLoad: requireSuperuser,
})

function EditUserPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const user = useRecord('users', () => params().id)
  const updateUser = useUpdateRecord("users")
  const [formInitialized, setFormInitialized] = createSignal(false)

  const userForm = createForm({
    schema: UsersFormSchema,
    initialInput: {
      username: '',
      email: '',
      name: '',
      role: 'Receptionist',
      emailVisibility: false,
      verified: false,
    },
  })

  // Initialize form with user data once
  createEffect(() => {
    const userData = user.data
    if (userData && !formInitialized()) {
      reset(userForm, {
        initialInput: {
          username: userData.username || '',
          email: userData.email || '',
          name: userData.name || '',
          role: userData.role || 'Receptionist',
          emailVisibility: userData.emailVisibility || false,
          verified: userData.verified || false,
        }
      })
      setFormInitialized(true)
    }
  })

  const handleSubmit: SubmitHandler<typeof UsersFormSchema> = async (values) => {
    try {
      console.log('📝 Updating user:', values)

      await updateUser.mutateAsync({
        id: params().id,
        ...values,
      })

      toast.success('User updated successfully!')
      navigate({ to: '/users' })
    } catch (error: any) {
      console.error('❌ Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Edit User
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Update user account information
          </p>
        </div>

        <Show
          when={!user.isLoading && user.data}
          fallback={
            <div class="p-8 text-center text-[var(--color-text-secondary)]">
              Loading user...
            </div>
          }
        >
          <FormCard>
            <Form of={userForm} onSubmit={handleSubmit} class="space-y-6">
              {/* Account Information */}
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Account Information
                </h2>

                <div class="space-y-5">
                  <Field of={userForm} path={['username']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Username"
                        placeholder="Enter username"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>

                  <Field of={userForm} path={['email']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="email"
                        label="Email"
                        placeholder="Enter email address"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>

                  <Field of={userForm} path={['name']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Full Name"
                        placeholder="Enter full name"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>

                  <Field of={userForm} path={['role']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Role"
                        placeholder="Select role"
                        options={ROLE_OPTIONS}
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div class="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={updateUser.isPending}
                >
                  <Show when={updateUser.isPending} fallback="Save Changes">
                    Saving...
                  </Show>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </FormCard>
        </Show>
      </div>
    </div>
  )
}
