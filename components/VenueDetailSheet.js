'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Heart, ChevronDown, ChevronRight,
  Clock, Phone, Globe, Wifi, Car, Accessibility, UtensilsCrossed, 
  PawPrint, ExternalLink, ListPlus, Share2, Check, Navigation,
  X, Camera, ImagePlus, Loader2, LogIn, MapPinned
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/AuthContext'

// Sign In Prompt Modal
const SignInPrompt = ({ isOpen, onClose, action }) => {
  const router = useRouter()
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[4000] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#00A8CC]/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-[#00A8CC]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in required</h3>
          <p className="text-gray-500 mb-6">Please sign in to {action} venues</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={() => router.push('/login')} className="flex-1 h-12 rounded-xl bg-[#00A8CC] text-white font-medium">Sign In</button>
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
      reader.onload = (e) => setPhotos(prev => [...prev, { id: Date.now() + Math.random(), url: e.target.result, file }])
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    if (navigator.vibrate) navigator.vibrate([50, 50, 50])
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[3000]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[3001] max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check-In</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-2">Share your experience at</p>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">{venue.name}</h3>
              <div className="mb-6">
                <p className="text-center font-medium text-gray-700 dark:text-gray-300 mb-3">How was it?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => { setRating(star); if (navigator.vibrate) navigator.vibrate(30) }} className="p-1">
                      <Star className={`w-10 h-10 transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">Add photos</p>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoCapture} className="hidden" />
                  <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00A8CC] hover:bg-[#00A8CC]/5 transition-colors">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm text-gray-500">Take photo</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00A8CC] hover:bg-[#00A8CC]/5 transition-colors">
                    <ImagePlus className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm text-gray-500">Upload</span>
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Comment</p>
                  <span className="text-sm text-gray-400">{comment.length}/300</span>
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 300))} placeholder="What did you love about this place?" className="w-full h-24 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 resize-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A8CC]" />
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-gray-700 dark:text-gray-300">Share with friends</p><p className="text-sm text-gray-400">Your friends will see this</p></div>
                  <Switch checked={shareWithFriends} onCheckedChange={setShareWithFriends} className="data-[state=checked]:bg-[#00A8CC]" />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-gray-700 dark:text-gray-300">Add to public feed</p><p className="text-sm text-gray-400">Everyone can see this</p></div>
                  <Switch checked={addToPublicFeed} onCheckedChange={setAddToPublicFeed} />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 safe-bottom">
              <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-[#00A8CC] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Check-In'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const VenueDetailSheet = ({ venue, isOpen, onClose, lastCheckin = null }) => {
  const { isAuthenticated } = useAuth()
  const [saved, setSaved] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [signInAction, setSignInAction] = useState('')

  if (!venue) return null

  // Format last check-in date
  const formatCheckinDate = (date) => {
    if (!date) return null
    const now = new Date()
    const checkinDate = new Date(date)
    const diffDays = Math.floor((now - checkinDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${checkinDate.getDate()} ${months[checkinDate.getMonth()]}`
  }

  const handleSave = () => {
    if (!isAuthenticated) { setSignInAction('save'); setShowSignInPrompt(true); return }
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved!')
  }

  const handleShare = async () => {
    if (navigator.vibrate) navigator.vibrate(30)
    if (navigator.share) {
      try { await navigator.share({ title: venue.name, text: `Check out ${venue.name}!`, url: window.location.href }) } 
      catch (err) { toast.info('Share cancelled') }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  const handleCheckInClick = () => {
    if (!isAuthenticated) { setSignInAction('check in to'); setShowSignInPrompt(true); return }
    if (navigator.vibrate) navigator.vibrate(30)
    setShowCheckIn(true)
  }

  const handleGetDirections = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const dest = `${venue.lat},${venue.lng}`
    window.open(isIOS ? `maps://maps.apple.com/?daddr=${dest}` : `https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank')
  }

  const handleCall = () => {
    window.location.href = 'tel:+61298346218'
  }

  const handleWebsite = () => {
    window.open('https://thegrounds.com.au', '_blank')
  }

  const amenities = [
    { icon: Car, label: 'Parking', available: true },
    { icon: Wifi, label: 'WiFi', available: true },
    { icon: Accessibility, label: 'Accessible', available: true },
    { icon: UtensilsCrossed, label: 'Outdoor', available: false },
    { icon: PawPrint, label: 'Pet Friendly', available: true },
  ]

  const reviewCount = Math.floor(Math.random() * 500) + 100

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[2000]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[2001] max-h-[92vh] overflow-hidden">
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" /></div>
              <div className="overflow-y-auto max-h-[calc(92vh-100px)] pb-24">
                {/* Hero Image */}
                <div className="relative h-56">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <ChevronDown className="w-6 h-6 text-gray-700" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-20">
                    <span className="text-[#00A8CC] text-sm font-semibold">{venue.category}</span>
                    <h2 className="text-2xl font-bold text-white">{venue.name}</h2>
                  </div>
                </div>

                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{venue.rating}</span>
                      <span className="text-gray-500">out of {reviewCount} reviews</span>
                    </div>
                    <span className="text-[#00A8CC] font-semibold">Top rated</span>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <MapPinned className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">Sydney N...</p>
                      <p className="text-xs text-gray-500 text-center truncate">Sydney NSW...</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-[#00A8CC]" />
                      <p className="text-sm font-semibold text-[#00A8CC] text-center">Open Now</p>
                      <p className="text-xs text-gray-500 text-center">Closes at 5:0...</p>
                    </div>
                    <button onClick={handleCall} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Phone className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">Call</p>
                      <p className="text-xs text-gray-500 text-center">02 9834 6218</p>
                    </button>
                  </div>

                  {/* About */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h3>
                    <p className="text-gray-600 dark:text-gray-400">{venue.category} in The Rocks, Sydney</p>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Amenities</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {amenities.map((a, i) => {
                        const Icon = a.icon
                        return (
                          <div key={i} className={`flex flex-col items-center min-w-[80px] p-4 rounded-2xl ${a.available ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50 opacity-40'}`}>
                            <Icon className="w-7 h-7 mb-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">{a.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Location</h3>
                    <div className="relative rounded-2xl overflow-hidden">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${venue.lng - 0.008}%2C${venue.lat - 0.005}%2C${venue.lng + 0.008}%2C${venue.lat + 0.005}&layer=mapnik&marker=${venue.lat}%2C${venue.lng}`}
                        className="w-full h-48 border-0"
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-[#00A8CC] flex items-center justify-center shadow-lg -mt-5">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <button onClick={handleGetDirections} className="absolute bottom-3 left-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-gray-700 text-sm font-medium hover:bg-gray-50">
                        <Navigation className="w-4 h-4 text-[#00A8CC]" />
                        <span>View on map</span>
                      </button>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h3>
                      <button className="flex items-center gap-1 text-[#00A8CC] font-medium">View all <ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 text-center">
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
                <div className="flex items-center gap-3">
                  <button onClick={handleSave} className={`w-14 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                    <Heart className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-14 h-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500">
                    <ListPlus className="w-6 h-6" />
                  </button>
                  <button onClick={handleShare} className="w-14 h-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500">
                    <Share2 className="w-6 h-6" />
                  </button>
                  <button onClick={handleCheckInClick} disabled={checkedIn} className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-lg ${checkedIn ? 'bg-green-500 text-white' : 'bg-[#00A8CC] text-white'}`}>
                    <Check className="w-6 h-6" />
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

export default VenueDetailSheet
