import { For } from "solid-js"
import { type Table } from "@tanstack/solid-table"

export interface PaginationControlsProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  showPageInfo?: boolean
}

export function PaginationControls<TData>(props: PaginationControlsProps<TData>) {
  const pageSizeOptions = () => props.pageSizeOptions || [10, 20, 30, 50]
  const showPageInfo = () => props.showPageInfo !== false

  return (
    <div class="px-6 py-4 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
      <div class="flex items-center justify-between">
        {showPageInfo() && (
          <div class="flex items-center gap-2">
            <span class="text-sm text-[var(--color-text-secondary)]">
              Page {props.table.getState().pagination.pageIndex + 1} of{" "}
              {props.table.getPageCount()}
            </span>
            <span class="text-sm text-[var(--color-text-tertiary)]">
              ({props.table.getFilteredRowModel().rows.length} total)
            </span>
          </div>
        )}

        <div class="flex items-center gap-2">
          <button
            onClick={() => props.table.setPageIndex(0)}
            disabled={!props.table.getCanPreviousPage()}
            class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
            title="First page"
          >
            {"<<"}
          </button>
          <button
            onClick={() => props.table.previousPage()}
            disabled={!props.table.getCanPreviousPage()}
            class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
            title="Previous page"
          >
            {"<"}
          </button>
          <button
            onClick={() => props.table.nextPage()}
            disabled={!props.table.getCanNextPage()}
            class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
            title="Next page"
          >
            {">"}
          </button>
          <button
            onClick={() => props.table.setPageIndex(props.table.getPageCount() - 1)}
            disabled={!props.table.getCanNextPage()}
            class="px-3 py-1 rounded border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
            title="Last page"
          >
            {">>"}
          </button>

          <select
            value={props.table.getState().pagination.pageSize}
            onChange={(e) => {
              props.table.setPageSize(Number(e.currentTarget.value))
            }}
            class="ml-2 px-2 py-1 rounded border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            <For each={pageSizeOptions()}>
              {(pageSize) => (
                <option value={pageSize}>Show {pageSize}</option>
              )}
            </For>
          </select>
        </div>
      </div>
    </div>
  )
}
