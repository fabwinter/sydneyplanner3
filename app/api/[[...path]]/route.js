import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Get all venues - GET /api/venues
    if (route === '/venues' && method === 'GET') {
      return handleCORS(NextResponse.json({
        venues: sydneyVenues,
        total: sydneyVenues.length
      }))
    }

    // Get venue by ID - GET /api/venues/:id
    if (route.startsWith('/venues/') && method === 'GET') {
      const venueId = path[1]
      const venue = sydneyVenues.find(v => v.id === venueId)
      
      if (!venue) {
        return handleCORS(NextResponse.json(
          { error: "Venue not found" },
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json(venue))
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
