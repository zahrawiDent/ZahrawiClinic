import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { Show, Suspense, createEffect } from "solid-js"
import { useRecord, useUpdateRecord, useDeleteRecord, useRealtimeRecord } from "@/lib/queries"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BackButton } from "@/components/back-button"
import { pb } from "@/lib/pocketbase"
import { queryClient } from "@/lib/query-client"
import { toast } from "@/components/toast"
import { createForm, valiForm, type SubmitHandler, reset } from '@modular-forms/solid'
import * as v from 'valibot'
import { TextInput } from "@/components/forms/TextInput"
import { Checkbox } from "@/components/forms/Checkbox"
import { Button } from "@/components/forms/Button"

export const Route = createFileRoute("/_authenticated/todos/$id")({
  component: TodoDetailPage,
  beforeLoad: async ({ params, context }) => {
    // Fetch the todo once - use it for both breadcrumb AND cache seeding
    try {
      const todo = await pb.collection("todos").getOne(params.id)

      // Pre-populate the TanStack Query cache so useRecord doesn't refetch
      queryClient.setQueryData(["todos", params.id], todo)

      const truncatedTitle = todo.title.length > 30 ? `${todo.title.substring(0, 30)}...` : todo.title
      return {
        ...context,
        breadcrumb: truncatedTitle,
      }
    } catch (error) {
      return context
    }
  },
})



// Todo Schema
const TodoSchema = v.object({
  title: v.pipe(
    v.string(),
    v.nonEmpty('Title is required.'),
    v.minLength(3, 'Title must be at least 3 characters.'),
  ),
  completed: v.boolean(),
})
type TodoFormData = v.InferOutput<typeof TodoSchema>

/**
 * 🎯 Individual Todo Detail & Edit Page
 * =====================================
 * 
 * Enhanced with:
 * - ✅ Modular Forms with Valibot validation
 * - 🎯 Only dirty values sent to server (reduces network traffic)
 * - 🔄 Realtime updates
 * - ⚡ Optimistic UI updates
 * - 🎨 Modern, elegant UI matching new.tsx
 */
