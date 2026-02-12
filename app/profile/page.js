'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Settings, Share2, User, MapPin, Clock,
  MessageCircle, Map, Heart, Coffee, Umbrella, TreePine, Landmark,
  Sparkles, UtensilsCrossed, Crown, Bookmark, Edit3, Star, Trophy,
  Bell, Shield, HelpCircle, LogOut, Moon, Sun, Camera, Loader2,
  BookMarked, Users, Zap
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Category icon and emoji mapping
const categoryConfig = {
  'Cafe': { icon: Coffee, emoji: '☕', color: '#F97316' },
  'Restaurant': { icon: UtensilsCrossed, emoji: '🍽️', color: '#EF4444' },
  'Beach': { icon: Umbrella, emoji: '🏖️', color: '#0EA5E9' },
  'Nature': { icon: TreePine, emoji: '🌳', color: '#22C55E' },
  'Museum': { icon: Landmark, emoji: '🏛️', color: '#8B5CF6' },
  'Attraction': { icon: Sparkles, emoji: '✨', color: '#EC4899' },
}

// Badge definitions
const badges = [
  { id: 'explorer', name: 'Explorer', emoji: '🧭', description: 'Visit 10 different venues', requirement: 10, type: 'total_checkins' },
  { id: 'beach_lover', name: 'Beach Lover', emoji: '🏖️', description: 'Visit 5 beaches', requirement: 5, type: 'category', category: 'Beach' },
  { id: 'foodie', name: 'Foodie', emoji: '🍽️', description: 'Visit 5 restaurants', requirement: 5, type: 'category', category: 'Restaurant' },
  { id: 'coffee_addict', name: 'Coffee Addict', emoji: '☕', description: 'Visit 5 cafes', requirement: 5, type: 'category', category: 'Cafe' },
  { id: 'nature_lover', name: 'Nature Lover', emoji: '🌿', description: 'Visit 3 nature spots', requirement: 3, type: 'category', category: 'Nature' },
  { id: 'culture_vulture', name: 'Culture Vulture', emoji: '🎭', description: 'Visit 3 museums', requirement: 3, type: 'category', category: 'Museum' },
  { id: 'adventurer', name: 'Adventurer', emoji: '🎢', description: 'Visit 3 attractions', requirement: 3, type: 'category', category: 'Attraction' },
  { id: 'regular', name: 'Regular', emoji: '⭐', description: 'Check-in at the same place 3 times', requirement: 3, type: 'repeat_visits' },
]

// Bottom Navigation
const BottomNav = ({ active = 'profile' }) => {
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

// Settings Sheet
const SettingsSheet = ({ isOpen, onClose }) => {
  const [darkMode, setDarkMode] = useState(false)
  
  if (!isOpen) return null

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => toast.info('Coming soon!') },
        { icon: Bell, label: 'Notifications', action: () => toast.info('Coming soon!') },
        { icon: Shield, label: 'Privacy', action: () => toast.info('Coming soon!') },
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Moon, label: 'Dark Mode', toggle: true, value: darkMode, onChange: () => setDarkMode(!darkMode) },
        { icon: HelpCircle, label: 'Help & FAQ', action: () => toast.info('Coming soon!') },
        { icon: Star, label: 'Rate Us', action: () => toast.info('Coming soon!') },
      ]
    },
    {
      title: 'About',
      items: [
        { icon: Share2, label: 'Share App', action: () => {
          if (navigator.share) {
            navigator.share({ title: 'Sydney Planner', text: 'Discover Sydney with AI!', url: window.location.origin })
          } else {
            toast.success('Link copied!')
          }
        }},
      ]
    }
  ]

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[2000]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 z-[2001] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
            <div className="w-10" />
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-gray-400 mb-2 px-1">{group.title}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                {group.items.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      onClick={item.toggle ? item.onChange : item.action}
                      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-700 ${idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
                      </div>
                      {item.toggle ? (
                        <div className={`w-12 h-7 rounded-full ${item.value ? 'bg-[#00A8CC]' : 'bg-gray-200 dark:bg-gray-600'} flex items-center ${item.value ? 'justify-end' : 'justify-start'} px-1 transition-all`}>
                          <div className="w-5 h-5 rounded-full bg-white shadow" />
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Stat Card
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="flex flex-col items-center">
    <Icon className="w-6 h-6 text-[#00A8CC] mb-1" />
    <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
)

// Category Badge
const CategoryBadge = ({ category, count, onClick }) => {
  const config = categoryConfig[category] || { emoji: '📍', color: '#6B7280' }
  return (
    <button onClick={onClick} className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: `${config.color}20` }}>
        <span className="text-3xl">{config.emoji}</span>
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
      <span className="text-xs text-gray-500">{count} Check-in{count !== 1 ? 's' : ''}</span>
    </button>
  )
}

