'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Heart, ChevronDown, ChevronRight, ChevronLeft,
  Clock, Phone, Globe, Wifi, Car, Accessibility, UtensilsCrossed, 
  PawPrint, ExternalLink, ListPlus, Share2, Check, Navigation,
  X, Camera, ImagePlus, Loader2, LogIn, MapPinned, Calendar, Edit3, Trash2
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
            <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={() => router.push('/login')} className="flex-1 h-11 rounded-xl bg-[#00A8CC] text-white font-medium">Sign In</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Check-In Modal Component - NOW ACTUALLY SAVES TO API
const CheckInModal = ({ venue, isOpen, onClose, onComplete }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState([])
  const [photoUrls, setPhotoUrls] = useState([])
  const [shareWithFriends, setShareWithFriends] = useState(true)
  const [addToPublicFeed, setAddToPublicFeed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState([]) // Track uploaded URLs
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  if (!venue || !isOpen) return null

  // Resize image to max dimension while maintaining aspect ratio
  const resizeImage = (file, maxSize = 1200) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            },
            'image/jpeg',
            0.8 // 80% quality
          )
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoCapture = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setIsUploading(true)
    const newUrls = []
    
    for (const originalFile of files) {
      try {
        // Resize image first
        const resizedFile = await resizeImage(originalFile)
        
        // Create local preview
        const previewUrl = URL.createObjectURL(resizedFile)
        setPhotos(prev => [...prev, { id: Date.now() + Math.random(), url: previewUrl, file: resizedFile }])
        
        // Upload to server
        const formData = new FormData()
        formData.append('file', resizedFile)
        const response = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await response.json()
        
        if (data.success && data.url) {
          newUrls.push(data.url)
        }
      } catch (err) {
        console.error('Upload error:', err)
        toast.error('Failed to upload image')
      }
    }
    
    // Update uploaded URLs
    setUploadedUrls(prev => [...prev, ...newUrls])
    setPhotoUrls(prev => [...prev, ...newUrls])
    setIsUploading(false)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    // Wait if still uploading
    if (isUploading) {
      toast.error('Please wait for photos to finish uploading')
      return
    }
    
    setIsSubmitting(true)
    if (navigator.vibrate) navigator.vibrate([50, 50, 50])
    
    try {
      // Use the collected uploaded URLs
      const finalPhotoUrls = [...uploadedUrls, ...photoUrls].filter((url, index, self) => 
        url && self.indexOf(url) === index // Remove duplicates and empty
      )
      
      // ACTUALLY SAVE TO API
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: venue.id,
          venue_name: venue.name,
          venue_category: venue.category,
          venue_address: venue.address || `${venue.category} in Sydney`,
          venue_lat: venue.lat,
          venue_lng: venue.lng,
          venue_image: venue.image,
          rating,
          comment,
          photos: finalPhotoUrls,
          user_id: 'anonymous'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Checked in at ${venue.name}!`)
        // Reset form
        setRating(0)
        setComment('')
        setPhotos([])
        setPhotoUrls([])
        setUploadedUrls([])
        onComplete(data)
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
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[3000]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[3001] max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Check-In</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-130px)] p-4">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-1 text-sm">Share your experience at</p>
              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-5">{venue.name}</h3>
              <div className="mb-5">
                <p className="text-center font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">How was it? *</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => { setRating(star); if (navigator.vibrate) navigator.vibrate(30) }} className="p-1">
                      <Star className={`w-9 h-9 transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Add photos (optional)</p>
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"><X className="w-3 h-3 text-white" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoCapture} className="hidden" />
                  <button onClick={() => cameraInputRef.current?.click()} disabled={isUploading} className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00A8CC] hover:bg-[#00A8CC]/5 transition-colors disabled:opacity-50">
                    <Camera className="w-6 h-6 text-gray-400 mb-1" /><span className="text-xs text-gray-500">Take photo</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00A8CC] hover:bg-[#00A8CC]/5 transition-colors disabled:opacity-50">
                    {isUploading ? <Loader2 className="w-6 h-6 text-gray-400 mb-1 animate-spin" /> : <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />}
                    <span className="text-xs text-gray-500">{isUploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Comment (optional)</p>
                  <span className="text-xs text-gray-400">{comment.length}/300</span>
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 300))} placeholder="What did you love about this place?" className="w-full h-20 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 resize-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A8CC] text-sm" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 safe-bottom">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="flex-1 h-11 rounded-xl bg-[#00A8CC] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Check-In'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Edit Check-in Modal
const EditCheckinModal = ({ checkin, isOpen, onClose, onSave }) => {
  const [rating, setRating] = useState(checkin?.rating || 0)
  const [comment, setComment] = useState(checkin?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (checkin) {
      setRating(checkin.rating || 0)
      setComment(checkin.comment || '')
    }
  }, [checkin])

  if (!checkin || !isOpen) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    setIsSubmitting(true)
    await onSave(checkin.id, rating, comment)
    setIsSubmitting(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[3500]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[3501] max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Check-In</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4">
              <div className="mb-5">
                <p className="text-center font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Your Rating *</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="p-1">
                      <Star className={`w-9 h-9 transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Comment</p>
                  <span className="text-xs text-gray-400">{comment.length}/300</span>
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 300))} placeholder="Update your experience..." className="w-full h-24 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 resize-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A8CC] text-sm" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 safe-bottom">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="flex-1 h-11 rounded-xl bg-[#00A8CC] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const VenueDetailSheet = ({ venue, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth()
  const [saved, setSaved] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [signInAction, setSignInAction] = useState('')
  
  // Check-in history state
  const [venueCheckins, setVenueCheckins] = useState([])
  const [currentVisitIndex, setCurrentVisitIndex] = useState(0)
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false)
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCheckin, setEditingCheckin] = useState(null)

  // Fetch check-ins for this venue
  const fetchVenueCheckins = useCallback(async () => {
    if (!venue) return
    setIsLoadingCheckins(true)
    try {
      const response = await fetch(`/api/checkins?user_id=anonymous`)
      const data = await response.json()
      // Match by venue_name since venue IDs can be dynamic
      const checkins = (data.checkins || []).filter(c => 
        c.venue_name?.toLowerCase() === venue.name?.toLowerCase()
      )
      setVenueCheckins(checkins)
      setCurrentVisitIndex(0)
    } catch (err) {
      console.error('Error fetching venue check-ins:', err)
    } finally {
      setIsLoadingCheckins(false)
    }
  }, [venue])

  useEffect(() => {
    if (isOpen && venue) {
      fetchVenueCheckins()
    }
  }, [isOpen, venue, fetchVenueCheckins])

  if (!venue) return null

  const totalVisits = venueCheckins.length
  const currentVisit = venueCheckins[currentVisitIndex]

  // Format date for display
  const formatVisitDate = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const handleSave = () => {
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
    if (navigator.vibrate) navigator.vibrate(30)
    setShowCheckIn(true)
  }

  const handleCheckInComplete = (data) => {
    // Refresh check-ins after new check-in
    fetchVenueCheckins()
  }

  // Edit check-in
  const handleEditCheckin = (checkin) => {
    setEditingCheckin(checkin)
    setShowEditModal(true)
  }

  // Delete check-in
  const handleDeleteCheckin = async (checkinId) => {
    if (!confirm('Delete this check-in?')) return
    
    try {
      const response = await fetch(`/api/checkins/${checkinId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Check-in deleted')
        fetchVenueCheckins() // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete check-in')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete check-in')
    }
  }

  // Save edited check-in
  const handleSaveEdit = async (checkinId, rating, comment) => {
    try {
      const response = await fetch(`/api/checkins/${checkinId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Check-in updated')
        setShowEditModal(false)
        setEditingCheckin(null)
        fetchVenueCheckins() // Refresh
      } else {
        toast.error(data.error || 'Failed to update check-in')
      }
    } catch (err) {
      console.error('Update error:', err)
      toast.error('Failed to update check-in')
    }
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

  const amenities = [
    { icon: Car, label: 'Parking', available: true },
    { icon: Wifi, label: 'WiFi', available: true },
    { icon: Accessibility, label: 'Accessible', available: false },
    { icon: UtensilsCrossed, label: 'Outdoor', available: true },
    { icon: PawPrint, label: 'Pet Friendly', available: false },
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
              <div className="overflow-y-auto max-h-[calc(92vh-90px)] pb-20">
                {/* Hero Image */}
                <div className="relative h-48">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button onClick={handleShare} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Share2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                    <span className="text-[#00A8CC] text-xs font-semibold">{venue.category}</span>
                    <h2 className="text-xl font-bold text-white">{venue.name}</h2>
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{venue.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Rating Section */}
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{venue.rating}</span>
                    <span className="text-sm text-gray-500">out of {reviewCount} reviews</span>
                  </div>

                  {/* Quick Info Cards - Smaller */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <MapPinned className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-900 dark:text-white text-center truncate">Sydney N...</p>
                      <p className="text-[10px] text-gray-500 text-center truncate">Sydney NSW...</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-[#00A8CC]" />
                      <p className="text-xs font-semibold text-[#00A8CC] text-center">Open Now</p>
                      <p className="text-[10px] text-gray-500 text-center">Closes at 10:...</p>
                    </div>
                    <button onClick={handleCall} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Phone className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-900 dark:text-white text-center">Call</p>
                      <p className="text-[10px] text-gray-500 text-center">02 9412 9952</p>
                    </button>
                  </div>

                  {/* Your Visits Section - NEW */}
                  {totalVisits > 0 && (
                    <div className="mb-5 p-4 rounded-2xl bg-[#E8F7FA] dark:bg-gray-800 border border-[#00A8CC]/20 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#00A8CC]" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">Your Visits ({totalVisits})</span>
                        </div>
                        <button 
                          onClick={handleCheckInClick}
                          className="px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Check-In Again
                        </button>
                      </div>
                      
                      {/* Visit Navigation */}
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <button 
                          onClick={() => setCurrentVisitIndex(prev => Math.min(prev + 1, totalVisits - 1))}
                          disabled={currentVisitIndex >= totalVisits - 1}
                          className="p-1 disabled:opacity-30"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <span className="text-sm text-gray-500">Visit {totalVisits - currentVisitIndex} of {totalVisits}</span>
                        <button 
                          onClick={() => setCurrentVisitIndex(prev => Math.max(prev - 1, 0))}
                          disabled={currentVisitIndex <= 0}
                          className="p-1 disabled:opacity-30"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      
                      {/* Current Visit Details */}
                      {currentVisit && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{formatVisitDate(currentVisit.created_at)}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= currentVisit.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {currentVisit.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2 bg-white dark:bg-gray-900 rounded-xl p-3">"{currentVisit.comment}"</p>
                          )}
                          
                          {/* User Photos */}
                          {currentVisit.photos && currentVisit.photos.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Photos</p>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {currentVisit.photos.filter(p => p && (p.startsWith('http') || p.startsWith('data:'))).map((photo, i) => (
                                  <img key={i} src={photo} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Edit and Delete buttons */}
                          <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <button 
                              onClick={() => handleEditCheckin(currentVisit)}
                              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#00A8CC]"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCheckin(currentVisit.id)}
                              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* About */}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{venue.category} in Sydney, Australia</p>
                  </div>

                  {/* Amenities - Smaller */}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Amenities</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {amenities.map((a, i) => {
                        const Icon = a.icon
                        return (
                          <div key={i} className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl ${a.available ? 'bg-[#00A8CC]/10' : 'bg-gray-50 dark:bg-gray-800/50 opacity-40'}`}>
                            <Icon className={`w-6 h-6 mb-1 ${a.available ? 'text-[#00A8CC]' : 'text-gray-400'}`} />
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 text-center font-medium">{a.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Location</h3>
                    <div className="relative rounded-xl overflow-hidden">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${venue.lng - 0.008}%2C${venue.lat - 0.005}%2C${venue.lng + 0.008}%2C${venue.lat + 0.005}&layer=mapnik&marker=${venue.lat}%2C${venue.lng}`}
                        className="w-full h-40 border-0"
                        style={{ pointerEvents: 'none' }}
                      />
                      <button onClick={handleGetDirections} className="absolute bottom-2 left-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-md text-gray-700 text-xs font-medium hover:bg-gray-50">
                        <Navigation className="w-3.5 h-3.5 text-[#00A8CC]" />
                        <span>View on map</span>
                      </button>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reviews</h3>
                      <button className="flex items-center gap-1 text-[#00A8CC] text-sm font-medium">View all <ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                      <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar - Smaller buttons like reference */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                    <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500">
                    <ListPlus className="w-4 h-4" />
                  </button>
                  <button onClick={handleShare} className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleCheckInClick} className="flex-1 h-9 rounded-lg flex items-center justify-center gap-1.5 font-medium text-sm bg-[#00A8CC] text-white">
                    <Check className="w-4 h-4" />
                    <span>{totalVisits > 0 ? `Check-In Again (${totalVisits})` : 'Check-In'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckInModal venue={venue} isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} onComplete={handleCheckInComplete} />
      <EditCheckinModal checkin={editingCheckin} isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingCheckin(null); }} onSave={handleSaveEdit} />
      <SignInPrompt isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)} action={signInAction} />
    </>
  )
}

export default VenueDetailSheet
