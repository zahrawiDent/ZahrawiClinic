import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { PageLayout, PageContainer, PageHeader, Card, Button } from '@/components/ui'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { usePatientForm } from '@/lib/use-patient-form'
import { GENDER_OPTIONS, PATIENT_STATUS_OPTIONS } from '@/lib/validation-schemas'

export const Route = createFileRoute('/_authenticated/patients/new')({
  component: AddPatientPage,
})

function AddPatientPage() {
  const navigate = useNavigate()

  const { form, validators, isPending } = usePatientForm({
    onSuccess: () => navigate({ to: '/patients' }),
  })

  return (
    <PageLayout>
      <PageContainer size="md" padding>
        <div class="mb-4">
          <Breadcrumbs separator="›" />
        </div>

        <PageHeader title="Add New Patient" subtitle="Enter patient information below" />

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
                  {(field) => {
                    const f = field()
                    return (
                      <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={f.state.value}
                          onInput={(e) => f.handleChange(e.target.value)}
                          onBlur={f.handleBlur}
                          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          placeholder="patient@example.com"
                        />
                        {f.state.meta.errors.length > 0 && (
                          <p class="text-sm text-red-500 mt-1">{f.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )
                  }}
                </form.Field>

                <form.Field name="phone" validators={validators.phone}>
                  {(field) => {
                    const f = field()
                    return (
                      <div>
                        <label class="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          value={f.state.value}
                          onInput={(e) => f.handleChange(e.target.value)}
                          onBlur={f.handleBlur}
                          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          placeholder="(123) 456-7890"
                        />
                        {f.state.meta.errors.length > 0 && (
                          <p class="text-sm text-red-500 mt-1">{f.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )
                  }}
                </form.Field>

                <form.Field name="mobile" validators={validators.mobile}>
                  {(field) => {
                    const f = field()
                    return (
                      <div>
                        <label class="block text-sm font-medium mb-1">Mobile</label>
                        <input
                          type="tel"
                          value={f.state.value}
                          onInput={(e) => f.handleChange(e.target.value)}
                          onBlur={f.handleBlur}
                          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          placeholder="(123) 456-7890"
                        />
                        {f.state.meta.errors.length > 0 && (
                          <p class="text-sm text-red-500 mt-1">{f.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )
                  }}
                </form.Field>

                <form.Field name="status">
                  {(field) => {
                    const f = field()
                    return (
                      <div>
                        <label class="block text-sm font-medium mb-1">Status</label>
                        <select
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value as any)}
                          onBlur={f.handleBlur}
                          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                          {PATIENT_STATUS_OPTIONS.map((option) => (
                            <option value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    )
                  }}
                </form.Field>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 class="text-lg font-medium mb-4">Additional Information</h3>
              <form.Field name="notes">
                {(field) => {
                  const f = field()
                  return (
                    <div>
                      <label class="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        value={f.state.value}
                        onInput={(e) => f.handleChange(e.target.value)}
                        onBlur={f.handleBlur}
                        rows={4}
                        class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        placeholder="Additional notes about the patient..."
                      />
                    </div>
                  )
                }}
              </form.Field>
            </div>

            {/* Actions */}
            <div class="flex justify-between pt-4 border-t dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate({ to: '/patients' })}
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
                    {state()[1] || isPending ? 'Adding...' : 'Add Patient'}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </Card>
      </PageContainer>
    </PageLayout>
  )
}
