# Forms Quick Reference

Fast lookup for common form patterns and components.

## Import Statement

```tsx
import { createForm } from '@tanstack/solid-form'
import * as v from 'valibot'
import {
  FormContainer,
  FormGroup,
  FormActions,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormDivider,
} from '~/components/forms'
import { valibotValidator, valibotValidatorAsync } from '~/lib/form-utils'
import { Button } from '~/components/ui'
```

## Basic Form Template

```tsx
// 1. Define schema
const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
})

type FormData = v.InferOutput<typeof schema>

// 2. Create form
const form = createForm(() => ({
  defaultValues: { name: '', email: '' } as FormData,
  onSubmit: async ({ value }) => {
    const data = v.parse(schema, value)
    // Handle submission
  },
}))

// 3. Render
<FormContainer onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
  <form.Field
    name="name"
    validators={{ onChange: valibotValidator(schema.entries.name) }}
    children={(field) => <FormInput field={field()} label="Name" required />}
  />
  {/* More fields... */}
  <FormActions>
    <Button type="submit">Submit</Button>
  </FormActions>
</FormContainer>
```

## Common Validation Schemas

```tsx
import {
  // Strings
  requiredStringSchema,
  optionalStringSchema,
  emailSchema,
  optionalEmailSchema,
  phoneSchema,
  optionalPhoneSchema,
  urlSchema,
  passwordSchema,
  nameSchema,
  addressSchema,
  
  // Numbers
  positiveNumberSchema,
  positiveIntegerSchema,
  ageSchema,
  percentageSchema,
  priceSchema,
  
  // Dates
  pastDateSchema,
  futureDateSchema,
  dateOfBirthSchema,
  
  // Boolean
  requiredCheckboxSchema,
} from '~/lib/validation-schemas'
```

## Component Cheat Sheet

### FormInput
```tsx
<form.Field
  name="fieldName"
  validators={{ onChange: valibotValidator(schema) }}
  children={(field) => (
    <FormInput
      field={field()}
      label="Label"
      type="text" // text, email, password, number, tel, url, date, time
      placeholder="Placeholder"
      required
      disabled
      autoComplete="email"
      min={0}
      max={100}
    />
  )}
/>
```

### FormTextarea
```tsx
<form.Field
  name="fieldName"
  children={(field) => (
    <FormTextarea
      field={field()}
      label="Label"
      placeholder="Placeholder"
      rows={4}
      maxLength={500}
    />
  )}
/>
```

### FormSelect
```tsx
<form.Field
  name="fieldName"
  children={(field) => (
    <FormSelect
      field={field()}
      label="Label"
      placeholder="Select..."
      required
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
      ]}
    />
  )}
/>
```

### FormCheckbox
```tsx
<form.Field
  name="fieldName"
  children={(field) => (
    <FormCheckbox
      field={field()}
      label="Label"
      description="Optional description"
    />
  )}
/>
```

### FormGroup
```tsx
<FormGroup
  title="Section Title"
  description="Optional description"
  columns={2} // 1, 2, 3, or 4
>
  {/* Fields */}
</FormGroup>
```

### FormActions
```tsx
<FormActions align="between"> {/* left, center, right, between */}
  <Button variant="secondary">Cancel</Button>
  <form.Subscribe
    selector={(state) => ({ canSubmit: state.canSubmit })}
    children={(state) => (
      <Button type="submit" disabled={!state().canSubmit}>
        Submit
      </Button>
    )}
  />
</FormActions>
```

## Validation Patterns

### Sync Validation
```tsx
validators={{
  onChange: valibotValidator(schema),
}}
```

### Async Validation with Debounce
```tsx
validators={{
  onChangeAsync: valibotValidatorAsync(asyncSchema),
  onChangeAsyncDebounceMs: 500,
}}
```

### Custom Validation Function
```tsx
validators={{
  onChange: ({ value }) => {
    if (value.length < 3) {
      return 'Too short'
    }
    return undefined
  },
}}
```

## Common Valibot Patterns

### Required String
```tsx
v.pipe(v.string(), v.nonEmpty('Required'))
```

### Email
```tsx
v.pipe(v.string(), v.email('Invalid email'))
```

### Min/Max Length
```tsx
v.pipe(
  v.string(),
  v.minLength(3, 'Min 3 chars'),
  v.maxLength(50, 'Max 50 chars')
)
```

### Number Range
```tsx
v.pipe(
  v.number(),
  v.minValue(0, 'Min 0'),
  v.maxValue(100, 'Max 100')
)
```

### Regex Pattern
```tsx
v.pipe(
  v.string(),
  v.regex(/^\d{5}$/, 'Must be 5 digits')
)
```

### Conditional Field
```tsx
v.optional(v.string())
```

### Picklist (Enum)
```tsx
v.picklist(['active', 'inactive', 'pending'])
```

### Object Schema
```tsx
v.object({
  name: v.string(),
  age: v.number(),
  email: v.pipe(v.string(), v.email()),
})
```

### Array Schema
```tsx
v.array(v.string())
```

