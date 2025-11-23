import { createFileRoute, Link } from "@tanstack/solid-router"
import { Show, createSignal, createMemo } from "solid-js"
import {
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/solid-table"
import { useCollection, useDeleteRecord, useRealtimeCollection } from "@/lib/queries"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import {
  PageLayout,
  PageContainer,
  StatsCard,
  FilterGroup,
  SearchBar,
  DataTable,
  PaginationControls,
  type FilterOption
} from "@/components/ui"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const Route = createFileRoute("/_authenticated/patients/")({
  component: PatientsPage,
})

function PatientsPage() {
  const patients = useCollection("patients", { sort: "-created" })
  const deletePatient = useDeleteRecord("patients")
  const confirmDialog = useConfirmationDialog()

  // Enable realtime sync
  useRealtimeCollection("patients")

  // Table state
  const [sorting, setSorting] = createSignal<SortingState>([])
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = createSignal("")
  const [deletingId, setDeletingId] = createSignal<string | null>(null)

  // Patient-specific filter options
  const statusOptions: FilterOption[] = [
    { value: "", label: "All", icon: "👥" },
    { value: "active", label: "Active", icon: "✅" },
    { value: "inactive", label: "Inactive", icon: "⏸️" },
    { value: "archived", label: "Archived", icon: "📦" },
  ]

  const insuranceOptions: FilterOption[] = [
    { value: "", label: "All", icon: "🏥" },
    { value: "insured", label: "Insured", icon: "✅" },
    { value: "uninsured", label: "Uninsured", icon: "❌" },
  ]

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const handleDelete = (id: string, name: string) => {
    confirmDialog.confirm({
      title: "Delete Patient",
      message: `Are you sure you want to delete patient "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        setDeletingId(id)
        deletePatient.mutate(id, {
          onSettled: () => setDeletingId(null),
        })
      },
    })
  }

  // Patient-specific table columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: (info) => {
        const patient = info.row.original
        const fullName = () =>
          `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "N/A"

        return (
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[var(--color-brand-primary)] text-white flex items-center justify-center font-semibold">
              {(patient.firstName?.[0] || patient.lastName?.[0] || "?").toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <Link
                to="/patients/$id"
                params={{ id: patient.id }}
                class="block font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] hover:underline transition-colors"
              >
                {fullName()}
              </Link>
              <Show when={patient.dateOfBirth}>
                <p class="text-xs text-[var(--color-text-tertiary)]">
                  {(() => {
                    try {
                      const dob = new Date(patient.dateOfBirth!)
                      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                      return `${age} years old`
                    } catch {
                      return patient.dateOfBirth
                    }
                  })()}
                </p>
              </Show>
            </div>
          </div>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        const firstName = row.original.firstName?.toLowerCase() || ""
        const lastName = row.original.lastName?.toLowerCase() || ""
        const search = filterValue.toLowerCase()
        return firstName.includes(search) || lastName.includes(search)
      },
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: (info) => {
        const patient = info.row.original
        return (
          <div class="text-sm">
            <Show when={patient.email}>
              <div class="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{patient.email}</span>
              </div>
            </Show>
            <Show when={patient.mobile || patient.phone}>
              <div class="flex items-center gap-1.5 text-[var(--color-text-secondary)] mt-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{patient.mobile || patient.phone}</span>
              </div>
            </Show>
            <Show when={!patient.email && !patient.mobile && !patient.phone}>
              <span class="text-[var(--color-text-tertiary)]">No contact info</span>
            </Show>
          </div>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        const email = row.original.email?.toLowerCase() || ""
        const mobile = row.original.mobile?.toLowerCase() || ""
        const phone = row.original.phone?.toLowerCase() || ""
        const search = filterValue.toLowerCase()
        return email.includes(search) || mobile.includes(search) || phone.includes(search)
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string | undefined
        return (
          <span
            class={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(status)}`}
          >
            {status || "active"}
          </span>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        const status = row.original.status || "active"
        return status === filterValue
      },
    },
    {
      id: "insurance",
      header: "Insurance",
      accessorFn: (row) => row.insuranceProvider || row.insuranceNumber ? "insured" : "uninsured",
      cell: (info) => {
        const patient = info.row.original
        const hasInsurance = patient.insuranceProvider || patient.insuranceNumber

        return (
          <div class="text-sm">
            <Show when={hasInsurance}>
              <div class="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">{patient.insuranceProvider || "Insured"}</span>
              </div>
              <Show when={patient.insuranceNumber}>
                <p class="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  #{patient.insuranceNumber}
                </p>
              </Show>
            </Show>
            <Show when={!hasInsurance}>
              <div class="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>No insurance</span>
              </div>
            </Show>
          </div>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        const hasInsurance = row.original.insuranceProvider || row.original.insuranceNumber
        const status = hasInsurance ? "insured" : "uninsured"
        return status === filterValue
      },
    },
    {
      accessorKey: "created",
      header: "Registered",
      cell: (info) => {
        const date = info.getValue() as string
        return (
          <div class="text-sm text-[var(--color-text-secondary)]">
            <div>{new Date(date).toLocaleDateString()}</div>
            <div class="text-xs text-[var(--color-text-tertiary)]">
              {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        return new Date(rowA.original.created).getTime() - new Date(rowB.original.created).getTime()
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const patient = info.row.original
        const isDeleting = () => deletingId() === patient.id
        const fullName = () =>
          `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Patient"

        return (
          <div class="flex items-center gap-2">
            <Link
              to="/patients/$id"
              params={{ id: patient.id }}
              class="p-2 text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-bg)] rounded-lg transition-colors"
              title="View/Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </Link>
            <button
              onClick={() => handleDelete(patient.id, fullName())}
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
      return patients.data?.items || []
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

  // Patient-specific statistics
  const stats = createMemo(() => {
    const items = table.getFilteredRowModel().rows.map(row => row.original)
    return {
      total: items.length,
      active: items.filter((p) => p.status === "active" || !p.status).length,
      insured: items.filter((p) => p.insuranceProvider || p.insuranceNumber).length,
      newThisMonth: items.filter((p) => {
        const created = new Date(p.created)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length,
    }
  })

  const hasActiveFilters = () => {
    return !!(globalFilter() || columnFilters().length > 0)
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

  const setInsuranceFilter = (value: string) => {
    setColumnFilters(old => {
      const filtered = old.filter(f => f.id !== "insurance")
      return value ? [...filtered, { id: "insurance", value }] : filtered
    })
  }

  const getStatusFilter = () => {
    return columnFilters().find(f => f.id === "status")?.value as string || ""
  }

  const getInsuranceFilter = () => {
    return columnFilters().find(f => f.id === "insurance")?.value as string || ""
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
                👥 Patient Management
              </h1>
              <Link
                to="/patients/new"
                class="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Patient
              </Link>
            </div>
            <p class="text-[var(--color-text-secondary)]">
              Manage patient records with advanced filtering and search
            </p>
          </div>

          {/* Stats Cards */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard value={stats().total} label="Total Patients" color="blue" />
            <StatsCard value={stats().active} label="Active" color="green" />
            <StatsCard value={stats().insured} label="Insured" color="purple" />
            <StatsCard value={stats().newThisMonth} label="New This Month" color="orange" />
          </div>

          {/* Search and Filters */}
          <div class="bg-[var(--color-bg-elevated)] rounded-lg shadow-sm border border-[var(--color-border-primary)] p-6 mb-6">
            <div class="space-y-4">
              {/* Search Bar */}
              <SearchBar
                value={globalFilter()}
                onSearch={setGlobalFilter}
                placeholder="Search patients by name, email, or phone..."
              />

              {/* Filters */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterGroup
                  label="Status"
                  options={statusOptions}
                  value={getStatusFilter()}
                  onChange={(v) => setStatusFilter(v as string)}
                />
                <FilterGroup
                  label="Insurance"
                  options={insuranceOptions}
                  value={getInsuranceFilter()}
                  onChange={(v) => setInsuranceFilter(v as string)}
                />
              </div>

              {/* Active filters indicator and reset */}
              <Show when={hasActiveFilters()}>
                <div class="flex items-center justify-between pt-2 border-t border-[var(--color-border-primary)]">
                  <span class="text-sm text-[var(--color-text-secondary)]">
                    {stats().total} {stats().total === 1 ? "patient" : "patients"} found
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

          {/* Table with DataTable component */}
          <DataTable
            table={table}
            isLoading={patients.isLoading}
            isError={patients.isError}
            errorMessage={patients.error?.message}
            hasActiveFilters={hasActiveFilters()}
            emptyState={{
              icon: "👥",
              title: "No patients yet",
              description: "Get started by adding your first patient",
              action: (
                <Link
                  to="/patients/new"
                  class="inline-block px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                >
                  Add your first patient
                </Link>
              ),
            }}
            noResultsState={{
              icon: "🔍",
              title: "No matching patients",
              description: "Try adjusting your filters or search query",
              action: (
                <button
                  onClick={resetFilters}
                  class="inline-block px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                >
                  Clear filters
                </button>
              ),
            }}
          />

          {/* Pagination - only show when there's data */}
          <Show when={table.getRowModel().rows.length > 0}>
            <PaginationControls table={table} />
          </Show>
        </PageContainer>
      </PageLayout>
    </>
  )
}
