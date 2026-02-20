import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  searchVenues as fsqSearch,
  getVenueDetails as fsqGetDetails,
  getVenuePhotos as fsqGetPhotos,
  getVenueTips as fsqGetTips,
} from '@/lib/foursquare'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const sydneyVenues = [
  {
    id: 'sv-1',
    name: 'The Grounds of Alexandria',
    category: 'Cafe',
    address: '7A/2 Huntley St, Alexandria NSW',
    lat: -33.9107,
    lng: 151.1957,
    rating: 4.5,
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    description: 'A stunning cafe and garden space with artisan coffee and fresh pastries.'
  },
  {
    id: 'sv-2',
    name: 'Bondi Beach',
    category: 'Beach',
    address: 'Queen Elizabeth Dr, Bondi Beach NSW',
    lat: -33.8915,
    lng: 151.2767,
    rating: 4.7,
    distance: '8.5 km',
    image: 'https://images.unsplash.com/photo-1527731149372-fae504a1185f?w=400&h=300&fit=crop',
    description: "Sydney's most famous beach with golden sand and excellent surf."
  },
  {
    id: 'sv-3',
    name: 'Quay Restaurant',
    category: 'Restaurant',
    address: 'Upper Level, Overseas Passenger Terminal',
    lat: -33.8582,
    lng: 151.2100,
    rating: 4.9,
    distance: '5.2 km',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    description: 'Award-winning fine dining with stunning Opera House views.'
  },
  {
    id: 'sv-4',
    name: 'Royal Botanic Garden',
    category: 'Nature',
    address: 'Mrs Macquaries Rd, Sydney NSW',
    lat: -33.8642,
    lng: 151.2166,
    rating: 4.8,
    distance: '4.8 km',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
    description: 'Beautiful 30-hectare garden in the heart of the city.'
  },
  {
    id: 'sv-5',
    name: 'Single O',
    category: 'Cafe',
    address: '60-64 Reservoir St, Surry Hills NSW',
    lat: -33.8836,
    lng: 151.2108,
    rating: 4.6,
    distance: '3.1 km',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    description: 'Specialty coffee roasters with a great working atmosphere.'
  },
  {
    id: 'sv-6',
    name: 'Coogee Beach',
    category: 'Beach',
    address: 'Coogee Bay Rd, Coogee NSW',
    lat: -33.9200,
    lng: 151.2576,
    rating: 4.6,
    distance: '9.2 km',
    image: 'https://images.unsplash.com/photo-1553039923-b7c666a88d9e?w=400&h=300&fit=crop',
    description: 'Family-friendly beach with calm waters and ocean pool.'
  },
  {
    id: 'sv-7',
    name: 'Chin Chin',
    category: 'Restaurant',
    address: 'Ivy, 330 George St, Sydney NSW',
    lat: -33.8688,
    lng: 151.2093,
    rating: 4.4,
    distance: '4.5 km',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    description: 'Modern Southeast Asian cuisine in a vibrant setting.'
  },
  {
    id: 'sv-8',
    name: 'Taronga Zoo',
    category: 'Attraction',
    address: 'Bradleys Head Rd, Mosman NSW',
    lat: -33.8436,
    lng: 151.2411,
    rating: 4.5,
    distance: '7.8 km',
    image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400&h=300&fit=crop',
    description: 'World-class zoo with stunning harbor views.'
  },
  {
    id: 'sv-9',
    name: 'Manly Beach',
    category: 'Beach',
    address: 'Manly NSW',
    lat: -33.7969,
    lng: 151.2879,
    rating: 4.7,
    distance: '14.2 km',
    image: 'https://images.unsplash.com/photo-1634473171198-d1fca67ca430?w=400&h=300&fit=crop',
    description: 'Beautiful beach accessible by ferry from Circular Quay.'
  },
  {
    id: 'sv-10',
    name: 'White Rabbit Gallery',
    category: 'Museum',
    address: '30 Balfour St, Chippendale NSW',
    lat: -33.8877,
    lng: 151.1986,
    rating: 4.7,
    distance: '2.8 km',
    image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop',
    description: 'Contemporary Chinese art museum with free entry.'
  }
]

