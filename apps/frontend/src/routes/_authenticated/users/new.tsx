import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Select, Button, FormCard } from "@/components/forms"
import { UsersFormSchema } from "@/types/schemas/users"
import { requireSuperuser } from "@/lib/route-guards"
import { ROLE_OPTIONS } from "@/lib/constants/roles"
import { Show } from "solid-js"

export const Route = createFileRoute('/_authenticated/users/new')({
  component: AddUserPage,
  beforeLoad: requireSuperuser,
})

function AddUserPage() {
  const navigate = useNavigate()
  const createUser = useCreateRecord("users")

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

  const handleSubmit: SubmitHandler<typeof UsersFormSchema> = async (values) => {
    try {
      console.log('📝 Creating user:', values)

      // Add password and passwordConfirm fields for user creation
      const userData = {
        ...values,
        password: 'changeme123',
        passwordConfirm: 'changeme123',
      }

      await createUser.mutateAsync(userData)
      toast.success('User created successfully! Default password: changeme123')
      navigate({ to: '/users' })
    } catch (error: any) {
      console.error('❌ Error creating user:', error)
      toast.error(error.message || 'Failed to create user')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Add New User
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Create a new user account for staff members
          </p>
        </div>

        <FormCard>
          <Form of={userForm} onSubmit={handleSubmit} class="space-y-8">
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

            {/* Info Box */}
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> The user will be created with a default password:
                <code class="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mx-1">changeme123</code>
                <br />
                Users should change their password after first login.
              </p>
            </div>

            {/* Actions */}
            <div class="flex gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button
                type="submit"
                variant="primary"
                disabled={createUser.isPending}
              >
                <Show when={createUser.isPending} fallback="Create User">
                  Creating...
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
      </div>
    </div>
  )
}
