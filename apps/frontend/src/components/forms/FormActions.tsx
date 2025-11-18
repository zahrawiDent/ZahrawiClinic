import { type JSX, type ParentComponent } from "solid-js"

type FormActionsProps = {
  align?: 'left' | 'right' | 'center' | 'between'
  class?: string
  children: JSX.Element
}

/**
 * FormActions - Container for form action buttons
 * 
 * @example
 * <FormActions align="right">
 *   <Button type="submit">Save</Button>
 *   <Button variant="secondary">Cancel</Button>
 * </FormActions>
 */
export const FormActions: ParentComponent<FormActionsProps> = (props) => {
  const alignClasses = () => {
    switch (props.align || 'right') {
      case 'left':
        return 'justify-start'
      case 'right':
        return 'justify-end'
      case 'center':
        return 'justify-center'
      case 'between':
        return 'justify-between'
    }
  }

  return (
    <div class={`flex items-center gap-3 pt-6 border-t border-[var(--color-border-primary)] ${alignClasses()} ${props.class || ''}`}>
      {props.children}
    </div>
  )
}
