import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  searchVenues as fsqSearch,
  getVenueDetails as fsqGetDetails,
  getVenuePhotos as fsqGetPhotos,
  getVenueTips as fsqGetTips,
} from '@/lib/foursquare'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Sample Sydney venues data
const sydneyVenues = [
  {
    id: uuidv4(),
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
    id: uuidv4(),
    name: 'Bondi Beach',
    category: 'Beach',
    address: 'Queen Elizabeth Dr, Bondi Beach NSW',
    lat: -33.8915,
    lng: 151.2767,
    rating: 4.7,
    distance: '8.5 km',
    image: 'https://images.unsplash.com/photo-1527731149372-fae504a1185f?w=400&h=300&fit=crop',
    description: 'Sydney\'s most famous beach with golden sand and excellent surf.'
  },
  {
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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

// AI Chat function using Emergent LLM
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
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      throw new Error('AI API error')
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('AI Error:', error)
    return "G'day! Here are some great spots I found for you in Sydney! Each one is a local favorite."
  }
}

// Filter venues based on query
function filterVenues(query) {
  const q = query.toLowerCase()
  
  let filtered = sydneyVenues
  
  // Filter by category keywords
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
  
  // If no specific filter, return top rated venues
  if (filtered.length === 0) {
    filtered = sydneyVenues.sort((a, b) => b.rating - a.rating).slice(0, 5)
  }
  
  return filtered.slice(0, 5)
}

