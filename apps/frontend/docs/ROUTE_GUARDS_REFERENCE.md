# Route Guards Reference

Reusable route protection guards for controlling access to pages based on authentication and roles.

## Location
`/apps/frontend/src/lib/route-guards.ts`

## Available Guards

### 1. `requireGuest`
Ensures user is NOT logged in. Redirects authenticated users to dashboard.

**Use case**: Login, signup pages

```typescript
export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
  beforeLoad: requireGuest,
})
```

---

### 2. `requireSuperuser`
Requires user to be authenticated as a superuser.

**Use case**: Admin-only pages (user management, system settings)

```typescript
export const Route = createFileRoute('/_authenticated/users/new')({
  component: AddUserPage,
  beforeLoad: requireSuperuser,
})
```

---

### 3. `requireRole`
Requires user to have specific role(s).

**Use case**: Role-specific features

```typescript
// Single role
export const Route = createFileRoute('/_authenticated/treatments/new')({
  component: AddTreatmentPage,
  beforeLoad: () => requireRole('Dentist'),
})

// Multiple roles
export const Route = createFileRoute('/_authenticated/patients/')({
  component: PatientsPage,
  beforeLoad: () => requireRole(['Dentist', 'Receptionist']),
})
```

---

### 4. `requireSuperuserOrRole`
Allows access to either superusers OR users with specific role(s).

**Use case**: Pages accessible by admins and certain staff roles

```typescript
// Dentists and admins can access
export const Route = createFileRoute('/_authenticated/reports/')({
  component: ReportsPage,
  beforeLoad: () => requireSuperuserOrRole('Dentist'),
})

// Multiple roles or admin
export const Route = createFileRoute('/_authenticated/billing/')({
  component: BillingPage,
  beforeLoad: () => requireSuperuserOrRole(['Dentist', 'Receptionist']),
})
```

---

## Utility Functions

For conditional UI rendering:

```typescript
import { isSuperuser, hasRole, getCurrentRole } from '@/lib/route-guards'

// In your component
function MyComponent() {
  return (
    <div>
      {/* Show button only for superusers */}
      <Show when={isSuperuser()}>
        <button>Admin Action</button>
      </Show>
      
      {/* Show content for dentists */}
      <Show when={hasRole('Dentist')}>
        <TreatmentPlanner />
      </Show>
      
      {/* Different content based on role */}
      <Switch>
        <Match when={getCurrentRole() === 'Dentist'}>
          <DentistDashboard />
        </Match>
        <Match when={getCurrentRole() === 'Receptionist'}>
          <ReceptionistDashboard />
        </Match>
      </Switch>
    </div>
  )
}
```

---

## Available Roles

- `Dentist`
- `Receptionist`

Defined in `/apps/frontend/src/types/schemas/users.ts`

---

## Error Handling

All guards throw descriptive errors when access is denied:
- `"Unauthorized: Superuser access required"`
- `"Unauthorized: User role not found"`
- `"Unauthorized: Requires one of: Dentist, Receptionist"`
- `"Unauthorized: Requires superuser or one of: Dentist"`

These errors will be caught by your error boundary and can be displayed to users.

---

## Examples by Use Case

### Patient Management
```typescript
// Anyone authenticated can view
beforeLoad: () => {}, // inherits from _authenticated layout

// Only dentists can create treatment plans
beforeLoad: () => requireRole('Dentist')

// Dentists and receptionists can edit patient info
beforeLoad: () => requireRole(['Dentist', 'Receptionist'])
```

### User Management
```typescript
// Only superusers can manage users
beforeLoad: requireSuperuser
```

### Reports
```typescript
// Admins and dentists can view reports
beforeLoad: () => requireSuperuserOrRole('Dentist')
```

### Settings
```typescript
// System settings - superuser only
beforeLoad: requireSuperuser

// User profile - any authenticated user (no guard needed)
```
