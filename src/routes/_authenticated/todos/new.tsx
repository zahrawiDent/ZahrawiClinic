import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { useCreateRecord } from "@/lib/queries"
import { createForm } from '@tanstack/solid-form'
import { toast } from "@/components/toast"

export const Route = createFileRoute('/_authenticated/todos/new')({
  component: AddTodoPage,
})

function AddTodoPage() {
  const navigate = useNavigate()
  const createTodo = useCreateRecord("todos")

  // Minimal TanStack Form example
  const form = createForm(() => ({
    defaultValues: {
      title: "",
      completed: false,
    },
    onSubmit: async ({ value }) => {
      // Try direct PocketBase call to bypass any middleware
      createTodo.mutate(value, {
        onSuccess: () => {
          toast.success('Todo created successfully!')
          navigate({ to: '/todos' })
        },
        onError: (error) => {
          toast.error(error.message)
        }
      })
    },
  }))

  return (
    <div style={{ padding: "20px", "max-width": "500px", margin: "0 auto" }}>
      <h1>Add New Todo</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        style={{ display: "flex", "flex-direction": "column", gap: "15px" }}
      >
        {/* Title Field */}
        <form.Field
          name="title"
          children={(field) => (
            <div>
              <label for="title">Title:</label>
              <input
                id="title"
                type="text"
                name={field().name}
                value={field().state.value}
                onInput={(e) => field().handleChange(e.currentTarget.value)}
                onBlur={field().handleBlur}
                placeholder="Enter todo title"
                style={{
                  width: "100%",
                  padding: "8px",
                  "margin-top": "5px",
                  border: "1px solid #ccc",
                  "border-radius": "4px"
                }}
              />
            </div>
          )}
        />

        {/* Completed Checkbox */}
        <form.Field
          name="completed"
          children={(field) => (
            <div>
              <label style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={field().state.value}
                  onChange={(e) => field().handleChange(e.currentTarget.checked)}
                  onBlur={field().handleBlur}
                />
                Mark as completed
              </label>
            </div>
          )}
        />

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "10px", "margin-top": "10px" }}>
          <button
            type="submit"
            disabled={createTodo.isPending}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              "border-radius": "4px",
              cursor: createTodo.isPending ? "not-allowed" : "pointer",
              opacity: createTodo.isPending ? 0.6 : 1
            }}
          >
            {createTodo.isPending ? "Adding..." : "Add Todo"}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/todos" })}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              "border-radius": "4px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </form>

    </div>
  )
}
