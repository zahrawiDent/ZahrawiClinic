import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/toast"
import { requireGuest } from "@/lib/route-guards"
import { PageLayout, PageContainer } from "@/components/ui"
import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Button } from "@/components/forms"
import { SignupFormSchema } from "@/types/schemas"

export const Route = createFileRoute("/_auth/signup")({
  beforeLoad: ({ context }) => requireGuest(context),
  component: SignupPage,
})

function SignupPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null)
  const [avatarFile, setAvatarFile] = createSignal<File | null>(null)

  const signupForm = createForm({
    schema: SignupFormSchema,
    initialInput: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      avatar: undefined,
    },
    validate: 'blur',
    revalidate: 'input',
  })

  const handleAvatarChange = (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar image must be less than 5MB")
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit: SubmitHandler<typeof SignupFormSchema> = async (values) => {
    try {
      const additionalData: Record<string, any> = {}
      
      if (values.name) {
        additionalData.name = values.name
      }
      
      if (avatarFile()) {
        additionalData.avatar = avatarFile()
      }
      
      // Register the user
      await auth.register(
        values.email, 
        values.password, 
        values.passwordConfirm,
        Object.keys(additionalData).length > 0 ? additionalData : undefined
      )
      
      toast.success("Account created! Signing you in...", 2000)
      
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          await auth.login(values.email, values.password)
          toast.success("Welcome! 🎉")
          navigate({ to: "/dashboard" })
        } catch (loginErr: any) {
          // If auto-login fails, redirect to login page
          toast.info("Please sign in with your new account")
          navigate({ to: "/login" })
        }
      }, 500)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create account"
      toast.error(errorMessage)
    }
  }

  return (
    <PageLayout variant="auth">
      <PageContainer size="sm" padding={false}>
        <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div class="max-w-md w-full space-y-8">
            {/* Header Section */}
            <div class="text-center">
              <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              
              <h2 class="text-4xl font-bold text-[var(--color-text-primary)] mb-3">
                Create your account
              </h2>
              <p class="text-base text-[var(--color-text-secondary)]">
                Join us to manage your dental clinic
              </p>
            </div>

            {/* Info Card */}
            <div class="bg-gradient-to-r from-[var(--color-brand-primary)]/10 to-[var(--color-brand-secondary)]/10 rounded-xl p-4 border border-[var(--color-brand-primary)]/20">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5 text-[var(--color-brand-primary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Get started in seconds
                  </p>
                  <p class="text-xs text-[var(--color-text-secondary)]">
                    Create your account and start managing patients, appointments, and more.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div class="bg-[var(--color-bg-primary)] rounded-2xl shadow-xl border border-[var(--color-border-primary)] p-8">
              <Form of={signupForm} onSubmit={handleSubmit} class="space-y-6">
                <div class="space-y-5">
                  {/* Avatar Upload */}
                  <div>
                    <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                      Profile Picture (Optional)
                    </label>
                    <div class="flex items-center gap-4">
                      <div class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-2xl shadow-md">
                        {avatarPreview() ? (
                          <img src={avatarPreview()!} alt="Avatar preview" class="w-full h-full object-cover" />
                        ) : (
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div class="flex-1">
                        <input
                          type="file"
                          id="avatar"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          class="hidden"
                        />
                        <label
                          for="avatar"
                          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose Image
                        </label>
                        <p class="text-xs text-[var(--color-text-secondary)] mt-2">
                          JPG, PNG or GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name Field */}
                  <Field of={signupForm} path={['name']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="text"
                        label="Display Name (Optional)"
                        placeholder="Dr. John Smith"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>

                  <Field of={signupForm} path={['email']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="email"
                        label="Email address"
                        placeholder="you@example.com"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>

                  <Field of={signupForm} path={['password']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="password"
                        label="Password"
                        placeholder="At least 8 characters"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>

                  <Field of={signupForm} path={['passwordConfirm']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="password"
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>
                </div>

                {/* Password Requirements */}
                <div class="bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border-primary)]">
                  <p class="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                    Password requirements:
                  </p>
                  <ul class="text-xs text-[var(--color-text-secondary)] space-y-1">
                    <li class="flex items-center gap-2">
                      <svg class="w-3 h-3 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Minimum 8 characters
                    </li>
                    <li class="flex items-center gap-2">
                      <svg class="w-3 h-3 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Passwords must match
                    </li>
                  </ul>
                </div>

                <div class="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={signupForm.isSubmitting}
                    disabled={signupForm.isSubmitting}
                    class="w-full h-12 text-base font-semibold rounded-xl"
                  >
                    {signupForm.isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </div>
              </Form>
            </div>

            {/* Footer */}
            <div class="text-center">
              <p class="text-sm text-[var(--color-text-secondary)]">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  class="font-semibold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
