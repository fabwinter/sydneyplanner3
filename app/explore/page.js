'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Star, Heart, ChevronRight, ChevronDown, ChevronUp,
  Clock, MessageCircle, User, Map, Loader2, Navigation, RotateCcw,
  X, Share2, Check, Phone, Globe, Wifi, Car, Accessibility, UtensilsCrossed, 
  PawPrint, ExternalLink, ListPlus, ChevronLeft
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

// Static map preview component
const StaticMapPreview = ({ lat, lng, name }) => {
  // Using OpenStreetMap static image via a tile server
  const zoom = 15
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${lng},${lat}&zoom=${zoom}&marker=lonlat:${lng},${lat};color:%2300A8CC;size:medium&apiKey=demo`
  
  return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-200">
      <img 
        src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+00A8CC(${lng},${lat})/${lng},${lat},14,0/400x200@2x?access_token=pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2xhc3NpYyJ9.demo`}
        alt="Map"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to a simple map placeholder
          e.target.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`
        }}
      />
      {/* Map overlay with location pin */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-[#00A8CC] flex items-center justify-center shadow-lg">
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">{name}</p>
      </div>
    </div>
  )
}

// Venue Detail Sheet Component
const VenueDetailSheet = ({ venue, isOpen, onClose }) => {
  const [saved, setSaved] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  if (!venue) return null

  const handleSave = () => {
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved to favorites!')
  }

  const handleShare = async () => {
    if (navigator.vibrate) navigator.vibrate(30)
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue.name,
          text: `Check out ${venue.name} in Sydney!`,
          url: window.location.href
        })
      } catch (err) {
        toast.info('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleCheckIn = () => {
    setCheckedIn(true)
    if (navigator.vibrate) navigator.vibrate([50, 50, 50])
    toast.success(`Checked in at ${venue.name}!`)
  }

  const handleGetDirections = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    const destination = `${venue.lat},${venue.lng}`
    const label = encodeURIComponent(venue.name)
    
    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      // Open Apple Maps
      window.open(`maps://maps.apple.com/?daddr=${destination}&q=${label}`, '_blank')
    } else {
      // Open Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`, '_blank')
    }
  }

  const handleViewOnMap = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    const destination = `${venue.lat},${venue.lng}`
    window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank')
  }

  const amenities = [
    { icon: Car, label: 'Parking', available: true },
    { icon: Wifi, label: 'WiFi', available: true },
    { icon: Accessibility, label: 'Accessible', available: true },
    { icon: UtensilsCrossed, label: 'Outdoor', available: false },
    { icon: PawPrint, label: 'Pet Friendly', available: true },
  ]

  // Generate random opening hours for demo
  const openingHours = {
    status: 'Open Now',
    closes: '5:00 PM',
    hours: [
      { day: 'Monday', time: '7:00 AM - 5:00 PM' },
      { day: 'Tuesday', time: '7:00 AM - 5:00 PM' },
      { day: 'Wednesday', time: '7:00 AM - 5:00 PM' },
      { day: 'Thursday', time: '7:00 AM - 5:00 PM' },
      { day: 'Friday', time: '7:00 AM - 6:00 PM' },
      { day: 'Saturday', time: '8:00 AM - 6:00 PM' },
      { day: 'Sunday', time: '8:00 AM - 4:00 PM' },
    ]
  }

  const phoneNumber = '02 9834 6321'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[2000]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[2001] max-h-[92vh] overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(92vh-120px)] pb-28">
              {/* Hero Image */}
              <div className="relative h-52">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                >
                  <ChevronDown className="w-6 h-6 text-gray-700" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                  <span className="text-[#00A8CC] text-sm font-medium">{venue.category}</span>
                  <h2 className="text-2xl font-bold text-white">{venue.name}</h2>
                </div>
              </div>

              {/* Rating & Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{venue.rating}</span>
                    <span className="text-gray-500">out of 5</span>
                  </div>
                  <span className="text-[#00A8CC] font-medium">Top rated</span>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <MapPin className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-xs text-gray-500 text-center truncate">Sydney, NSW...</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-[#00A8CC]" />
                    <p className="text-xs text-[#00A8CC] font-medium text-center">{openingHours.status}</p>
                    <p className="text-[10px] text-gray-400 text-center">Closes at {openingHours.closes}</p>
                  </div>
                  <a href={`tel:${phoneNumber}`} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 block">
                    <Phone className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-xs text-gray-500 text-center">Call</p>
                    <p className="text-[10px] text-gray-400 text-center truncate">{phoneNumber}</p>
                  </a>
                </div>

                {/* About */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {venue.description || `${venue.category} in The Rocks, Sydney. A stunning destination with artisan offerings and a welcoming atmosphere.`}
                  </p>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Amenities</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {amenities.map((amenity, idx) => {
                      const Icon = amenity.icon
                      return (
                        <div 
                          key={idx}
                          className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl border ${
                            amenity.available 
                              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                              : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-40'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mb-1 ${amenity.available ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`} />
                          <span className="text-xs text-gray-500 text-center">{amenity.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Location Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Location</h3>
                  
                  {/* Full Address */}
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {venue.address || '7A/2 Huntley St, Alexandria NSW 2015, Australia'}
                    </p>
                  </div>

                  {/* Map Preview with Get Directions */}
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {/* Static Map Image */}
                    <div className="relative h-44 bg-gray-100 dark:bg-gray-800">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${venue.lng - 0.008}%2C${venue.lat - 0.005}%2C${venue.lng + 0.008}%2C${venue.lat + 0.005}&layer=mapnik&marker=${venue.lat}%2C${venue.lng}`}
                        className="w-full h-full border-0"
                        style={{ pointerEvents: 'none' }}
                      />
                      {/* Overlay to make it non-interactive */}
                      <div className="absolute inset-0" />
                    </div>
                    
                    {/* Get Directions Button */}
                    <button
                      onClick={handleGetDirections}
                      className="absolute top-3 left-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      <span>Get directions</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {/* View on Map Button */}
                    <button
                      onClick={handleViewOnMap}
                      className="absolute bottom-3 left-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
                    >
                      <Navigation className="w-4 h-4 text-[#00A8CC]" />
                      <span className="font-medium">View on map</span>
                    </button>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reviews</h3>
                    <button className="flex items-center gap-1 text-[#00A8CC] text-sm font-medium">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                </div>

                {/* Distance Info */}
                <div className="p-4 rounded-xl bg-[#00A8CC]/10 border border-[#00A8CC]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00A8CC] flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{venue.distance} away</p>
                      <p className="text-sm text-gray-500">from your location</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className={`w-14 h-12 rounded-xl border flex items-center justify-center transition-all ${
                    saved 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button
                  className="w-14 h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500"
                >
                  <ListPlus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="w-14 h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={checkedIn}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                    checkedIn
                      ? 'bg-green-500 text-white'
                      : 'bg-[#00A8CC] text-white hover:bg-[#00A8CC]/90'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  <span>{checkedIn ? 'Checked In!' : 'Check-In'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const ExplorePage = () => {
  const router = useRouter()
  const { currentVenues } = useVenues()
  const [allVenues, setAllVenues] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [showVenueDetail, setShowVenueDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [mapBounds, setMapBounds] = useState(null)
  const [showSearchHere, setShowSearchHere] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [navHidden, setNavHidden] = useState(false)

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

  const handleVenueClick = () => {
    if (selectedVenue) {
      setShowVenueDetail(true)
      if (navigator.vibrate) navigator.vibrate(30)
    }
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
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
          setUserLocation(loc)
          setShowUserLocation(true)
          setIsLocating(false)
          toast.success('Location found!')
        },
        (error) => {
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
    if (zoom > 13) setShowSearchHere(true)
  }, [])

  const handleSearchHere = async () => {
    if (navigator.vibrate) navigator.vibrate(30)
    setShowSearchHere(false)
    toast.success('Searching this area...')
  }

  const toggleNav = () => {
    setNavHidden(!navHidden)
    if (navigator.vibrate) navigator.vibrate(30)
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

      {/* Location Button */}
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

      {/* Search Here Button */}
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
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Search this area</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Venue Preview */}
      <AnimatePresence>
        {selectedVenue && !showVenueDetail && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed left-4 right-4 z-[1002] max-w-lg mx-auto transition-all ${navHidden ? 'bottom-20' : 'bottom-44'}`}
          >
            <button
              onClick={handleVenueClick}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden text-left"
            >
              <div className="flex gap-3 p-3">
                <img src={selectedVenue.image} alt={selectedVenue.name} className="w-24 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedVenue.name}</h3>
                  <p className="text-sm text-gray-500">{selectedVenue.category} • {selectedVenue.distance}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedVenue.rating}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <motion.div
        initial={false}
        animate={{ y: navHidden ? 80 : 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[1000]"
      >
        {/* Pull Tab */}
        <div className="flex justify-center -mb-1">
          <button
            onClick={toggleNav}
            className="px-6 py-1 rounded-t-xl bg-white dark:bg-gray-900 border border-b-0 border-gray-200 dark:border-gray-700"
          >
            {navHidden ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Chat Button */}
        <div className="flex justify-center mb-2 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 pt-4">
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
        <div className="px-4 pb-2 bg-white dark:bg-gray-900">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Sydney..."
                className="w-full h-11 rounded-full bg-gray-100 dark:bg-gray-800 border-0 pl-11 pr-4 text-base placeholder:text-gray-400"
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
      </motion.div>

      {/* Venue Detail Sheet */}
      <VenueDetailSheet 
        venue={selectedVenue} 
        isOpen={showVenueDetail} 
        onClose={() => setShowVenueDetail(false)} 
      />
    </motion.div>
  )
}

export default ExplorePage
