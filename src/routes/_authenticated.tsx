import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/toast"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
  SidebarUser,
  DashboardIcon,
  AppointmentsIcon,
  PatientsIcon,
  TreatmentsIcon,
  MedicalRecordsIcon,
  BillingIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/components/sidebar"

// This is a pathless layout route that wraps all authenticated routes
// The beforeLoad function checks if the user is authenticated
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    // If user is not authenticated, redirect to login
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          // Store the current location so we can redirect back after login
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.logout()
    toast.success('Signed out successfully')
    navigate({ to: '/' })
  }

  return (
    <div class="flex h-screen bg-[var(--color-bg-secondary)]">
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader
          title="Zahrawi Clinic"
          subtitle="Dental Management"
        />
        
        <SidebarContent>
          <SidebarSection title="Main Menu">
            <SidebarItem
              href="/dashboard"
              icon={<DashboardIcon />}
              label="Dashboard"
            />
            <SidebarItem
              href="/appointments"
              icon={<AppointmentsIcon />}
              label="Appointments"
              badge={5}
            />
            <SidebarItem
              href="/patients"
              icon={<PatientsIcon />}
              label="Patients"
            />
            <SidebarItem
              href="/treatments"
              icon={<TreatmentsIcon />}
              label="Treatments"
              hasSubmenu
            />
            <SidebarItem
              href="/medical-records"
              icon={<MedicalRecordsIcon />}
              label="Medical Records"
            />
            <SidebarItem
              href="/billing"
              icon={<BillingIcon />}
              label="Billing"
              hasSubmenu
            />
          </SidebarSection>

          <SidebarSection title="Management">
            <SidebarItem
              href="/reports"
              icon={<ReportsIcon />}
              label="Reports"
            />
            <SidebarItem
              href="/settings"
              icon={<SettingsIcon />}
              label="Settings"
            />
          </SidebarSection>
        </SidebarContent>

        <SidebarFooter>
          <SidebarUser
            name={auth.user()?.name || "Dr. Sarah Ahmed"}
            email={auth.user()?.email || ""}
            role="Administrator"
            onLogout={handleLogout}
          />
        </SidebarFooter>
        
        {/* Toggle button inside sidebar for context access */}
        <SidebarToggle />
      </Sidebar>

      {/* Main Content */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header class="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-primary)] px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-semibold text-[var(--color-text-primary)]">
              Welcome back, {auth.user()?.name || auth.user()?.email}
            </h2>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main class="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

