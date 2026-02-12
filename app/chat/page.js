'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Plus, Map, MapPin, Star, Heart, ChevronRight, 
  Clock, MessageCircle, User, Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useVenues } from '@/lib/VenueContext'
import VenueDetailSheet from '@/components/VenueDetailSheet'

const quickButtons = [
  { label: 'Best brunch spots', emoji: '🍳', query: 'best brunch cafes in Sydney' },
  { label: 'Family-friendly beaches', emoji: '🏖️', query: 'family friendly beaches in Sydney' },
  { label: 'Hidden gems to explore', emoji: '💎', query: 'hidden gem spots in Sydney' },
]

const BottomNav = ({ active = 'home' }) => {
  const navItems = [
    { id: 'home', icon: MessageCircle, label: 'Chats', href: '/chat' },
    { id: 'explore', icon: Map, label: 'Explore', href: '/explore' },
    { id: 'timeline', icon: Clock, label: 'Timeline', href: '/timeline' },
    { id: 'saved', icon: Heart, label: 'Saved', href: '/saved' },
    { id: 'profile', icon: User, label: 'Me', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link key={item.id} href={item.href} className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const VenueCard = ({ venue, index, onClick }) => {
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.stopPropagation()
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className="bg-white dark:bg-gray-800 overflow-hidden mb-3 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClick && onClick(venue)}
      >
        <div className="relative h-36 overflow-hidden">
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
          <button
            onClick={handleSave}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all ${saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400'}`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700">{venue.category}</span>
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
            <span className="text-[#00A8CC] font-medium text-sm flex items-center">View <ChevronRight className="w-4 h-4 ml-0.5" /></span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const ChatPage = () => {
  const router = useRouter()
  const { currentVenues, setCurrentVenues, chatMessages, setChatMessages } = useVenues()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('explorer')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [showVenueDetail, setShowVenueDetail] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const storedName = localStorage.getItem('sydney_user_name')
    if (storedName) setUserName(storedName.toLowerCase())
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSend = async (query = null) => {
    const messageText = query || input.trim()
    if (!messageText) return
    if (navigator.vibrate) navigator.vibrate(30)

    const userMessage = { id: Date.now(), type: 'user', text: messageText, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageText })
      })
      const data = await response.json()
      const aiMessage = { id: Date.now() + 1, type: 'assistant', text: data.message, venues: data.venues || [], timestamp: new Date() }
      setChatMessages(prev => [...prev, aiMessage])
      setCurrentVenues(data.venues || [])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenMap = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    router.push('/explore')
  }

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue)
    setShowVenueDetail(true)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  const hasVenues = currentVenues.length > 0

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-36"
    >
      {chatMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <div className="relative w-48 h-32">
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="w-36 h-24 rounded-t-full bg-gradient-to-t from-orange-200 to-orange-100 opacity-80" />
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="flex gap-0">
                  <div className="w-16 h-8 bg-white rounded-full shadow-sm" />
                  <div className="w-12 h-8 bg-white rounded-full shadow-sm -ml-6 mt-2" />
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                <div className="w-4 h-10 bg-gray-700 rounded-t-full transform -rotate-12" />
                <div className="w-5 h-14 bg-gray-800 rounded-t-full" />
                <div className="w-4 h-10 bg-gray-700 rounded-t-full transform rotate-12" />
                <div className="w-8 h-6 bg-gray-600 ml-1" />
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2">
                <div className="w-6 h-6 bg-[#00A8CC] rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Where to today, {userName}?
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 max-w-sm">
            {quickButtons.map((btn, i) => (
              <button key={i} onClick={() => handleSend(btn.query)} className="flex items-center gap-2 px-5 py-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 border border-gray-200 dark:border-gray-700">
                <span className="text-base">{btn.emoji}</span>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{btn.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 pt-6">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {chatMessages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'user' ? (
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-[#00A8CC] text-white">{msg.text}</div>
                  ) : (
                    <div className="max-w-full w-full">
                      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-3">
                        <p className="text-gray-700 dark:text-gray-300">{msg.text}</p>
                      </div>
                      {msg.venues && msg.venues.length > 0 && (
                        <div className="space-y-3">
                          {msg.venues.map((venue, idx) => (
                            <VenueCard key={venue.id} venue={venue} index={idx} onClick={handleVenueClick} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#00A8CC]" />
                <span className="text-gray-500 text-sm">Finding spots...</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="fixed bottom-16 left-0 right-0 z-40">
        {hasVenues && !isLoading && (
          <div className="flex justify-center mb-2">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleOpenMap}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A8CC] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </motion.button>
          </div>
        )}

        <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shrink-0">
                <Plus className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." className="w-full h-11 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 pl-4 pr-12 text-base placeholder:text-gray-400" />
                <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00A8CC] disabled:opacity-50 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />

      {/* Venue Detail Sheet */}
      <VenueDetailSheet 
        venue={selectedVenue} 
        isOpen={showVenueDetail} 
        onClose={() => setShowVenueDetail(false)} 
      />
    </motion.div>
  )
}

export default ChatPage
