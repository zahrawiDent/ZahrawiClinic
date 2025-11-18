/**
 * Edit Patient Page - Example using TanStack Form + Valibot
 * 
 * This is a comprehensive example demonstrating:
 * - TanStack Solid Form integration
 * - Valibot schema validation
 * - Reusable form components
 * - Proper error handling and user feedback
 * - Clean, scalable patterns
 */

import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { Show, Suspense } from 'solid-js'
import { createForm } from '@tanstack/solid-form'
import * as v from 'valibot'
import { useRecord, useUpdateRecord, useDeleteRecord } from '@/lib/queries'
import { useConfirmationDialog } from '@/components/confirmation-dialog'
import { toast } from '@/components/toast'
import { PageLayout, PageContainer, PageHeader, Card, Button } from '@/components/ui'
import { Breadcrumbs } from '@/components/breadcrumbs'
import {
  FormContainer,
  FormGroup,
  FormActions,
  FormInput,
  FormTextarea,
  FormSelect,
  FormDivider,
} from '@/components/forms'
import { valibotValidator } from '@/lib/form-utils'
import {
  nameSchema,
  optionalPhoneSchema,
  optionalEmailSchema,
} from '@/lib/validation-schemas'

export const Route = createFileRoute('/_authenticated/patients/$id')({
  component: EditPatientPage,
})

// Define the form schema using Valibot
const patientFormSchema = v.object({
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: v.optional(v.string()),
  gender: v.optional(
    v.picklist(['male', 'female', 'other', 'prefer_not_to_say'])
  ),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  mobile: optionalPhoneSchema,
  status: v.picklist(['active', 'inactive', 'archived']),
  notes: v.optional(v.string()),
})

type PatientFormData = v.InferOutput<typeof patientFormSchema>

function EditPatientPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const patient = useRecord('patients', () => params().id)
  const updatePatient = useUpdateRecord('patients')
  const deletePatient = useDeleteRecord('patients')
  const confirmDialog = useConfirmationDialog()

  const form = createForm(() => ({
    defaultValues: {
      firstName: patient.data?.firstName || '',
      lastName: patient.data?.lastName || '',
      dateOfBirth: patient.data?.dateOfBirth || '',
      gender: patient.data?.gender || '',
      email: patient.data?.email || '',
      phone: patient.data?.phone || '',
      mobile: patient.data?.mobile || '',
      status: patient.data?.status || 'active',
      notes: patient.data?.notes || '',
    } as PatientFormData,
    onSubmit: async ({ value }) => {
      try {
        // Validate the entire form
        const validatedData = v.parse(patientFormSchema, value)

        // Update the patient
        await updatePatient.mutateAsync({
          id: params().id,
          data: validatedData,
        })

        toast.success('Patient updated successfully! 🎉')
      } catch (error: any) {
        toast.error(error?.message || 'Failed to update patient')
      }
    },
  }))

  const handleCancel = () => {
    navigate({ to: '/patients' })
  }

  const handleDelete = () => {
    const patientData = patient.data
    if (!patientData) return

    const fullName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim()
    
    confirmDialog.confirm({
      title: 'Delete Patient',
      message: `Are you sure you want to delete patient "${fullName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
      onConfirm: () => {
        deletePatient.mutate(params().id, {
          onSuccess: () => {
            navigate({ to: '/patients' })
          },
        })
      },
    })
  }

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <PageLayout>
        <PageContainer size="md" padding>
          <div class="mb-4">
            <Breadcrumbs separator="›" />
          </div>

          <Suspense
            fallback={
              <div class="p-8 text-center text-gray-500">
                Loading patient details...
              </div>
            }
          >
            <Show
              when={!patient.isLoading && patient.data}
              fallback={
                <div class="p-8 text-center">
                  <Show when={patient.isError}>
                    <p class="text-red-600">
                      Error: {patient.error?.message || 'Failed to load patient'}
                    </p>
                  </Show>
                </div>
              }
            >
              <PageHeader
                title="Edit Patient"
                subtitle={`Update information for ${patient.data?.firstName} ${patient.data?.lastName}`}
                action={
                  <Button
                    onClick={handleDelete}
                    variant="secondary"
                    disabled={deletePatient.isPending}
                  >
                    {deletePatient.isPending ? 'Deleting...' : 'Delete Patient'}
                  </Button>
                }
              />

              <Card>
                <FormContainer
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                  }}
                >
                  {/* Personal Information Section */}
                  <FormGroup
                    title="Personal Information"
                    description="Basic information about the patient"
                    columns={2}
                  >
                    <form.Field
                      name="firstName"
                      validators={{
                        onChange: valibotValidator(nameSchema),
                      }}
                      children={(field) => (
                        <FormInput
                          field={field()}
                          label="First Name"
                          placeholder="Enter first name"
                          required
                        />
                      )}
                    />

                    <form.Field
                      name="lastName"
                      validators={{
                        onChange: valibotValidator(nameSchema),
                      }}
                      children={(field) => (
                        <FormInput
                          field={field()}
                          label="Last Name"
                          placeholder="Enter last name"
                          required
                        />
                      )}
                    />

                    <form.Field
                      name="dateOfBirth"
                      children={(field) => (
                        <FormInput
                          field={field()}
                          label="Date of Birth"
                          type="date"
                        />
                      )}
                    />

                    <form.Field
                      name="gender"
                      children={(field) => (
                        <FormSelect
                          field={field()}
                          label="Gender"
                          placeholder="Select gender"
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' },
                            {
                              value: 'prefer_not_to_say',
                              label: 'Prefer not to say',
                            },
                          ]}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormDivider />

                  {/* Contact Information Section */}
                  <FormGroup
                    title="Contact Information"
                    description="How to reach the patient"
                    columns={2}
                  >
                    <form.Field
                      name="email"
                      validators={{
                        onChange: valibotValidator(optionalEmailSchema),
                      }}
                      children={(field) => (
                        <FormInput
                          field={field()}
                          label="Email"
                          type="email"
                          placeholder="patient@example.com"
                          autoComplete="email"
                        />
                      )}
                    />

                    <form.Field
                      name="phone"
                      validators={{
                        onChange: valibotValidator(optionalPhoneSchema),
                      }}
                      children={(field) => (
                        <FormInput
                          field={field()}
                          label="Phone"
                          type="tel"
                          placeholder="(123) 456-7890"
                          autoComplete="tel"
                        />
                      )}
                    />

                    <form.Field
                      name="mobile"
                      validators={{
                        onChange: valibotValidator(optionalPhoneSchema),
                      }}
                      children={(field) => (
                        <FormInput
                          field={field()}
                          label="Mobile"
                          type="tel"
                          placeholder="(123) 456-7890"
                          autoComplete="tel"
                        />
                      )}
                    />

                    <form.Field
                      name="status"
                      children={(field) => (
                        <FormSelect
                          field={field()}
                          label="Status"
                          placeholder="Select status"
                          required
                          options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'archived', label: 'Archived' },
                          ]}
                        />
                      )}
                    />
                  </FormGroup>

                  <FormDivider />

                  {/* Additional Information Section */}
                  <FormGroup
                    title="Additional Information"
                    description="Notes and other details"
                  >
                    <form.Field
                      name="notes"
                      children={(field) => (
                        <FormTextarea
                          field={field()}
                          label="Notes"
                          placeholder="Additional notes about the patient..."
                          rows={4}
                        />
                      )}
                    />
                  </FormGroup>

                  {/* Form Actions */}
                  <FormActions align="between">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={updatePatient.isPending}
                    >
                      Cancel
                    </Button>

                    <form.Subscribe
                      selector={(state) => ({
                        canSubmit: state.canSubmit,
                        isSubmitting: state.isSubmitting,
                      })}
                      children={(state) => (
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={!state().canSubmit || updatePatient.isPending}
                        >
                          {state().isSubmitting || updatePatient.isPending
                            ? 'Saving...'
                            : 'Save Changes'}
                        </Button>
                      )}
                    />
                  </FormActions>
                </FormContainer>
              </Card>
            </Show>
          </Suspense>
        </PageContainer>
      </PageLayout>
    </>
  )
}
