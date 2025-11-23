import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Textarea, Select, Button, FormCard } from "@/components/forms"
import { PatientsFormSchema } from "@/types/schemas/patients"

export const Route = createFileRoute('/_authenticated/patients/new')({
  component: AddPatientPage,
})

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
]

function AddPatientPage() {
  const navigate = useNavigate()
  const createPatient = useCreateRecord("patients")

  const patientForm = createForm({
    schema: PatientsFormSchema,
    initialInput: {
      firstName: '',
      lastName: '',
      gender: 'male',
      status: 'active',
    },
  })

  const handleSubmit: SubmitHandler<typeof PatientsFormSchema> = async (values) => {
    try {
      console.log('📝 Submitting patient:', values)
      await createPatient.mutateAsync(values)
      toast.success('Patient created successfully!')
      navigate({ to: '/patients' })
    } catch (error: any) {
      console.error('❌ Error creating patient:', error)
      toast.error(error.message || 'Failed to create patient')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Add New Patient
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Enter patient information to create a new record
          </p>
        </div>

        <FormCard>
          <Form of={patientForm} onSubmit={handleSubmit} class="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Personal Information
              </h2>

              <div class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field of={patientForm} path={['firstName']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="First Name"
                        placeholder="Enter first name"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>

                  <Field of={patientForm} path={['lastName']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Last Name"
                        placeholder="Enter last name"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field of={patientForm} path={['dateOfBirth']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="date"
                        label="Date of Birth"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>

                  <Field of={patientForm} path={['gender']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Gender"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        placeholder="Select gender"
                        options={GENDER_OPTIONS}
                        required
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div class="pt-6 border-t border-[var(--color-border-primary)]">
              <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Contact Information
              </h2>

              <div class="space-y-5">
                <Field of={patientForm} path={['email']}>
                  {(field) => (
                    <TextInput
                      {...field.props}
                      type="email"
                      label="Email"
                      placeholder="patient@example.com"
                      value={field.input}
                      errors={field.errors ?? undefined}
                    />
                  )}
                </Field>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field of={patientForm} path={['phone']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="tel"
                        label="Phone"
                        placeholder="(123) 456-7890"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>

                  <Field of={patientForm} path={['mobile']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="tel"
                        label="Mobile"
                        placeholder="(123) 456-7890"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>

            {/* Practice Management */}
            <div class="pt-6 border-t border-[var(--color-border-primary)]">
              <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Practice Management
              </h2>

              <div class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field of={patientForm} path={['status']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Status"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        placeholder="Select status"
                        options={STATUS_OPTIONS}
                      />
                    )}
                  </Field>

                  <Field of={patientForm} path={['primaryDentist']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Primary Dentist"
                        placeholder="Dentist ID (optional)"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>
                </div>

                <Field of={patientForm} path={['notes']}>
                  {(field) => (
                    <Textarea
                      {...field.props}
                      label="Notes"
                      placeholder="Additional notes about the patient..."
                      value={field.input}
                      errors={field.errors ?? undefined}
                      rows={4}
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* Additional Information (Optional) */}
            <div class="pt-6 border-t border-[var(--color-border-primary)]">
              <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Additional Information <span class="text-sm font-normal text-[var(--color-text-secondary)]">(Optional)</span>
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field of={patientForm} path={['primaryAddress']}>
                  {(field) => (
                    <TextInput
                      {...field.props}
                      label="Primary Address ID"
                      placeholder="Address relation ID (optional)"
                      value={field.input}
                      errors={field.errors ?? undefined}
                    />
                  )}
                </Field>

                <Field of={patientForm} path={['primaryInsurance']}>
                  {(field) => (
                    <TextInput
                      {...field.props}
                      label="Primary Insurance ID"
                      placeholder="Insurance relation ID (optional)"
                      value={field.input}
                      errors={field.errors ?? undefined}
                    />
                  )}
                </Field>

                <Field of={patientForm} path={['emergencyContact']}>
                  {(field) => (
                    <TextInput
                      {...field.props}
                      label="Emergency Contact ID"
                      placeholder="Emergency contact relation ID (optional)"
                      value={field.input}
                      errors={field.errors ?? undefined}
                    />
                  )}
                </Field>
              </div>

              <p class="mt-3 text-sm text-[var(--color-text-secondary)]">
                💡 Tip: These IDs link to other records in the system. You can add them later.
              </p>
            </div>

            {/* Actions */}
            <div class="flex items-center gap-3 pt-6 border-t border-[var(--color-border-primary)]">
              <Button
                type="submit"
                variant="primary"
                loading={patientForm.isSubmitting}
                disabled={patientForm.isSubmitting || !patientForm.isDirty}
              >
                Create Patient
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate({ to: "/patients" })}
                disabled={patientForm.isSubmitting}
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