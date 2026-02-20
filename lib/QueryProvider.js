'use client'

/**
 * QueryProvider
 *
 * Wraps the app in TanStack Query's QueryClientProvider.
 * Must be a Client Component because QueryClient is created on the client.
 *
 * Usage: add <QueryProvider> to /app/layout.js around children.
 */

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function QueryProvider({ children }) {
  // Create a stable QueryClient instance for the lifetime of the component.
  // Using useState so each browser session gets its own client.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache Foursquare results for 5 minutes to avoid hammering the API
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 10 minutes after component unmounts
            gcTime: 10 * 60 * 1000,
            // Retry once on failure before surfacing the error
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
