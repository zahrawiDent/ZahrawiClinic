# Patient Forms - TanStack Form & Valibot Implementation Guide

## 📋 Overview

This guide documents the elegant, reusable, and scalable patient form implementation using **TanStack Form** and **Valibot** validation. The implementation prioritizes:

- ✨ **Clean Code**: Minimal duplication, clear separation of concerns
- 🔄 **Reusability**: Shared components and hooks across create/edit flows
- 🎯 **Type Safety**: Full TypeScript integration with Valibot schema inference
- 🚀 **Great UX**: Real-time validation, optimistic updates, instant feedback
- 📦 **Scalability**: Easy to extend for new fields or forms

---

## 🏗️ Architecture

### Core Principles

1. **Schema-First Validation**: Define schemas once, reuse everywhere
2. **Custom Hooks**: Encapsulate form logic in reusable hooks
3. **Component Composition**: Build forms from small, focused components
4. **Type Inference**: Let TypeScript infer types from Valibot schemas

### File Structure

```
src/
├── lib/
│   ├── validation-schemas.ts      # All Valibot schemas & types
│   ├── use-patient-form.ts        # Patient form hook
│   └── form-utils.ts              # Valibot adapter for TanStack Form
├── components/
│   └── forms/
│       ├── FormInput.tsx          # Generic input component
│       ├── FormSelect.tsx         # Generic select component
│       ├── FormTextarea.tsx       # Generic textarea component
│       ├── FormField.tsx          # Field wrapper with error display
│       ├── FormLayout.tsx         # Layout components
│       ├── PatientFormFields.tsx  # Patient-specific fields
│       └── index.tsx              # Exports
└── routes/
    └── _authenticated/patients/
        ├── new.tsx                # Create patient page
        └── $id.edit.tsx           # Edit patient page
```

---

## 🎨 Usage Examples

### Creating a Patient Form

```tsx
import { usePatientForm } from '@/lib/use-patient-form'
import { FormContainer, FormActions, PatientFormFields } from '@/components/forms'

function AddPatientPage() {
  const navigate = useNavigate()

  const { form, validators, isPending } = usePatientForm({
    onSuccess: () => navigate({ to: '/patients' })
  })

  return (
    <FormContainer onSubmit={(e) => { 
      e.preventDefault()
      form.handleSubmit() 
    }}>
      <PatientFormFields form={form} validators={validators} />
      
      <FormActions align="between">
        <Button onClick={() => navigate({ to: '/patients' })}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          Add Patient
        </Button>
      </FormActions>
    </FormContainer>
  )
}
```

### Editing a Patient

```tsx
import { usePatientForm } from '@/lib/use-patient-form'
import { PatientFormFields } from '@/components/forms'

function EditPatientPage() {
  const params = Route.useParams()
  const patient = useRecord('patients', () => params().id)

  const { form, validators, isPending } = usePatientForm({
    initialData: patient.data,      // Pre-fill with existing data
    patientId: params().id,          // For updates
    onSuccess: () => navigate({ to: `/patients/${params().id}` })
  })

  return (
    <FormContainer onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      <PatientFormFields form={form} validators={validators} />
      {/* Actions... */}
    </FormContainer>
  )
}
```

---

## 🔧 Key Components

### 1. `usePatientForm` Hook

**Location**: `src/lib/use-patient-form.ts`

Encapsulates all patient form logic including validation, submission, and error handling.

**API**:

```typescript
interface UsePatientFormOptions {
  initialData?: Partial<PatientFormData>  // For editing
  patientId?: string                       // Required when editing
  onSuccess?: (data: PatientFormData) => void
  onError?: (error: Error) => void
}

const {
  form,           // TanStack Form instance
  validators,     // Pre-configured validators
  isEditing,      // boolean
  isPending,      // boolean - mutation pending
  isSubmitting,   // () => boolean
  canSubmit,      // () => boolean
} = usePatientForm(options)
```

**Features**:
- ✅ Automatic create vs. update detection
- ✅ Built-in toast notifications
- ✅ Form validation with Valibot
- ✅ Error handling and recovery

### 2. `PatientFormFields` Component

**Location**: `src/components/forms/PatientFormFields.tsx`

Reusable component containing all patient form fields. Use this instead of duplicating field definitions.

**Props**:

```typescript
interface PatientFormFieldsProps {
  form: any           // TanStack Form instance
  validators: {       // Validator objects
    firstName: any
    lastName: any
    email: any
    phone: any
    mobile: any
  }
}
```

**Sections**:
- Personal Information (firstName, lastName, dateOfBirth, gender)
- Contact Information (email, phone, mobile, status)
- Additional Information (notes)

