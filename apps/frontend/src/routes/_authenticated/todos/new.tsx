import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"

import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Textarea, Select, Checkbox, Button } from "@/components/forms"
import { TodoFormSchema } from "@/types/schemas"

export const Route = createFileRoute('/_authenticated/todos/new')({
  component: AddTodoPage,
})

function AddTodoPage() {
  const navigate = useNavigate()
  const createTodo = useCreateRecord("todos")

  // Get tomorrow's date in YYYY-MM-DD format for default due date
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const todoForm = createForm({
    schema: TodoFormSchema,
    initialInput: {
      completed: false,
      dueDate: getTomorrowDate(),
      priority: 'medium',
    },
    validate: 'blur',
    revalidate: 'input',
  })

  const handleSubmit: SubmitHandler<typeof TodoFormSchema> = async (values) => {
    try {
      console.log('📝 Submitting todo:', values)
      await createTodo.mutateAsync(values)
      toast.success('Todo created successfully!')
      navigate({ to: '/todos' })
    } catch (error: any) {
      console.error('❌ Error creating todo:', error)
      toast.error(error.message || 'Failed to create todo')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Add New Todo
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Create a new task to track and manage your work
          </p>
        </div>

        <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6 sm:p-8">
          <Form of={todoForm} onSubmit={handleSubmit} class="space-y-8">
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Task Details
                </h2>

                <div class="mb-5">
                  <Field of={todoForm} path={['title']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Title"
                        placeholder="Enter task title"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        required
                      />
                    )}
                  </Field>
                </div>

                <div class="mb-5">
                  <Field of={todoForm} path={['description']}>
                    {(field) => (
                      <Textarea
                        {...field.props}
                        label="Description"
                        placeholder="Add details about this task (optional)"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        rows={4}
                      />
                    )}
                  </Field>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field of={todoForm} path={['priority']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Priority"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        placeholder="Select priority"
                        options={[
                          { value: 'low', label: '🟢 Low' },
                          { value: 'medium', label: '🟡 Medium' },
                          { value: 'high', label: '🟠 High' },
                          { value: 'urgent', label: '🔴 Urgent' },
                        ]}
                      />
                    )}
                  </Field>

                  <Field of={todoForm} path={['category']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Category"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        placeholder="Select category"
                        options={[
                          { value: 'administrative', label: '📋 Administrative' },
                          { value: 'clinical', label: '🏥 Clinical' },
                          { value: 'financial', label: '💰 Financial' },
                          { value: 'operational', label: '⚙️ Operational' },
                          { value: 'patient_care', label: '🏥 Patient Care' },
                          { value: 'other', label: '📌 Other' },
                        ]}
                      />
                    )}
                  </Field>
                </div>

                <div class="mt-5">
                  <Field of={todoForm} path={['dueDate']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        type="date"
                        label="Due Date"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>

            <div class="space-y-6 pt-6 border-t border-[var(--color-border-primary)]">
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Assignment (Optional)
                </h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field of={todoForm} path={['assignedTo']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Assigned To"
                        placeholder="User ID (optional)"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>

                  <Field of={todoForm} path={['relatedPatient']}>
                    {(field) => (
                      <TextInput
                        {...field.props}
                        label="Related Patient"
                        placeholder="Patient ID (optional)"
                        value={field.input}
                        errors={field.errors ?? undefined}
                      />
                    )}
                  </Field>
                </div>

                <p class="mt-3 text-sm text-[var(--color-text-secondary)]">
                  💡 Tip: Link this task to a user or patient for better organization
                </p>
              </div>
            </div>

            <div class="pt-6 border-t border-[var(--color-border-primary)]">
              <Field of={todoForm} path={['completed']}>
                {(field) => (
                  <Checkbox
                    {...field.props}
                    label="Mark as completed"
                    checked={!!field.input}
                  />
                )}
              </Field>
            </div>

            <div class="flex items-center gap-3 pt-6 border-t border-[var(--color-border-primary)]">
              <Button
                type="submit"
                variant="primary"
                loading={todoForm.isSubmitting}
                disabled={todoForm.isSubmitting || !todoForm.isDirty}
              >
                Create Task
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate({ to: "/todos" })}
                disabled={todoForm.isSubmitting}
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
