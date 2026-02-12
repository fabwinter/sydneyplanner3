'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Star, Clock, Filter, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  MessageCircle, User, Map, Heart, Coffee, Umbrella, Building2,
  TreePine, Landmark, Sparkles, UtensilsCrossed, X, ArrowRight, List, Loader2, Navigation,
  MapPin, Phone, Globe, Share2, Bookmark, Camera, Image as ImageIcon, Plus, RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

// Dynamic import for map
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
    </div>
  )
})

// Category icon mapping
const categoryIcons = {
  'Cafe': Coffee,
  'Restaurant': UtensilsCrossed,
  'Beach': Umbrella,
  'Nature': TreePine,
  'Museum': Landmark,
  'Attraction': Sparkles,
}

const categoryColors = {
  'Cafe': '#F97316',
  'Restaurant': '#F97316',
  'Beach': '#0EA5E9',
  'Nature': '#22C55E',
  'Museum': '#8B5CF6',
  'Attraction': '#EC4899',
}

// Format date helper - only used after client mount
const formatDate = (date) => {
  if (!date) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
}

const formatShortDate = (date) => {
  if (!date) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${date.getDate()} ${months[date.getMonth()]}`
}

const formatFullDate = (date) => {
  if (!date) return ''
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

// Group checkins by date
const groupByDate = (checkins) => {
  const groups = {}
  checkins.forEach(checkin => {
    if (!checkin.date) return
    const dateKey = checkin.date.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = { date: checkin.date, checkins: [] }
    }
    groups[dateKey].checkins.push(checkin)
  })
  return Object.values(groups).sort((a, b) => b.date - a.date)
}

// Date Range Picker Modal - TEAL colors
const DateRangePickerModal = ({ isOpen, onClose, startDate, endDate, onDateRangeSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState('start')
  const [tempStartDate, setTempStartDate] = useState(startDate)
  const [tempEndDate, setTempEndDate] = useState(endDate)
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const daysArray = []
    for (let i = 0; i < startingDay; i++) daysArray.push(null)
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(new Date(year, month, i))
    return daysArray
  }
  
  const handleDateClick = (date) => {
    if (!date) return
    if (selecting === 'start') {
      setTempStartDate(date)
      setTempEndDate(null)
      setSelecting('end')
    } else {
      if (date < tempStartDate) {
        setTempStartDate(date)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(date)
      }
      setSelecting('start')
    }
  }
  
  const isInRange = (date) => date && tempStartDate && tempEndDate && date >= tempStartDate && date <= tempEndDate
  const isStartDate = (date) => date && tempStartDate && date.toDateString() === tempStartDate.toDateString()
  const isEndDate = (date) => date && tempEndDate && date.toDateString() === tempEndDate.toDateString()
  const isToday = (date) => date && date.toDateString() === new Date().toDateString()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-32">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mx-4 w-full max-w-sm">
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className={`flex-1 text-center p-2 rounded-lg ${selecting === 'start' ? 'bg-[#00A8CC]/20 border border-[#00A8CC]' : ''}`}>
              <p className="text-xs text-gray-500 mb-1">Start Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">{tempStartDate ? formatShortDate(tempStartDate) : 'Select'}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
            <div className={`flex-1 text-center p-2 rounded-lg ${selecting === 'end' ? 'bg-[#00A8CC]/20 border border-[#00A8CC]' : ''}`}>
              <p className="text-xs text-gray-500 mb-1">End Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">{tempEndDate ? formatShortDate(tempEndDate) : 'Select'}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <button key={index} onClick={() => handleDateClick(date)} disabled={!date} className={`
                aspect-square flex items-center justify-center text-sm rounded-full
                ${!date ? 'invisible' : ''}
                ${isStartDate(date) || isEndDate(date) ? 'bg-[#00A8CC] text-white font-semibold' : ''}
                ${isInRange(date) && !isStartDate(date) && !isEndDate(date) ? 'bg-[#00A8CC]/20' : ''}
                ${isToday(date) && !isStartDate(date) && !isEndDate(date) && !isInRange(date) ? 'bg-gray-200 dark:bg-gray-600 font-semibold' : ''}
                ${!isStartDate(date) && !isEndDate(date) && !isInRange(date) && !isToday(date) && date ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
              `}>
                {date?.getDate()}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => { setTempStartDate(null); setTempEndDate(null); onDateRangeSelect(null, null); onClose(); }} className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium">Clear</button>
            <button onClick={() => { onDateRangeSelect(tempStartDate, tempEndDate); onClose(); }} className="flex-1 h-10 rounded-xl bg-[#00A8CC] text-white font-medium">Apply</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Enhanced Check-in Detail Sheet with Full Venue Info
const CheckinDetailSheet = ({ checkin, isOpen, onClose, onCheckInAgain }) => {
  const [activeTab, setActiveTab] = useState('checkin')
  const [saved, setSaved] = useState(false)
  
  if (!checkin || !isOpen) return null
  
  const CategoryIcon = categoryIcons[checkin.venue.category] || Sparkles
  const categoryColor = categoryColors[checkin.venue.category] || '#6B7280'

  const handleSave = () => {
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved to favorites!')
  }

  const handleCheckInAgain = () => {
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success('Opening check-in...')
    if (onCheckInAgain) onCheckInAgain(checkin.venue)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: checkin.venue.name,
        text: `Check out ${checkin.venue.name} in Sydney!`,
        url: window.location.href,
      })
    } else {
      toast.success('Link copied!')
    }
  }

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${checkin.venue.lat},${checkin.venue.lng}`
    window.open(url, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[2000]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[2001] max-h-[90vh] overflow-hidden">
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" /></div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-60px)] pb-8">
              {/* Hero Image */}
              <div className="relative h-52">
                <img src={checkin.photos?.[0] || checkin.venue.image} alt={checkin.venue.name} className="w-full h-full object-cover" />
                <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: categoryColor }}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-medium">{checkin.venue.category}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-white font-semibold">{checkin.venue.rating}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{checkin.venue.name}</h2>
                </div>
              </div>
              
              {/* Tab Toggle */}
              <div className="px-4 pt-4">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
                  <button onClick={() => setActiveTab('checkin')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'checkin' ? 'bg-white dark:bg-gray-700 text-[#00A8CC] shadow-sm' : 'text-gray-500'}`}>
                    Your Check-in
                  </button>
                  <button onClick={() => setActiveTab('venue')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'venue' ? 'bg-white dark:bg-gray-700 text-[#00A8CC] shadow-sm' : 'text-gray-500'}`}>
                    Venue Details
                  </button>
                </div>
              </div>
              
              <div className="px-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'checkin' ? (
                    <motion.div key="checkin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      {/* Check-in Info */}
                      <div className="p-4 rounded-2xl bg-[#00A8CC]/10 border border-[#00A8CC]/20 mb-4">
                        <h3 className="text-sm font-semibold text-[#00A8CC] mb-3">Your Check-in</h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{checkin.date ? formatFullDate(checkin.date) : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{checkin.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-gray-600 dark:text-gray-400">Your rating:</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-5 h-5 ${star <= checkin.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {checkin.comment && (
                          <div className="p-3 rounded-xl bg-white dark:bg-gray-800">
                            <p className="text-gray-700 dark:text-gray-300 italic">"{checkin.comment}"</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Photos */}
                      {checkin.photos && checkin.photos.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your Photos</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {checkin.photos.map((photo, idx) => (
                              <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="venue" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      {/* About */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</h3>
                        <p className="text-gray-600 dark:text-gray-400">{checkin.venue.description}</p>
                      </div>
                      
                      {/* Quick Info */}
                      <div className="mb-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-gray-900 dark:text-white font-medium">{checkin.venue.address}</p>
                          </div>
                        </div>
                        
                        {checkin.venue.hours && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">Hours</p>
                              <p className="text-gray-900 dark:text-white font-medium">{checkin.venue.hours}</p>
                            </div>
                          </div>
                        )}
                        
                        {checkin.venue.phone && (
                          <a href={`tel:${checkin.venue.phone}`} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Phone className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="text-[#00A8CC] font-medium">{checkin.venue.phone}</p>
                            </div>
                          </a>
                        )}
                        
                        {checkin.venue.website && (
                          <a href={checkin.venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Globe className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">Website</p>
                              <p className="text-[#00A8CC] font-medium truncate">{checkin.venue.website.replace('https://', '')}</p>
                            </div>
                          </a>
                        )}
                      </div>
                      
                      {/* Amenities */}
                      {checkin.venue.amenities && checkin.venue.amenities.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Amenities</h3>
                          <div className="flex flex-wrap gap-2">
                            {checkin.venue.amenities.map((amenity, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Mini Map */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Location</h3>
                        <div className="rounded-2xl overflow-hidden h-40 relative">
                          <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${checkin.venue.lng - 0.01}%2C${checkin.venue.lat - 0.006}%2C${checkin.venue.lng + 0.01}%2C${checkin.venue.lat + 0.006}&layer=mapnik&marker=${checkin.venue.lat}%2C${checkin.venue.lng}`}
                            className="w-full h-full border-0"
                          />
                          <button onClick={handleDirections} className="absolute bottom-3 right-3 px-4 py-2 rounded-lg bg-[#00A8CC] text-white text-sm font-medium flex items-center gap-2 shadow-lg">
                            <Navigation className="w-4 h-4" />
                            Directions
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 pb-4">
                  <button 
                    onClick={handleSave}
                    className={`flex-1 h-12 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all ${
                      saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                    {saved ? 'Saved' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCheckInAgain}
                    className="flex-1 h-12 rounded-xl bg-[#00A8CC] text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Clock className="w-5 h-5" />Check-in Again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Check-in Card Component
const CheckinCard = ({ checkin, onClick }) => {
  const CategoryIcon = categoryIcons[checkin.venue?.category] || Sparkles
  const categoryColor = categoryColors[checkin.venue?.category] || '#6B7280'

  if (!checkin.venue) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={onClick} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="relative w-28 h-28 flex-shrink-0">
          <img src={checkin.photos?.[0] || checkin.venue.image} alt={checkin.venue.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: categoryColor }}>
            <CategoryIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 p-3 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{checkin.venue.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{checkin.venue.category} • {checkin.venue.address}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-amber-500">{checkin.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{checkin.time}</span>
            </div>
          </div>
          {checkin.comment && <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 truncate">"{checkin.comment}"</p>}
        </div>
      </div>
    </motion.div>
  )
}

// Simple Check-in Modal
const CheckInModalSimple = ({ venue, isOpen, onClose, onCheckinComplete }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !venue) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    setIsSubmitting(true)
    if (navigator.vibrate) navigator.vibrate(50)
    
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: venue.id,
          venue_name: venue.name,
          venue_category: venue.category,
          venue_address: venue.address,
          venue_lat: venue.lat,
          venue_lng: venue.lng,
          venue_image: venue.image,
          rating,
          comment,
          photos: [],
          user_id: 'anonymous' // Replace with actual user ID when auth is implemented
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Checked in at ${venue.name}!`)
        if (onCheckinComplete) onCheckinComplete(data)
        onClose()
      } else {
        toast.error('Failed to check in')
      }
    } catch (err) {
      console.error('Check-in error:', err)
      toast.error('Failed to check in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[3000] flex items-end justify-center">
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg p-6 pb-8">
          <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Check in at {venue.name}</h2>
          <p className="text-sm text-gray-500 mb-6">{venue.category} • {venue.address}</p>
          
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Your Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={`w-8 h-8 transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Comment (optional)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#00A8CC]" />
          </div>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="flex-1 h-12 rounded-xl bg-[#00A8CC] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check In'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Bottom Navigation
const BottomNav = ({ active = 'timeline' }) => {
  const navItems = [
    { id: 'home', icon: MessageCircle, label: 'Chats', href: '/chat' },
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
            <Link key={item.id} href={item.href} className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${isActive ? 'text-[#00A8CC]' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const TimelinePage = () => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedCheckin, setSelectedCheckin] = useState(null)
  const [showCheckinDetail, setShowCheckinDetail] = useState(false)
  const [selectedMapVenue, setSelectedMapVenue] = useState(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [checkInVenue, setCheckInVenue] = useState(null)
  
  // Real data state
  const [checkins, setCheckins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch check-ins from API
  const fetchCheckins = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true)
      else setIsLoading(true)
      
      const response = await fetch('/api/checkins?user_id=anonymous')
      const data = await response.json()
      
      if (data.checkins) {
        // Transform API data to match UI structure
        const transformedCheckins = data.checkins.map(checkin => {
          const createdAt = new Date(checkin.created_at)
          const hours = createdAt.getHours()
          const minutes = createdAt.getMinutes()
          const ampm = hours >= 12 ? 'pm' : 'am'
          const displayHours = hours % 12 || 12
          const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
          
          return {
            id: checkin.id,
            venue: {
              id: checkin.venue_id,
              name: checkin.venue_name || 'Unknown Venue',
              category: checkin.venue_category || 'Other',
              address: checkin.venue_address || '',
              lat: checkin.venue_lat || -33.8688,
              lng: checkin.venue_lng || 151.2093,
              rating: checkin.rating || 4,
              distance: '0 km',
              image: checkin.venue_image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
              description: `You checked in here on ${createdAt.toLocaleDateString()}`,
              phone: '',
              website: '',
              hours: '',
              amenities: [],
            },
            rating: checkin.rating,
            comment: checkin.comment || '',
            time: timeString,
            date: createdAt,
            photos: checkin.photos || [],
          }
        })
        
        setCheckins(transformedCheckins)
        if (showRefreshToast) toast.success('Timeline refreshed!')
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error)
      toast.error('Failed to load check-ins')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Only compute dates on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Fetch check-ins on mount
  useEffect(() => {
    if (isClient) {
      fetchCheckins()
    }
  }, [isClient, fetchCheckins])

  // Use real check-ins data
  const realCheckins = useMemo(() => {
    return checkins
  }, [checkins])

  const categories = ['All Categories', 'Cafe', 'Restaurant', 'Beach', 'Nature', 'Museum', 'Attraction']

  // Filter checkins
  const filteredCheckins = useMemo(() => {
    return realCheckins.filter(checkin => {
      const matchesSearch = searchQuery === '' || 
        checkin.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checkin.venue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checkin.venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All Categories' || checkin.venue.category === selectedCategory
      let matchesDateRange = true
      if (startDate && endDate) {
        matchesDateRange = checkin.date >= startDate && checkin.date <= endDate
      } else if (startDate) {
        matchesDateRange = checkin.date >= startDate
      } else if (endDate) {
        matchesDateRange = checkin.date <= endDate
      }
      return matchesSearch && matchesCategory && matchesDateRange
    })
  }, [realCheckins, searchQuery, selectedCategory, startDate, endDate])

  const groupedCheckins = useMemo(() => groupByDate(filteredCheckins), [filteredCheckins])
  const totalPlaces = filteredCheckins.length
  const mapVenues = filteredCheckins.map(c => c.venue)

  const handleCheckinClick = (checkin) => {
    setSelectedCheckin(checkin)
    setShowCheckinDetail(true)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  const handleMapVenueSelect = (venue) => {
    setSelectedMapVenue(venue)
    const checkin = filteredCheckins.find(c => c.venue.id === venue.id)
    if (checkin) setSelectedCheckin(checkin)
  }

  const handleMapVenueDeselect = () => {
    setSelectedMapVenue(null)
  }

  const handleMapVenueClick = () => {
    if (selectedCheckin) setShowCheckinDetail(true)
  }

  const handleCheckInAgain = (venue) => {
    setCheckInVenue(venue)
    setShowCheckinDetail(false)
    setShowCheckInModal(true)
  }

  const hasDateFilter = startDate || endDate
  const dateFilterLabel = () => {
    if (startDate && endDate) return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
    if (startDate) return `From ${formatShortDate(startDate)}`
    if (endDate) return `Until ${formatShortDate(endDate)}`
    return 'Date'
  }

  // Show loading state during hydration or data fetch
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00A8CC] mb-4" />
        <p className="text-gray-500">Loading your timeline...</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-40 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
            <p className="text-sm text-gray-500">{totalPlaces} places visited</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchCheckins(true)} 
              disabled={isRefreshing}
              className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
              {viewMode === 'list' ? <><Map className="w-4 h-4" /><span>Map</span></> : <><List className="w-4 h-4" /><span>List</span></>}
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search timeline..." className="w-full h-12 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 pl-12 pr-4 text-base placeholder:text-gray-400" />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <button onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} className="w-full h-11 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{selectedCategory}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedCategory === cat ? 'bg-[#00A8CC]/10 text-[#00A8CC] font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setShowDatePicker(true)} className={`h-11 px-4 rounded-xl flex items-center gap-2 font-medium whitespace-nowrap ${hasDateFilter ? 'bg-[#00A8CC] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{dateFilterLabel()}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-2">
            {groupedCheckins.length > 0 ? (
              groupedCheckins.map((group, groupIndex) => (
                <div key={group.date.toDateString()} className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-3 flex justify-center"><div className="w-0.5 h-4" style={{ backgroundColor: '#00A8CC' }} /></div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white ml-5">{formatDate(group.date)}</h2>
                  </div>
                  {group.checkins.map((checkin, index) => (
                    <div key={checkin.id} className="relative flex">
                      <div className="w-3 flex flex-col items-center flex-shrink-0">
                        <div className="w-0.5 h-4 flex-shrink-0" style={{ backgroundColor: '#00A8CC' }} />
                        <div className="w-3 h-3 rounded-full border-2 border-white z-10 flex-shrink-0" style={{ backgroundColor: '#00A8CC' }} />
                        <div className="w-0.5 flex-1" style={{ backgroundColor: (index === group.checkins.length - 1 && groupIndex === groupedCheckins.length - 1) ? 'transparent' : '#00A8CC' }} />
                      </div>
                      <div className="flex-1 ml-5 pb-0">
                        <CheckinCard checkin={checkin} onClick={() => handleCheckinClick(checkin)} />
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No check-ins found</h3>
                <p className="text-gray-500 text-center max-w-xs">{hasDateFilter || selectedCategory !== 'All Categories' ? 'Try adjusting your filters' : 'Start exploring Sydney!'}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-240px)]">
            <MapComponent venues={mapVenues} selectedVenue={selectedMapVenue} onVenueSelect={handleMapVenueSelect} onVenueDeselect={handleMapVenueDeselect} fitBounds={true} />
            
            <AnimatePresence>
              {selectedMapVenue && !showCheckinDetail && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed left-4 right-4 bottom-24 z-[1002] max-w-lg mx-auto">
                  <button onClick={handleMapVenueClick} className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-left">
                    <div className="flex gap-3 p-3">
                      <img src={selectedMapVenue.image} alt={selectedMapVenue.name} className="w-24 h-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white">{selectedMapVenue.name}</h3>
                        <p className="text-sm text-gray-500">{selectedMapVenue.category} • {selectedMapVenue.distance}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedMapVenue.rating}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="timeline" />
      <DateRangePickerModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} startDate={startDate} endDate={endDate} onDateRangeSelect={(s, e) => { setStartDate(s); setEndDate(e); }} />
      <CheckinDetailSheet checkin={selectedCheckin} isOpen={showCheckinDetail} onClose={() => setShowCheckinDetail(false)} onCheckInAgain={handleCheckInAgain} />
      
      {showCheckInModal && checkInVenue && (
        <CheckInModalSimple 
          venue={checkInVenue} 
          isOpen={showCheckInModal} 
          onClose={() => { setShowCheckInModal(false); setCheckInVenue(null); }} 
          onCheckinComplete={() => {
            // Refresh the checkins list after a new check-in
            fetchCheckins(true)
          }}
        />
      )}
    </motion.div>
  )
}

export default TimelinePage
