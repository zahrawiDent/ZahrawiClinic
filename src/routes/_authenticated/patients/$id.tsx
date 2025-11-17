import { createFileRoute,useNavigate } from '@tanstack/solid-router'
import { Show, Suspense } from "solid-js"
import { useRecord, useDeleteRecord } from "@/lib/queries"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { PageLayout, PageContainer, PageHeader, Card } from "@/components/ui"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const Route = createFileRoute('/_authenticated/patients/$id')({
  component: PatientDetailPage,
})

function PatientDetailPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const patient = useRecord("patients", () => params().id)
  const deletePatient = useDeleteRecord("patients")
  const confirmDialog = useConfirmationDialog()

  const handleDelete = () => {
    const patientData = patient.data
    if (!patientData) return

    const fullName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim()
    
    confirmDialog.confirm({
      title: "Delete Patient",
      message: `Are you sure you want to delete patient "${fullName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        deletePatient.mutate(params().id, {
          onSuccess: () => {
            navigate({ to: "/patients" })
          },
        })
      },
    })
  }

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <PageLayout>
        <PageContainer size="md" padding>
          {/* Breadcrumbs Navigation */}
          <div class="mb-4">
            <Breadcrumbs separator="›" />
          </div>

          <Suspense
            fallback={
              <div class="p-8 text-center text-[var(--color-text-tertiary)]">
                Loading patient details...
              </div>
            }
          >
            <Show
              when={!patient.isLoading && patient.data}
              fallback={
                <div class="p-8 text-center">
                  <Show when={patient.isError}>
                    <p class="text-[var(--color-error)]">
                      Error: {patient.error?.message || 'Failed to load patient'}
                    </p>
                  </Show>
                </div>
              }
            >
              {(data) => {
                const fullName = () => `${data().firstName || ''} ${data().lastName || ''}`.trim()
                
                return (
                  <>
                    <PageHeader 
                      title={fullName()} 
                      subtitle={`Patient ID: ${data().id}`}
                      action={
                        <button
                          onClick={handleDelete}
                          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          disabled={deletePatient.isPending}
                        >
                          {deletePatient.isPending ? 'Deleting...' : 'Delete Patient'}
                        </button>
                      }
                    />

                    <div class="space-y-6">
                      {/* Personal Information */}
                      <Card>
                        <h2 class="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                          Personal Information
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">First Name</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {data().firstName || '-'}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Last Name</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {data().lastName || '-'}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Date of Birth</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {data().dateOfBirth ? new Date(data().dateOfBirth!).toLocaleDateString() : '-'}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Gender</p>
                            <p class="text-[var(--color-text-primary)] font-medium capitalize">
                              {data().gender?.replace('_', ' ') || '-'}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Contact Information */}
                      <Card>
                        <h2 class="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                          Contact Information
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Email</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {data().email || '-'}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Phone</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {data().phone || '-'}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Mobile</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {data().mobile || '-'}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Status</p>
                            <span 
                              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              classList={{
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': data().status === 'active',
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': data().status === 'inactive',
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': data().status === 'archived',
                              }}
                            >
                              {data().status || 'active'}
                            </span>
                          </div>
                        </div>
                      </Card>

                      {/* Notes */}
                      <Show when={data().notes}>
                        <Card>
                          <h2 class="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                            Notes
                          </h2>
                          <p class="text-[var(--color-text-primary)] whitespace-pre-wrap">
                            {data().notes}
                          </p>
                        </Card>
                      </Show>

                      {/* Metadata */}
                      <Card>
                        <h2 class="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                          Metadata
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Created</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {new Date(data().created).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p class="text-sm text-[var(--color-text-tertiary)]">Last Updated</p>
                            <p class="text-[var(--color-text-primary)] font-medium">
                              {new Date(data().updated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </>
                )
              }}
            </Show>
          </Suspense>
        </PageContainer>
      </PageLayout>
    </>
  )
}