### 3. Validation Schemas

**Location**: `src/lib/validation-schemas.ts`

Centralized validation schemas for reuse across the application.

**Key Schemas**:

```typescript
// Base field schemas
export const nameSchema           // Required name with regex
export const optionalEmailSchema  // Optional valid email
export const optionalPhoneSchema  // Optional phone number

// Enum schemas
export const patientGenderSchema  // 'male' | 'female' | 'other' | 'prefer_not_to_say'
export const patientStatusSchema  // 'active' | 'inactive' | 'archived'

// Complete form schema
export const patientFormSchema    // Full patient object
export type PatientFormData       // Inferred TypeScript type

// Select options (readonly)
export const GENDER_OPTIONS
export const PATIENT_STATUS_OPTIONS
```

**Type Inference**:

```typescript
// Types are automatically inferred from schemas
type PatientFormData = v.InferOutput<typeof patientFormSchema>
// {
//   firstName: string
//   lastName: string
//   dateOfBirth?: string
//   gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
//   email?: string
//   phone?: string
//   mobile?: string
//   status: 'active' | 'inactive' | 'archived'
//   notes?: string
// }
```

### 4. Form Components

#### `FormInput`
Generic text input with built-in validation display.

```tsx
<FormInput
  field={field()}
  label="Email"
  type="email"
  placeholder="user@example.com"
  required
  autoComplete="email"
/>
```

**Props**: `field`, `label`, `description`, `required`, `type`, `placeholder`, `disabled`, `autoComplete`, `min`, `max`, `step`, `pattern`

#### `FormSelect`
Dropdown with options.

```tsx
<FormSelect
  field={field()}
  label="Status"
  placeholder="Select status"
  required
  options={PATIENT_STATUS_OPTIONS}
/>
```

**Props**: `field`, `label`, `description`, `required`, `placeholder`, `options`, `disabled`

#### `FormTextarea`
Multi-line text input.

```tsx
<FormTextarea
  field={field()}
  label="Notes"
  placeholder="Enter notes..."
  rows={4}
/>
```

**Props**: `field`, `label`, `description`, `required`, `placeholder`, `rows`, `maxLength`, `disabled`

---

## 🎯 Benefits

### For Developers

1. **No Duplication**: Define fields once in `PatientFormFields`
2. **Type Safety**: Full autocomplete and type checking
3. **Easy Testing**: Isolated, composable units
4. **Clear Structure**: Know exactly where to look for logic

### For Users

1. **Instant Feedback**: Real-time validation as you type
2. **Clear Errors**: Field-level error messages
3. **Fast Navigation**: Optimistic updates (no waiting for server)
4. **Consistent UX**: Same experience across all forms

---

## 🚀 Extending the System

### Adding a New Field

1. **Add to Schema** (`validation-schemas.ts`):
```typescript
export const patientFormSchema = v.object({
  // ... existing fields
  insuranceNumber: v.optional(insuranceNumberSchema), // New field
})
```

2. **Add to Form Fields** (`PatientFormFields.tsx`):
```tsx
<form.Field
  name="insuranceNumber"
  children={(field: any) => (
    <FormInput
      field={field()}
      label="Insurance Number"
      placeholder="Enter insurance number"
    />
  )}
/>
```

Done! The hook and pages automatically pick up the new field.

### Creating a New Form Type

1. **Create Schema** in `validation-schemas.ts`:
```typescript
export const appointmentFormSchema = v.object({
  patientId: requiredStringSchema,
  appointmentDate: futureDateSchema,
  notes: optionalStringSchema,
})

export type AppointmentFormData = v.InferOutput<typeof appointmentFormSchema>
```

2. **Create Hook** (`use-appointment-form.ts`):
```typescript
export function useAppointmentForm(options: UseAppointmentFormOptions) {
  // Similar structure to usePatientForm
}
```

3. **Create Fields Component** (`AppointmentFormFields.tsx`):
```tsx
export function AppointmentFormFields(props) {
  // Define appointment-specific fields
}
```

4. **Use in Pages**:
```tsx
const { form, validators } = useAppointmentForm({ ... })
return <AppointmentFormFields form={form} validators={validators} />
```

---

## 📚 Advanced Patterns

### Async Validation

For server-side validation (e.g., checking email uniqueness):

```typescript
import { valibotValidatorAsync } from '@/lib/form-utils'

const uniqueEmailSchema = v.pipeAsync(
  v.string(),
  v.email(),
  v.checkAsync(async (email) => {
    const exists = await checkEmailExists(email)
    return !exists
  }, 'Email already exists')
)

// In form field:
<form.Field
  name="email"
  validators={{
    onChangeAsync: valibotValidatorAsync(uniqueEmailSchema),
    onChangeAsyncDebounceMs: 500
  }}
/>
```