// God mode guard
function isGodModeRequest(request) {
  const email = request.headers.get('x-god-mode-email')
  const godModeEmail = process.env.GOD_MODE_EMAIL
  return !!(email && godModeEmail && email === godModeEmail)
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Welcome to Sydney Planner API",
        version: "1.0.0"
      }))
    }

    // Chat endpoint - POST /api/chat
    if (route === '/chat' && method === 'POST') {
      const body = await request.json()
      const { query } = body

      if (!query) {
        return handleCORS(NextResponse.json(
          { error: "Query is required" },
          { status: 400 }
        ))
      }

      // Get AI response and filter venues
      const [aiMessage, venues] = await Promise.all([
        getAIResponse(query),
        Promise.resolve(filterVenues(query))
      ])

      return handleCORS(NextResponse.json({
        message: aiMessage,
        venues: venues,
        query: query
      }))
    }

    // Get all venues - GET /api/venues (static + MongoDB)
    if (route === '/venues' && method === 'GET') {
      try {
        const database = await connectToMongo()
        const dbVenues = await database.collection('venues').find({}).toArray()
        // Merge: static venues + db-only venues (avoid duplicates by id)
        const staticIds = new Set(sydneyVenues.map(v => v.id))
        const dbOnlyVenues = dbVenues.filter(v => !staticIds.has(v.id))
        const allVenues = [...sydneyVenues, ...dbOnlyVenues]
        return handleCORS(NextResponse.json({ venues: allVenues, total: allVenues.length }))
      } catch (err) {
        return handleCORS(NextResponse.json({ venues: sydneyVenues, total: sydneyVenues.length }))
      }
    }

    // Create venue - POST /api/venues (god mode only)
    if (route === '/venues' && method === 'POST') {
      if (!isGodModeRequest(request)) {
        return handleCORS(NextResponse.json({ error: 'God mode required' }, { status: 403 }))
      }
      const body = await request.json()
      const { name, category, address, lat, lng, rating, description, image, fsqId } = body

      if (!name || !category) {
        return handleCORS(NextResponse.json({ error: 'Name and category are required' }, { status: 400 }))
      }

      const venueId = uuidv4()
      const now = new Date().toISOString()
      const venue = {
        id: venueId,
        name,
        category,
        address: address || '',
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        rating: parseFloat(rating) || 0,
        description: description || '',
        image: image || '',
        distance: '0 km',
        fsqId: fsqId || null,
        isDbVenue: true,
        created_at: now,
        updated_at: now,
      }

      try {
        const database = await connectToMongo()
        await database.collection('venues').insertOne(venue)
        return handleCORS(NextResponse.json({ success: true, venue, message: 'Venue created' }))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Failed to create venue' }, { status: 500 }))
      }
    }

    // Get venue by ID - GET /api/venues/:id
    if (route.startsWith('/venues/') && method === 'GET') {
      const venueId = path[1]
      const venue = sydneyVenues.find(v => v.id === venueId)

      if (venue) return handleCORS(NextResponse.json(venue))

      // Check MongoDB
      try {
        const database = await connectToMongo()
        const dbVenue = await database.collection('venues').findOne({ id: venueId })
        if (!dbVenue) {
          return handleCORS(NextResponse.json({ error: 'Venue not found' }, { status: 404 }))
        }
        return handleCORS(NextResponse.json(dbVenue))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Venue not found' }, { status: 404 }))
      }
    }

    // Update venue - PUT /api/venues/:id (god mode only)
    if (route.startsWith('/venues/') && method === 'PUT') {
      if (!isGodModeRequest(request)) {
        return handleCORS(NextResponse.json({ error: 'God mode required' }, { status: 403 }))
      }
      const venueId = path[1]
      const body = await request.json()
      const { name, category, address, lat, lng, rating, description, image } = body

      const updateFields = { updated_at: new Date().toISOString() }
      if (name !== undefined) updateFields.name = name
      if (category !== undefined) updateFields.category = category
      if (address !== undefined) updateFields.address = address
      if (lat !== undefined) updateFields.lat = parseFloat(lat)
      if (lng !== undefined) updateFields.lng = parseFloat(lng)
      if (rating !== undefined) updateFields.rating = parseFloat(rating)
      if (description !== undefined) updateFields.description = description
      if (image !== undefined) updateFields.image = image

      try {
        const database = await connectToMongo()
        const result = await database.collection('venues').updateOne(
          { id: venueId },
          { $set: updateFields }
        )
        if (result.matchedCount === 0) {
          return handleCORS(NextResponse.json({ error: 'Venue not found' }, { status: 404 }))
        }
        const updatedVenue = await database.collection('venues').findOne({ id: venueId })
        return handleCORS(NextResponse.json({ success: true, venue: updatedVenue, message: 'Venue updated' }))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Failed to update venue' }, { status: 500 }))
      }
    }

    // Delete venue - DELETE /api/venues/:id (god mode only)
    if (route.startsWith('/venues/') && method === 'DELETE') {
      if (!isGodModeRequest(request)) {
        return handleCORS(NextResponse.json({ error: 'God mode required' }, { status: 403 }))
      }
      const venueId = path[1]
      try {
        const database = await connectToMongo()
        const result = await database.collection('venues').deleteOne({ id: venueId })
        if (result.deletedCount === 0) {
          return handleCORS(NextResponse.json({ error: 'Venue not found' }, { status: 404 }))
        }
        return handleCORS(NextResponse.json({ success: true, message: 'Venue deleted' }))
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 }))
      }
    }

    // Search venues - GET /api/search?q=...
    if (route === '/search' && method === 'GET') {
      const url = new URL(request.url)
      const q = url.searchParams.get('q') || ''
      const venues = filterVenues(q)
      
      return handleCORS(NextResponse.json({
        venues: venues,
        query: q,
        total: venues.length
      }))
    }

    // =====================
    // CHECK-IN ENDPOINTS
    // =====================

    // Create check-in - POST /api/checkins
    if (route === '/checkins' && method === 'POST') {
      const body = await request.json()
      const { venue_id, venue_name, venue_category, venue_address, venue_lat, venue_lng, venue_image, rating, comment, photos, user_id } = body
      
      if (!venue_id || !rating) {
        return handleCORS(NextResponse.json(
          { error: "venue_id and rating are required" },
          { status: 400 }
        ))
      }

      const checkinId = uuidv4()
      const now = new Date().toISOString()

      // Try to save to Supabase
      try {
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
          console.log('Supabase error (table may not exist):', error.message)
          // Fall back to MongoDB if Supabase table doesn't exist
          const database = await connectToMongo()
          const result = await database.collection('checkins').insertOne({
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
          })
          
          return handleCORS(NextResponse.json({
            success: true,
            id: checkinId,
            message: 'Check-in saved to MongoDB',
            storage: 'mongodb'
          }))
        }

        return handleCORS(NextResponse.json({
          success: true,
          id: checkinId,
          data: data,
          message: 'Check-in saved successfully',
          storage: 'supabase'
        }))
      } catch (err) {
        console.error('Check-in save error:', err)
        // Fallback to MongoDB
        const database = await connectToMongo()
        await database.collection('checkins').insertOne({
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
        })
        
        return handleCORS(NextResponse.json({
          success: true,
          id: checkinId,
          message: 'Check-in saved to MongoDB',
          storage: 'mongodb'
        }))
      }
    }

    // Get user check-ins - GET /api/checkins?user_id=...
    if (route === '/checkins' && method === 'GET') {
      const url = new URL(request.url)
      const user_id = url.searchParams.get('user_id') || 'anonymous'
      
      try {
        // Try Supabase first
        const { data, error } = await supabase
          .from('checkins')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.log('Supabase error:', error.message)
          // Fallback to MongoDB
          const database = await connectToMongo()
          const checkins = await database.collection('checkins')
            .find({ user_id })
            .sort({ created_at: -1 })
            .toArray()
          
          return handleCORS(NextResponse.json({
            checkins: checkins,
            total: checkins.length,
            storage: 'mongodb'
          }))
        }

        return handleCORS(NextResponse.json({
          checkins: data || [],
          total: (data || []).length,
          storage: 'supabase'
        }))
      } catch (err) {
        // Fallback to MongoDB
        const database = await connectToMongo()
        const checkins = await database.collection('checkins')
          .find({ user_id })
          .sort({ created_at: -1 })
          .toArray()
        
        return handleCORS(NextResponse.json({
          checkins: checkins,
          total: checkins.length,
          storage: 'mongodb'
        }))
      }
    }

    // Delete check-in - DELETE /api/checkins/:id
    if (route.startsWith('/checkins/') && method === 'DELETE') {
      const checkinId = path[1]
      
      if (!checkinId) {
        return handleCORS(NextResponse.json(
          { error: "Check-in ID is required" },
          { status: 400 }
        ))
      }

      try {
        const database = await connectToMongo()
        const result = await database.collection('checkins').deleteOne({ id: checkinId })
        
        if (result.deletedCount === 0) {
          return handleCORS(NextResponse.json(
            { error: "Check-in not found" },
            { status: 404 }
          ))
        }

        return handleCORS(NextResponse.json({
          success: true,
          message: 'Check-in deleted successfully'
        }))
      } catch (err) {
        console.error('Delete check-in error:', err)
        return handleCORS(NextResponse.json(
          { error: "Failed to delete check-in" },
          { status: 500 }
        ))
      }
    }

    // Update check-in - PATCH /api/checkins/:id
    if (route.startsWith('/checkins/') && method === 'PATCH') {
      const checkinId = path[1]
      
      if (!checkinId) {
        return handleCORS(NextResponse.json(
          { error: "Check-in ID is required" },
          { status: 400 }
        ))
      }

      try {
        const body = await request.json()
        const { rating, comment, photos } = body
        
        const database = await connectToMongo()
        
        // Build update object
        const updateFields = {}
        if (rating !== undefined) updateFields.rating = rating
        if (comment !== undefined) updateFields.comment = comment
        if (photos !== undefined) updateFields.photos = photos
        updateFields.updated_at = new Date().toISOString()
        
        const result = await database.collection('checkins').updateOne(
          { id: checkinId },
          { $set: updateFields }
        )
        
        if (result.matchedCount === 0) {
          return handleCORS(NextResponse.json(
            { error: "Check-in not found" },
            { status: 404 }
          ))
        }

        return handleCORS(NextResponse.json({
          success: true,
          message: 'Check-in updated successfully'
        }))
      } catch (err) {
        console.error('Update check-in error:', err)
        return handleCORS(NextResponse.json(
          { error: "Failed to update check-in" },
          { status: 500 }
        ))
      }
    }

    // Save venue - POST /api/saves
    if (route === '/saves' && method === 'POST') {
      const body = await request.json()
      const { venue_id, venue_name, venue_category, venue_image, user_id } = body
      
      if (!venue_id) {
        return handleCORS(NextResponse.json(
          { error: "venue_id is required" },
          { status: 400 }
        ))
      }

      const saveId = uuidv4()
      const now = new Date().toISOString()

      try {
        const database = await connectToMongo()
        
        // Check if already saved
        const existing = await database.collection('saves').findOne({
          user_id: user_id || 'anonymous',
          venue_id
        })

        if (existing) {
          // Remove save
          await database.collection('saves').deleteOne({ id: existing.id })
          return handleCORS(NextResponse.json({
            success: true,
            action: 'removed',
            message: 'Venue removed from saves'
          }))
        }

        // Add save
        await database.collection('saves').insertOne({
          id: saveId,
          user_id: user_id || 'anonymous',
          venue_id,
          venue_name,
          venue_category,
          venue_image,
          created_at: now
        })
        
        return handleCORS(NextResponse.json({
          success: true,
          action: 'saved',
          id: saveId,
          message: 'Venue saved successfully'
        }))
      } catch (err) {
        console.error('Save error:', err)
        return handleCORS(NextResponse.json(
          { error: "Failed to save venue" },
          { status: 500 }
        ))
      }
    }

    // Get user saves - GET /api/saves?user_id=...
    if (route === '/saves' && method === 'GET') {
      const url = new URL(request.url)
      const user_id = url.searchParams.get('user_id') || 'anonymous'
      
      try {
        const database = await connectToMongo()
        const saves = await database.collection('saves')
          .find({ user_id })
          .sort({ created_at: -1 })
          .toArray()
        
        return handleCORS(NextResponse.json({
          saves: saves,
          total: saves.length
        }))
      } catch (err) {
        return handleCORS(NextResponse.json({
          saves: [],
          total: 0
        }))
      }
    }

    // Upload photo - POST /api/upload
    if (route === '/upload' && method === 'POST') {
      try {
        const formData = await request.formData()
        const file = formData.get('file')
        const userId = formData.get('user_id') || 'anonymous'
        
        if (!file) {
          return handleCORS(NextResponse.json(
            { error: "No file provided" },
            { status: 400 }
          ))
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
          return handleCORS(NextResponse.json(
            { error: "Invalid file type. Allowed: jpeg, png, webp, gif" },
            { status: 415 }
          ))
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          return handleCORS(NextResponse.json(
            { error: "File size exceeds 5MB limit" },
            { status: 413 }
          ))
        }

        // Generate unique filename with user folder structure
        const timestamp = Date.now()
        const extension = file.name.split('.').pop() || 'jpg'
        const fileName = `${timestamp}-${uuidv4().slice(0, 8)}.${extension}`
        const filePath = `${userId}/${fileName}`
        
        console.log('Attempting Supabase Storage upload to checkin-photos bucket...')

        // Try Supabase Storage first - using 'checkin-photos' bucket
        const { data, error } = await supabase.storage
          .from('checkin-photos')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.log('Supabase storage error:', error.message)
          console.log('Supabase storage error code:', error.statusCode || error.status)
          
          // Check if it's a bucket not found error - try creating it
          if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
            console.log('Bucket may not exist, attempting with fallback storage...')
          }
          
          // Fallback: Store in MongoDB with base64
          // Compress the data URL to reasonable size
          const base64 = buffer.toString('base64')
          const dataUrl = `data:${file.type};base64,${base64}`
          
          // If the data URL is too large (> 500KB), return error
          if (dataUrl.length > 500000) {
            return handleCORS(NextResponse.json({
              success: false,
              error: 'Image too large for base64 storage. Please use a smaller image.',
              note: 'Configure Supabase Storage bucket for larger files'
            }, { status: 413 }))
          }
          
          // Store as base64 data URL
          return handleCORS(NextResponse.json({
            success: true,
            url: dataUrl,
            storage: 'base64',
            note: 'Stored as base64 (Supabase bucket not configured)'
          }))
        }

        console.log('Supabase upload successful:', data.path)

        // Generate signed URL for private bucket access (valid for 1 year)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('checkin-photos')
          .createSignedUrl(filePath, 31536000) // 1 year in seconds

        if (signedUrlError) {
          console.log('Error creating signed URL:', signedUrlError.message)
          // Fall back to public URL
          const { data: publicUrlData } = supabase.storage
            .from('checkin-photos')
            .getPublicUrl(filePath)
          
          return handleCORS(NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            path: filePath,
            storage: 'supabase'
          }))
        }

        return handleCORS(NextResponse.json({
          success: true,
          url: signedUrlData.signedUrl,
          path: filePath,
          storage: 'supabase'
        }))
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        return handleCORS(NextResponse.json({
          success: false,
          error: 'Upload failed: ' + uploadError.message
        }, { status: 500 }))
      }
    }

    // Get signed URL for a photo - GET /api/photos/signed-url?path=...
    if (route === '/photos/signed-url' && method === 'GET') {
      const url = new URL(request.url)
      const filePath = url.searchParams.get('path')
      const expiresIn = parseInt(url.searchParams.get('expires_in') || '3600')
      
      if (!filePath) {
        return handleCORS(NextResponse.json(
          { error: "File path is required" },
          { status: 400 }
        ))
      }

      try {
        const { data, error } = await supabase.storage
          .from('checkin-photos')
          .createSignedUrl(filePath, expiresIn)

        if (error) {
          return handleCORS(NextResponse.json(
            { error: error.message },
            { status: 500 }
          ))
        }

        return handleCORS(NextResponse.json({
          success: true,
          signedUrl: data.signedUrl,
          path: filePath,
          expiresIn
        }))
      } catch (err) {
        return handleCORS(NextResponse.json(
          { error: 'Failed to generate signed URL' },
          { status: 500 }
        ))
      }
    }

    // Delete a photo - DELETE /api/photos/:path
    if (route.startsWith('/photos/') && method === 'DELETE') {
      const filePath = decodeURIComponent(path.slice(1).join('/'))
      
      if (!filePath) {
        return handleCORS(NextResponse.json(
          { error: "File path is required" },
          { status: 400 }
        ))
      }

      try {
        const { error } = await supabase.storage
          .from('checkin-photos')
          .remove([filePath])

        if (error) {
          return handleCORS(NextResponse.json(
            { error: error.message },
            { status: 500 }
          ))
        }

        return handleCORS(NextResponse.json({
          success: true,
          deleted: filePath
        }))
      } catch (err) {
        return handleCORS(NextResponse.json(
          { error: 'Failed to delete photo' },
          { status: 500 }
        ))
      }
    }

    // =====================
    // FOURSQUARE ENDPOINTS
    // =====================

    /**
     * Search Foursquare venues near Sydney
     * GET /api/foursquare/search?q=&lat=&lng=&category=&radius=&limit=
     */
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
        return handleCORS(
          NextResponse.json({ venues, total: venues.length, source: 'foursquare' })
        )
      } catch (err) {
        console.error('Foursquare search error:', err.message)
        // Surface a friendly error rather than 500 so the client can show a fallback
        return handleCORS(
          NextResponse.json(
            {
              error: 'Foursquare search failed',
              details: err.message,
              venues: [],
              total: 0,
            },
            { status: err.message.includes('FOURSQUARE_API_KEY') ? 503 : 502 }
          )
        )
      }
    }

    /**
     * Get full venue details from Foursquare
     * GET /api/foursquare/venues/:fsqId
     */
    if (route.startsWith('/foursquare/venues/') && !route.endsWith('/photos') && !route.endsWith('/tips') && method === 'GET') {
      const fsqId = path[2]
      if (!fsqId) {
        return handleCORS(NextResponse.json({ error: 'fsqId is required' }, { status: 400 }))
      }
      try {
        const venue = await fsqGetDetails(fsqId)
        return handleCORS(NextResponse.json(venue))
      } catch (err) {
        console.error('Foursquare venue details error:', err.message)
        return handleCORS(
          NextResponse.json({ error: 'Failed to fetch venue', details: err.message }, { status: 502 })
        )
      }
    }

    /**
     * Get venue photos from Foursquare
     * GET /api/foursquare/venues/:fsqId/photos?limit=10
     */
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
        console.error('Foursquare photos error:', err.message)
        return handleCORS(
          NextResponse.json({ error: 'Failed to fetch photos', photos: [], total: 0 }, { status: 502 })
        )
      }
    }

    /**
     * Get venue tips/reviews from Foursquare
     * GET /api/foursquare/venues/:fsqId/tips?limit=5
     */
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
        console.error('Foursquare tips error:', err.message)
        return handleCORS(
          NextResponse.json({ error: 'Failed to fetch tips', tips: [], total: 0 }, { status: 502 })
        )
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
