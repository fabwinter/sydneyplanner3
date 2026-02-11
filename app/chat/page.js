'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, Coffee, Umbrella, Utensils, TreePine, Gem, MapPin, 
  Star, Heart, ChevronRight, Home, Map, Clock, MessageCircle, User,
  Loader2, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { toast } from 'sonner'

const quickButtons = [
  { icon: Coffee, label: 'Best brunch spots nearby', emoji: '🍳', query: 'best brunch cafes in Sydney' },
  { icon: Umbrella, label: 'Family-friendly beaches', emoji: '🏖️', query: 'family friendly beaches in Sydney' },
  { icon: Utensils, label: 'Romantic dinner ideas', emoji: '🌃', query: 'romantic dinner restaurants in Sydney' },
  { icon: Gem, label: 'Hidden gems to explore', emoji: '🔮', query: 'hidden gem spots in Sydney' },
  { icon: Coffee, label: 'Quiet cafes for work', emoji: '☕', query: 'quiet cafes for working in Sydney' },
  { icon: TreePine, label: 'Nature walks in Sydney', emoji: '🌿', query: 'nature walks and hiking trails in Sydney' },
]

const BottomNav = ({ active = 'home' }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/chat' },
    { id: 'map', icon: Map, label: 'Map', href: '/explore' },
    { id: 'timeline', icon: Clock, label: 'Timeline', href: '/timeline' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', href: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#00A8CC] bg-[#00A8CC]/10' 
                  : 'text-gray-500 hover:text-[#00A8CC]'
              }`}
              onClick={() => navigator.vibrate && navigator.vibrate(30)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const VenueCard = ({ venue, index }) => {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(!saved)
    if (navigator.vibrate) navigator.vibrate(50)
    toast.success(saved ? 'Removed from saved' : 'Saved to favorites!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass-card overflow-hidden mb-4 hover:shadow-xl transition-all duration-300">
        <div className="relative h-40 overflow-hidden">
          <img 
            src={venue.image} 
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                saved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700">
              {venue.category}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{venue.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{venue.address}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-[#F4A261] fill-[#F4A261]" />
                <span className="ml-1 font-semibold text-gray-700 dark:text-gray-300">{venue.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">{venue.distance}</span>
            </div>
            <Link href={`/venue/${venue.id}`}>
              <Button size="sm" variant="outline" className="rounded-full text-[#00A8CC] border-[#00A8CC] hover:bg-[#00A8CC] hover:text-white">
                View <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('Explorer')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Load user name from localStorage
    const storedName = localStorage.getItem('sydney_user_name')
    if (storedName) setUserName(storedName)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (query = null) => {
    const messageText = query || input.trim()
    if (!messageText) return

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30)

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageText })
      })

      const data = await response.json()

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: data.message,
        venues: data.venues || [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickButton = (query) => {
    handleSend(query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A8CC] to-[#F4A261] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">Sydney Planner</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Discovery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        {messages.length === 0 ? (
          // Welcome Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Avatar className="w-20 h-20 border-4 border-[#00A8CC]/20">
                <AvatarImage src="https://images.unsplash.com/photo-1568246654191-5d306d62227d?w=100&h=100&fit=crop" />
                <AvatarFallback className="bg-[#00A8CC] text-white text-2xl">SP</AvatarFallback>
              </Avatar>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              G'day {userName}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              I'm your Sydney Planner assistant. Tell me what you're in the mood for, and I'll find the perfect spots in Sydney!
            </p>

            {/* Quick Buttons */}
            <div className="space-y-3">
              {quickButtons.slice(0, 3).map((btn, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => handleQuickButton(btn.query)}
                  className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-xl">{btn.emoji}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{btn.label}</span>
                </motion.button>
              ))}
              
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {quickButtons.slice(3).map((btn, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    onClick={() => handleQuickButton(btn.query)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-lg">{btn.emoji}</span>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{btn.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          // Messages
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'user' ? (
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#00A8CC] text-white">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="max-w-full">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#00A8CC] text-white text-xs">SP</AvatarFallback>
                        </Avatar>
                        <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm max-w-[280px]">
                          <p className="text-gray-700 dark:text-gray-300">{msg.text}</p>
                        </div>
                      </div>
                      {msg.venues && msg.venues.length > 0 && (
                        <div className="ml-11 space-y-3">
                          {msg.venues.map((venue, idx) => (
                            <VenueCard key={venue.id} venue={venue} index={idx} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#00A8CC] text-white text-xs">SP</AvatarFallback>
                </Avatar>
                <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finding the best spots...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-16 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 p-2 rounded-full glass border border-gray-200 dark:border-gray-700">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about Sydney..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-full bg-[#00A8CC] hover:bg-[#00D4FF] w-10 h-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

export default ChatPage
