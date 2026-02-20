'use client'

/**
 * Foursquare React Query Hooks
 *
 * These hooks call the internal Next.js API routes (`/api/foursquare/*`)
 * which in turn call the Foursquare Places API server-side.
 * The API key never reaches the browser.
 *
 * All hooks use TanStack Query (React Query v5) for caching, deduplication,
 * and background refetch. Wrap the component tree with <QueryProvider>
 * from /lib/QueryProvider.js before using these hooks.
 */

import { useQuery } from '@tanstack/react-query'

// ─── Query key factory ────────────────────────────────────────────────────────
// Centralises cache key construction so cache invalidation is consistent.

export const foursquareKeys = {
  all: ['foursquare'],
  search: (params) => ['foursquare', 'search', params],
  venue: (fsqId) => ['foursquare', 'venue', fsqId],
  photos: (fsqId) => ['foursquare', 'photos', fsqId],
  tips: (fsqId) => ['foursquare', 'tips', fsqId],
}

// ─── Fetcher helpers ──────────────────────────────────────────────────────────

async function fetchFoursquareSearch({ query, lat, lng, categoryId, radius, limit }) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (lat) params.set('lat', lat)
  if (lng) params.set('lng', lng)
  if (categoryId) params.set('category', categoryId)
  if (radius) params.set('radius', radius)
  if (limit) params.set('limit', limit)

  const res = await fetch(`/api/foursquare/search?${params}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Foursquare search failed')
  }
  return res.json()
}

async function fetchVenueDetails(fsqId) {
  const res = await fetch(`/api/foursquare/venues/${fsqId}`)
  if (!res.ok) throw new Error('Failed to fetch venue details')
  return res.json()
}

async function fetchVenuePhotos(fsqId, limit = 10) {
  const res = await fetch(`/api/foursquare/venues/${fsqId}/photos?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch venue photos')
  return res.json()
}

async function fetchVenueTips(fsqId, limit = 5) {
  const res = await fetch(`/api/foursquare/venues/${fsqId}/tips?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch venue tips')
  return res.json()
}

// ─── Public hooks ─────────────────────────────────────────────────────────────

/**
 * Search Foursquare for venues near the supplied coordinates.
 *
 * @param {Object}  opts
 * @param {string}  [opts.query='']      - Free-text search query
 * @param {number}  [opts.lat]           - Latitude (Sydney CBD if omitted)
 * @param {number}  [opts.lng]           - Longitude (Sydney CBD if omitted)
 * @param {string}  [opts.categoryId]    - Foursquare category ID to filter by
 * @param {number}  [opts.radius=15000]  - Search radius in metres
 * @param {number}  [opts.limit=20]      - Max venues to return
 * @param {boolean} [opts.enabled=true]  - Set to false to skip the fetch
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 *   `.data.venues` - array of normalised venue objects
 *   `.data.total`  - count
 */
export function useFoursquareSearch({
  query = '',
  lat = -33.8688,
  lng = 151.2093,
  categoryId = null,
  radius = 15000,
  limit = 20,
  enabled = true,
} = {}) {
  const params = { query, lat, lng, categoryId, radius, limit }

  return useQuery({
    queryKey: foursquareKeys.search(params),
    queryFn: () => fetchFoursquareSearch(params),
    // Only fetch when at least a category is selected or a query is typed
    enabled: enabled && (!!query || !!categoryId),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.venues || [],
  })
}

/**
 * Fetch full details for a Foursquare venue by its fsq_id.
 *
 * @param {string}  fsqId   - Foursquare place ID (without "fsq_" prefix)
 * @param {boolean} [enabled=true]
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 *   `.data` - normalised venue object with extended fields
 */
export function useFoursquareVenue(fsqId, enabled = true) {
  return useQuery({
    queryKey: foursquareKeys.venue(fsqId),
    queryFn: () => fetchVenueDetails(fsqId),
    enabled: enabled && !!fsqId,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Fetch photos for a Foursquare venue.
 *
 * @param {string}  fsqId   - Foursquare place ID
 * @param {number}  [limit=10]
 * @param {boolean} [enabled=true]
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 *   `.data.photos` - array of full-res photo URLs
 */
export function useFoursquarePhotos(fsqId, limit = 10, enabled = true) {
  return useQuery({
    queryKey: foursquareKeys.photos(fsqId),
    queryFn: () => fetchVenuePhotos(fsqId, limit),
    enabled: enabled && !!fsqId,
    staleTime: 30 * 60 * 1000,
    select: (data) => data.photos || [],
  })
}

/**
 * Fetch user tips/reviews for a Foursquare venue.
 *
 * @param {string}  fsqId   - Foursquare place ID
 * @param {number}  [limit=5]
 * @param {boolean} [enabled=true]
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 *   `.data.tips` - array of tip objects { text, created_at, ... }
 */
export function useFoursquareTips(fsqId, limit = 5, enabled = true) {
  return useQuery({
    queryKey: foursquareKeys.tips(fsqId),
    queryFn: () => fetchVenueTips(fsqId, limit),
    enabled: enabled && !!fsqId,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.tips || [],
  })
}

/**
 * Convenience hook: fetch Sydney venues filtered by Foursquare category.
 * Fetches immediately when a `categoryKey` is provided (not 'all').
 *
 * @param {string} categoryKey  - Key from FSQ_CATEGORIES (e.g. 'cafe', 'beach')
 * @param {string} categoryId   - The Foursquare category ID for that key
 * @param {Object} [location]   - { lat, lng } to search from (defaults to Sydney CBD)
 *
 * @returns {{ venues: Object[], isLoading: boolean, isError: boolean, error: Error|null }}
 */
export function useSydneyVenues(categoryKey, categoryId, location = null) {
  const lat = location?.lat ?? -33.8688
  const lng = location?.lng ?? 151.2093

  const result = useFoursquareSearch({
    lat,
    lng,
    categoryId,
    radius: 15000,
    limit: 30,
    enabled: !!categoryId && categoryKey !== 'all',
  })

  return {
    venues: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
  }
}
