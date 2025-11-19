import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router"
import { Show } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/toast"
import { requireGuest } from "@/lib/route-guards"
import { PageLayout, PageContainer, Card, InfoBox } from "@/components/ui"
import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Button } from "@/components/forms"
import { LoginFormSchema } from "@/types/schemas"

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: ({ context }) => requireGuest(context),
  component: LoginPage,
})

function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  // Get redirect URL from search params
  const search = Route.useSearch() as { redirect?: string }

  // Parse the redirect to show a friendly message
  const getRedirectMessage = () => {
    if (!search.redirect) return null

    const url = search.redirect
    if (url.includes('/patients')) return 'Patients page'
    if (url.includes('/dashboard')) return 'Dashboard'

    // Extract the path from the URL
    try {
      const path = new URL(url, window.location.origin).pathname
      return path.split('/').filter(Boolean).join(' / ') || 'the page you were viewing'
    } catch {
      return 'the page you were viewing'
    }
  }

  const loginForm = createForm({
    schema: LoginFormSchema,
    initialInput: {
      email: '',
      password: '',
    },
    validate: 'blur',
    revalidate: 'input',
  })

  const handleSubmit: SubmitHandler<typeof LoginFormSchema> = async (values) => {
    try {
      await auth.login(values.email, values.password)

      // Check if user is admin and show appropriate message
      const userType = auth.isAdmin() ? "Admin" : "User"
      
      // Show success message
      const redirectMessage = getRedirectMessage()
      if (redirectMessage) {
        toast.success(`Welcome back, ${userType}! Redirecting to ${redirectMessage}...`, 2000)
      } else {
        toast.success(`Welcome back${auth.isAdmin() ? ', Admin' : ''}!`, 2000)
      }

      // Small delay for toast to show, then redirect
      setTimeout(() => {
        const redirectTo = search.redirect || "/dashboard"
        navigate({ to: redirectTo as any })
      }, 500)
    } catch (err: any) {
      toast.error(err?.message || 'Invalid email or password')
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              <h2 class="text-4xl font-bold text-[var(--color-text-primary)] mb-3">
                Welcome back
              </h2>
              <p class="text-base text-[var(--color-text-secondary)]">
                Sign in to continue to your clinic
              </p>
            </div>

            {/* Info Cards */}
            <div class="space-y-3">
              <Show when={search.redirect}>
                <InfoBox variant="info">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <div class="flex-1">
                      <p class="font-medium">Redirecting to: {getRedirectMessage()}</p>
                    </div>
                  </div>
                </InfoBox>
              </Show>

              <Card padding="sm">
                <div class="flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  <span>Works for both regular users and admins</span>
                </div>
              </Card>
            </div>

            {/* Form Card */}
            <div class="bg-[var(--color-bg-primary)] rounded-2xl shadow-xl border border-[var(--color-border-primary)] p-8">
              <Form of={loginForm} onSubmit={handleSubmit} class="space-y-6">
                <div class="space-y-5">
                  <Field of={loginForm} path={['email']}>
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

                  <Field of={loginForm} path={['password']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>
                </div>

                <div class="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loginForm.isSubmitting}
                    disabled={loginForm.isSubmitting}
                    class="w-full h-12 text-base font-semibold rounded-xl"
                  >
                    {loginForm.isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </Form>
            </div>

            {/* Footer */}
            <div class="text-center">
              <p class="text-sm text-[var(--color-text-secondary)]">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  class="font-semibold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
