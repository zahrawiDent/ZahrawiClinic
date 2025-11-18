import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import * as v from 'valibot';

import { createForm, valiForm, type SubmitHandler } from '@modular-forms/solid';
import { TextInput } from "@/components/forms/TextInput";
import { Checkbox } from "@/components/forms/Checkbox";
import { Button } from "@/components/forms/Button";

export const Route = createFileRoute('/_authenticated/todos/new')({
  component: AddTodoPage,
})




const TodoSchema = v.object({
  title: v.pipe(
    v.string(),
    v.nonEmpty('Title is required.'),
    v.minLength(3, 'Title must be at least 3 characters.'),
  ),
  completed: v.boolean(),
})
type TodoFormData = v.InferOutput<typeof TodoSchema>

function AddTodoPage() {
  const navigate = useNavigate()
  const createTodo = useCreateRecord("todos")

  // Initialize form with validation settings
  const [todoForm, { Form, Field }] = createForm<TodoFormData>({
    // Validate on blur (when user leaves the field)
    validateOn: 'blur',
    // After first validation, revalidate on input for immediate feedback
    revalidateOn: 'input',
    // Validate with Valibot schema on submit
    validate: valiForm(TodoSchema),
  })

  // Handle form submission - only runs if validation passes
  const handleSubmit: SubmitHandler<TodoFormData> = async (values) => {
    try {
      await createTodo.mutateAsync(values)
      toast.success('Todo created successfully!')
      navigate({ to: '/todos' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create todo')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-2xl mx-auto">
        {/* Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Add New Todo
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Create a new task to track your work
          </p>
        </div>

        {/* Form Card */}
        <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6 sm:p-8">
          <Form onSubmit={handleSubmit} class="space-y-6">
            {/* Title Field - validates on blur */}
            <Field name="title">
              {(field, props) => (
                <TextInput
                  {...props}
                  name="title"
                  label="Title"
                  placeholder="Enter todo title"
                  value={field.value}
                  error={field.error}
                  required
                />
              )}
            </Field>

            {/* Completed Checkbox */}
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

            {/* Actions */}
            <div class="flex items-center gap-3 pt-4 border-t border-[var(--color-border-primary)]">
              <Button
                type="submit"
                variant="primary"
                // loading={todoForm.submitting}
                disabled={todoForm.submitting}
              >
                {todoForm.submitting ? 'Adding...' : 'Add Todo'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate({ to: "/todos" })}
                disabled={todoForm.submitting}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
