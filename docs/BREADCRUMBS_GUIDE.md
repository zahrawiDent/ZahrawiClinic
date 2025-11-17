# 🧭 Breadcrumbs & Navigation Components

This guide explains the breadcrumbs and back button components added to the application.

## 📦 Components Created

### 1. **Breadcrumbs Component** (`/src/components/breadcrumbs.tsx`)

A smart breadcrumb navigation component that automatically generates breadcrumbs from the current route using TanStack Router's `useMatches()` hook.

#### Features:
- ✨ **Automatic generation** - No manual configuration needed
- 🔗 **Clickable navigation** - Each breadcrumb is a link (except current page)
- 🎨 **Customizable separator** - Default is `/`, can be changed
- 📍 **Route-aware** - Uses TanStack Router context
- 🏷️ **Smart labels** - Automatically generates readable labels from routes

#### Usage:
```tsx
import { Breadcrumbs } from "@/components/breadcrumbs"

// Basic usage
<Breadcrumbs />
// Renders: Home / Patients / Patient Details

// Custom separator
<Breadcrumbs separator="›" />
// Renders: Home › Patients › Patient Details

// With custom class
<Breadcrumbs separator="→" class="mb-4" />
```

#### How It Works:
1. Uses `useMatches()` to get current route hierarchy
2. Filters out layout routes (`__root__`, `/_authenticated`)
3. Generates human-readable labels from route IDs
4. Creates clickable links for all except the current page
5. Supports dynamic route params (shows shortened IDs)

#### Route Label Generation:
```
/dashboard           → "Dashboard"
/patients/           → "Patients"
/patients/new        → "New Patient"
/patients/$id        → "Patient abc123..."
/todos/              → "Todos"
/todos/$id           → "Todo xyz789..."
```

---

### 2. **BackButton Component** (`/src/components/back-button.tsx`)

A smart back navigation button with browser history awareness.

#### Features:
- 🔙 **Browser history aware** - Uses `window.history.back()` when available
- 🎯 **Fallback route** - Navigates to specified route if no history
- 🎨 **Multiple variants** - Default, ghost, outline styles
- ♿ **Accessible** - Proper ARIA labels
- 🧩 **Two variants** - Full button and icon-only

#### Usage:

**Full Button:**
```tsx
import { BackButton } from "@/components/back-button"

// Basic usage
<BackButton fallbackTo="/patients" />

// Custom label
<BackButton fallbackTo="/todos" label="Back to List" />

// Ghost variant
<BackButton fallbackTo="/patients" variant="ghost" />

// Only show if browser history exists
<BackButton fallbackTo="/" showOnlyWithHistory />
```

**Icon-Only Button:**
```tsx
import { BackButtonIcon } from "@/components/back-button"

<BackButtonIcon fallbackTo="/patients" />
```

#### Variants:
- **default** - Elevated background with border and shadow
- **ghost** - Transparent, subtle hover effect
- **outline** - Border with transparent background

---

## 🎯 Implementation in Pages

### Patient Detail Page (`/patients/$id`)
```tsx
<Breadcrumbs separator="›" />
// Home › Patients › Patient abc123...

<BackButton fallbackTo="/patients" />
```

### Todo Detail Page (`/todos/$id`)
```tsx
<Breadcrumbs separator="›" />
// Home › Todos › Todo xyz789...

<BackButton fallbackTo="/todos" label="Back to Todos" />
```

### New Patient/Todo Pages
```tsx
<Breadcrumbs separator="›" />
// Home › Patients › New Patient
// Home › Todos › New Todo
```

### List Pages
```tsx
<Breadcrumbs separator="›" />
// Home › Patients
// Home › Todos
```

---

## 🔧 Technical Details

### TanStack Router Integration

The breadcrumbs component leverages TanStack Router's context system:

```tsx
const matches = useMatches()
// Returns array of matched routes with:
// - routeId: Unique route identifier
// - pathname: Current path
// - params: Route parameters
// - route: Full route object
```

### History Navigation Logic

The BackButton intelligently chooses navigation method:

```tsx
if (window.history.length > 1 && window.history.state?.key) {
  // Browser has history - use native back
  window.history.back()
} else if (props.fallbackTo) {
  // No history - navigate to fallback
  navigate({ to: props.fallbackTo })
} else {
  // Default fallback to home
  navigate({ to: "/" })
}
```

---

## 🎨 Styling

Both components use CSS variables for theming:
- `--color-text-primary` - Main text color
- `--color-text-secondary` - Secondary text
- `--color-text-tertiary` - Muted text
- `--color-brand-primary` - Brand color for links/hover
- `--color-bg-elevated` - Elevated background
- `--color-bg-secondary` - Secondary background
- `--color-border-primary` - Border color

---

## 🚀 Benefits

### User Experience:
- **Clear navigation hierarchy** - Users always know where they are
- **Quick navigation** - Click any breadcrumb to jump levels
- **Natural back navigation** - Respects browser history
- **Consistent UI** - Same navigation pattern across all pages

### Developer Experience:
- **Zero configuration** - Automatically works with TanStack Router
- **Type-safe** - Full TypeScript support
- **Reusable** - Drop into any page
- **Customizable** - Props for styling and behavior

### Accessibility:
- **Semantic HTML** - Proper `<nav>` and `aria-label`
- **Keyboard navigation** - Tab through breadcrumbs
- **Screen reader friendly** - Descriptive labels

---

## 📝 Future Enhancements

Possible improvements:
- [ ] Add custom breadcrumb labels via route meta
- [ ] Support for truncating long breadcrumb trails
- [ ] Breadcrumb dropdown for deep hierarchies
- [ ] Mobile-responsive breadcrumb collapsing
- [ ] Breadcrumb structured data for SEO

---

## 🎓 Learn More

- [TanStack Router - useMatches](https://tanstack.com/router/latest/docs/framework/solid/api/router/useMatchesHook)
- [TanStack Router - Route Context](https://tanstack.com/router/latest/docs/framework/solid/guide/router-context)
- [ARIA Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
