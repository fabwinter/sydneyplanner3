'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Star, Heart, ChevronRight, 
  Clock, MessageCircle, User, Map, Loader2, Navigation, RotateCcw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { useVenues } from '@/lib/VenueContext'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
    </div>
  )
})

const ExplorePage = () => {
  const router = useRouter()
  const { currentVenues } = useVenues()
  const [allVenues, setAllVenues] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [mapBounds, setMapBounds] = useState(null)
  const [showSearchHere, setShowSearchHere] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // Use current venues from chat if available, otherwise fetch all
  const displayVenues = currentVenues.length > 0 ? currentVenues : allVenues

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('/api/venues')
        const data = await response.json()
        setAllVenues(data.venues || [])
      } catch (error) {
        console.error('Error fetching venues:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVenues()
  }, [])

  const filteredVenues = searchQuery 
    ? displayVenues.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayVenues

  // Filter venues by map bounds
  const visibleVenues = mapBounds 
    ? filteredVenues.filter(v => 
        v.lat >= mapBounds.south && 
        v.lat <= mapBounds.north && 
        v.lng >= mapBounds.west && 
        v.lng <= mapBounds.east
      )
    : filteredVenues

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  const handleBackToChat = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    router.push('/chat')
  }

  const handleGetLocation = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    setIsLocating(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(loc)
          setShowUserLocation(true)
          setIsLocating(false)
          toast.success('Location found!')
        },
        (error) => {
          console.error('Geolocation error:', error)
          setIsLocating(false)
          toast.error('Could not get your location')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setIsLocating(false)
      toast.error('Geolocation not supported')
    }
  }

  const handleMapMove = useCallback((bounds, zoom) => {
    setMapBounds(bounds)
    // Show "Search here" if zoomed in (zoom > 13) or moved significantly
    if (zoom > 13) {
      setShowSearchHere(true)
    }
  }, [])

  const handleSearchHere = async () => {
    if (navigator.vibrate) navigator.vibrate(30)
    setShowSearchHere(false)
    // In a real app, this would search for venues in the current map bounds
    toast.success('Searching this area...')
  }

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
      className="h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden"
    >
      {/* Full Screen Map */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
          </div>
        ) : (
          <MapComponent 
            venues={filteredVenues}
            selectedVenue={selectedVenue}
            onVenueSelect={handleVenueSelect}
            fitBounds={true}
            userLocation={showUserLocation ? userLocation : null}
            onMapMove={handleMapMove}
          />
        )}
      </div>

      {/* Location Button - top right */}
      <div className="fixed top-4 right-4 z-[1001]">
        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#00A8CC]" />
          ) : (
            <Navigation className={`w-5 h-5 ${showUserLocation ? 'text-[#00A8CC]' : ''}`} />
          )}
        </button>
      </div>

      {/* Search Here Button - top center */}
      <AnimatePresence>
        {showSearchHere && visibleVenues.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[1001]"
          >
            <button
              onClick={handleSearchHere}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Search this area</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Venue Card */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-40 left-4 right-4 z-[1002] max-w-lg mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex gap-3 p-3">
                <img src={selectedVenue.image} alt={selectedVenue.name} className="w-20 h-20 rounded-xl object-cover" />
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

      {/* Bottom Controls Overlay */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000]">
        {/* Chat Button - smaller, just above search bar */}
        <div className="flex justify-center mb-2">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleBackToChat}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A8CC] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 pt-4">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Sydney..."
                className="w-full h-11 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 pl-11 pr-4 text-base placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {[
              { id: 'home', icon: MessageCircle, label: 'Chats', href: '/chat' },
              { id: 'explore', icon: Map, label: 'Explore', href: '/explore' },
              { id: 'timeline', icon: Clock, label: 'Timeline', href: '/timeline' },
              { id: 'saved', icon: Heart, label: 'Saved', href: '/saved' },
              { id: 'profile', icon: User, label: 'Me', href: '/profile' },
            ].map((item) => {
              const Icon = item.icon
              const isActive = item.id === 'explore'
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </motion.div>
  )
}

export default ExplorePage
