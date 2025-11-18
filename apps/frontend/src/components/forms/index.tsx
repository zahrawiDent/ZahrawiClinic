/**
 * Form Components Library
 * 
 * A comprehensive set of form components for use with Modular Forms
 * All components support:
 * - Light/dark mode using CSS variables
 * - Validation error display
 * - Accessibility (ARIA attributes)
 * - Consistent styling and UX
 * 
 * @example
 * import { TextInput, Checkbox, Button, FormCard, FormActions } from '@/components/forms'
 * 
 * <FormCard title="Add Todo">
 *   <Form onSubmit={handleSubmit}>
 *     <Field name="title">
 *       {(field, props) => (
 *         <TextInput
 *           {...props}
 *           name="title"
 *           label="Title"
 *           value={field.value}
 *           error={field.error}
 *           required
 *         />
 *       )}
 *     </Field>
 *     <FormActions>
 *       <Button type="submit">Save</Button>
 *     </FormActions>
 *   </Form>
 * </FormCard>
 */

// Input Components
export { TextInput } from './TextInput'
export { Textarea } from './Textarea'
export { Checkbox } from './Checkbox'
export { Select, type SelectOption } from './Select'
export { RadioGroup, type RadioOption } from './Radio'

// Button Component
export { Button } from './Button'

// Layout Components
export { FormCard } from './FormCard'
export { FormGroup } from './FormGroup'
export { FormActions } from './FormActions'