### Conditional Fields

Show/hide fields based on other field values:

```tsx
<Show when={form.state.values.status === 'archived'}>
  <form.Field name="archiveReason">
    {(field) => (
      <FormTextarea
        field={field()}
        label="Archive Reason"
        required
      />
    )}
  </form.Field>
</Show>
```

### Dynamic Field Arrays

For repeating sections (e.g., multiple phone numbers):

```typescript
// In schema:
export const patientFormSchema = v.object({
  // ... other fields
  phoneNumbers: v.array(phoneSchema),
})

// In component:
<form.Field name="phoneNumbers" mode="array">
  {(field) => (
    <For each={field().state.value}>
      {(_, index) => (
        <form.Field name={`phoneNumbers[${index()}]`}>
          {(phoneField) => (
            <FormInput field={phoneField()} label={`Phone ${index() + 1}`} />
          )}
        </form.Field>
      )}
    </For>
  )}
</form.Field>
```

---

## 🎨 UX Enhancements

### Loading States

```tsx
<Suspense fallback={<FormSkeleton />}>
  <PatientFormFields form={form} validators={validators} />
</Suspense>
```

### Unsaved Changes Warning

```typescript
createEffect(() => {
  const isDirty = form.state.isDirty
  
  if (isDirty) {
    window.onbeforeunload = () => 'You have unsaved changes'
  } else {
    window.onbeforeunload = null
  }
})
```

### Form Reset

```tsx
<Button onClick={() => form.reset()}>
  Reset Form
</Button>
```

---

## 🧪 Testing

### Testing the Hook

```typescript
import { renderHook, waitFor } from '@solidjs/testing-library'
import { usePatientForm } from '@/lib/use-patient-form'

test('validates required fields', async () => {
  const { result } = renderHook(() => usePatientForm())
  
  // Submit empty form
  result.form.handleSubmit()
  
  await waitFor(() => {
    expect(result.form.state.errors.firstName).toBeDefined()
  })
})
```

### Testing Components

```typescript
import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'

test('shows validation error on invalid email', async () => {
  render(<AddPatientPage />)
  
  const emailInput = screen.getByLabelText('Email')
  await userEvent.type(emailInput, 'invalid-email')
  await userEvent.tab() // Trigger blur
  
  expect(screen.getByText(/valid email/i)).toBeInTheDocument()
})
```

---

## 📖 Best Practices

1. **Keep Schemas Pure**: Define validation logic only in schemas
2. **Component Composition**: Build complex forms from simple components
3. **Single Responsibility**: Each component does one thing well
4. **Type Safety**: Always use inferred types, never `any` in user code
5. **Accessibility**: Use `required`, `aria-invalid`, proper labels
6. **Error Messages**: Make them clear, actionable, and user-friendly
7. **Performance**: Use debouncing for async validation
8. **Consistency**: Reuse form components across the application

---

## 🔍 Debugging Tips

### View Form State

```tsx
<form.Subscribe>
  {(state) => (
    <pre>{JSON.stringify(state(), null, 2)}</pre>
  )}
</form.Subscribe>
```

### Log Validation Errors

```typescript
onSubmit: async ({ value }) => {
  try {
    const validatedData = v.parse(schema, value)
  } catch (error) {
    if (error instanceof v.ValiError) {
      console.log('Validation errors:', error.issues)
    }
  }
}
```

### Check Field State

```tsx
<form.Field name="email">
  {(field) => {
    console.log('Field state:', field().state)
    return <FormInput field={field()} />
  }}
</form.Field>
```

---

## 📦 Related Documentation

- [TanStack Form Docs](https://tanstack.com/form/latest)
- [Valibot Documentation](https://valibot.dev)
- [SolidJS Documentation](https://www.solidjs.com)
- [Forms System Summary](./FORMS_SYSTEM_SUMMARY.md)
- [Type Inference Guide](./TYPE_INFERENCE_GUIDE.md)

---

## 🎉 Summary

The patient forms implementation demonstrates a clean, scalable approach to form handling:

- **1 Hook** (`usePatientForm`) handles all form logic
- **1 Component** (`PatientFormFields`) defines all fields
- **1 Schema** (`patientFormSchema`) validates everything
- **2 Pages** (new/edit) with minimal, clean code

This pattern is easy to understand, test, and extend—making it perfect for a growing application! 🚀
