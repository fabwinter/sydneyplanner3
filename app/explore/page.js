'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Star, Heart, ChevronRight, ChevronDown,
  Clock, MessageCircle, User, Map, Loader2, Navigation, RotateCcw,
  X, Share2, Check, Phone, Globe, Wifi, Car, Accessibility, UtensilsCrossed, 
  PawPrint, ExternalLink, ListPlus, Camera, ImagePlus, LogIn
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { useVenues } from '@/lib/VenueContext'
import { useAuth } from '@/lib/AuthContext'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A8CC]" />
    </div>
  )
})

// Sign In Prompt Modal
const SignInPrompt = ({ isOpen, onClose, action }) => {
  const router = useRouter()
  
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#00A8CC]/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-[#00A8CC]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in required</h3>
          <p className="text-gray-500 mb-6">Please sign in to {action} venues</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex-1 h-12 rounded-xl bg-[#00A8CC] text-white font-medium"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Check-In Modal Component
const CheckInModal = ({ venue, isOpen, onClose, onComplete }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState([])
  const [shareWithFriends, setShareWithFriends] = useState(true)
  const [addToPublicFeed, setAddToPublicFeed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  if (!venue || !isOpen) return null

  const handlePhotoCapture = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotos(prev => [...prev, { id: Date.now(), url: e.target.result, file }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    if (navigator.vibrate) navigator.vibrate([50, 50, 50])
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    toast.success(`Checked in at ${venue.name}!`)
    onComplete()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[3000]"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[3001] max-h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check-In</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-2">Share your experience at</p>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">{venue.name}</h3>

              {/* Star Rating */}
              <div className="mb-6">
                <p className="text-center font-medium text-gray-700 dark:text-gray-300 mb-3">How was it?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => { setRating(star); if (navigator.vibrate) navigator.vibrate(30) }}
                      className="p-1"
                    >
                      <Star className={`w-10 h-10 transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">Add photos</p>
                
                {/* Photo Preview Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00A8CC] hover:bg-[#00A8CC]/5 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Take photo</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00A8CC] hover:bg-[#00A8CC]/5 transition-colors"
                  >
                    <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload</span>
                  </button>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Comment</p>
                  <span className="text-sm text-gray-400">{comment.length}/300</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 300))}
                  placeholder="What did you love about this place?"
                  className="w-full h-24 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 resize-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A8CC]"
                />
              </div>

              {/* Share Options */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Share with friends</p>
                    <p className="text-sm text-gray-400">Your friends will see this check-in</p>
                  </div>
                  <Switch checked={shareWithFriends} onCheckedChange={setShareWithFriends} className="data-[state=checked]:bg-[#00A8CC]" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Add to public feed</p>
                    <p className="text-sm text-gray-400">Everyone can see this review</p>
                  </div>
                  <Switch checked={addToPublicFeed} onCheckedChange={setAddToPublicFeed} />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 safe-bottom">
              <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-[#00A8CC] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Check-In'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Venue Detail Sheet Component
const VenueDetailSheet = ({ venue, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth()
  const [saved, setSaved] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [signInAction, setSignInAction] = useState('')

  if (!venue) return null

  const handleSave = () => {
    if (!isAuthenticated) {
      setSignInAction('save')
      setShowSignInPrompt(true)
      return
    }
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved to favorites!')
  }

  const handleShare = async () => {
    if (navigator.vibrate) navigator.vibrate(30)
    if (navigator.share) {
      try { await navigator.share({ title: venue.name, text: `Check out ${venue.name} in Sydney!`, url: window.location.href }) } 
      catch (err) { toast.info('Share cancelled') }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  const handleCheckInClick = () => {
    if (!isAuthenticated) {
      setSignInAction('check in to')
      setShowSignInPrompt(true)
      return
    }
    if (navigator.vibrate) navigator.vibrate(30)
    setShowCheckIn(true)
  }

  const handleGetDirections = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const destination = `${venue.lat},${venue.lng}`
    window.open(isIOS ? `maps://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank')
  }

  const amenities = [
    { icon: Car, label: 'Parking', available: true },
    { icon: Wifi, label: 'WiFi', available: true },
    { icon: Accessibility, label: 'Accessible', available: true },
    { icon: UtensilsCrossed, label: 'Outdoor', available: false },
    { icon: PawPrint, label: 'Pet Friendly', available: true },
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[2000]" />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[2001] max-h-[92vh] overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>

              <div className="overflow-y-auto max-h-[calc(92vh-120px)] pb-28">
                <div className="relative h-52">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <ChevronDown className="w-6 h-6 text-gray-700" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                    <span className="text-[#00A8CC] text-sm font-medium">{venue.category}</span>
                    <h2 className="text-2xl font-bold text-white">{venue.name}</h2>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{venue.rating}</span>
                      <span className="text-gray-500">out of 5</span>
                    </div>
                    <span className="text-[#00A8CC] font-medium">Top rated</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <MapPin className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-xs text-gray-500 text-center truncate">Sydney, NSW</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-[#00A8CC]" />
                      <p className="text-xs text-[#00A8CC] font-medium text-center">Open Now</p>
                    </div>
                    <a href="tel:(02)98346321" className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 block">
                      <Phone className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-xs text-gray-500 text-center">Call</p>
                    </a>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                    <a href="tel:(02)98346321" className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Phone className="w-5 h-5 text-gray-500" /></div>
                      <span className="text-gray-700 dark:text-gray-300">(02) 9834 6321</span>
                    </a>
                    <a href="http://thegrounds.com.au" target="_blank" className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Globe className="w-5 h-5 text-gray-500" /></div>
                      <span className="text-gray-700 dark:text-gray-300">thegrounds.com.au</span>
                    </a>
                    <div className="flex items-center gap-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><MapPin className="w-5 h-5 text-gray-500" /></div>
                      <span className="text-gray-700 dark:text-gray-300">{venue.address || '7A/2 Huntley St, Alexandria NSW'}</span>
                    </div>

                    <div className="mt-4 relative rounded-2xl overflow-hidden shadow-sm">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${venue.lng - 0.006}%2C${venue.lat - 0.004}%2C${venue.lng + 0.006}%2C${venue.lat + 0.004}&layer=mapnik&marker=${venue.lat}%2C${venue.lng}`}
                        className="w-full h-44 border-0"
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-[#F4A261] flex items-center justify-center shadow-lg -mt-6">
                          <UtensilsCrossed className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <button onClick={handleGetDirections} className="absolute bottom-3 left-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-gray-700 text-sm font-medium">
                        <Navigation className="w-4 h-4 text-[#00A8CC]" />
                        <span>Get directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Amenities</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {amenities.map((a, i) => {
                        const Icon = a.icon
                        return (
                          <div key={i} className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl border ${a.available ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'opacity-40 border-gray-100'}`}>
                            <Icon className="w-6 h-6 mb-1 text-gray-700 dark:text-gray-300" />
                            <span className="text-xs text-gray-500 text-center">{a.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
                <div className="flex items-center gap-3">
                  <button onClick={handleSave} className={`w-14 h-12 rounded-xl border flex items-center justify-center transition-all ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                    <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-14 h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500"><ListPlus className="w-5 h-5" /></button>
                  <button onClick={handleShare} className="w-14 h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500"><Share2 className="w-5 h-5" /></button>
                  <button onClick={handleCheckInClick} disabled={checkedIn} className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-medium ${checkedIn ? 'bg-green-500 text-white' : 'bg-[#00A8CC] text-white'}`}>
                    <Check className="w-5 h-5" />
                    <span>{checkedIn ? 'Checked In!' : 'Check-In'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckInModal venue={venue} isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} onComplete={() => setCheckedIn(true)} />
      <SignInPrompt isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)} action={signInAction} />
    </>
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
        {/* Chat Button FIRST */}
        <div className="flex justify-center pb-2">
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleBackToChat} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A8CC] text-white text-sm font-medium shadow-md">
            <MessageCircle className="w-4 h-4" /><span>Chat</span>
          </motion.button>
        </div>

        {/* Slim Line Handle SECOND */}
        <div className="flex justify-center pb-2">
          <button onClick={toggleNav} className="px-8 py-1">
            <div className="w-8 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-2 bg-white dark:bg-gray-900">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Sydney..." className="w-full h-11 rounded-full bg-gray-100 dark:bg-gray-800 border-0 pl-11 pr-4 text-base placeholder:text-gray-400" />
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