function TodoDetailPage() {
  const params = Route.useParams()
  const navigate = useNavigate()

  // 📄 Fetch the specific todo record
  const todo = useRecord("todos", () => params().id)

  // 🔄 Subscribe to realtime updates for THIS specific todo
  useRealtimeRecord("todos", () => params().id, (event) => {
    console.log("🔄 Realtime event for todo:", event.action, event.record)
    // Reset form with new data when realtime update arrives
    if (event.action === 'update' && event.record) {
      reset(todoForm, {
        initialValues: {
          title: event.record.title,
          completed: event.record.completed,
        }
      })
    }
  })

  // ✏️ Initialize form with shouldDirty to only send modified values
  const [todoForm, { Form, Field }] = createForm<TodoFormData>({
    validateOn: 'blur',
    revalidateOn: 'input',
    validate: valiForm(TodoSchema),
  })

  // Initialize form values when data loads
  createEffect(() => {
    if (todo.data) {
      reset(todoForm, {
        initialValues: {
          title: todo.data.title,
          completed: todo.data.completed,
        }
      })
    }
  })

  // ✏️ Update mutation
  const updateTodo = useUpdateRecord("todos")

  // 🗑️ Delete mutation
  const deleteTodo = useDeleteRecord("todos")
  const confirmDialog = useConfirmationDialog()

  // Handle form submission - only sends dirty (changed) values
  const handleSubmit: SubmitHandler<TodoFormData> = async (values) => {
    try {
      // Get only the dirty fields - compare with original data
      const updates: Partial<TodoFormData> = {}

      // Check which fields are dirty (have been modified)
      if (values.title !== todo.data?.title) {
        updates.title = values.title
      }
      if (values.completed !== todo.data?.completed) {
        updates.completed = values.completed
      }

      // Only send update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateTodo.mutateAsync({
          id: params().id,
          ...updates,
        })
        toast.success('Todo updated successfully!')
      } else {
        toast.info('No changes to save')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update todo')
    }
  }

  const handleDelete = (title: string) => {
    confirmDialog.confirm({
      title: "Delete Todo",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        deleteTodo.mutate(params().id, {
          onSuccess: () => {
            toast.success('Todo deleted successfully!')
            navigate({ to: "/todos" })
          },
        })
      },
    })
  }

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <div class="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
        <div class="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div class="mb-4">
            <Breadcrumbs separator="›" />
          </div>

          {/* Back Button */}
          <div class="mb-6">
            <BackButton fallbackTo="/todos" label="Back to Todos" />
          </div>

          <Suspense
            fallback={
              <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-8">
                <div class="flex flex-col items-center justify-center gap-3">
                  <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-brand-primary)]"></div>
                  <p class="text-[var(--color-text-tertiary)]">Loading todo...</p>
                </div>
              </div>
            }
          >
            <Show
              when={!todo.isLoading && todo.data}
              fallback={
                <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-8">
                  <Show when={todo.isError}>
                    <div class="text-center">
                      <p class="text-[var(--color-error)] font-medium">
                        Error: {todo.error?.message || "Failed to load todo"}
                      </p>
                    </div>
                  </Show>
                </div>
              }
            >
              {(data) => (
                <div class="space-y-6">
                  {/* Header Card */}
                  <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6">
                    <div class="flex items-center justify-between">
                      <div>
                        <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                          Edit Todo
                        </h1>
                        <p class="text-[var(--color-text-secondary)] text-sm">
                          Make changes and only modified fields will be saved
                        </p>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class={`px-4 py-2 rounded-lg text-sm font-medium ${data().completed
                          ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]"
                          : "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]"
                          }`}>
                          {data().completed ? "✅ Completed" : "⏳ Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form Card */}
                  <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6 sm:p-8">
                    <Form onSubmit={handleSubmit} shouldDirty class="space-y-6">
                      {/* Title Field */}
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

                      {/* Dirty Fields Indicator */}
                      <Show when={todoForm.dirty}>
                        <div class="bg-[var(--color-info-bg)] border border-[var(--color-info-border)] rounded-lg p-4">
                          <div class="flex items-center gap-2 text-[var(--color-info-text)]">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-sm font-medium">
                              You have unsaved changes
                            </span>
                          </div>
                        </div>
                      </Show>

                      {/* Actions */}
                      <div class="flex items-center gap-3 pt-4 border-t border-[var(--color-border-primary)]">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={todoForm.submitting}
                          disabled={todoForm.submitting || !todoForm.dirty}
                        >
                          {todoForm.submitting ? 'Saving...' : 'Save Changes'}
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => {
                            reset(todoForm)
                            toast.info('Changes discarded')
                          }}
                          disabled={todoForm.submitting || !todoForm.dirty}
                        >
                          Reset
                        </Button>

                        <div class="flex-1"></div>

                        <Button
                          variant="danger"
                          onClick={() => handleDelete(data().title)}
                          disabled={deleteTodo.isPending}
                          loading={deleteTodo.isPending}
                        >
                          {deleteTodo.isPending ? 'Deleting...' : 'Delete Todo'}
                        </Button>
                      </div>
                    </Form>
                  </div>

                  {/* Metadata Card */}
                  <div class="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-6">
                    <h3 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                      Todo Information
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p class="text-sm text-[var(--color-text-tertiary)] mb-1">ID</p>
                        <p class="text-[var(--color-text-primary)] font-mono text-sm">
                          {data().id}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm text-[var(--color-text-tertiary)] mb-1">Created</p>
                        <p class="text-[var(--color-text-primary)] text-sm">
                          {new Date(data().created).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm text-[var(--color-text-tertiary)] mb-1">Last Updated</p>
                        <p class="text-[var(--color-text-primary)] text-sm">
                          {new Date(data().updated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div class="bg-gradient-to-br from-[var(--gradient-primary-from)] to-[var(--gradient-primary-to)] rounded-xl border border-[var(--color-border-primary)] p-6">
                    <h3 class="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                      💡 Smart Form Features
                    </h3>
                    <div class="space-y-2 text-sm text-[var(--color-text-secondary)]">
                      <div class="flex items-start gap-2">
                        <span class="text-lg">🎯</span>
                        <div>
                          <strong>Dirty Values Only:</strong> Only modified fields are sent to the server, reducing network traffic.
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="text-lg">✅</span>
                        <div>
                          <strong>Valibot Validation:</strong> Client-side validation with blur and submit triggers.
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="text-lg">🔄</span>
                        <div>
                          <strong>Realtime Updates:</strong> Form resets with new values when another user updates this todo.
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="text-lg">🎨</span>
                        <div>
                          <strong>Modern UI:</strong> Clean, elegant design that works perfectly in light and dark modes.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      </div>
    </>
  )
}
