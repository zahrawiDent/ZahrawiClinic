import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { PageLayout, PageContainer, PageHeader, Card, InfoBox, FormField, FormActions, Button } from "@/components/ui"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const Route = createFileRoute("/_authenticated/patients/new")({
  component: AddPatientPage,
})

function AddPatientPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = createSignal("")
  const [lastName, setLastName] = createSignal("")
  const [dateOfBirth, setDateOfBirth] = createSignal("")
  const [gender, setGender] = createSignal("")
  const [email, setEmail] = createSignal("")
  const [phone, setPhone] = createSignal("")
  const [mobile, setMobile] = createSignal("")
  const [status, setStatus] = createSignal("active")
  const [notes, setNotes] = createSignal("")

  const createPatient = useCreateRecord("patients")

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    if (!firstName().trim() || !lastName().trim()) {
      toast.error("Please enter patient first and last name")
      return
    }

    const patientData = {
      firstName: firstName().trim(),
      lastName: lastName().trim(),
      dateOfBirth: dateOfBirth() || undefined,
      gender: gender() || undefined,
      email: email().trim() || undefined,
      phone: phone().trim() || undefined,
      mobile: mobile().trim() || undefined,
      status: status() || "active",
      notes: notes().trim() || undefined,
    }

    // Use optimistic update - navigate immediately!
    createPatient.mutate(
      patientData,
      {
        onSuccess: () => {
          toast.success("Patient added successfully! 🎉")
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to add patient")
        },
      }
    )

    // Navigate immediately (optimistic UI)
    navigate({ to: "/patients" })
  }

  const handleCancel = () => {
    navigate({ to: "/patients" })
  }

  return (
    <PageLayout>
      <PageContainer size="sm" padding>
        {/* Breadcrumbs Navigation */}
        <div class="mb-4">
          <Breadcrumbs separator="›" />
        </div>

        <PageHeader
          title="Add New Patient"
          subtitle="Enter patient information below. Changes will sync in realtime across all connected clients."
        />

        <Card>
          <form onSubmit={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="firstName"
                label="First Name"
                type="text"
                required
                placeholder="Enter first name"
                value={firstName()}
                onInput={(e) => setFirstName(e.currentTarget.value)}
                helperText="Patient's first name"
              />

              <FormField
                id="lastName"
                label="Last Name"
                type="text"
                required
                placeholder="Enter last name"
                value={lastName()}
                onInput={(e) => setLastName(e.currentTarget.value)}
                helperText="Patient's last name"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                placeholder="Select date"
                value={dateOfBirth()}
                onInput={(e) => setDateOfBirth(e.currentTarget.value)}
                helperText="Patient's date of birth"
              />

              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={gender()}
                  onInput={(e) => setGender(e.currentTarget.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="patient@example.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              helperText="Patient's email address"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="phone"
                label="Phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone()}
                onInput={(e) => setPhone(e.currentTarget.value)}
                helperText="Home or office phone"
              />

              <FormField
                id="mobile"
                label="Mobile"
                type="tel"
                placeholder="Enter mobile number"
                value={mobile()}
                onInput={(e) => setMobile(e.currentTarget.value)}
                helperText="Mobile phone number"
              />
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={status()}
                onInput={(e) => setStatus(e.currentTarget.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes about the patient..."
                value={notes()}
                onInput={(e) => setNotes(e.currentTarget.value)}
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Optional patient notes</p>
            </div>

            <FormActions>
              <Button
                type="submit"
                variant="primary"
                disabled={createPatient.isPending}
                class="flex-1"
              >
                Add Patient
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={createPatient.isPending}
              >
                Cancel
              </Button>
            </FormActions>
          </form>
        </Card>

        <div class="mt-6">
          <InfoBox variant="info" title="⚡ Optimistic Updates Enabled">
            <p>
              When you add a patient, you'll be redirected instantly and the new patient
              will appear immediately in the list. The data syncs with the server in the
              background with automatic rollback on errors.
            </p>
          </InfoBox>
        </div>
      </PageContainer>
    </PageLayout>
  )
}

