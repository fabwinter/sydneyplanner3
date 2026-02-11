'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { List, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useVenues } from '@/lib/VenueContext'

// Dynamically import map component
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
    </div>
  )
})

const MapPage = () => {
  const router = useRouter()
  const { currentVenues } = useVenues()
  const [selectedVenue, setSelectedVenue] = useState(null)

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  const handleBackToList = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Full Screen Map */}
      <div className="h-screen w-full relative">
        <MapComponent 
          venues={currentVenues}
          selectedVenue={selectedVenue}
          onVenueSelect={handleVenueSelect}
          fitBounds={true}
        />

        {/* Floating List Button - centered at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]"
        >
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <List className="w-5 h-5" />
            <span className="font-medium">List</span>
          </button>
        </motion.div>

        {/* Selected Venue Card */}
        {selectedVenue && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[1000] max-w-lg mx-auto"
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
                    <span className="text-amber-400">★</span>
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
      </div>
    </div>
  )
}

export default MapPage
