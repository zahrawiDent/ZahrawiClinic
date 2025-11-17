import { Link, useLocation, useMatches } from "@tanstack/solid-router"
import { For, Show, createMemo } from "solid-js"
import { useQueryClient } from "@tanstack/solid-query"

/**
 * 🍞 Breadcrumbs Component
 * ========================
 * 
 * Simple, elegant breadcrumb system that builds from the URL path.
 * Supports custom labels via route context.
 * 
 * @example
 * <Breadcrumbs />
 * // On /todos/123 renders: Home › Todos › Todo Title
 */

export interface BreadcrumbItem {
  label: string
  path: string
  isCurrentPage: boolean
}

interface BreadcrumbsProps {
  separator?: string
  class?: string
}

export function Breadcrumbs(props: BreadcrumbsProps) {
  const location = useLocation()
  const matches = useMatches()
  const queryClient = useQueryClient()
  
  const breadcrumbs = createMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = []
    const pathname = location().pathname
    
    // Always add home
    items.push({
      label: "Home",
      path: "/",
      isCurrentPage: pathname === "/",
    })
    
    // If we're on home page, stop here
    if (pathname === "/") return items
    
    // Split path into segments
    const segments = pathname.split("/").filter(Boolean)
    
    // Build breadcrumbs from segments
    let currentPath = ""
    
    segments.forEach((segment: string, index: number) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Try to find a custom label from route context
      const matchForPath = matches().find(m => m.pathname === currentPath)
      const customLabel = (matchForPath?.context as any)?.breadcrumb
      
      // Generate label - check cache first to avoid flash
      const label = customLabel || getCachedLabel(queryClient, segment, index, segments) || getSegmentLabel(segment, index, segments)
      
      items.push({
        label,
        path: currentPath,
        isCurrentPage: isLast,
      })
    })
    
    return items
  })
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      class={`flex items-center gap-2 text-sm ${props.class || ""}`}
    >
      <For each={breadcrumbs()}>
        {(item, index) => (
          <>
            <Show when={index() > 0}>
              <span class="text-[var(--color-text-tertiary)]">
                {props.separator || "/"}
              </span>
            </Show>
            
            <Show
              when={!item.isCurrentPage}
              fallback={
                <span class="text-[var(--color-text-primary)] font-medium">
                  {item.label}
                </span>
              }
            >
              <Link
                to={item.path}
                class="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
              >
                {item.label}
              </Link>
            </Show>
          </>
        )}
      </For>
    </nav>
  )
}

/**
 * Try to get label from cached data to avoid flash on navigation
 */
function getCachedLabel(queryClient: any, segment: string, index: number, allSegments: string[]): string | null {
  // Only check cache for IDs (last segment that's not 'new')
  if (index !== allSegments.length - 1 || segment === 'new') {
    return null
  }
  
  const previousSegment = allSegments[index - 1]
  
  // Check todos cache
  if (previousSegment === 'todos') {
    const cachedTodo = queryClient.getQueryData(['todos', segment])
    if (cachedTodo?.title) {
      return cachedTodo.title.length > 30 
        ? `${cachedTodo.title.substring(0, 30)}...` 
        : cachedTodo.title
    }
  }
  
  // Check patients cache
  if (previousSegment === 'patients') {
    const cachedPatient = queryClient.getQueryData(['patients', segment])
    if (cachedPatient?.name) {
      return cachedPatient.name.length > 30 
        ? `${cachedPatient.name.substring(0, 30)}...` 
        : cachedPatient.name
    }
  }
  
  return null
}

/**
 * Get a human-readable label for a path segment
 */
function getSegmentLabel(segment: string, index: number, allSegments: string[]): string {
  // Specific route labels
  const labels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'about': 'About',
    'patients': 'Patients',
    'todos': 'Todos',
    'new': 'New',
  }
  
  // Check if it's a known segment
  if (labels[segment]) {
    return labels[segment]
  }
  
  // If it's an ID (last segment and not 'new'), just show a truncated version
  // The actual title will come from route context if provided
  if (index === allSegments.length - 1 && segment !== 'new') {
    // Check if previous segment indicates what type of resource
    const previousSegment = allSegments[index - 1]
    if (previousSegment === 'patients') {
      return `Patient ${segment.substring(0, 8)}...`
    }
    if (previousSegment === 'todos') {
      return `Todo ${segment.substring(0, 8)}...`
    }
  }
  
  // Default: capitalize
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}