## Form State

### Subscribe to Form State
```tsx
<form.Subscribe
  selector={(state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
    isDirty: state.isDirty,
    isValid: state.isValid,
  })}
  children={(state) => (
    <div>Can submit: {state().canSubmit ? 'Yes' : 'No'}</div>
  )}
/>
```

### Access Field State
```tsx
<form.Field
  name="email"
  children={(field) => {
    const state = field().state
    // state.value - current value
    // state.meta.errors - validation errors
    // state.meta.isTouched - has field been touched
    // state.meta.isValid - is field valid
    return <FormInput field={field()} label="Email" />
  }}
/>
```

## Error Handling

### Display Field Errors
```tsx
<Show when={field().state.meta.errors.length > 0}>
  <p class="text-red-600">
    {field().state.meta.errors.join(', ')}
  </p>
</Show>
```

### Display Form Errors
```tsx
<form.Subscribe
  selector={(state) => ({ errors: state.errors })}
  children={(state) => (
    <Show when={state().errors.length > 0}>
      <div class="text-red-600">
        {state().errors.join(', ')}
      </div>
    </Show>
  )}
/>
```

## Loading States

```tsx
<form.Subscribe
  selector={(state) => ({ isSubmitting: state.isSubmitting })}
  children={(state) => (
    <Button type="submit" disabled={state().isSubmitting}>
      {state().isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  )}
/>
```

## Submission

```tsx
const form = createForm(() => ({
  defaultValues: { /* ... */ },
  onSubmit: async ({ value }) => {
    try {
      // Validate
      const validatedData = v.parse(schema, value)
      
      // Submit
      await api.submit(validatedData)
      
      // Success
      toast.success('Saved!')
      navigate({ to: '/success' })
    } catch (error) {
      // Error
      toast.error(error.message)
    }
  },
}))
```

## Reset Form

```tsx
// Reset to defaults
form.reset()

// Reset to specific values
form.reset({
  name: 'New Name',
  email: 'new@email.com',
})
```

## Set Field Value Programmatically

```tsx
form.setFieldValue('email', 'new@email.com')
```

## File Structure

```
components/forms/
├── index.tsx          - Export all components
├── FormField.tsx      - Base field wrapper
├── FormInput.tsx      - Text inputs
├── FormTextarea.tsx   - Multi-line text
├── FormSelect.tsx     - Dropdowns
├── FormCheckbox.tsx   - Checkboxes
└── FormLayout.tsx     - Layout components

lib/
├── form-utils.ts      - Valibot adapter
└── validation-schemas.ts - Reusable schemas
```

## Example: Complete Form

```tsx
const patientSchema = v.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  status: v.picklist(['active', 'inactive']),
  notes: v.optional(v.string()),
})

type PatientData = v.InferOutput<typeof patientSchema>

function PatientForm() {
  const form = createForm(() => ({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'active',
      notes: '',
    } as PatientData,
    onSubmit: async ({ value }) => {
      const data = v.parse(patientSchema, value)
      await savePatient(data)
    },
  }))

  return (
    <FormContainer
      title="Patient Information"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FormGroup title="Personal Info" columns={2}>
        <form.Field
          name="firstName"
          validators={{ onChange: valibotValidator(nameSchema) }}
          children={(field) => (
            <FormInput field={field()} label="First Name" required />
          )}
        />
        <form.Field
          name="lastName"
          validators={{ onChange: valibotValidator(nameSchema) }}
          children={(field) => (
            <FormInput field={field()} label="Last Name" required />
          )}
        />
      </FormGroup>

      <FormDivider />

      <FormGroup title="Contact Info" columns={2}>
        <form.Field
          name="email"
          validators={{ onChange: valibotValidator(optionalEmailSchema) }}
          children={(field) => (
            <FormInput field={field()} label="Email" type="email" />
          )}
        />
        <form.Field
          name="phone"
          validators={{ onChange: valibotValidator(optionalPhoneSchema) }}
          children={(field) => (
            <FormInput field={field()} label="Phone" type="tel" />
          )}
        />
      </FormGroup>

      <FormGroup>
        <form.Field
          name="notes"
          children={(field) => (
            <FormTextarea field={field()} label="Notes" rows={4} />
          )}
        />
      </FormGroup>

      <FormActions align="between">
        <Button variant="secondary">Cancel</Button>
        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit })}
          children={(state) => (
            <Button type="submit" disabled={!state().canSubmit}>
              Save
            </Button>
          )}
        />
      </FormActions>
    </FormContainer>
  )
}
```

## Tips

1. **Always use type inference**: `type FormData = v.InferOutput<typeof schema>`
2. **Validate on submit**: Always parse with Valibot in `onSubmit`
3. **Show loading states**: Use `form.Subscribe` for button states
4. **Group related fields**: Use `FormGroup` with columns
5. **Debounce async**: Set `onChangeAsyncDebounceMs: 500`
6. **Reuse schemas**: Import from `validation-schemas.ts`
7. **Handle errors gracefully**: Use try/catch in onSubmit
