# Patient Forms - Quick Reference

## 🚀 Quick Start

### Create a Patient Form (3 lines)

```tsx
const { form, validators, isPending } = usePatientForm({
  onSuccess: () => navigate({ to: '/patients' })
})

return (
  <FormContainer onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
    <PatientFormFields form={form} validators={validators} />
    {/* Add buttons */}
  </FormContainer>
)
```

### Edit a Patient Form (4 lines)

```tsx
const patient = useRecord('patients', () => params().id)
const { form, validators, isPending } = usePatientForm({
  initialData: patient.data,
  patientId: params().id,
  onSuccess: () => navigate({ to: `/patients/${params().id}` })
})

// Same JSX as create form
```

---

## 📋 Common Patterns

### Standard Form Actions

```tsx
<FormActions align="between">
  <Button variant="secondary" onClick={handleCancel} disabled={isPending}>
    Cancel
  </Button>
  
  <form.Subscribe selector={(state) => ({ 
    canSubmit: state.canSubmit, 
    isSubmitting: state.isSubmitting 
  })}>
    {(state) => (
      <Button 
        type="submit" 
        disabled={!state().canSubmit || isPending}
      >
        {state().isSubmitting || isPending ? 'Saving...' : 'Save'}
      </Button>
    )}
  </form.Subscribe>
</FormActions>
```

### Custom Field

```tsx
<form.Field 
  name="customField"
  validators={{ onChange: valibotValidator(mySchema) }}
>
  {(field) => (
    <FormInput
      field={field()}
      label="My Field"
      placeholder="Enter value"
      required
    />
  )}
</form.Field>
```

### Conditional Field

```tsx
<Show when={form.state.values.someField === 'value'}>
  <form.Field name="conditionalField">
    {(field) => <FormInput field={field()} label="Conditional" />}
  </form.Field>
</Show>
```

---

## 🎨 Component Props

### FormInput

```tsx
<FormInput
  field={field()}           // Required: TanStack field
  label="Label"            // Optional: Display text
  type="text"              // Optional: input type
  placeholder="..."        // Optional
  required                 // Optional: shows asterisk
  disabled                 // Optional
  description="Help text"  // Optional: below label
  autoComplete="email"     // Optional
  min={0}                  // Optional: for number/date
  max={100}                // Optional: for number/date
  step={1}                 // Optional: for number
  pattern="regex"          // Optional: HTML5 validation
/>
```

### FormSelect

```tsx
<FormSelect
  field={field()}
  label="Label"
  placeholder="Choose..."
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B', disabled: true },
  ]}
  required
/>
```

### FormTextarea

```tsx
<FormTextarea
  field={field()}
  label="Label"
  placeholder="Enter notes..."
  rows={4}
  maxLength={500}
/>
```

### FormGroup

```tsx
<FormGroup
  title="Section Title"
  description="Optional description"
  columns={2}              // 1, 2, 3, or 4
>
  {/* Fields */}
</FormGroup>
```

---

## ✅ Validation Schemas

### Available Schemas

```typescript
// Strings
requiredStringSchema      // Non-empty string
optionalStringSchema      // Can be empty
nameSchema               // 2-50 chars, letters/spaces/hyphens
emailSchema              // Required valid email
optionalEmailSchema      // Optional valid email
phoneSchema              // Required phone (10-20 digits)
optionalPhoneSchema      // Optional phone
addressSchema            // 5-200 chars
urlSchema                // Valid URL

// Numbers
positiveNumberSchema     // >= 0
positiveIntegerSchema    // Integer >= 0
ageSchema               // 0-150
percentageSchema        // 0-100
priceSchema             // >= 0

// Dates
pastDateSchema          // Date in the past
futureDateSchema        // Date in the future
dateOfBirthSchema       // Past date, reasonable range

// Booleans
requiredCheckboxSchema  // Must be true

// Patient-specific
patientGenderSchema     // 'male' | 'female' | 'other' | 'prefer_not_to_say'
patientStatusSchema     // 'active' | 'inactive' | 'archived'
patientFormSchema       // Complete patient object
```

