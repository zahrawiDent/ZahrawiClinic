import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { toast } from "@/components/toast"
import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Select, Button, FormCard } from "@/components/forms"
import { UsersFormSchema } from "@/types/schemas/users"
import { useAuth } from "@/lib/auth-context"
import { Show } from "solid-js"
import { pb } from "@/lib/pocketbase"
import { isSuperuser } from "@/lib/route-guards"
import * as v from 'valibot'

export const Route = createFileRoute('/_authenticated/profile/edit')({
  component: EditProfilePage,
})

const ROLE_OPTIONS = [
  { value: 'Dentist', label: 'Dentist' },
  { value: 'Receptionist', label: 'Receptionist' },
]

// Superuser schema (only email, no role)
const SuperuserFormSchema = v.object({
  email: v.optional(v.string()),
})

function EditProfilePage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const user = auth.user
  const isSuper = isSuperuser()

  // Use different schemas for superuser vs regular user
  const userForm = createForm({
    schema: isSuper ? SuperuserFormSchema : UsersFormSchema,
    initialInput: isSuper
      ? {
          email: user()?.email || '',
        }
      : {
          username: user()?.username || '',
          email: user()?.email || '',
          name: user()?.name || '',
          role: user()?.role || 'Receptionist',
          emailVisibility: user()?.emailVisibility || false,
          verified: user()?.verified || false,
        },
  })

  const handleSubmit: SubmitHandler<typeof SuperuserFormSchema | typeof UsersFormSchema> = async (values) => {
    try {
      const currentUser = user()
      if (!currentUser?.id) {
        toast.error('User not found')
        return
      }

      console.log('📝 Updating profile:', values)
      
      // Update the appropriate collection
      const collection = isSuper ? '_superusers' : 'users'
      await pb.collection(collection).update(currentUser.id, values)
      
      toast.success('Profile updated successfully!')
      
      // Refresh auth to get updated user data
      await auth.refreshAuth()
      
      navigate({ to: '/profile' })
    } catch (error: any) {
      console.error('❌ Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Edit Profile
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Update your account information
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
          <FormCard>
            <Form of={userForm} onSubmit={handleSubmit} class="space-y-8">
              {/* Account Information */}
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Account Information
                </h2>

                <div class="space-y-5">
                  <Show when={!isSuper}>
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
                  </Show>

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

                  <Show when={!isSuper}>
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
                          disabled
                        />
                      )}
                    </Field>
                  </Show>
                </div>
              </div>

              <Show when={!isSuper}>
                {/* Info Box */}
                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p class="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Role field is read-only. Contact an administrator to change your role.
                  </p>
                </div>
              </Show>

              {/* Actions */}
              <div class="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button
                  type="submit"
                  variant="primary"
                >
                  Save Changes
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate({ to: '/profile' })}
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
