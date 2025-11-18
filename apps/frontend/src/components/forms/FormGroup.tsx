import { type JSX, type ParentComponent } from "solid-js"

type FormGroupProps = {
  title?: string
  description?: string
  class?: string
  children: JSX.Element
}

/**
 * FormGroup - Container for grouping related form fields
 * 
 * @example
 * <FormGroup title="Personal Information" description="Basic details">
 *   <Field name="firstName">...</Field>
 *   <Field name="lastName">...</Field>
 * </FormGroup>
 */
export const FormGroup: ParentComponent<FormGroupProps> = (props) => {
  return (
    <div class={`space-y-4 ${props.class || ''}`}>
      {(props.title || props.description) && (
        <div class="space-y-1">
          {props.title && (
            <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">
              {props.title}
            </h3>
          )}
          {props.description && (
            <p class="text-sm text-[var(--color-text-secondary)]">
              {props.description}
            </p>
          )}
        </div>
      )}
      <div class="space-y-6">
        {props.children}
      </div>
    </div>
  )
}
