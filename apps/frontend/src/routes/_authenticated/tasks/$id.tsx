import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useRecord, useUpdateRecord, useDeleteRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { createForm, Field, Form, reset } from '@formisch/solid'
import type { SubmitHandler } from '@formisch/solid'
import { TextInput, Textarea, Select, Checkbox, Button } from "@/components/forms"
import { TaskFormSchema } from "@/types/schemas"
import { createEffect, createSignal, Show } from "solid-js"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { PRIORITY_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants/tasks"

export const Route = createFileRoute('/_authenticated/tasks/$id')({
  component: EditTaskPage,
})

function EditTaskPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const taskQuery = useRecord("tasks", () => params().id, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })
  const updateTask = useUpdateRecord("tasks")
  const deleteTask = useDeleteRecord("tasks")
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false)
  const [formInitialized, setFormInitialized] = createSignal(false)

  const taskForm = createForm({
    schema: TaskFormSchema,
    initialInput: { completed: false },
    validate: 'blur',
    revalidate: 'input',
  })

  // Initialize form with task data once
  createEffect(() => {
    const task = taskQuery.data
    if (task && !formInitialized()) {
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
      setFormInitialized(true)
    }
  })

  const handleSubmit: SubmitHandler<typeof TaskFormSchema> = async (values) => {
    try {
      await updateTask.mutateAsync({ id: params().id, ...values })
      toast.success('Task updated successfully!')
      navigate({ to: '/tasks' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(params().id)
      toast.success('Task deleted successfully!')
      navigate({ to: '/tasks' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task')
    }
  }

  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <Show 
          when={!taskQuery.isLoading} 
          fallback={
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
              <p class="mt-4 text-[var(--color-text-secondary)]">Loading task...</p>
            </div>
          }
        >
          {/* Header */}
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Edit Task</h1>
            <p class="text-[var(--color-text-secondary)]">Update your task details</p>
          </div>

          {/* Form */}
          <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6 sm:p-8">
            <Form of={taskForm} onSubmit={handleSubmit} class="space-y-8">
              {/* Task Details */}
              <div>
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Task Details</h2>
                
                <div class="space-y-5">
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

              {/* Assignment */}
              <div class="pt-6 border-t border-[var(--color-border-primary)]">
                <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Assignment <span class="text-sm font-normal text-[var(--color-text-secondary)]">(Optional)</span>
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
              </div>

              {/* Status */}
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

              {/* Actions */}
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

            {/* Metadata */}
            <Show when={taskQuery.data}>
              <div class="mt-8 pt-8 border-t border-[var(--color-border-primary)]">
                <h3 class="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Metadata</h3>
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

      {/* Delete Confirmation Dialog */}
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
