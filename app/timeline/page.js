'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Star, Clock, Filter, Calendar, ChevronDown,
  MessageCircle, User, Map, Heart, Coffee, Umbrella, Building2,
  TreePine, Landmark, Sparkles, UtensilsCrossed
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import VenueDetailSheet from '@/components/VenueDetailSheet'

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

// Sample check-in data (will be replaced with real data from database)
const sampleCheckins = [
  {
    id: '1',
    venue: {
      id: 'v1',
      name: 'Bondi Beach',
      category: 'Beach',
      address: 'Campbell Parade, Bondi',
      lat: -33.8915,
      lng: 151.2767,
      rating: 4.7,
      distance: '8.5 km',
      image: 'https://images.unsplash.com/photo-1527731149372-fae504a1185f?w=400&h=300&fit=crop',
    },
    rating: 4,
    comment: 'Great beach.',
    time: '1:24 pm',
    date: new Date('2025-02-09'),
    photo: 'https://images.unsplash.com/photo-1527731149372-fae504a1185f?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    venue: {
      id: 'v2',
      name: 'Single O',
      category: 'Cafe',
      address: 'Reservoir St, Surry Hills',
      lat: -33.8836,
      lng: 151.2108,
      rating: 4.6,
      distance: '3.1 km',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    },
    rating: 4,
    comment: 'Great Coffee',
    time: '1:10 pm',
    date: new Date('2025-02-09'),
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    venue: {
      id: 'v3',
      name: 'White Rabbit Gallery',
      category: 'Museum',
      address: '30 Balfour Street',
      lat: -33.8877,
      lng: 151.1986,
      rating: 4.7,
      distance: '2.8 km',
      image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop',
    },
    rating: 4,
    comment: '',
    time: '8:05 pm',
    date: new Date('2025-02-08'),
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop',
  },
  {
    id: '4',
    venue: {
      id: 'v4',
      name: 'The Grounds of Alexandria',
      category: 'Cafe',
      address: 'Huntley St, Alexandria',
      lat: -33.9107,
      lng: 151.1957,
      rating: 4.5,
      distance: '2.1 km',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    },
    rating: 5,
    comment: 'Amazing brunch spot!',
    time: '11:30 am',
    date: new Date('2025-02-04'),
    photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop',
  },
  {
    id: '5',
    venue: {
      id: 'v5',
      name: 'Royal Botanic Garden',
      category: 'Nature',
      address: 'Mrs Macquaries Rd, Sydney',
      lat: -33.8642,
      lng: 151.2166,
      rating: 4.8,
      distance: '4.8 km',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
    },
    rating: 5,
    comment: 'Beautiful gardens!',
    time: '3:00 pm',
    date: new Date('2025-02-04'),
    photo: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=100&h=100&fit=crop',
  },
]

// Format date to "Mon, 9 Feb" format
const formatDate = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
}

// Group checkins by date
const groupByDate = (checkins) => {
  const groups = {}
  checkins.forEach(checkin => {
    const dateKey = checkin.date.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: checkin.date,
        checkins: []
      }
    }
    groups[dateKey].checkins.push(checkin)
  })
  return Object.values(groups).sort((a, b) => b.date - a.date)
}

// Check-in Card Component
const CheckinCard = ({ checkin, onClick, isLast }) => {
  const CategoryIcon = categoryIcons[checkin.venue.category] || Sparkles
  const categoryColor = categoryColors[checkin.venue.category] || '#6B7280'

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div 
        className="absolute left-0 top-6 w-3 h-3 rounded-full border-2 border-white z-10"
        style={{ backgroundColor: '#00A8CC' }}
      />
      
      {/* Timeline line - only show if not last */}
      {!isLast && (
        <div 
          className="absolute left-[5px] top-8 w-0.5 h-full"
          style={{ backgroundColor: '#00A8CC' }}
        />
      )}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex gap-3">
          {/* Category Icon */}
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            <CategoryIcon 
              className="w-7 h-7" 
              style={{ color: categoryColor }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {checkin.venue.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {checkin.venue.category} • {checkin.venue.address}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-amber-500">{checkin.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{checkin.time}</span>
              </div>
            </div>
            {checkin.comment && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 truncate">
                "{checkin.comment}"
              </p>
            )}
          </div>

          {/* Photo */}
          {checkin.photo && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={checkin.photo} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Bottom Navigation Component
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
            <Link 
              key={item.id} 
              href={item.href} 
              className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${isActive ? 'text-[#00A8CC]' : 'text-gray-400 hover:text-gray-600'}`}
            >
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [showVenueDetail, setShowVenueDetail] = useState(false)

  const categories = ['All Categories', 'Cafe', 'Restaurant', 'Beach', 'Nature', 'Museum', 'Attraction']

  // Filter checkins
  const filteredCheckins = sampleCheckins.filter(checkin => {
    const matchesSearch = searchQuery === '' || 
      checkin.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checkin.venue.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || 
      checkin.venue.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedCheckins = groupByDate(filteredCheckins)

  const handleCheckinClick = (checkin) => {
    setSelectedVenue(checkin.venue)
    setShowVenueDetail(true)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-40 px-4 pt-4 pb-2">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="w-full h-12 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 pl-12 pr-4 text-base placeholder:text-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Category Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-300"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{selectedCategory}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setShowCategoryDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedCategory === cat ? 'bg-[#00A8CC]/10 text-[#00A8CC] font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Button */}
          <button className="h-11 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Date</span>
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="px-4 pt-2">
        {groupedCheckins.length > 0 ? (
          groupedCheckins.map((group, groupIndex) => (
            <div key={group.date.toDateString()} className="mb-6">
              {/* Date Header */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {formatDate(group.date)}
              </h2>

              {/* Timeline line container */}
              <div className="relative">
                {/* Continuous timeline line for the group */}
                <div 
                  className="absolute left-[5px] top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: '#00A8CC' }}
                />

                {/* Checkins */}
                {group.checkins.map((checkin, index) => (
                  <CheckinCard
                    key={checkin.id}
                    checkin={checkin}
                    onClick={() => handleCheckinClick(checkin)}
                    isLast={index === group.checkins.length - 1 && groupIndex === groupedCheckins.length - 1}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No check-ins yet
            </h3>
            <p className="text-gray-500 text-center max-w-xs">
              Start exploring Sydney and check in at your favorite places!
            </p>
            <Link 
              href="/explore"
              className="mt-4 px-6 py-3 rounded-full bg-[#00A8CC] text-white font-medium"
            >
              Explore Sydney
            </Link>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <Link
        href="/chat"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#00A8CC] text-white flex items-center justify-center shadow-lg z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </Link>

      {/* Bottom Navigation */}
      <BottomNav active="timeline" />

      {/* Venue Detail Sheet */}
      <VenueDetailSheet
        venue={selectedVenue}
        isOpen={showVenueDetail}
        onClose={() => setShowVenueDetail(false)}
      />
    </motion.div>
  )
}

export default TimelinePage
