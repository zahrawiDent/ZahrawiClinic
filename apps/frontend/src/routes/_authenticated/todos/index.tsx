import { createFileRoute, Link } from "@tanstack/solid-router"
import { For, Show, Suspense, createSignal, createMemo } from "solid-js"
import { useCollection, useDeleteRecord, useUpdateRecord, useRealtimeCollection } from "@/lib/queries"
import { type TodoRecord } from "@/types/schemas"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { PageLayout, PageContainer, StatsCard, SearchBar, FilterGroup, type FilterOption } from "@/components/ui"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const Route = createFileRoute("/_authenticated/todos/")({
  component: TodosPage,
})

function TodosPage() {
  const todos = useCollection("todos", { sort: "-created" })
  const deleteTodo = useDeleteRecord("todos")
  const updateTodo = useUpdateRecord("todos")
  const confirmDialog = useConfirmationDialog()

  // Enable realtime sync
  useRealtimeCollection("todos")

  // Local state for filters and search
  const [searchQuery, setSearchQuery] = createSignal("")
  const [statusFilter, setStatusFilter] = createSignal<string>("")
  const [priorityFilter, setPriorityFilter] = createSignal<string>("")
  const [categoryFilter, setCategoryFilter] = createSignal<string>("")
  const [sortBy, setSortBy] = createSignal<"created" | "dueDate" | "priority" | "title">("created")
  const [sortOrder, setSortOrder] = createSignal<"asc" | "desc">("desc")
  const [deletingId, setDeletingId] = createSignal<string | null>(null)

  // Filter options
  const statusOptions: FilterOption[] = [
    { value: "active", label: "Active", icon: "🔵" },
    { value: "completed", label: "Completed", icon: "✅" },
  ]

  const priorityOptions: FilterOption[] = [
    { value: "urgent", label: "Urgent", icon: "🔴" },
    { value: "high", label: "High", icon: "🟠" },
    { value: "medium", label: "Medium", icon: "🟡" },
    { value: "low", label: "Low", icon: "⚪" },
  ]

  const categoryOptions: FilterOption[] = [
    { value: "administrative", label: "Administrative", icon: "📋" },
    { value: "clinical", label: "Clinical", icon: "🏥" },
    { value: "follow_up", label: "Follow Up", icon: "📞" },
    { value: "billing", label: "Billing", icon: "💰" },
    { value: "other", label: "Other", icon: "📌" },
  ]

  // Computed filtered and sorted todos
  const filteredTodos = createMemo(() => {
    const items = todos.data?.items || []
    
    return items
      .filter((todo) => {
        // Search filter
        const query = searchQuery().toLowerCase()
        const matchesSearch =
          !query ||
          todo.title.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query)

        // Status filter
        const matchesStatus =
          !statusFilter() ||
          (statusFilter() === "completed" && todo.completed) ||
          (statusFilter() === "active" && !todo.completed)

        // Priority filter
        const matchesPriority = !priorityFilter() || todo.priority === priorityFilter()

        // Category filter
        const matchesCategory = !categoryFilter() || todo.category === categoryFilter()

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory
      })
      .sort((a, b) => {
        const order = sortOrder() === "asc" ? 1 : -1
        
        switch (sortBy()) {
          case "title":
            return order * a.title.localeCompare(b.title)
          case "dueDate":
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return order
            if (!b.dueDate) return -order
            return order * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          case "priority": {
            const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
            const aPriority = priorityOrder[a.priority || "low"] || 1
            const bPriority = priorityOrder[b.priority || "low"] || 1
            return order * (bPriority - aPriority)
          }
          case "created":
          default:
            return order * (new Date(b.created).getTime() - new Date(a.created).getTime())
        }
      })
  })

  // Statistics
  const stats = createMemo(() => {
    const items = filteredTodos()
    return {
      total: items.length,
      completed: items.filter((t) => t.completed).length,
      active: items.filter((t) => !t.completed).length,
      urgent: items.filter((t) => t.priority === "urgent" && !t.completed).length,
    }
  })

  const handleToggleComplete = (todo: TodoRecord) => {
    updateTodo.mutate({
      id: todo.id,
      completed: !todo.completed,
    })
  }

  const handleDelete = (id: string, title: string) => {
    confirmDialog.confirm({
      title: "Delete Todo",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        setDeletingId(id)
        deleteTodo.mutate(id, {
          onSettled: () => setDeletingId(null),
        })
      },
    })
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("")
    setPriorityFilter("")
    setCategoryFilter("")
  }

  const hasActiveFilters = () => {
    return searchQuery() || statusFilter() || priorityFilter() || categoryFilter()
  }

  const toggleSort = (field: typeof sortBy extends () => infer T ? T : never) => {
    if (sortBy() === field) {
      setSortOrder(sortOrder() === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 dark:text-red-400"
      case "high":
        return "text-orange-600 dark:text-orange-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-gray-600 dark:text-gray-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "administrative": return "📋"
      case "clinical": return "🏥"
      case "follow_up": return "📞"
      case "billing": return "💰"
      case "other": return "📌"
      default: return "📝"
    }
  }

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <PageLayout>
        <PageContainer size="full">
          {/* Breadcrumbs */}
          <div class="mb-4">
            <Breadcrumbs separator="›" />
          </div>

          {/* Header */}
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
                ✅ Todo Management
              </h1>
              <Link
                to="/todos/new"
                class="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Todo
              </Link>
            </div>
            <p class="text-[var(--color-text-secondary)]">
              Manage your tasks with advanced filtering and search
            </p>
          </div>

          {/* Stats Cards */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard value={stats().total} label="Total" color="blue" />
            <StatsCard value={stats().active} label="Active" color="orange" />
            <StatsCard value={stats().completed} label="Completed" color="green" />
            <StatsCard value={stats().urgent} label="Urgent" color="red" />
          </div>

          {/* Search and Filters */}
          <div class="bg-[var(--color-bg-elevated)] rounded-lg shadow-sm border border-[var(--color-border-primary)] p-6 mb-6">
            <div class="space-y-4">
              {/* Search Bar */}
              <SearchBar
                value={searchQuery()}
                onSearch={setSearchQuery}
                placeholder="Search todos by title or description..."
              />

              {/* Filters */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterGroup
                  label="Status"
                  options={statusOptions}
                  value={statusFilter()}
                  onChange={(v) => setStatusFilter(v as string)}
                />
                <FilterGroup
                  label="Priority"
                  options={priorityOptions}
                  value={priorityFilter()}
                  onChange={(v) => setPriorityFilter(v as string)}
                />
                <FilterGroup
                  label="Category"
                  options={categoryOptions}
                  value={categoryFilter()}
                  onChange={(v) => setCategoryFilter(v as string)}
                />
              </div>

              {/* Active filters indicator and reset */}
              <Show when={hasActiveFilters()}>
                <div class="flex items-center justify-between pt-2 border-t border-[var(--color-border-primary)]">
                  <span class="text-sm text-[var(--color-text-secondary)]">
                    {stats().total} {stats().total === 1 ? "result" : "results"} found
                  </span>
                  <button
                    onClick={resetFilters}
                    class="text-sm text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </Show>
            </div>
          </div>

          {/* Todos List */}
          <div class="bg-[var(--color-bg-elevated)] rounded-lg shadow-lg border border-[var(--color-border-primary)] overflow-hidden">
            {/* Sort Controls */}
            <div class="bg-[var(--color-bg-secondary)] px-6 py-3 border-b border-[var(--color-border-primary)]">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-[var(--color-text-secondary)]">Sort by:</span>
                <button
                  onClick={() => toggleSort("created")}
                  class={`px-3 py-1 rounded transition-colors ${
                    sortBy() === "created"
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  Date {sortBy() === "created" && (sortOrder() === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("priority")}
                  class={`px-3 py-1 rounded transition-colors ${
                    sortBy() === "priority"
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  Priority {sortBy() === "priority" && (sortOrder() === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("dueDate")}
                  class={`px-3 py-1 rounded transition-colors ${
                    sortBy() === "dueDate"
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  Due Date {sortBy() === "dueDate" && (sortOrder() === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("title")}
                  class={`px-3 py-1 rounded transition-colors ${
                    sortBy() === "title"
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  Title {sortBy() === "title" && (sortOrder() === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>
            <Suspense
              fallback={
                <div class="p-12 text-center">
                  <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-brand-primary)] border-t-transparent"></div>
                  <p class="mt-4 text-[var(--color-text-tertiary)]">Loading todos...</p>
                </div>
              }
            >
              <Show
                when={!todos.isLoading && todos.data}
                fallback={
                  <div class="p-8 text-center">
                    <Show when={todos.isError}>
                      <p class="text-[var(--color-error)]">
                        Error: {todos.error?.message || "Failed to load todos"}
                      </p>
                    </Show>
                  </div>
                }
              >
                <div class="divide-y divide-[var(--color-border-primary)]">
                  <For
                    each={filteredTodos()}
                    fallback={
                      <div class="p-12 text-center">
                        <div class="text-6xl mb-4">
                          {hasActiveFilters() ? "�" : "�📝"}
                        </div>
                        <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                          {hasActiveFilters() ? "No matching todos" : "No todos yet"}
                        </h3>
                        <p class="text-[var(--color-text-tertiary)] mb-4">
                          {hasActiveFilters()
                            ? "Try adjusting your filters or search query"
                            : "Get started by creating your first todo"}
                        </p>
                        <Show when={!hasActiveFilters()}>
                          <Link
                            to="/todos/new"
                            class="inline-block px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                          >
                            Create your first todo
                          </Link>
                        </Show>
                        <Show when={hasActiveFilters()}>
                          <button
                            onClick={resetFilters}
                            class="inline-block px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                          >
                            Clear filters
                          </button>
                        </Show>
                      </div>
                    }
                  >
                    {(todo) => {
                      const isDeleting = () => deletingId() === todo.id
                      const isOverdue = () => {
                        if (!todo.dueDate || todo.completed) return false
                        return new Date(todo.dueDate) < new Date()
                      }

                      return (
                        <div
                          class="transition-all duration-200"
                          classList={{
                            "opacity-50 bg-[var(--color-error-bg)] pointer-events-none": isDeleting(),
                          }}
                        >
                          <div class="p-5 hover:bg-[var(--color-bg-tertiary)] transition-colors">
                            <div class="flex items-start gap-4">
                              {/* Checkbox */}
                              <button
                                onClick={() => handleToggleComplete(todo)}
                                class="mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                classList={{
                                  "border-[var(--color-success)] bg-[var(--color-success)]": todo.completed,
                                  "border-[var(--color-border-secondary)] hover:border-[var(--color-success)]": !todo.completed,
                                }}
                                title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                <Show when={todo.completed}>
                                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </Show>
                              </button>

                              {/* Content */}
                              <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-4 mb-2">
                                  <div class="flex-1 min-w-0">
                                    <Link
                                      to="/todos/$id"
                                      params={{ id: todo.id }}
                                      class="block group"
                                    >
                                      <h3
                                        class={`text-base font-semibold mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors ${
                                          todo.completed
                                            ? "line-through text-[var(--color-text-tertiary)]"
                                            : "text-[var(--color-text-primary)]"
                                        }`}
                                      >
                                        {todo.title}
                                      </h3>
                                    </Link>
                                    <Show when={todo.description}>
                                      <p
                                        class={`text-sm line-clamp-2 ${
                                          todo.completed
                                            ? "text-[var(--color-text-tertiary)]"
                                            : "text-[var(--color-text-secondary)]"
                                        }`}
                                      >
                                        {todo.description}
                                      </p>
                                    </Show>
                                  </div>

                                  {/* Priority Badge */}
                                  <Show when={todo.priority}>
                                    <span
                                      class={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityColor(
                                        todo.priority
                                      )} bg-opacity-10`}
                                      style={{
                                        "background-color": `${
                                          todo.priority === "urgent"
                                            ? "rgba(220, 38, 38, 0.1)"
                                            : todo.priority === "high"
                                            ? "rgba(249, 115, 22, 0.1)"
                                            : todo.priority === "medium"
                                            ? "rgba(234, 179, 8, 0.1)"
                                            : "rgba(156, 163, 175, 0.1)"
                                        }`,
                                      }}
                                    >
                                      {todo.priority?.toUpperCase()}
                                    </span>
                                  </Show>
                                </div>

                                {/* Metadata */}
                                <div class="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                                  {/* Category */}
                                  <Show when={todo.category}>
                                    <span class="flex items-center gap-1">
                                      <span>{getCategoryIcon(todo.category)}</span>
                                      <span class="capitalize">{todo.category?.replace("_", " ")}</span>
                                    </span>
                                  </Show>

                                  {/* Due Date */}
                                  <Show when={todo.dueDate}>
                                    <span
                                      class="flex items-center gap-1"
                                      classList={{
                                        "text-red-600 dark:text-red-400 font-semibold": isOverdue(),
                                      }}
                                    >
                                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span>
                                        {isOverdue() && "⚠️ "}
                                        {(() => {
                                          try {
                                            return new Date(todo.dueDate!).toLocaleDateString()
                                          } catch {
                                            return todo.dueDate
                                          }
                                        })()}
                                      </span>
                                    </span>
                                  </Show>

                                  {/* Created Date */}
                                  <span class="flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>
                                      {(() => {
                                        try {
                                          return new Date(todo.created).toLocaleDateString()
                                        } catch {
                                          return "Unknown"
                                        }
                                      })()}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div class="flex items-center gap-2 flex-shrink-0">
                                <Link
                                  to="/todos/$id"
                                  params={{ id: todo.id }}
                                  class="p-2 text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-bg)] rounded-lg transition-colors"
                                  title="View/Edit"
                                >
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => handleDelete(todo.id, todo.title)}
                                  disabled={isDeleting()}
                                  class="p-2 text-[var(--color-error)] hover:bg-[var(--color-error-bg)] rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Show
                                    when={!isDeleting()}
                                    fallback={
                                      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle
                                          class="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          stroke-width="4"
                                        ></circle>
                                        <path
                                          class="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                    }
                                  >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </Show>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  </For>
                </div>
              </Show>
            </Suspense>
          </div>

          {/* Footer Info */}
          <div class="mt-6 p-4 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-primary)]">
            <div class="flex items-start gap-3">
              <div class="text-2xl">💡</div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Tips for Better Task Management
                </h3>
                <ul class="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Use priority levels to focus on what matters most</li>
                  <li>• Set due dates to keep track of deadlines</li>
                  <li>• Categorize tasks for better organization</li>
                  <li>• Mark tasks complete to track your progress</li>
                </ul>
              </div>
            </div>
          </div>
        </PageContainer>
      </PageLayout>
    </>
  )
}

