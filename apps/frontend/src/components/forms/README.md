# Form Components Library

A comprehensive, reusable form components library for the dental clinic application. All components are built with:

- ✅ **Modular Forms** compatibility
- 🎨 **Light/Dark mode** support using CSS variables
- ♿ **Full accessibility** with ARIA attributes
- 🎯 **Type safety** with TypeScript
- 💫 **Smooth animations** and transitions
- 📱 **Responsive** design

## Components

### Input Components

#### TextInput
Standard text input with various types.

```tsx
<Field name="email">
  {(field, props) => (
    <TextInput
      {...props}
      name="email"
      type="email"
      label="Email Address"
      placeholder="you@example.com"
      value={field.value}
      error={field.error}
      required
    />
  )}
</Field>
```

**Props:**
- `type`: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date'
- `label`: Label text
- `placeholder`: Placeholder text
- `required`: Shows asterisk
- `error`: Error message to display

---

#### Textarea
Multi-line text input with character counter.

```tsx
<Field name="notes">
  {(field, props) => (
    <Textarea
      {...props}
      name="notes"
      label="Notes"
      placeholder="Enter notes..."
      value={field.value}
      error={field.error}
      rows={4}
      maxLength={500}
    />
  )}
</Field>
```

**Props:**
- `rows`: Number of visible rows (default: 4)
- `maxLength`: Character limit with counter
- Other props same as TextInput

---

#### Checkbox
Styled checkbox with custom checkmark icon.

```tsx
<Field name="completed" type="boolean">
  {(field, props) => (
    <Checkbox
      {...props}
      name="completed"
      label="Mark as completed"
      checked={field.value ?? false}
    />
  )}
</Field>
```

**Features:**
- Custom checkmark icon
- Smooth animations
- Hover effects on label

---

#### Select
Dropdown select with custom styling.

```tsx
<Field name="status">
  {(field, props) => (
    <Select
      {...props}
      name="status"
      label="Status"
      placeholder="Select status..."
      value={field.value}
      error={field.error}
      options={[
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending', disabled: true },
      ]}
      required
    />
  )}
</Field>
```

**Props:**
- `options`: Array of `{ value, label, disabled? }`
- Custom dropdown arrow
- Placeholder support

---

#### RadioGroup
Radio button group with inline or stacked layout.

```tsx
<Field name="gender">
  {(field, props) => (
    <RadioGroup
      {...props}
      name="gender"
      label="Gender"
      value={field.value}
      error={field.error}
      options={[
        { value: 'male', label: 'Male', description: 'Male patient' },
        { value: 'female', label: 'Female', description: 'Female patient' },
      ]}
      inline={false}
      required
    />
  )}
</Field>
```

**Props:**
- `options`: Array of `{ value, label, description?, disabled? }`
- `inline`: Display horizontally or vertically

---

### Button Component

Versatile button with multiple variants and states.

```tsx
<Button 
  type="submit" 
  variant="primary" 
  loading={form.submitting}
  disabled={!form.dirty}
>
  Save Changes
</Button>

<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

<Button variant="danger" loading={isDeleting}>
  Delete
</Button>
```

**Variants:**
- `primary`: Brand primary color (default)
- `secondary`: Gray with border
- `danger`: Red for destructive actions
- `success`: Green for positive actions
- `ghost`: Transparent background

**Sizes:**
- `sm`: Small button
- `md`: Medium (default)
- `lg`: Large button

**Props:**
- `loading`: Shows spinner, disables button
- `disabled`: Disables button
- `fullWidth`: Makes button full width
- `type`: 'button' | 'submit' | 'reset'

---

### Layout Components

#### FormCard
Card container for forms with optional header.

```tsx
<FormCard 
  title="Edit Profile" 
  description="Update your personal information"
>
  <Form onSubmit={handleSubmit}>
    {/* Form fields */}
  </Form>
</FormCard>
```

**Features:**
- Rounded corners with shadow
- Optional title and description
- Proper padding and spacing
- Border using theme colors

---

#### FormGroup
Groups related fields with optional title.

```tsx
<FormGroup 
  title="Contact Information" 
  description="How we'll reach you"
>
  <Field name="email">...</Field>
  <Field name="phone">...</Field>
</FormGroup>
```

**Use Cases:**
- Grouping related fields
- Adding section headers
- Organizing complex forms

---

#### FormActions
Container for form action buttons with alignment options.

```tsx
<FormActions align="right">
  <Button type="submit" loading={form.submitting}>
    Save
  </Button>
  <Button variant="secondary" onClick={onCancel}>
    Cancel
  </Button>
</FormActions>

<FormActions align="between">
  <Button variant="danger">Delete</Button>
  <div class="flex gap-3">
    <Button type="submit">Save</Button>
    <Button variant="secondary">Cancel</Button>
  </div>
</FormActions>
```