### Using Schemas

```typescript
import { nameSchema } from '@/lib/validation-schemas'
import { valibotValidator } from '@/lib/form-utils'

// In a field:
validators={{ onChange: valibotValidator(nameSchema) }}
```

### Creating Custom Schema

```typescript
import * as v from 'valibot'

export const customSchema = v.pipe(
  v.string(),
  v.nonEmpty('Required'),
  v.minLength(3, 'Too short'),
  v.regex(/^[A-Z]/, 'Must start with uppercase')
)
```

---

## 🎯 Hook API

### `usePatientForm(options)`

**Options:**
```typescript
{
  initialData?: Partial<PatientFormData>,  // Pre-fill (for edit)
  patientId?: string,                       // Required for edit
  onSuccess?: (data: PatientFormData) => void,
  onError?: (error: Error) => void
}
```

**Returns:**
```typescript
{
  form: FormInstance,          // TanStack Form instance
  validators: {                // Pre-configured validators
    firstName, lastName, email, phone, mobile
  },
  isEditing: boolean,          // true if patientId provided
  isPending: boolean,          // Mutation in progress
  isSubmitting: () => boolean, // Form submitting
  canSubmit: () => boolean     // Form can be submitted
}
```

---

## 🐛 Common Issues

### Issue: Field not validating

**Solution:** Make sure validator is in `validators` prop:
```tsx
<form.Field 
  name="email"
  validators={{ onChange: valibotValidator(emailSchema) }}  // ✅
>
```

### Issue: Form not submitting

**Solution:** Check form is wrapped properly:
```tsx
<FormContainer onSubmit={(e) => {
  e.preventDefault()        // ✅ Prevent default
  e.stopPropagation()       // ✅ Stop bubbling
  form.handleSubmit()       // ✅ Submit
}}>
```

### Issue: Values not updating

**Solution:** Use `field()` as a function:
```tsx
{(field) => <FormInput field={field()} />}  // ✅ field() not field
```

### Issue: Type errors with options

**Solution:** Use readonly array or define as const:
```tsx
const options = [...] as const  // ✅
// or
options: readonly SelectOption[]  // ✅
```

---

## 📊 Form State

### Access Form State

```tsx
<form.Subscribe>
  {(state) => (
    <div>
      <p>Valid: {state().isValid}</p>
      <p>Dirty: {state().isDirty}</p>
      <p>Submitting: {state().isSubmitting}</p>
      <pre>{JSON.stringify(state().values, null, 2)}</pre>
    </div>
  )}
</form.Subscribe>
```

### Field State Properties

```typescript
field().state = {
  value: any,              // Current value
  meta: {
    errors: string[],      // Validation errors
    isTouched: boolean,    // User interacted
    isDirty: boolean,      // Value changed
    isValidating: boolean, // Async validation
  }
}
```

---

## 🎨 Styling Tips

### Custom Input Styling

```tsx
<FormInput
  field={field()}
  class="my-custom-class"  // Additional classes
/>
```

### Dark Mode

All form components include dark mode styles automatically:
- `dark:bg-gray-800` - Dark backgrounds
- `dark:text-gray-100` - Dark text
- `dark:border-gray-600` - Dark borders

---

## 🔗 Links

- Full Guide: [PATIENT_FORMS_GUIDE.md](./PATIENT_FORMS_GUIDE.md)
- Forms System: [FORMS_SYSTEM_SUMMARY.md](./FORMS_SYSTEM_SUMMARY.md)
- Type Inference: [TYPE_INFERENCE_GUIDE.md](./TYPE_INFERENCE_GUIDE.md)
- Validation Schemas: `src/lib/validation-schemas.ts`
- Form Hook: `src/lib/use-patient-form.ts`
- Form Components: `src/components/forms/`
