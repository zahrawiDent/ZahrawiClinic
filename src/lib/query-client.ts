import { QueryClient } from '@tanstack/solid-query'

// Create QueryClient for TanStack Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
