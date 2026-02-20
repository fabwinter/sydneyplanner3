/**
 * Foursquare Places API v3 Service
 *
 * Server-side utility for communicating with the Foursquare Places API.
 * MUST only be imported in Next.js API routes (server-side) to keep the
 * API key out of the browser bundle.
 *
 * Docs: https://docs.foursquare.com/developer/reference/place-search
 */

import axios from 'axios'

const FSQ_BASE_URL = 'https://api.foursquare.com/v3'

/** Default Sydney city centre coordinates */
const SYDNEY_CENTER = { lat: -33.8688, lng: 151.2093 }

/**
 * Foursquare category definitions used throughout the app.
 * Each key maps to a human-readable label, emoji, Foursquare category ID,
 * and the colour used for the map pin.
 *
 * @type {Record<string, { id: string, label: string, emoji: string, color: string }>}
 */
export const FSQ_CATEGORIES = {
  all: { id: null, label: 'All', emoji: '🗺️', color: '#6B7280' },
  cafe: { id: '13065', label: 'Cafes', emoji: '☕', color: '#F97316' },
  restaurant: { id: '13035', label: 'Restaurants', emoji: '🍽️', color: '#EF4444' },
  bar: { id: '13003', label: 'Bars', emoji: '🍺', color: '#8B5CF6' },
  beach: { id: '16019', label: 'Beaches', emoji: '🏖️', color: '#0EA5E9' },
  park: { id: '16032', label: 'Parks', emoji: '🌿', color: '#22C55E' },
  museum: { id: '10027', label: 'Museums', emoji: '🏛️', color: '#A855F7' },
  attraction: { id: '10000', label: 'Attractions', emoji: '⭐', color: '#EC4899' },
}

/**
 * Build an axios instance with the Foursquare API key injected as a header.
 * Throws if the env variable is missing.
 *
 * @returns {import('axios').AxiosInstance}
 */
function buildClient() {
  const apiKey = process.env.FOURSQUARE_API_KEY
  if (!apiKey) {
    throw new Error('FOURSQUARE_API_KEY environment variable is not set.')
  }
  return axios.create({
    baseURL: FSQ_BASE_URL,
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
    },
    timeout: 10000,
  })
}

/**
 * Convert a raw Foursquare place object into the common venue shape used
 * across the Sydney Planner app.
 *
 * @param {Object} raw  - A single place object returned by the Foursquare API
 * @param {string} [fallbackImage] - URL to use when the place has no photos
 * @returns {Object} Normalised venue object
 */
export function normalizeFoursquareVenue(raw, fallbackImage = null) {
  const {
    fsq_id,
    name,
    categories = [],
    location = {},
    geocodes = {},
    rating,
    distance,
    photos = [],
    hours,
    tel,
    website,
    description,
    tips = [],
  } = raw

  const primaryCategory = categories[0] || {}
  const coords = geocodes.main || geocodes.roof || {}

  // Foursquare rating is 0–10; app uses 0–5
  const normalisedRating = rating ? (rating / 2).toFixed(1) : '4.0'

  // Distance from search origin in km
  const distanceKm =
    typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : 'Nearby'

  // Best available photo: use 500-wide variant
  const heroImage =
    photos.length > 0
      ? `${photos[0].prefix}500x300${photos[0].suffix}`
      : fallbackImage ||
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'

  // All photos for the gallery
  const allPhotos = photos.map(
    (p) => `${p.prefix}500x300${p.suffix}`
  )

  // Address
  const address =
    location.formatted_address ||
    [location.address, location.locality, location.region]
      .filter(Boolean)
      .join(', ') ||
    'Sydney, NSW'

  return {
    /* ── Core fields (shared with static venues) ── */
    id: `fsq_${fsq_id}`,
    name,
    category: primaryCategory.name || 'Venue',
    address,
    lat: coords.latitude || SYDNEY_CENTER.lat,
    lng: coords.longitude || SYDNEY_CENTER.lng,
    rating: normalisedRating,
    distance: distanceKm,
    image: heroImage,
    description: description || `${primaryCategory.name || 'Venue'} in Sydney, Australia.`,

    /* ── Foursquare-specific extras ── */
    isFoursquare: true,
    fsq_id,
    phone: tel || null,
    website: website || null,
    hours: hours || null,
    photos: allPhotos,
    tips,
    categories,
  }
}

/**
 * Search Foursquare for places near a location.
 *
 * @param {Object}  opts
 * @param {string}  [opts.query='']        - Free-text search term
 * @param {number}  [opts.lat]             - Latitude (defaults to Sydney CBD)
 * @param {number}  [opts.lng]             - Longitude (defaults to Sydney CBD)
 * @param {string}  [opts.categoryId]      - Foursquare category ID
 * @param {number}  [opts.radius=15000]    - Search radius in metres
 * @param {number}  [opts.limit=20]        - Max results (1–50)
 * @returns {Promise<Object[]>}            - Array of normalised venue objects
 */
export async function searchVenues({
  query = '',
  lat = SYDNEY_CENTER.lat,
  lng = SYDNEY_CENTER.lng,
  categoryId = null,
  radius = 15000,
  limit = 20,
} = {}) {
  const client = buildClient()

  const params = {
    ll: `${lat},${lng}`,
    radius,
    limit,
    // Request rich fields in one call
    fields:
      'fsq_id,name,categories,location,geocodes,rating,distance,photos,hours,tel,website,description,tips',
  }

  if (query) params.query = query
  if (categoryId) params.categories = categoryId

  const response = await client.get('/places/search', { params })
  const results = response.data?.results || []

  return results.map((r) => normalizeFoursquareVenue(r))
}

/**
 * Fetch full details for a single Foursquare place by its fsq_id.
 *
 * @param {string} fsqId - The Foursquare place ID (without the "fsq_" prefix)
 * @returns {Promise<Object>} Normalised venue object with extended data
 */
export async function getVenueDetails(fsqId) {
  const client = buildClient()
  const response = await client.get(`/places/${fsqId}`, {
    params: {
      fields:
        'fsq_id,name,categories,location,geocodes,rating,distance,photos,hours,tel,website,description,tips',
    },
  })
  return normalizeFoursquareVenue(response.data)
}

/**
 * Fetch photos for a Foursquare place.
 *
 * @param {string} fsqId  - Foursquare place ID
 * @param {number} limit  - Max photos to return (default 10)
 * @returns {Promise<string[]>} Array of full-resolution photo URLs
 */
export async function getVenuePhotos(fsqId, limit = 10) {
  const client = buildClient()
  const response = await client.get(`/places/${fsqId}/photos`, {
    params: { limit },
  })
  return (response.data || []).map((p) => `${p.prefix}original${p.suffix}`)
}

/**
 * Fetch user tips (micro-reviews) for a Foursquare place.
 *
 * @param {string} fsqId  - Foursquare place ID
 * @param {number} limit  - Max tips to return (default 5)
 * @returns {Promise<Object[]>} Array of tip objects
 */
export async function getVenueTips(fsqId, limit = 5) {
  const client = buildClient()
  const response = await client.get(`/places/${fsqId}/tips`, {
    params: { limit },
  })
  return response.data || []
}
