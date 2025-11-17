# Form Components

Reusable, type-safe form components using TanStack Solid Form and Valibot validation.

## Components

- **FormField** - Base wrapper with error handling and labels
- **FormInput** - Text, email, number, date, and other input types
- **FormTextarea** - Multi-line text input
- **FormSelect** - Dropdown select with options
- **FormCheckbox** - Checkbox with label and description
- **FormContainer** - Main form wrapper with consistent layout
- **FormGroup** - Section grouping with multi-column support
- **FormActions** - Button container with flexible alignment
- **FormDivider** - Visual separator between sections

## Usage

```tsx
import { FormContainer, FormInput, FormActions } from '~/components/forms'
import { valibotValidator } from '~/lib/form-utils'
import { emailSchema } from '~/lib/validation-schemas'

<FormContainer onSubmit={handleSubmit}>
  <form.Field
    name="email"
    validators={{ onChange: valibotValidator(emailSchema) }}
    children={(field) => (
      <FormInput
        field={field()}
        label="Email"
        type="email"
        required
      />
    )}
  />
  <FormActions>
    <Button type="submit">Submit</Button>
  </FormActions>
</FormContainer>
```

## Features

- ✅ Full TypeScript support
- ✅ Real-time validation
- ✅ Accessible (ARIA attributes)
- ✅ Dark mode support
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive layout

## Documentation

See `/docs/FORMS_GUIDE.md` for complete documentation.
See `/docs/FORMS_QUICK_REFERENCE.md` for quick lookup.
