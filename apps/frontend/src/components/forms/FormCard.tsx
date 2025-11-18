import { type JSX, type ParentComponent } from "solid-js"

type FormCardProps = {
  title?: string
  description?: string
  class?: string
  children: JSX.Element
}

/**
 * FormCard - Card container for forms
 * 
 * @example
 * <FormCard title="Edit Profile" description="Update your information">
 *   <Form>...</Form>
 * </FormCard>
 */
export const FormCard: ParentComponent<FormCardProps> = (props) => {
  return (
    <div class={`bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] ${props.class || ''}`}>
      {(props.title || props.description) && (
        <div class="px-6 py-5 border-b border-[var(--color-border-primary)]">
          {props.title && (
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">
              {props.title}
            </h2>
          )}
          {props.description && (
            <p class="text-sm text-[var(--color-text-secondary)] mt-1">
              {props.description}
            </p>
          )}
        </div>
      )}
      <div class="p-6 sm:p-8">
        {props.children}
      </div>
    </div>
  )
}
