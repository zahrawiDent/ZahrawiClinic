import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useRecord, useUpdateRecord, useDeleteRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form, reset } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Textarea, Select, Checkbox, Button } from "@/components/forms"
import { TaskFormSchema } from "@/types/schemas"
import { createEffect, Show } from "solid-js"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { createSignal } from "solid-js"

export const Route = createFileRoute('/_authenticated/tasks/$id')({
  component: EditTaskPage,
})

function EditTaskPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const taskQuery = useRecord("tasks", () => params().id)
  const updateTask = useUpdateRecord("tasks")
  const deleteTask = useDeleteRecord("tasks")
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false)

  const taskForm = createForm({
    schema: TaskFormSchema,
    initialInput: {
      completed: false,
    },
    validate: 'blur',
    revalidate: 'input',
  })

  // Populate form when task data loads
  createEffect(() => {
    const task = taskQuery.data
    if (task) {
      console.log('📋 Loading task into form:', task)
      // Reset form with task data
      reset(taskForm, {
        initialInput: {
          title: task.title || '',
          description: task.description || '',
          priority: task.priority,
          category: task.category,
          dueDate: task.dueDate || '',
          assignedTo: task.assignedTo || '',
          relatedPatient: task.relatedPatient || '',
          completed: task.completed || false,
        }
      })
    }
  })

  const handleSubmit: SubmitHandler<typeof TaskFormSchema> = async (values) => {
    try {
      console.log('💾 Updating task:', values)
      await updateTask.mutateAsync({ id: params().id, data: values })
      toast.success('Task updated successfully!')
      navigate({ to: '/tasks' })
    } catch (error: any) {
      console.error('❌ Error updating task:', error)
      toast.error(error.message || 'Failed to update task')
    }
  }

  const handleDelete = async () => {
    try {
      console.log('🗑️ Deleting task:', params().id)
      await deleteTask.mutateAsync(params().id)
      toast.success('Task deleted successfully!')
      navigate({ to: '/tasks' })
    } catch (error: any) {
      console.error('❌ Error deleting task:', error)
      toast.error(error.message || 'Failed to delete task')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <Show when={!taskQuery.isLoading} fallback={
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            <p class="mt-4 text-[var(--color-text-secondary)]">Loading task...</p>
          </div>
        }>
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Edit Task
            </h1>
            <p class="text-[var(--color-text-secondary)]">
              Update your task details
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
                          options={[
                            { value: 'low', label: '🟢 Low' },
                            { value: 'medium', label: '🟡 Medium' },
                            { value: 'high', label: '🟠 High' },
                            { value: 'urgent', label: '🔴 Urgent' },
                          ]}
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

              <div class="flex items-center justify-between gap-3 pt-6 border-t border-[var(--color-border-primary)]">
                <div class="flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={taskForm.isSubmitting}
                    disabled={taskForm.isSubmitting || !taskForm.isDirty}
                  >
                    Save Changes
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

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={taskForm.isSubmitting || deleteTask.isPending}
                >
                  Delete
                </Button>
              </div>
            </Form>

            <Show when={taskQuery.data}>
              <div class="mt-8 pt-8 border-t border-[var(--color-border-primary)]">
                <h3 class="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                  Metadata
                </h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-[var(--color-text-secondary)]">Created:</span>
                    <span class="ml-2 text-[var(--color-text-primary)]">
                      {new Date(taskQuery.data!.created).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span class="text-[var(--color-text-secondary)]">Updated:</span>
                    <span class="ml-2 text-[var(--color-text-primary)]">
                      {new Date(taskQuery.data!.updated).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog()}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
