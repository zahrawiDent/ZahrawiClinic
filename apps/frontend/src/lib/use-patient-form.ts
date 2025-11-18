/**
 * Simple Patient Form Hook
 * Uses TanStack Form + Valibot with field-level validation
 */

import { createForm } from '@tanstack/solid-form'
import * as v from 'valibot'
import { useCreateRecord, useUpdateRecord } from './queries'
import { toast } from '@/components/toast'
import { 
  patientFormSchema, 
  type PatientFormData,
  nameSchema,
  patientGenderSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
} from './validation-schemas'
import { valibotValidator } from './form-utils'

export interface UsePatientFormOptions {
  initialData?: Partial<PatientFormData>
  patientId?: string
  onSuccess?: () => void
}

export function usePatientForm(options: UsePatientFormOptions = {}) {
  const createPatient = useCreateRecord('patients')
  const updatePatient = useUpdateRecord('patients')
  
  const isEditing = !!options.patientId

  const form = createForm(() => ({
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined as any,
      dateOfBirth: '',
      email: '',
      phone: '',
      mobile: '',
      status: 'active',
      notes: '',
      ...options.initialData,
    } as PatientFormData,

    onSubmit: async ({ value }) => {
      try {
        const validatedData = v.parse(patientFormSchema, value)

        if (isEditing && options.patientId) {
          await updatePatient.mutateAsync({
            id: options.patientId,
            data: validatedData,
          })
          toast.success('Patient updated successfully!')
        } else {
          await createPatient.mutateAsync(validatedData)
          toast.success('Patient added successfully!')
        }

        options.onSuccess?.()
      } catch (error: any) {
        // Only show toast for non-validation errors
        if (error?.name !== 'ValiError') {
          toast.error(error?.message || 'Failed to save patient')
        }
        throw error
      }
    },
  }))

  // Field-level validators for inline error display
  // Use onBlur to only show errors after leaving the field (not while typing)
  const validators = {
    firstName: {
      onBlur: valibotValidator(nameSchema),
    },
    lastName: {
      onBlur: valibotValidator(nameSchema),
    },
    gender: {
      onBlur: valibotValidator(patientGenderSchema),
    },
    // Optional fields - only validate if not empty
    email: {
      onBlur: valibotValidator(optionalEmailSchema),
    },
    phone: {
      onBlur: valibotValidator(optionalPhoneSchema),
    },
    mobile: {
      onBlur: valibotValidator(optionalPhoneSchema),
    },
  }

  return {
    form,
    validators,
    isPending: isEditing ? updatePatient.isPending : createPatient.isPending,
  }
}
