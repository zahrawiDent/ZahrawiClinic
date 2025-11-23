import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useRecord, useUpdateRecord, useDeleteRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form, reset } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Textarea, Select, Button, FormCard } from "@/components/forms"
import { PatientsFormSchema } from "@/types/schemas/patients"
import { createEffect, createSignal, Show } from "solid-js"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

export const Route = createFileRoute('/_authenticated/patients/$id')({
  component: EditPatientPage,
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

function EditPatientPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const patientQuery = useRecord("patients", () => params().id, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })
  const updatePatient = useUpdateRecord("patients")
  const deletePatient = useDeleteRecord("patients")
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false)
  const [formInitialized, setFormInitialized] = createSignal(false)

  const patientForm = createForm({
    schema: PatientsFormSchema,
    initialInput: { 
      gender: 'male',
      status: 'active',
    },
    validate: 'blur',
    revalidate: 'input',
  })

  // Initialize form with patient data once
  createEffect(() => {
    const patient = patientQuery.data
    if (patient && !formInitialized()) {
      reset(patientForm, {
        initialInput: {
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          dateOfBirth: patient.dateOfBirth || '',
          gender: patient.gender,
          email: patient.email || '',
          phone: patient.phone || '',
          mobile: patient.mobile || '',
          status: patient.status || 'active',
          notes: patient.notes || '',
          primaryAddress: patient.primaryAddress || '',
          primaryDentist: patient.primaryDentist || '',
          primaryInsurance: patient.primaryInsurance || '',
          emergencyContact: patient.emergencyContact || '',
        }
      })
      setFormInitialized(true)
    }
  })

  const handleSubmit: SubmitHandler<typeof PatientsFormSchema> = async (values) => {
    try {
      await updatePatient.mutateAsync({ id: params().id, ...values })
      toast.success('Patient updated successfully!')
      navigate({ to: '/patients' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update patient')
    }
  }

  const handleDelete = async () => {
    try {
      await deletePatient.mutateAsync(params().id)
      toast.success('Patient deleted successfully!')
      navigate({ to: '/patients' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete patient')
    }
  }

  const patientName = () => {
    const patient = patientQuery.data
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <Show 
          when={!patientQuery.isLoading} 
          fallback={
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
              <p class="mt-4 text-[var(--color-text-secondary)]">Loading patient...</p>
            </div>
          }
        >
          {/* Header */}
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Edit Patient: {patientName()}
            </h1>
            <p class="text-[var(--color-text-secondary)]">Update patient information and details</p>
          </div>

          {/* Form */}
          <FormCard>
            <Form of={patientForm} onSubmit={handleSubmit} class="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Personal Information</h2>
                
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
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Contact Information</h2>

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
              </div>

              {/* Actions */}
              <div class="flex items-center justify-between gap-3 pt-6 border-t border-[var(--color-border-primary)]">
                <div class="flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={patientForm.isSubmitting}
                    disabled={patientForm.isSubmitting || !patientForm.isDirty}
                  >
                    Save Changes
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
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={patientForm.isSubmitting || deletePatient.isPending}
                >
                  Delete
                </Button>
              </div>
            </Form>

            {/* Metadata */}
            <Show when={patientQuery.data}>
              <div class="mt-8 pt-8 border-t border-[var(--color-border-primary)]">
                <h3 class="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Metadata</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-[var(--color-text-secondary)]">Created:</span>
                    <span class="ml-2 text-[var(--color-text-primary)]">
                      {new Date(patientQuery.data!.created).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span class="text-[var(--color-text-secondary)]">Updated:</span>
                    <span class="ml-2 text-[var(--color-text-primary)]">
                      {new Date(patientQuery.data!.updated).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Show>
          </FormCard>
        </Show>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog()}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${patientName()}? This action cannot be undone and will remove all associated records.`}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  )
}
