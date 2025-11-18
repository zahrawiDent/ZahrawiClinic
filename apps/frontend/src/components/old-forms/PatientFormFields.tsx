/**
 * Patient Form Fields Component
 * 
 * A reusable component containing all patient form fields.
 * This eliminates duplication between create and edit forms.
 * 
 * @example
 * ```tsx
 * const { form, validators } = usePatientForm()
 * 
 * <PatientFormFields form={form} validators={validators} />
 * ```
 */

import { FormGroup, FormInput, FormTextarea, FormSelect, FormDivider } from './index'
import { GENDER_OPTIONS, PATIENT_STATUS_OPTIONS } from '@/lib/validation-schemas'

export interface PatientFormFieldsProps {
  form: any // TanStack Form instance
  validators: {
    firstName: any
    lastName: any
    email: any
    phone: any
    mobile: any
  }
}

export function PatientFormFields(props: PatientFormFieldsProps) {
  return (
    <>
      {/* Personal Information Section */}
      <FormGroup
        title="Personal Information"
        description="Basic information about the patient"
        columns={2}
      >
        <props.form.Field
          name="firstName"
          validators={props.validators.firstName}
          children={(field: any) => (
            <FormInput
              field={field()}
              label="First Name"
              placeholder="Enter first name"
              required
            />
          )}
        />

        <props.form.Field
          name="lastName"
          validators={props.validators.lastName}
          children={(field: any) => (
            <FormInput
              field={field()}
              label="Last Name"
              placeholder="Enter last name"
              required
            />
          )}
        />

        <props.form.Field
          name="dateOfBirth"
          children={(field: any) => (
            <FormInput
              field={field()}
              label="Date of Birth"
              type="date"
            />
          )}
        />

        <props.form.Field
          name="gender"
          children={(field: any) => (
            <FormSelect
              field={field()}
              label="Gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
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
        <props.form.Field
          name="email"
          validators={props.validators.email}
          children={(field: any) => (
            <FormInput
              field={field()}
              label="Email"
              type="email"
              placeholder="patient@example.com"
              autoComplete="email"
            />
          )}
        />

        <props.form.Field
          name="phone"
          validators={props.validators.phone}
          children={(field: any) => (
            <FormInput
              field={field()}
              label="Phone"
              type="tel"
              placeholder="(123) 456-7890"
              autoComplete="tel"
            />
          )}
        />

        <props.form.Field
          name="mobile"
          validators={props.validators.mobile}
          children={(field: any) => (
            <FormInput
              field={field()}
              label="Mobile"
              type="tel"
              placeholder="(123) 456-7890"
              autoComplete="tel"
            />
          )}
        />

        <props.form.Field
          name="status"
          children={(field: any) => (
            <FormSelect
              field={field()}
              label="Status"
              placeholder="Select status"
              required
              options={PATIENT_STATUS_OPTIONS}
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
        <props.form.Field
          name="notes"
          children={(field: any) => (
            <FormTextarea
              field={field()}
              label="Notes"
              placeholder="Additional notes about the patient..."
              rows={4}
            />
          )}
        />
      </FormGroup>
    </>
  )
}