// Achievement Badge
const AchievementBadge = ({ badge, unlocked, progress }) => (
  <div className={`flex flex-col items-center ${!unlocked ? 'opacity-40' : ''}`}>
    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${unlocked ? 'bg-amber-100' : 'bg-gray-100 dark:bg-gray-800'}`}>
      <span className="text-3xl">{badge.emoji}</span>
    </div>
    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{badge.name}</span>
    {!unlocked && progress && (
      <span className="text-xs text-gray-500">{progress}/{badge.requirement}</span>
    )}
  </div>
)

// List Card
const ListCard = ({ title, count, icon: Icon, color, onClick }) => (
  <button onClick={onClick} className="flex-1 min-w-[140px] p-4 rounded-2xl" style={{ backgroundColor: color || '#F3F4F6' }}>
    <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-gray-700" />
    </div>
    <h3 className="font-semibold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600">{count} place{count !== 1 ? 's' : ''}</p>
  </button>
)

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [checkins, setCheckins] = useState([])
  const [saves, setSaves] = useState([])
  const [stats, setStats] = useState({
    totalCheckins: 0,
    mayorships: 0,
    friends: 0,
    points: 0
  })
  const [categoryStats, setCategoryStats] = useState({})
  const [unlockedBadges, setUnlockedBadges] = useState([])

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch check-ins
      const checkinsRes = await fetch('/api/checkins?user_id=anonymous')
      const checkinsData = await checkinsRes.json()
      
      // Fetch saves
      const savesRes = await fetch('/api/saves?user_id=anonymous')
      const savesData = await savesRes.json()
      
      const userCheckins = checkinsData.checkins || []
      const userSaves = savesData.saves || []
      
      setCheckins(userCheckins)
      setSaves(userSaves)
      
      // Calculate stats
      const totalCheckins = userCheckins.length
      const points = totalCheckins * 10 // 10 points per check-in
      
      setStats({
        totalCheckins,
        mayorships: 0, // Would need more complex logic
        friends: 0,
        points
      })
      
      // Calculate category stats
      const catStats = {}
      userCheckins.forEach(checkin => {
        const cat = checkin.venue_category || 'Other'
        catStats[cat] = (catStats[cat] || 0) + 1
      })
      setCategoryStats(catStats)
      
      // Calculate unlocked badges
      const unlocked = []
      badges.forEach(badge => {
        if (badge.type === 'total_checkins' && totalCheckins >= badge.requirement) {
          unlocked.push(badge.id)
        } else if (badge.type === 'category' && (catStats[badge.category] || 0) >= badge.requirement) {
          unlocked.push(badge.id)
        }
      })
      setUnlockedBadges(unlocked)
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Sydney Planner Profile',
        text: `I've visited ${stats.totalCheckins} places in Sydney!`,
        url: window.location.href
      })
    } else {
      toast.success('Link copied!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00A8CC] mb-4" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'checkins', label: 'Check-Ins' },
    { id: 'saved', label: 'Saved' },
    { id: 'badges', label: 'Badges' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-40 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mb-6">
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00A8CC] flex items-center justify-center border-2 border-white dark:border-gray-900">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex-1 flex items-center justify-around">
            <StatCard icon={MapPin} value={stats.totalCheckins} label="Check-ins" />
            <StatCard icon={Crown} value={stats.mayorships} label="Mayorships" />
            <StatCard icon={Users} value={stats.friends} label="Friends" />
          </div>
        </div>

        {/* Name and Location */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sydney Explorer</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Sydney, NSW</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 font-semibold">{stats.points} points</span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium flex items-center justify-center gap-2">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-[#00A8CC] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 space-y-6"
          >
            {/* Lists Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lists</h2>
                <Link href="/saved" className="text-[#00A8CC] text-sm font-medium flex items-center gap-1">
                  See all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                <ListCard
                  title="Saved places"
                  count={saves.length}
                  icon={Bookmark}
                  color="#E5E7EB"
                  onClick={() => router.push('/saved')}
                />
                <ListCard
                  title="Liked places"
                  count={0}
                  icon={Heart}
                  color="#FEF3C7"
                  onClick={() => toast.info('Coming soon!')}
                />
              </div>
            </div>

            {/* Achievements Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h2>
              </div>
              
              {/* Categories */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Categories {Object.keys(categoryStats).length}/6</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <CategoryBadge
                      key={category}
                      category={category}
                      count={count}
                      onClick={() => setActiveTab('checkins')}
                    />
                  ))}
                  {Object.keys(categoryStats).length === 0 && (
                    <div className="flex items-center justify-center py-8 w-full">
                      <p className="text-gray-500 text-sm">No categories yet. Start checking in!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Badges {unlockedBadges.length}/{badges.length}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                  {badges.slice(0, 4).map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id)
                    let progress = 0
                    if (badge.type === 'total_checkins') {
                      progress = stats.totalCheckins
                    } else if (badge.type === 'category') {
                      progress = categoryStats[badge.category] || 0
                    }
                    return (
                      <AchievementBadge
                        key={badge.id}
                        badge={badge}
                        unlocked={isUnlocked}
                        progress={progress}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'checkins' && (
          <motion.div
            key="checkins"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4"
          >
            {checkins.length > 0 ? (
              <div className="space-y-3">
                {checkins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-3 shadow-sm"
                  >
                    <img
                      src={checkin.venue_image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop'}
                      alt={checkin.venue_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{checkin.venue_name}</h3>
                      <p className="text-sm text-gray-500">{checkin.venue_category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= checkin.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(checkin.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <MapPin className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No check-ins yet</h3>
                <p className="text-gray-500 text-center max-w-xs mb-4">Start exploring Sydney and check in to your favorite places!</p>
                <Link href="/explore" className="px-6 py-3 rounded-xl bg-[#00A8CC] text-white font-medium flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Explore Sydney
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4"
          >
            {saves.length > 0 ? (
              <div className="space-y-3">
                {saves.map((save) => (
                  <div
                    key={save.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-3 shadow-sm"
                  >
                    <img
                      src={save.venue_image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop'}
                      alt={save.venue_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{save.venue_name}</h3>
                      <p className="text-sm text-gray-500">{save.venue_category}</p>
                      <span className="text-xs text-gray-400">
                        Saved {new Date(save.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Heart className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved places</h3>
                <p className="text-gray-500 text-center max-w-xs mb-4">Save your favorite venues to visit them later!</p>
                <Link href="/explore" className="px-6 py-3 rounded-xl bg-[#00A8CC] text-white font-medium flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Explore Sydney
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4"
          >
            <div className="grid grid-cols-3 gap-4">
              {badges.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id)
                let progress = 0
                if (badge.type === 'total_checkins') {
                  progress = stats.totalCheckins
                } else if (badge.type === 'category') {
                  progress = categoryStats[badge.category] || 0
                }
                return (
                  <div
                    key={badge.id}
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center ${!isUnlocked ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'bg-amber-100' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <span className="text-2xl">{badge.emoji}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">{badge.name}</span>
                    <span className="text-xs text-gray-500 text-center mt-1">{badge.description}</span>
                    {!isUnlocked && (
                      <div className="w-full mt-2">
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00A8CC] rounded-full"
                            style={{ width: `${Math.min((progress / badge.requirement) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{progress}/{badge.requirement}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="profile" />
      <SettingsSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </motion.div>
  )
}
