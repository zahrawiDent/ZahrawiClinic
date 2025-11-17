# Sidebar Component

A clean, reusable, and collapsible sidebar component system for the Zahrawi Clinic application.

## Features

- ✅ **Collapsible** - Click the toggle button to collapse/expand
- ✅ **Responsive** - Smooth transitions between states
- ✅ **Themeable** - Uses CSS variables from `index.css`
- ✅ **Accessible** - Proper ARIA labels and keyboard support
- ✅ **Composable** - Built with clean, reusable sub-components
- ✅ **Type-safe** - Full TypeScript support

## Components

### `<Sidebar>`
Main container component that provides context for all child components.

```tsx
<Sidebar>
  {/* Child components */}
</Sidebar>
```

### `<SidebarHeader>`
Header section with logo and title.

```tsx
<SidebarHeader
  title="Zahrawi Clinic"
  subtitle="Dental Management"
  logo={<CustomIcon />} // optional
/>
```

### `<SidebarContent>`
Main scrollable content area for navigation items.

```tsx
<SidebarContent>
  {/* Navigation sections */}
</SidebarContent>
```

### `<SidebarSection>`
Groups related navigation items with an optional title.

```tsx
<SidebarSection title="Main Menu">
  {/* Sidebar items */}
</SidebarSection>
```

### `<SidebarItem>`
Individual navigation link with icon, label, and optional badge.

```tsx
<SidebarItem
  href="/dashboard"
  icon={<DashboardIcon />}
  label="Dashboard"
  badge={5} // optional
  hasSubmenu // optional
  onClick={() => {}} // optional
/>
```

### `<SidebarFooter>`
Footer section, typically used for user profile.

```tsx
<SidebarFooter>
  {/* Footer content */}
</SidebarFooter>
```

### `<SidebarUser>`
User profile component with logout functionality.

```tsx
<SidebarUser
  name="Dr. Sarah Ahmed"
  email="sarah@example.com"
  role="Administrator" // optional
  avatar="https://..." // optional
  onLogout={() => {}} // optional
/>
```

### `<SidebarToggle>`
Toggle button to collapse/expand the sidebar. Position it outside the sidebar container.

```tsx
<SidebarToggle />
```

## Icons

Pre-built icon components are available:

```tsx
import {
  DashboardIcon,
  AppointmentsIcon,
  PatientsIcon,
  TreatmentsIcon,
  MedicalRecordsIcon,
  BillingIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/components/sidebar"
```

You can also use custom icons by passing any SVG element.

## Complete Example

```tsx
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
  PatientsIcon,
} from "@/components/sidebar"

function Layout() {
  return (
    <div class="flex h-screen">
      <div class="relative flex">
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
                href="/patients"
                icon={<PatientsIcon />}
                label="Patients"
                badge={12}
              />
            </SidebarSection>
          </SidebarContent>

          <SidebarFooter>
            <SidebarUser
              name="Dr. Sarah Ahmed"
              email="sarah@clinic.com"
              role="Administrator"
              onLogout={() => console.log('Logout')}
            />
          </SidebarFooter>
        </Sidebar>
        
        <div class="absolute -right-3 top-20 z-10">
          <SidebarToggle />
        </div>
      </div>

      <main class="flex-1">
        {/* Page content */}
      </main>
    </div>
  )
}
```

## Styling

The sidebar uses CSS variables from `index.css`:

- `--color-bg-elevated` - Sidebar background
- `--color-border-primary` - Borders
- `--color-text-primary` - Main text
- `--color-text-secondary` - Secondary text
- `--color-brand-primary` - Active state
- Custom scrollbar styles via `.sidebar-scrollbar` class

## State Management

The sidebar collapse state is managed internally via SolidJS context. Use the `useSidebar()` hook if you need to access or control the state from child components:

```tsx
import { useSidebar } from "@/components/sidebar"

function CustomComponent() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  
  return (
    <button onClick={() => setIsCollapsed(!isCollapsed())}>
      Toggle
    </button>
  )
}
```

## Responsive Behavior

The sidebar automatically:
- Animates width changes (300ms cubic-bezier)
- Shows tooltips when collapsed
- Hides text content when collapsed
- Maintains icon visibility at all times

## Dark Mode

The sidebar automatically adapts to dark mode using the CSS variable system. No additional configuration needed.
