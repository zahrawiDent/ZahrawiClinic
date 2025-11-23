import { createFileRoute, Link } from "@tanstack/solid-router"
import { Show, Suspense, createSignal, createMemo, For } from "solid-js"
import { 
  createSolidTable, 
  flexRender, 
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/solid-table"
import { useCollection, useDeleteRecord, useUpdateRecord, useRealtimeCollection } from "@/lib/queries"
import { type TaskRecord } from "@/types/schemas"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { PageLayout, PageContainer, StatsCard, FilterGroup, type FilterOption } from "@/components/ui"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const Route = createFileRoute("/_authenticated/tasks/")({
  component: TasksPage,
})

function TasksPage() {
  const tasks = useCollection("tasks", { sort: "-created" })
  const deleteTask = useDeleteRecord("tasks")
  const updateTask = useUpdateRecord("tasks")
  const confirmDialog = useConfirmationDialog()

  // Enable realtime sync
  useRealtimeCollection("tasks")

  // Table state
  const [sorting, setSorting] = createSignal<SortingState>([])
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = createSignal("")
  const [deletingId, setDeletingId] = createSignal<string | null>(null)

  // Filter options
  const statusOptions: FilterOption[] = [
    { value: "", label: "All", icon: "📋" },
    { value: "active", label: "Active", icon: "🔵" },
    { value: "completed", label: "Completed", icon: "✅" },
  ]

  const priorityOptions: FilterOption[] = [
    { value: "", label: "All", icon: "⭐" },
    { value: "urgent", label: "Urgent", icon: "🔴" },
    { value: "high", label: "High", icon: "🟠" },
    { value: "medium", label: "Medium", icon: "🟡" },
    { value: "low", label: "Low", icon: "⚪" },
  ]

  const categoryOptions: FilterOption[] = [
    { value: "", label: "All", icon: "📂" },
    { value: "administrative", label: "Administrative", icon: "📋" },
    { value: "clinical", label: "Clinical", icon: "🏥" },
    { value: "follow_up", label: "Follow Up", icon: "📞" },
    { value: "billing", label: "Billing", icon: "💰" },
    { value: "other", label: "Other", icon: "📌" },
  ]

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

  const handleToggleComplete = (task: TaskRecord) => {
    updateTask.mutate({
      id: task.id,
      completed: !task.completed,
    })
  }

  const handleDelete = (id: string, title: string) => {
    confirmDialog.confirm({
      title: "Delete Task",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        setDeletingId(id)
        deleteTask.mutate(id, {
          onSettled: () => setDeletingId(null),
        })
      },
    })
  }

  // Table columns definition
  const columns: ColumnDef<TaskRecord>[] = [
    {
      id: "completed",
      header: () => <div class="w-8">✓</div>,
      cell: (info) => {
        const task = info.row.original
        return (
          <button
            onClick={() => handleToggleComplete(task)}
            class="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
            classList={{
              "border-[var(--color-success)] bg-[var(--color-success)]": task.completed,
              "border-[var(--color-border-secondary)] hover:border-[var(--color-success)]": !task.completed,
            }}
            title={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            <Show when={task.completed}>
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </Show>
          </button>
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: "title",
      header: "Task",
      cell: (info) => {
        const task = info.row.original
        return (
          <div class="flex-1 min-w-0">
            <Link
              to="/tasks/$id"
              params={{ id: task.id }}
              class="block group"
            >
              <h3
                class={`text-base font-semibold mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors ${
                  task.completed
                    ? "line-through text-[var(--color-text-tertiary)]"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {task.title}
              </h3>
            </Link>
            <Show when={task.description}>
              <p
                class={`text-sm line-clamp-2 ${
                  task.completed
                    ? "text-[var(--color-text-tertiary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {task.description}
              </p>
            </Show>
          </div>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        const title = row.original.title.toLowerCase()
        const description = row.original.description?.toLowerCase() || ""
        const search = filterValue.toLowerCase()
        return title.includes(search) || description.includes(search)
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (info) => {
        const priority = info.getValue() as string | undefined
        return (
          <Show when={priority}>
            <span
              class={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityColor(
                priority
              )} bg-opacity-10`}
              style={{
                "background-color": `${
                  priority === "urgent"
                    ? "rgba(220, 38, 38, 0.1)"
                    : priority === "high"
                    ? "rgba(249, 115, 22, 0.1)"
                    : priority === "medium"
                    ? "rgba(234, 179, 8, 0.1)"
                    : "rgba(156, 163, 175, 0.1)"
                }`,
              }}
            >
              {priority?.toUpperCase()}
            </span>
          </Show>
        )
      },
      sortingFn: (rowA, rowB) => {
        const priorityOrder: Record<string, number> = { 
          urgent: 4, 
          high: 3, 
          medium: 2, 
          low: 1 
        }
        const aPriority = priorityOrder[rowA.original.priority || "low"] || 1
        const bPriority = priorityOrder[rowB.original.priority || "low"] || 1
        return aPriority - bPriority
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.priority === filterValue
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info) => {
        const category = info.getValue() as string | undefined
        return (
          <Show when={category}>
            <span class="flex items-center gap-1 text-sm">
              <span>{getCategoryIcon(category)}</span>
              <span class="capitalize">{category?.replace("_", " ")}</span>
            </span>
          </Show>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.category === filterValue
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: (info) => {
        const task = info.row.original
        const isOverdue = () => {
          if (!task.dueDate || task.completed) return false
          return new Date(task.dueDate) < new Date()
        }
        return (
          <Show when={task.dueDate}>
            <span
              class="flex items-center gap-1 text-sm"
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
                    return new Date(task.dueDate!).toLocaleDateString()
                  } catch {
                    return task.dueDate
                  }
                })()}
              </span>
            </span>
          </Show>
        )
      },
      sortingFn: (rowA, rowB) => {
        if (!rowA.original.dueDate && !rowB.original.dueDate) return 0
        if (!rowA.original.dueDate) return 1
        if (!rowB.original.dueDate) return -1
        return new Date(rowA.original.dueDate).getTime() - new Date(rowB.original.dueDate).getTime()
      },
    },
    {
      id: "status",
      accessorFn: (row) => row.completed ? "completed" : "active",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string
        return (
          <span
            class={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {status === "completed" ? "✅ Completed" : "🔵 Active"}
          </span>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        const status = row.original.completed ? "completed" : "active"
        return status === filterValue
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const task = info.row.original
        const isDeleting = () => deletingId() === task.id
        return (
          <div class="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/tasks/$id"
              params={{ id: task.id }}
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
              onClick={() => handleDelete(task.id, task.title)}
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
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ]

  // Create table instance
  const table = createSolidTable({
    get data() {
      return tasks.data?.items || []
    },
    columns,
    state: {
      get sorting() {
        return sorting()
      },
      get columnFilters() {
        return columnFilters()
      },
      get globalFilter() {
        return globalFilter()
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Statistics
  const stats = createMemo(() => {
    const items = table.getFilteredRowModel().rows.map(row => row.original)
    return {
      total: items.length,
      completed: items.filter((t) => t.completed).length,
      active: items.filter((t) => !t.completed).length,
      urgent: items.filter((t) => t.priority === "urgent" && !t.completed).length,
    }
  })

  const hasActiveFilters = () => {
    return globalFilter() || columnFilters().length > 0
  }

  const resetFilters = () => {
    setGlobalFilter("")
    setColumnFilters([])
  }

  const setStatusFilter = (value: string) => {
    setColumnFilters(old => {
      const filtered = old.filter(f => f.id !== "status")
      return value ? [...filtered, { id: "status", value }] : filtered
    })
  }

  const setPriorityFilter = (value: string) => {
    setColumnFilters(old => {
      const filtered = old.filter(f => f.id !== "priority")
      return value ? [...filtered, { id: "priority", value }] : filtered
    })
  }

  const setCategoryFilter = (value: string) => {
    setColumnFilters(old => {
      const filtered = old.filter(f => f.id !== "category")
      return value ? [...filtered, { id: "category", value }] : filtered
    })
  }

  const getStatusFilter = () => {
    return columnFilters().find(f => f.id === "status")?.value as string || ""
  }

  const getPriorityFilterValue = () => {
    return columnFilters().find(f => f.id === "priority")?.value as string || ""
  }

  const getCategoryFilterValue = () => {
    return columnFilters().find(f => f.id === "category")?.value as string || ""
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
                ✅ Task Management
              </h1>
              <Link
                to="/tasks/new"
                class="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Task
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
              <div class="relative">
                <input
                  type="text"
                  value={globalFilter()}
                  onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                  placeholder="Search tasks by title or description..."
                  class="w-full px-4 py-2 pl-10 border border-[var(--color-border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                />
                <svg
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filters */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterGroup
                  label="Status"
                  options={statusOptions}
                  value={getStatusFilter()}
                  onChange={(v) => setStatusFilter(v as string)}
                />
                <FilterGroup
                  label="Priority"
                  options={priorityOptions}
                  value={getPriorityFilterValue()}
                  onChange={(v) => setPriorityFilter(v as string)}
                />
                <FilterGroup
                  label="Category"
                  options={categoryOptions}
                  value={getCategoryFilterValue()}
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

          {/* Table */}
          <div class="bg-[var(--color-bg-elevated)] rounded-lg shadow-lg border border-[var(--color-border-primary)] overflow-hidden">
            <Suspense
              fallback={
                <div class="p-12 text-center">
                  <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-brand-primary)] border-t-transparent"></div>
                  <p class="mt-4 text-[var(--color-text-tertiary)]">Loading Tasks...</p>
                </div>
              }
            >
              <Show
                when={!tasks.isLoading && tasks.data}
                fallback={
                  <div class="p-8 text-center">
                    <Show when={tasks.isError}>
                      <p class="text-[var(--color-error)]">
                        Error: {tasks.error?.message || "Failed to load tasks"}
                      </p>
                    </Show>
                  </div>
                }
              >
                <Show
                  when={table.getRowModel().rows.length > 0}
                  fallback={
                    <div class="p-12 text-center">
                      <div class="text-6xl mb-4">
                        {hasActiveFilters() ? "🔍" : "📝"}
                      </div>
                      <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                        {hasActiveFilters() ? "No matching tasks" : "No tasks yet"}
                      </h3>
                      <p class="text-[var(--color-text-tertiary)] mb-4">
                        {hasActiveFilters()
                          ? "Try adjusting your filters or search query"
                          : "Get started by creating your first task"}
                      </p>
                      <Show when={!hasActiveFilters()}>
                        <Link
                          to="/tasks/new"
                          class="inline-block px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                        >
                          Create your first task
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
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead class="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
                        <For each={table.getHeaderGroups()}>
                          {(headerGroup) => (
                            <tr>
                              <For each={headerGroup.headers}>
                                {(header) => (
                                  <th
                                    class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
                                    classList={{
                                      "cursor-pointer select-none hover:bg-[var(--color-bg-tertiary)]": header.column.getCanSort(),
                                    }}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    <div class="flex items-center gap-2">
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                      <Show when={header.column.getCanSort()}>
                                        <span class="text-sm">
                                          {{
                                            asc: "↑",
                                            desc: "↓",
                                          }[header.column.getIsSorted() as string] ?? "⇅"}
                                        </span>
                                      </Show>
                                    </div>
                                  </th>
                                )}
                              </For>
                            </tr>
                          )}
                        </For>
                      </thead>
                      <tbody class="divide-y divide-[var(--color-border-primary)]">
                        <For each={table.getRowModel().rows}>
                          {(row) => (
                            <tr class="hover:bg-[var(--color-bg-tertiary)] transition-colors">
                              <For each={row.getVisibleCells()}>
                                {(cell) => (
                                  <td class="px-6 py-4 whitespace-nowrap">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                )}
                              </For>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div class="px-6 py-4 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-[var(--color-text-secondary)]">
                          Page {table.getState().pagination.pageIndex + 1} of{" "}
                          {table.getPageCount()}
                        </span>
                        <span class="text-sm text-[var(--color-text-tertiary)]">
                          ({table.getFilteredRowModel().rows.length} total)
                        </span>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                          class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
                        >
                          {"<<"}
                        </button>
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
                        >
                          {"<"}
                        </button>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
                        >
                          {">"}
                        </button>
                        <button
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                          class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
                        >
                          {">>"}
                        </button>

                        <select
                          value={table.getState().pagination.pageSize}
                          onChange={(e) => {
                            table.setPageSize(Number(e.currentTarget.value))
                          }}
                          class="ml-2 px-2 py-1 rounded border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                        >
                          <For each={[10, 20, 30, 50]}>
                            {(pageSize) => (
                              <option value={pageSize}>Show {pageSize}</option>
                            )}
                          </For>
                        </select>
                      </div>
                    </div>
                  </div>
                </Show>
              </Show>
            </Suspense>
          </div>
        </PageContainer>
      </PageLayout>
    </>
  )
}
