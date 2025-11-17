# Form System Documentation

Complete guide to using TanStack Solid Form with Valibot validation in this project.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Form Components](#form-components)
- [Validation](#validation)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Overview

This project uses a modern, type-safe form system combining:

- **TanStack Solid Form** - Headless form state management
- **Valibot** - Modular schema validation library
- **Custom Form Components** - Reusable, accessible form inputs
- **Type Safety** - Full TypeScript support throughout

### Key Benefits

- ✅ **Type-safe** - Full TypeScript inference from schema to form
- ✅ **Reusable** - Components work across all forms
- ✅ **Validated** - Real-time validation with great UX
- ✅ **Accessible** - ARIA attributes and proper error handling
- ✅ **Scalable** - Easy to add new fields and forms
- ✅ **Clean** - Minimal boilerplate, maximum clarity

## Quick Start

### Basic Form Example

```tsx
import { createForm } from '@tanstack/solid-form'
import * as v from 'valibot'
import { FormContainer, FormInput, FormActions } from '~/components/forms'
import { valibotValidator } from '~/lib/form-utils'
import { emailSchema, nameSchema } from '~/lib/validation-schemas'
import { Button } from '~/components/ui'

// 1. Define your schema
const userSchema = v.object({
  name: nameSchema,
  email: emailSchema,
})

type UserFormData = v.InferOutput<typeof userSchema>

function MyForm() {
  // 2. Create the form
  const form = createForm(() => ({
    defaultValues: {
      name: '',
      email: '',
    } as UserFormData,
    onSubmit: async ({ value }) => {
      const validatedData = v.parse(userSchema, value)
      console.log('Submit:', validatedData)
    },
  }))

  // 3. Render with form components
  return (
    <FormContainer
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="name"
        validators={{ onChange: valibotValidator(nameSchema) }}
        children={(field) => (
          <FormInput
            field={field()}
            label="Name"
            placeholder="Enter your name"
            required
          />
        )}
      />

      <form.Field
        name="email"
        validators={{ onChange: valibotValidator(emailSchema) }}
        children={(field) => (
          <FormInput
            field={field()}
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
          />
        )}
      />

      <FormActions>
        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit })}
          children={(state) => (
            <Button type="submit" disabled={!state().canSubmit}>
              Submit
            </Button>
          )}
        />
      </FormActions>
    </FormContainer>
  )
}
```

## Form Components

### FormContainer

Wraps the entire form with consistent layout and spacing.

```tsx
<FormContainer
  title="Form Title"
  description="Optional description"
  onSubmit={handleSubmit}
  class="custom-class"
>
  {/* Form fields */}
</FormContainer>
```

### FormGroup

Groups related fields together with optional title and multi-column layout.

```tsx
<FormGroup
  title="Contact Information"
  description="How we'll reach you"
  columns={2} // 1, 2, 3, or 4
>
  {/* Fields */}
</FormGroup>
```

### FormInput

Text input component with various types.

```tsx
<form.Field
  name="email"
  validators={{ onChange: valibotValidator(emailSchema) }}
  children={(field) => (
    <FormInput
      field={field()}
      label="Email"
      type="email" // text, email, password, number, tel, url, date, etc.
      placeholder="you@example.com"
      required
      autoComplete="email"
    />
  )}
/>
```

### FormTextarea

Multi-line text input.

```tsx
<form.Field
  name="notes"
  children={(field) => (
    <FormTextarea
      field={field()}
      label="Notes"
      placeholder="Enter notes..."
      rows={4}
    />
  )}
/>
```

### FormSelect

Dropdown select input.

```tsx
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
      ]}
    />
  )}
/>
```

### FormCheckbox

Checkbox input with label and description.

```tsx
<form.Field
  name="acceptTerms"
  children={(field) => (
    <FormCheckbox
      field={field()}
      label="Accept Terms"
      description="I agree to the terms and conditions"
    />
  )}
/>
```

### FormActions

Container for form buttons with flexible alignment.

```tsx
<FormActions align="between"> {/* left, center, right, between */}
  <Button type="button" variant="secondary" onClick={handleCancel}>
    Cancel
  </Button>
  <Button type="submit" variant="primary">
    Save
  </Button>
</FormActions>
```

### FormDivider

Visual separator between form sections.

```tsx
<FormDivider />
```

## Validation

### Using Valibot Schemas

The project includes pre-built validation schemas in `src/lib/validation-schemas.ts`:

#### String Validations
- `requiredStringSchema` - Non-empty string
- `optionalStringSchema` - Optional string
- `emailSchema` - Email validation
- `optionalEmailSchema` - Optional email
- `phoneSchema` - Phone number validation
- `optionalPhoneSchema` - Optional phone
- `urlSchema` - URL validation
- `passwordSchema` - Password with complexity
- `nameSchema` - Person name validation
- `addressSchema` - Address validation

#### Number Validations
- `positiveNumberSchema` - Positive number
- `positiveIntegerSchema` - Positive whole number
- `ageSchema` - Age (0-150)
- `percentageSchema` - Percentage (0-100)
- `priceSchema` - Price/money validation

#### Date Validations
- `pastDateSchema` - Date in the past
- `futureDateSchema` - Date in the future
- `dateOfBirthSchema` - Birth date validation

#### Dental-Specific
- `patientNameSchema` - Patient name
- `insuranceNumberSchema` - Insurance number
- `toothNumberSchema` - Tooth number (1-32)
- `treatmentCodeSchema` - Treatment code

### Creating Custom Schemas

```tsx
import * as v from 'valibot'

// Simple schema
const usernameSchema = v.pipe(
  v.string(),
  v.nonEmpty('Username is required.'),
  v.minLength(3, 'Username must be at least 3 characters.'),
  v.maxLength(20, 'Username is too long.')
)

// Complex object schema
const addressSchema = v.object({
  street: v.pipe(v.string(), v.nonEmpty('Street is required.')),
  city: v.pipe(v.string(), v.nonEmpty('City is required.')),
  zipCode: v.pipe(
    v.string(),
    v.regex(/^\d{5}$/, 'ZIP must be 5 digits.')
  ),
})

// Async validation
const asyncEmailSchema = v.pipeAsync(
  v.string(),
  v.email(),
  v.checkAsync(async (email) => {
    const exists = await checkEmailExists(email)
    return !exists
  }, 'Email already exists.')
)
```

### Field-Level Validation

```tsx
<form.Field
  name="email"
  validators={{
    onChange: valibotValidator(emailSchema),
    onChangeAsync: valibotValidatorAsync(asyncEmailSchema),
    onChangeAsyncDebounceMs: 500, // Debounce async validation
  }}
  children={(field) => <FormInput field={field()} label="Email" />}
/>
```

### Form-Level Validation

```tsx
const form = createForm(() => ({
  defaultValues: { /* ... */ },
  validators: {
    onChange: ({ value }) => {
      // Custom cross-field validation
      if (value.password !== value.confirmPassword) {
        return {
          form: 'Passwords do not match',
          fields: {
            confirmPassword: 'Must match password',
          },
        }
      }
      return undefined
    },
  },
  onSubmit: async ({ value }) => { /* ... */ },
}))
```

## Examples

### Complete Patient Form

See `src/routes/_authenticated/patients/$id.tsx` for a comprehensive example showing:

- Multi-section form with `FormGroup`
- Field validation with Valibot
- Form submission with error handling
- Loading states and optimistic updates
- Delete confirmation dialog

### Simple Contact Form

```tsx
import { createForm } from '@tanstack/solid-form'
import * as v from 'valibot'
import { FormContainer, FormInput, FormTextarea, FormActions } from '~/components/forms'
import { valibotValidator } from '~/lib/form-utils'
import { emailSchema, nameSchema } from '~/lib/validation-schemas'
import { Button } from '~/components/ui'

const contactSchema = v.object({
  name: nameSchema,
  email: emailSchema,
  message: v.pipe(v.string(), v.nonEmpty('Message is required.')),
})

function ContactForm() {
  const form = createForm(() => ({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
    onSubmit: async ({ value }) => {
      const data = v.parse(contactSchema, value)
      await sendContactMessage(data)
    },
  }))

  return (
    <FormContainer
      title="Contact Us"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="name"
        validators={{ onChange: valibotValidator(nameSchema) }}
        children={(field) => (
          <FormInput field={field()} label="Name" required />
        )}
      />

      <form.Field
        name="email"
        validators={{ onChange: valibotValidator(emailSchema) }}
        children={(field) => (
          <FormInput field={field()} label="Email" type="email" required />
        )}
      />

      <form.Field
        name="message"
        children={(field) => (
          <FormTextarea
            field={field()}
            label="Message"
            placeholder="Your message..."
            required
          />
        )}
      />

      <FormActions>
        <Button type="submit">Send Message</Button>
      </FormActions>
    </FormContainer>
  )
}
```

## Best Practices

### 1. Define Schemas First

Always define your validation schema before creating the form. This ensures type safety.

```tsx
// ✅ Good
const schema = v.object({ /* ... */ })
type FormData = v.InferOutput<typeof schema>

// ❌ Bad - no type inference
const form = createForm(() => ({
  defaultValues: { name: '', email: '' },
}))
```

### 2. Reuse Validation Schemas

Use the pre-built schemas from `validation-schemas.ts` or create your own reusable schemas.

```tsx
// ✅ Good - reusable
import { emailSchema } from '~/lib/validation-schemas'

// ❌ Bad - duplicated validation logic
v.pipe(v.string(), v.email(), v.maxLength(100))
```

### 3. Use Field-Level Validation for Better UX

Validate fields as users type for immediate feedback.

```tsx
<form.Field
  name="email"
  validators={{ onChange: valibotValidator(emailSchema) }}
  children={(field) => <FormInput field={field()} label="Email" />}
/>
```

### 4. Group Related Fields

Use `FormGroup` with `columns` prop for better organization.

```tsx
<FormGroup title="Personal Info" columns={2}>
  {/* Fields */}
</FormGroup>
```

### 5. Handle Async Validation Properly

Use debouncing for async validations to avoid excessive API calls.

```tsx
<form.Field
  name="username"
  validators={{
    onChangeAsync: valibotValidatorAsync(asyncUsernameSchema),
    onChangeAsyncDebounceMs: 500,
  }}
  children={(field) => <FormInput field={field()} label="Username" />}
/>
```

### 6. Show Loading States

Always show loading states during form submission.

```tsx
<form.Subscribe
  selector={(state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
  })}
  children={(state) => (
    <Button type="submit" disabled={!state().canSubmit}>
      {state().isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  )}
/>
```

### 7. Provide Clear Error Messages

Write user-friendly validation messages.

```tsx
// ✅ Good
v.pipe(
  v.string(),
  v.email('Please enter a valid email address.')
)

// ❌ Bad
v.pipe(v.string(), v.email())
```

### 8. Use Type Inference

Let TypeScript infer types from your schema.

```tsx
const schema = v.object({ name: v.string(), age: v.number() })
type FormData = v.InferOutput<typeof schema> // { name: string, age: number }
```

## File Structure

```
src/
├── components/
│   └── forms/
│       ├── index.tsx           # Exports all form components
│       ├── FormField.tsx       # Base field wrapper
│       ├── FormInput.tsx       # Text input
│       ├── FormTextarea.tsx    # Multi-line text
│       ├── FormSelect.tsx      # Dropdown select
│       ├── FormCheckbox.tsx    # Checkbox
│       └── FormLayout.tsx      # Layout components
├── lib/
│   ├── form-utils.ts           # Valibot adapter & utilities
│   └── validation-schemas.ts   # Reusable validation schemas
└── routes/
    └── _authenticated/
        └── patients/
            └── $id.tsx         # Example form implementation
```

## TypeScript Support

All form components are fully typed with TypeScript. Use type inference for the best experience:

```tsx
const schema = v.object({
  name: v.string(),
  age: v.number(),
})

// Type is automatically inferred
type FormData = v.InferOutput<typeof schema>

const form = createForm(() => ({
  defaultValues: {
    name: '',
    age: 0,
  } as FormData, // Full type safety
  onSubmit: async ({ value }) => {
    // value is typed as FormData
  },
}))
```

## Performance Tips

1. **Use `createForm` with a factory function** - Ensures proper reactivity
2. **Debounce async validations** - Use `onChangeAsyncDebounceMs`
3. **Use `form.Subscribe` selectively** - Only subscribe to needed state
4. **Memoize complex schemas** - Define schemas outside components when possible

## Accessibility

All form components include:

- Proper `label` and `id` associations
- ARIA attributes (`aria-invalid`, `aria-describedby`)
- Error announcements with `role="alert"`
- Keyboard navigation support
- Focus management

## Further Reading

- [TanStack Form Docs](https://tanstack.com/form/latest)
- [Valibot Docs](https://valibot.dev)
- [SolidJS Docs](https://solidjs.com)
