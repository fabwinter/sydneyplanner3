'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Star, Heart, ChevronRight, 
  Home, Map, Clock, MessageCircle, User, List, Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
    </div>
  )
})

const BottomNav = ({ active = 'explore' }) => {
  const navItems = [
    { id: 'home', icon: MessageCircle, label: 'Chats', href: '/chat', filled: true },
    { id: 'explore', icon: Map, label: 'Explore', href: '/explore' },
    { id: 'timeline', icon: Clock, label: 'Timeline', href: '/timeline' },
    { id: 'saved', icon: Heart, label: 'Saved', href: '/saved' },
    { id: 'profile', icon: User, label: 'Me', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
                isActive 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => navigator.vibrate && navigator.vibrate(30)}
            >
              <Icon className={`w-6 h-6 ${isActive && item.filled ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const VenueCard = ({ venue }) => {
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.stopPropagation()
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved!')
  }

  return (
    <Card className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl">
      <div className="relative h-36 overflow-hidden">
        <img 
          src={venue.image} 
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all ${
            saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700">
            {venue.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{venue.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{venue.address}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{venue.rating}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-500">{venue.distance}</span>
          </div>
          <Link href={`/venue/${venue.id}`}>
            <span className="text-[#00A8CC] font-medium text-sm flex items-center hover:underline">
              View <ChevronRight className="w-4 h-4 ml-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </Card>
  )
}

const ExplorePage = () => {
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('map')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const filtered = venues.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.category.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      )
      setFilteredVenues(filtered)
    } else {
      setFilteredVenues(venues)
    }
  }, [searchQuery, venues])

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
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 safe-top">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Sydney..."
              className="pl-10 rounded-full bg-gray-100 dark:bg-gray-800 border-0 h-11"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
        </div>
      ) : viewMode === 'map' ? (
        // Map View
        <div className="relative h-[calc(100vh-140px)]">
          <MapComponent 
            venues={filteredVenues}
            selectedVenue={selectedVenue}
            onVenueSelect={handleVenueSelect}
            fitBounds={true}
          />

          {/* Selected Venue Card */}
          <AnimatePresence>
            {selectedVenue && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-20 left-4 right-4 z-[1000]"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <img 
                      src={selectedVenue.image} 
                      alt={selectedVenue.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{selectedVenue.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{selectedVenue.category} • {selectedVenue.distance}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedVenue.rating}</span>
                      </div>
                    </div>
                    <Link href={`/venue/${selectedVenue.id}`} className="self-center">
                      <span className="text-[#00A8CC] font-medium text-sm">View</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // List View
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="grid gap-4">
            {filteredVenues.map((venue) => (
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
      >
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:shadow-xl transition-all active:scale-95"
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
        </button>
      </motion.div>

      <BottomNav active="explore" />
    </div>
  )
}

export default ExplorePage