**Alignment:**
- `left`: Align to left
- `right`: Align to right (default)
- `center`: Center buttons
- `between`: Space between buttons

---

## Complete Example

```tsx
import { createForm, valiForm, type SubmitHandler } from '@modular-forms/solid'
import * as v from 'valibot'
import { 
  TextInput, 
  Textarea, 
  Checkbox, 
  Select, 
  RadioGroup, 
  Button,
  FormCard,
  FormGroup,
  FormActions 
} from '@/components/forms'

const Schema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  role: v.string(),
  gender: v.string(),
  subscribe: v.boolean(),
  bio: v.string(),
})

function MyForm() {
  const [form, { Form, Field }] = createForm({
    validate: valiForm(Schema),
    validateOn: 'blur',
    revalidateOn: 'input',
  })

  const handleSubmit: SubmitHandler<typeof Schema> = async (values) => {
    console.log(values)
  }

  return (
    <FormCard title="User Profile" description="Update your details">
      <Form onSubmit={handleSubmit} class="space-y-6">
        <FormGroup title="Basic Information">
          <Field name="name">
            {(field, props) => (
              <TextInput
                {...props}
                label="Full Name"
                value={field.value}
                error={field.error}
                required
              />
            )}
          </Field>

          <Field name="email">
            {(field, props) => (
              <TextInput
                {...props}
                type="email"
                label="Email"
                value={field.value}
                error={field.error}
                required
              />
            )}
          </Field>

          <Field name="gender">
            {(field, props) => (
              <RadioGroup
                {...props}
                label="Gender"
                value={field.value}
                error={field.error}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                inline
              />
            )}
          </Field>
        </FormGroup>

        <FormGroup title="Additional Details">
          <Field name="role">
            {(field, props) => (
              <Select
                {...props}
                label="Role"
                value={field.value}
                error={field.error}
                placeholder="Select a role"
                options={[
                  { value: 'admin', label: 'Administrator' },
                  { value: 'user', label: 'User' },
                ]}
              />
            )}
          </Field>

          <Field name="bio">
            {(field, props) => (
              <Textarea
                {...props}
                label="Bio"
                value={field.value}
                error={field.error}
                rows={4}
                maxLength={500}
              />
            )}
          </Field>

          <Field name="subscribe" type="boolean">
            {(field, props) => (
              <Checkbox
                {...props}
                label="Subscribe to newsletter"
                checked={field.value ?? false}
              />
            )}
          </Field>
        </FormGroup>

        <FormActions align="right">
          <Button 
            type="submit" 
            loading={form.submitting}
            disabled={!form.dirty}
          >
            Save Changes
          </Button>
          <Button variant="secondary" onClick={() => reset(form)}>
            Reset
          </Button>
        </FormActions>
      </Form>
    </FormCard>
  )
}
```

## CSS Variables Used

All components use these CSS variables for consistent theming:

### Colors
- `--color-bg-primary` - Primary background
- `--color-bg-secondary` - Secondary background
- `--color-bg-tertiary` - Tertiary background
- `--color-text-primary` - Primary text
- `--color-text-secondary` - Secondary text
- `--color-text-tertiary` - Tertiary text
- `--color-text-inverse` - Inverse text (for buttons)

### Borders & Focus
- `--color-border-primary` - Primary border
- `--color-border-secondary` - Secondary border
- `--color-border-focus` - Focus state border

### Brand & States
- `--color-brand-primary` - Primary brand color
- `--color-brand-primary-hover` - Primary hover state
- `--color-error` - Error color
- `--color-error-text` - Error text color
- `--color-error-hover` - Error hover state
- `--color-success` - Success color
- `--color-success-hover` - Success hover state

## Best Practices

1. **Always spread props** from Field component
```tsx
<Field name="email">
  {(field, props) => <TextInput {...props} />}
</Field>
```

2. **Use FormCard** for consistent form layouts
3. **Group related fields** with FormGroup
4. **Use FormActions** for button containers
5. **Enable shouldDirty** for edit forms to only send changed values
6. **Validate on blur** for better UX (don't validate while typing)

## Accessibility

All components include:
- Proper ARIA attributes (`aria-invalid`, `aria-required`, `aria-errormessage`)
- Associated labels with `for` attributes
- Error announcements with `role="alert"`
- Keyboard navigation support
- Focus indicators
- Disabled states

## Dark Mode

All components automatically support dark mode through CSS variables. No additional configuration needed.