async function getAIResponse(query) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMERGENT_LLM_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a friendly Sydney travel assistant called Sydney Planner. You help users discover the best venues, cafes, beaches, restaurants, and attractions in Sydney, Australia.

When recommending places, be enthusiastic and knowledgeable about Sydney. Include helpful tips like best times to visit, what to order, or hidden features.

Keep responses concise and friendly - 2-3 sentences max. Use Australian slang occasionally like "G'day", "arvo" (afternoon), "brekkie" (breakfast), etc.

Do NOT include venue names in your response text - the venues will be shown separately as cards.`
          },
          { role: 'user', content: query }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    })

    if (!response.ok) throw new Error('AI API error')

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('AI Error:', error)
    return "G'day! Here are some great spots I found for you in Sydney! Each one is a local favorite."
  }
}

function filterVenues(query) {
  const q = query.toLowerCase()
  let filtered = sydneyVenues

  if (q.includes('brunch') || q.includes('breakfast') || q.includes('cafe') || q.includes('coffee')) {
    filtered = sydneyVenues.filter(v => v.category === 'Cafe')
  } else if (q.includes('beach') || q.includes('swim') || q.includes('surf') || q.includes('family')) {
    filtered = sydneyVenues.filter(v => v.category === 'Beach')
  } else if (q.includes('dinner') || q.includes('restaurant') || q.includes('romantic') || q.includes('food')) {
    filtered = sydneyVenues.filter(v => v.category === 'Restaurant')
  } else if (q.includes('nature') || q.includes('walk') || q.includes('hike') || q.includes('park')) {
    filtered = sydneyVenues.filter(v => v.category === 'Nature')
  } else if (q.includes('museum') || q.includes('art') || q.includes('gallery')) {
    filtered = sydneyVenues.filter(v => v.category === 'Museum')
  } else if (q.includes('hidden') || q.includes('gem') || q.includes('secret')) {
    filtered = sydneyVenues.filter(v => v.rating >= 4.6)
  } else if (q.includes('work') || q.includes('quiet') || q.includes('study')) {
    filtered = sydneyVenues.filter(v => v.category === 'Cafe')
  }

  if (filtered.length === 0) {
    filtered = [...sydneyVenues].sort((a, b) => b.rating - a.rating).slice(0, 5)
  }

  return filtered.slice(0, 5)
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({
        message: "Welcome to Sydney Planner API",
        version: "1.0.0"
      }))
    }

    if (route === '/chat' && method === 'POST') {
      const body = await request.json()
      const { query } = body

      if (!query) {
        return handleCORS(NextResponse.json({ error: "Query is required" }, { status: 400 }))
      }

      const [aiMessage, venues] = await Promise.all([
        getAIResponse(query),
        Promise.resolve(filterVenues(query))
      ])

      return handleCORS(NextResponse.json({ message: aiMessage, venues, query }))
    }

    if (route === '/venues' && method === 'GET') {
      return handleCORS(NextResponse.json({ venues: sydneyVenues, total: sydneyVenues.length }))
    }

    if (route.startsWith('/venues/') && method === 'GET') {
      const venueId = path[1]
      const venue = sydneyVenues.find(v => v.id === venueId)
      if (!venue) {
        return handleCORS(NextResponse.json({ error: "Venue not found" }, { status: 404 }))
      }
      return handleCORS(NextResponse.json(venue))
    }

    if (route === '/search' && method === 'GET') {
      const url = new URL(request.url)
      const q = url.searchParams.get('q') || ''
      const venues = filterVenues(q)
      return handleCORS(NextResponse.json({ venues, query: q, total: venues.length }))
    }

    if (route === '/checkins' && method === 'POST') {
      const body = await request.json()
      const { venue_id, venue_name, venue_category, venue_address, venue_lat, venue_lng, venue_image, rating, comment, photos, user_id } = body

      if (!venue_id || !rating) {
        return handleCORS(NextResponse.json({ error: "venue_id and rating are required" }, { status: 400 }))
      }

      const checkinId = uuidv4()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('checkins')
        .insert([{
          id: checkinId,
          user_id: user_id || 'anonymous',
          venue_id,
          venue_name,
          venue_category,
          venue_address,
          venue_lat,
          venue_lng,
          venue_image,
          rating,
          comment: comment || '',
          photos: photos || [],
          created_at: now
        }])
        .select()

      if (error) {
        console.error('Supabase checkin error:', error.message)
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }

      return handleCORS(NextResponse.json({
        success: true,
        id: checkinId,
        data,
        message: 'Check-in saved successfully'
      }))
    }

    if (route === '/checkins' && method === 'GET') {
      const url = new URL(request.url)
      const user_id = url.searchParams.get('user_id') || 'anonymous'

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase checkins fetch error:', error.message)
        return handleCORS(NextResponse.json({ checkins: [], total: 0 }))
      }

      return handleCORS(NextResponse.json({ checkins: data || [], total: (data || []).length }))
    }

    if (route.startsWith('/checkins/') && method === 'DELETE') {
      const checkinId = path[1]
      if (!checkinId) {
        return handleCORS(NextResponse.json({ error: "Check-in ID is required" }, { status: 400 }))
      }

      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', checkinId)

      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }

      return handleCORS(NextResponse.json({ success: true, message: 'Check-in deleted successfully' }))
    }

    if (route.startsWith('/checkins/') && method === 'PATCH') {
      const checkinId = path[1]
      if (!checkinId) {
        return handleCORS(NextResponse.json({ error: "Check-in ID is required" }, { status: 400 }))
      }

      const body = await request.json()
      const updateFields = {}
      if (body.rating !== undefined) updateFields.rating = body.rating
      if (body.comment !== undefined) updateFields.comment = body.comment
      if (body.photos !== undefined) updateFields.photos = body.photos
      updateFields.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('checkins')
        .update(updateFields)
        .eq('id', checkinId)

      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }

      return handleCORS(NextResponse.json({ success: true, message: 'Check-in updated successfully' }))
    }

    if (route === '/saves' && method === 'POST') {
      const body = await request.json()
      const { venue_id, venue_name, venue_category, venue_image, user_id } = body

      if (!venue_id) {
        return handleCORS(NextResponse.json({ error: "venue_id is required" }, { status: 400 }))
      }

      const uid = user_id || 'anonymous'

      const { data: existing } = await supabase
        .from('saves')
        .select('id')
        .eq('user_id', uid)
        .eq('venue_id', venue_id)
        .maybeSingle()

      if (existing) {
        await supabase.from('saves').delete().eq('id', existing.id)
        return handleCORS(NextResponse.json({ success: true, action: 'removed', message: 'Venue removed from saves' }))
      }

      const saveId = uuidv4()
      const { error } = await supabase
        .from('saves')
        .insert([{
          id: saveId,
          user_id: uid,
          venue_id,
          venue_name,
          venue_category,
          venue_image,
          created_at: new Date().toISOString()
        }])

      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }

      return handleCORS(NextResponse.json({ success: true, action: 'saved', id: saveId, message: 'Venue saved successfully' }))
    }

    if (route === '/saves' && method === 'GET') {
      const url = new URL(request.url)
      const user_id = url.searchParams.get('user_id') || 'anonymous'

      const { data, error } = await supabase
        .from('saves')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

      return handleCORS(NextResponse.json({ saves: data || [], total: (data || []).length }))
    }

    if (route === '/upload' && method === 'POST') {
      try {
        const formData = await request.formData()
        const file = formData.get('file')
        const userId = formData.get('user_id') || 'anonymous'

        if (!file) {
          return handleCORS(NextResponse.json({ error: "No file provided" }, { status: 400 }))
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
          return handleCORS(NextResponse.json({ error: "Invalid file type. Allowed: jpeg, png, webp, gif" }, { status: 415 }))
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        if (buffer.length > 5 * 1024 * 1024) {
          return handleCORS(NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 413 }))
        }

        const timestamp = Date.now()
        const extension = file.name.split('.').pop() || 'jpg'
        const fileName = `${timestamp}-${uuidv4().slice(0, 8)}.${extension}`
        const filePath = `${userId}/${fileName}`

        const { data, error } = await supabase.storage
          .from('checkin-photos')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          const base64 = buffer.toString('base64')
          const dataUrl = `data:${file.type};base64,${base64}`

          if (dataUrl.length > 500000) {
            return handleCORS(NextResponse.json({ error: 'Image too large for base64 storage.' }, { status: 413 }))
          }

          return handleCORS(NextResponse.json({ success: true, url: dataUrl, storage: 'base64' }))
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('checkin-photos')
          .createSignedUrl(filePath, 31536000)

        if (signedUrlError) {
          const { data: publicUrlData } = supabase.storage
            .from('checkin-photos')
            .getPublicUrl(filePath)

          return handleCORS(NextResponse.json({ success: true, url: publicUrlData.publicUrl, path: filePath, storage: 'supabase' }))
        }

        return handleCORS(NextResponse.json({ success: true, url: signedUrlData.signedUrl, path: filePath, storage: 'supabase' }))
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        return handleCORS(NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 }))
      }
    }

    if (route === '/photos/signed-url' && method === 'GET') {
      const url = new URL(request.url)
      const filePath = url.searchParams.get('path')
      const expiresIn = parseInt(url.searchParams.get('expires_in') || '3600')

      if (!filePath) {
        return handleCORS(NextResponse.json({ error: "File path is required" }, { status: 400 }))
      }

      const { data, error } = await supabase.storage
        .from('checkin-photos')
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }

      return handleCORS(NextResponse.json({ success: true, signedUrl: data.signedUrl, path: filePath, expiresIn }))
    }

    if (route.startsWith('/photos/') && method === 'DELETE') {
      const filePath = decodeURIComponent(path.slice(1).join('/'))

      if (!filePath) {
        return handleCORS(NextResponse.json({ error: "File path is required" }, { status: 400 }))
      }

      const { error } = await supabase.storage
        .from('checkin-photos')
        .remove([filePath])

      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }

      return handleCORS(NextResponse.json({ success: true, deleted: filePath }))
    }

    if (route === '/foursquare/search' && method === 'GET') {
      const url = new URL(request.url)
      const query = url.searchParams.get('q') || ''
      const lat = parseFloat(url.searchParams.get('lat')) || -33.8688
      const lng = parseFloat(url.searchParams.get('lng')) || 151.2093
      const categoryId = url.searchParams.get('category') || null
      const radius = parseInt(url.searchParams.get('radius')) || 15000
      const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50)

      try {
        const venues = await fsqSearch({ query, lat, lng, categoryId, radius, limit })
        return handleCORS(NextResponse.json({ venues, total: venues.length, source: 'foursquare' }))
      } catch (err) {
        console.error('Foursquare search error:', err.message)
        return handleCORS(
          NextResponse.json(
            { error: 'Foursquare search failed', details: err.message, venues: [], total: 0 },
            { status: err.message.includes('FOURSQUARE_API_KEY') ? 503 : 502 }
          )
        )
      }
    }

    if (route.startsWith('/foursquare/venues/') && !route.endsWith('/photos') && !route.endsWith('/tips') && method === 'GET') {
      const fsqId = path[2]
      if (!fsqId) {
        return handleCORS(NextResponse.json({ error: 'fsqId is required' }, { status: 400 }))
      }
      try {
        const venue = await fsqGetDetails(fsqId)
        return handleCORS(NextResponse.json(venue))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Failed to fetch venue', details: err.message }, { status: 502 }))
      }
    }

    if (route.startsWith('/foursquare/venues/') && route.endsWith('/photos') && method === 'GET') {
      const fsqId = path[2]
      const url = new URL(request.url)
      const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 20)

      if (!fsqId) {
        return handleCORS(NextResponse.json({ error: 'fsqId is required' }, { status: 400 }))
      }
      try {
        const photos = await fsqGetPhotos(fsqId, limit)
        return handleCORS(NextResponse.json({ photos, total: photos.length }))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Failed to fetch photos', photos: [], total: 0 }, { status: 502 }))
      }
    }

    if (route.startsWith('/foursquare/venues/') && route.endsWith('/tips') && method === 'GET') {
      const fsqId = path[2]
      const url = new URL(request.url)
      const limit = Math.min(parseInt(url.searchParams.get('limit')) || 5, 10)

      if (!fsqId) {
        return handleCORS(NextResponse.json({ error: 'fsqId is required' }, { status: 400 }))
      }
      try {
        const tips = await fsqGetTips(fsqId, limit)
        return handleCORS(NextResponse.json({ tips, total: tips.length }))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Failed to fetch tips', tips: [], total: 0 }, { status: 502 }))
      }
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
