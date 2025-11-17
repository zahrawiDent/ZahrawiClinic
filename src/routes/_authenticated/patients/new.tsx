import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { createForm } from '@tanstack/solid-form'
import * as v from 'valibot'
import { useCreateRecord } from '@/lib/queries'
import { toast } from '@/components/toast'
import { PageLayout, PageContainer, PageHeader, Card, InfoBox, Button } from '@/components/ui'
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

export const Route = createFileRoute('/_authenticated/patients/new')({
  component: AddPatientPage,
})

// Define the form schema
const newPatientSchema = v.object({
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

function AddPatientPage() {
  const navigate = useNavigate()
  const createPatient = useCreateRecord('patients')

  const form = createForm(() => ({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: undefined as 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined,
      email: '',
      phone: '',
      mobile: '',
      status: 'active' as 'active' | 'inactive' | 'archived',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate the form data
        const validatedData = v.parse(newPatientSchema, value)

        // Create patient with optimistic update
        createPatient.mutate(validatedData, {
          onSuccess: () => {
            toast.success('Patient added successfully! 🎉')
          },
          onError: (err: any) => {
            toast.error(err?.message || 'Failed to add patient')
          },
        })

        // Navigate immediately (optimistic UI)
        navigate({ to: '/patients' })
      } catch (error: any) {
        toast.error(error?.message || 'Please check your input')
      }
    },
  }))

  const handleCancel = () => {
    navigate({ to: '/patients' })
  }

  return (
    <PageLayout>
      <PageContainer size="sm" padding>
        <div class="mb-4">
          <Breadcrumbs separator="›" />
        </div>

        <PageHeader
          title="Add New Patient"
          subtitle="Enter patient information below. Changes will sync in realtime across all connected clients."
        />

        <Card>
          <FormContainer
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FormGroup title="Personal Information" columns={2}>
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
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ]}
                  />
                )}
              />
            </FormGroup>

            <FormDivider />

            <FormGroup title="Contact Information" columns={2}>
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

            <FormGroup title="Additional Information">
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

            <FormActions align="between">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={createPatient.isPending}
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
                    disabled={!state().canSubmit || createPatient.isPending}
                  >
                    {state().isSubmitting || createPatient.isPending
                      ? 'Adding...'
                      : 'Add Patient'}
                  </Button>
                )}
              />
            </FormActions>
          </FormContainer>
        </Card>

        <div class="mt-6">
          <InfoBox variant="info" title="⚡ Optimistic Updates Enabled">
            <p>
              When you add a patient, you'll be redirected instantly and the new patient
              will appear immediately in the list. The data syncs with the server in the
              background with automatic rollback on errors.
            </p>
          </InfoBox>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
