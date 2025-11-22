import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Textarea, Select, Checkbox, Button } from "@/components/forms"
import { TaskFormSchema } from "@/types/schemas"
import { PRIORITY_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants/tasks"

export const Route = createFileRoute('/_authenticated/tasks/new')({
  component: AddTaskPage,
})

function AddTaskPage() {
  const navigate = useNavigate()
  const createTask = useCreateRecord("tasks")

  // Get tomorrow's date in YYYY-MM-DD format for default due date
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const taskForm = createForm({
    schema: TaskFormSchema,
    initialInput: {
      completed: false,
      dueDate: getTomorrowDate(),
      priority: 'medium',
      category: "administrative"
    },
    validate: 'blur',
    revalidate: 'input',
  })

  const handleSubmit: SubmitHandler<typeof TaskFormSchema> = async (values) => {
    try {
      console.log('📝 Submitting task:', values)
      await createTask.mutateAsync(values)
      toast.success('Task created successfully!')
      navigate({ to: '/tasks' })
    } catch (error: any) {
      console.error('❌ Error creating task:', error)
      toast.error(error.message || 'Failed to create task')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Add New Task
          </h1>
          <p class="text-[var(--color-text-secondary)]">
            Create a new task to track and manage your work
          </p>
        </div>

        <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6 sm:p-8">
          <Form of={taskForm} onSubmit={handleSubmit} class="space-y-8">
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Task Details
                </h2>

                <div class="mb-5">
                  <Field of={taskForm} path={['title']}>
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
                  <Field of={taskForm} path={['description']}>
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
                  <Field of={taskForm} path={['priority']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Priority"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        placeholder="Select priority"
                        options={PRIORITY_OPTIONS}
                      />
                    )}
                  </Field>

                  <Field of={taskForm} path={['category']}>
                    {(field) => (
                      <Select
                        {...field.props}
                        label="Category"
                        value={field.input}
                        errors={field.errors ?? undefined}
                        placeholder="Select category"
                        options={CATEGORY_OPTIONS}
                      />
                    )}
                  </Field>
                </div>

                <div class="mt-5">
                  <Field of={taskForm} path={['dueDate']}>
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
                  <Field of={taskForm} path={['assignedTo']}>
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

                  <Field of={taskForm} path={['relatedPatient']}>
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
              <Field of={taskForm} path={['completed']}>
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
                loading={taskForm.isSubmitting}
                disabled={taskForm.isSubmitting || !taskForm.isDirty}
              >
                Create Task
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate({ to: "/tasks" })}
                disabled={taskForm.isSubmitting}
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
