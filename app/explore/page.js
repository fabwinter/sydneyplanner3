'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Star, Heart, ChevronRight,
  Clock, MessageCircle, User, Map, Loader2, Navigation, RotateCcw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { useVenues } from '@/lib/VenueContext'
import VenueDetailSheet from '@/components/VenueDetailSheet'

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
  const [showVenueDetail, setShowVenueDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [showUserLocation, setShowUserLocation] = useState(false)
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

  const filteredVenues = searchQuery ? displayVenues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase())) : displayVenues

  const handleVenueSelect = (venue) => { setSelectedVenue(venue); if (navigator.vibrate) navigator.vibrate(30) }
  const handleVenueClick = () => { if (selectedVenue) { setShowVenueDetail(true); if (navigator.vibrate) navigator.vibrate(30) } }
  const handleBackToChat = () => { if (navigator.vibrate) navigator.vibrate(30); router.push('/chat') }

  const handleGetLocation = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setShowUserLocation(true); setIsLocating(false); toast.success('Location found!') },
        () => { setIsLocating(false); toast.error('Could not get location') },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }

  const handleMapMove = useCallback((bounds, zoom) => { if (zoom > 13) setShowSearchHere(true) }, [])
  const toggleNav = () => { setNavHidden(!navHidden); if (navigator.vibrate) navigator.vibrate(30) }

  return (
    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} transition={{ type: 'tween', duration: 0.25 }} className="h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"><Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" /></div>
        ) : (
          <MapComponent venues={filteredVenues} selectedVenue={selectedVenue} onVenueSelect={handleVenueSelect} fitBounds={true} userLocation={showUserLocation ? userLocation : null} onMapMove={handleMapMove} />
        )}
      </div>

      <div className="fixed top-4 right-4 z-[1001]">
        <button onClick={handleGetLocation} disabled={isLocating} className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          {isLocating ? <Loader2 className="w-5 h-5 animate-spin text-[#00A8CC]" /> : <Navigation className={`w-5 h-5 ${showUserLocation ? 'text-[#00A8CC]' : ''}`} />}
        </button>
      </div>

      <AnimatePresence>
        {showSearchHere && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-[1001]">
            <button onClick={() => { setShowSearchHere(false); toast.success('Searching...') }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-gray-700 text-sm font-medium">
              <RotateCcw className="w-4 h-4" /><span>Search this area</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVenue && !showVenueDetail && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed left-4 right-4 z-[1002] max-w-lg mx-auto ${navHidden ? 'bottom-20' : 'bottom-44'}`}>
            <button onClick={handleVenueClick} className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-left">
              <div className="flex gap-3 p-3">
                <img src={selectedVenue.image} alt={selectedVenue.name} className="w-24 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedVenue.name}</h3>
                  <p className="text-sm text-gray-500">{selectedVenue.category} • {selectedVenue.distance}</p>
                  <div className="flex items-center gap-1 mt-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">{selectedVenue.rating}</span></div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={false} animate={{ y: navHidden ? 80 : 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-[1000]">
        <div className="flex justify-center pb-2">
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleBackToChat} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A8CC] text-white text-sm font-medium shadow-md">
            <MessageCircle className="w-4 h-4" /><span>Chat</span>
          </motion.button>
        </div>

        <div className="flex justify-center pb-2">
          <button onClick={toggleNav} className="px-8 py-1">
            <div className="w-8 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          </button>
        </div>

        <div className="px-4 pb-2 bg-white dark:bg-gray-900">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Sydney..." className="w-full h-11 rounded-full bg-gray-100 dark:bg-gray-800 border-0 pl-11 pr-4 text-base placeholder:text-gray-400" />
            </div>
          </div>
        </div>

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
                <Link key={item.id} href={item.href} className={`flex flex-col items-center justify-center px-4 py-2 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </motion.div>

      <VenueDetailSheet venue={selectedVenue} isOpen={showVenueDetail} onClose={() => setShowVenueDetail(false)} />
    </motion.div>
  )
}

export default ExplorePage
