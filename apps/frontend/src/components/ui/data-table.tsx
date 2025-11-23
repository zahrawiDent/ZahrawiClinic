import { For, Show, type JSX } from "solid-js"
import { 
  type Table, 
  flexRender,
} from "@tanstack/solid-table"

export interface DataTableProps<TData> {
  table: Table<TData>
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  emptyState?: {
    icon?: string
    title: string
    description: string
    action?: JSX.Element
  }
  noResultsState?: {
    icon?: string
    title: string
    description: string
    action?: JSX.Element
  }
  hasActiveFilters?: boolean
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  const emptyStateConfig = () => props.emptyState || {
    icon: "📝",
    title: "No data yet",
    description: "Get started by creating your first item",
  }

  const noResultsStateConfig = () => props.noResultsState || {
    icon: "🔍",
    title: "No matching results",
    description: "Try adjusting your filters or search query",
  }

  return (
    <div class="bg-[var(--color-bg-elevated)] rounded-lg shadow-lg border border-[var(--color-border-primary)] overflow-hidden">
      <Show
        when={!props.isLoading}
        fallback={
          <div class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-brand-primary)] border-t-transparent"></div>
            <p class="mt-4 text-[var(--color-text-tertiary)]">Loading...</p>
          </div>
        }
      >
        <Show
          when={!props.isError}
          fallback={
            <div class="p-8 text-center">
              <p class="text-[var(--color-error)]">
                Error: {props.errorMessage || "Failed to load data"}
              </p>
            </div>
          }
        >
          <Show
            when={props.table.getRowModel().rows.length > 0}
            fallback={
              <div class="p-12 text-center">
                <div class="text-6xl mb-4">
                  {props.hasActiveFilters ? noResultsStateConfig().icon : emptyStateConfig().icon}
                </div>
                <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  {props.hasActiveFilters ? noResultsStateConfig().title : emptyStateConfig().title}
                </h3>
                <p class="text-[var(--color-text-tertiary)] mb-4">
                  {props.hasActiveFilters ? noResultsStateConfig().description : emptyStateConfig().description}
                </p>
                {props.hasActiveFilters ? noResultsStateConfig().action : emptyStateConfig().action}
              </div>
            }
          >
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
                  <For each={props.table.getHeaderGroups()}>
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
                  <For each={props.table.getRowModel().rows}>
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
          </Show>
        </Show>
      </Show>
    </div>
  )
}
