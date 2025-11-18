import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { Show, Suspense } from 'solid-js'
import { useRecord } from '@/lib/queries'
import { PageLayout, PageContainer, PageHeader, Card, Button } from '@/components/ui'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { usePatientForm } from '@/lib/use-patient-form'
import { GENDER_OPTIONS, PATIENT_STATUS_OPTIONS } from '@/lib/validation-schemas'

export const Route = createFileRoute('/_authenticated/patients/$id/edit')({
  component: EditPatientPage,
})

function EditPatientPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const patient = useRecord('patients', () => params().id)

  const { form, validators, isPending } = usePatientForm({
    initialData: patient.data,
    patientId: params().id,
    onSuccess: () => navigate({ to: '/patients/$id', params: { id: params().id } }),
  })

  return (
    <PageLayout>
      <PageContainer size="md" padding>
        <div class="mb-4">
          <Breadcrumbs separator="›" />
        </div>

        <Suspense
          fallback={
            <div class="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading patient details...
            </div>
          }
        >
          <Show
            when={!patient.isLoading && patient.data}
            fallback={
              <div class="p-8 text-center">
                <Show when={patient.isError}>
                  <p class="text-red-600 dark:text-red-400">
                    Error: {patient.error?.message || 'Failed to load patient'}
                  </p>
                </Show>
              </div>
            }
          >
            <PageHeader
              title="Edit Patient"
              subtitle={`Update information for ${patient.data?.firstName} ${patient.data?.lastName}`}
            />

            <Card>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
                class="space-y-6"
              >
                {/* Personal Information */}
                <div>
                  <h3 class="text-lg font-medium mb-4">Personal Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form.Field name="firstName" validators={validators.firstName}>
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">
                            First Name <span class="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={field().state.value}
                            onInput={(e) => field().handleChange(e.target.value)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Enter first name"
                          />
                          {field().state.meta.errors.length > 0 && (
                            <p class="text-sm text-red-500 mt-1">{field().state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="lastName" validators={validators.lastName}>
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">
                            Last Name <span class="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={field().state.value}
                            onInput={(e) => field().handleChange(e.target.value)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Enter last name"
                          />
                          {field().state.meta.errors.length > 0 && (
                            <p class="text-sm text-red-500 mt-1">{field().state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="dateOfBirth">
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={field().state.value}
                            onInput={(e) => field().handleChange(e.target.value)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="gender" validators={validators.gender}>
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">
                            Gender <span class="text-red-500">*</span>
                          </label>
                          <select
                            value={field().state.value || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field().handleChange(value ? value as any : undefined)
                            }}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          >
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.map((option) => (
                              <option value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          {field().state.meta.errors.length > 0 && (
                            <p class="text-sm text-red-500 mt-1">{field().state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 class="text-lg font-medium mb-4">Contact Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form.Field name="email" validators={validators.email}>
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            value={field().state.value}
                            onInput={(e) => field().handleChange(e.target.value)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="patient@example.com"
                          />
                          {field().state.meta.errors.length > 0 && (
                            <p class="text-sm text-red-500 mt-1">{field().state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="phone" validators={validators.phone}>
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">Phone</label>
                          <input
                            type="tel"
                            value={field().state.value}
                            onInput={(e) => field().handleChange(e.target.value)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="(123) 456-7890"
                          />
                          {field().state.meta.errors.length > 0 && (
                            <p class="text-sm text-red-500 mt-1">{field().state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="mobile" validators={validators.mobile}>
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">Mobile</label>
                          <input
                            type="tel"
                            value={field().state.value}
                            onInput={(e) => field().handleChange(e.target.value)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="(123) 456-7890"
                          />
                          {field().state.meta.errors.length > 0 && (
                            <p class="text-sm text-red-500 mt-1">{field().state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="status">
                      {(field) => (
                        <div>
                          <label class="block text-sm font-medium mb-1">Status</label>
                          <select
                            value={field().state.value}
                            onChange={(e) => field().handleChange(e.target.value as any)}
                            onBlur={field().handleBlur}
                            class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          >
                            {PATIENT_STATUS_OPTIONS.map((option) => (
                              <option value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </form.Field>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 class="text-lg font-medium mb-4">Additional Information</h3>
                  <form.Field name="notes">
                    {(field) => (
                      <div>
                        <label class="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                          value={field().state.value}
                          onInput={(e) => field().handleChange(e.target.value)}
                          onBlur={field().handleBlur}
                          rows={4}
                          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          placeholder="Additional notes about the patient..."
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Actions */}
                <div class="flex justify-between pt-4 border-t dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate({ to: '/patients/$id', params: { id: params().id } })}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>

                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                  >
                    {(state) => (
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!state()[0] || isPending}
                      >
                        {state()[1] || isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              </form>
            </Card>
          </Show>
        </Suspense>
      </PageContainer>
    </PageLayout>
  )
}
