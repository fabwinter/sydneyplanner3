'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, SlidersHorizontal, MapPin, Star, Heart, ChevronRight, 
  Home, Map, Clock, MessageCircle, User, List, X, Navigation,
  Coffee, Umbrella, Utensils, TreePine, Building, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
    </div>
  )
})

const categories = [
  { id: 'all', label: 'For you', icon: Star },
  { id: 'Restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'Cafe', label: 'Cafes', icon: Coffee },
  { id: 'Beach', label: 'Beaches', icon: Umbrella },
  { id: 'Nature', label: 'Nature', icon: TreePine },
  { id: 'Museum', label: 'Museums', icon: Building },
]

const BottomNav = ({ active = 'map' }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/chat' },
    { id: 'map', icon: Map, label: 'Map', href: '/explore' },
    { id: 'timeline', icon: Clock, label: 'Timeline', href: '/timeline' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', href: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#00A8CC] bg-[#00A8CC]/10' 
                  : 'text-gray-500 hover:text-[#00A8CC]'
              }`}
              onClick={() => navigator.vibrate && navigator.vibrate(30)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const VenueCard = ({ venue, compact = false }) => {
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.stopPropagation()
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved to favorites!')
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 glass-card rounded-xl"
      >
        <img 
          src={venue.image} 
          alt={venue.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{venue.name}</h3>
          <p className="text-xs text-gray-500 truncate">{venue.category} • {venue.distance}</p>
          <div className="flex items-center mt-1">
            <Star className="w-3 h-3 text-[#F4A261] fill-[#F4A261]" />
            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{venue.rating}</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`p-2 rounded-full transition-all ${
            saved ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative h-40 overflow-hidden">
          <img 
            src={venue.image} 
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                saved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700">
              {venue.category}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{venue.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">{venue.address}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-[#F4A261] fill-[#F4A261]" />
                <span className="ml-1 font-semibold text-gray-700 dark:text-gray-300">{venue.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">{venue.distance}</span>
            </div>
            <Link href={`/venue/${venue.id}`}>
              <Button size="sm" variant="outline" className="rounded-full text-[#00A8CC] border-[#00A8CC] hover:bg-[#00A8CC] hover:text-white">
                View <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const ExplorePage = () => {
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)

  // Fetch venues on mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('/api/venues')
        const data = await response.json()
        setVenues(data.venues || [])
        setFilteredVenues(data.venues || [])
      } catch (error) {
        console.error('Error fetching venues:', error)
        toast.error('Failed to load venues')
      } finally {
        setIsLoading(false)
      }
    }
    fetchVenues()

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Default to Sydney CBD
          setUserLocation({ lat: -33.8688, lng: 151.2093 })
        }
      )
    }
  }, [])

  // Filter venues when category or search changes
  useEffect(() => {
    let filtered = venues

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.category === selectedCategory)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.category.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      )
    }

    setFilteredVenues(filtered)
  }, [selectedCategory, searchQuery, venues])

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'list' : 'map')
    if (navigator.vibrate) navigator.vibrate(30)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="pl-10 rounded-full bg-gray-100 dark:bg-gray-800 border-0 h-11"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full h-11 w-11 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Location & Categories */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <Navigation className="w-4 h-4" />
              <span className="font-medium">Sydney</span>
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    if (navigator.vibrate) navigator.vibrate(30)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-medium text-sm">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
          </div>
        ) : viewMode === 'map' ? (
          // Map View
          <div className="relative h-[calc(100vh-220px)]">
            <MapComponent 
              venues={filteredVenues}
              selectedVenue={selectedVenue}
              onVenueSelect={handleVenueSelect}
              userLocation={userLocation}
            />

            {/* Selected Venue Card */}
            <AnimatePresence>
              {selectedVenue && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-4 left-4 right-4 z-[1000]"
                >
                  <div className="relative">
                    <button
                      onClick={() => setSelectedVenue(null)}
                      className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-gray-900 text-white shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <VenueCard venue={selectedVenue} compact />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // List View
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === 'all' ? 'All Venues' : categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <span className="text-sm text-gray-500">{filteredVenues.length} places</span>
            </div>

            {/* Venue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVenues.map((venue, idx) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>

            {filteredVenues.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No venues found</p>
              </div>
            )}
          </div>
        )}

        {/* View Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleViewMode}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl"
        >
          {viewMode === 'map' ? (
            <>
              <List className="w-5 h-5" />
              <span className="font-medium">List</span>
            </>
          ) : (
            <>
              <Map className="w-5 h-5" />
              <span className="font-medium">Map</span>
            </>
          )}
        </motion.button>
      </div>

      <BottomNav active="map" />
    </div>
  )
}

export default ExplorePage
