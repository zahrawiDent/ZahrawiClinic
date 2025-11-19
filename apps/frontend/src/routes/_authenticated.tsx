import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { getUserAvatarUrl } from "@/lib/pocketbase"
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

  // User menu items
  const userMenuItems = [
    {
      label: 'Profile',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/profile'
    },
    {
      label: 'Settings',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/settings'
    },
    {
      label: 'Help & Support',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/help'
    },
    {
      label: 'Sign Out',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: handleLogout,
      isDanger: true
    }
  ]

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
            name={auth.user()?.name || auth.user()?.email || "User"}
            email={auth.user()?.email || ""}
            role={auth.isAdmin() ? "Administrator" : "Staff"}
            avatar={getUserAvatarUrl(auth.user())}
            menuItems={userMenuItems}
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

