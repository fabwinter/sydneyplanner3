'use client'

/**
 * FoursquareCategoryFilter
 *
 * A horizontally-scrolling chip bar that lets users pick a Foursquare venue
 * category to filter the explore map/list. Uses the same colour palette as the
 * existing map markers.
 *
 * Props:
 *   selectedCategory  string            - Currently active category key
 *   onCategoryChange  (key, id) => void - Called with the key and FSQ category ID
 *   isLoading         boolean           - Shows a spinner on the active chip
 */

import { useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { FSQ_CATEGORIES } from '@/lib/foursquare'

export default function FoursquareCategoryFilter({
  selectedCategory = 'all',
  onCategoryChange,
  isLoading = false,
}) {
  const scrollRef = useRef(null)

  const handleSelect = (key, cat) => {
    if (onCategoryChange) {
      onCategoryChange(key, cat.id)
    }
    // Scroll the clicked chip into view on mobile
    const el = document.getElementById(`cat-chip-${key}`)
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 pb-1 pt-1 no-scrollbar"
      style={{ scrollbarWidth: 'none' }}
      aria-label="Filter by venue category"
    >
      {Object.entries(FSQ_CATEGORIES).map(([key, cat]) => {
        const isActive = selectedCategory === key
        const showSpinner = isActive && isLoading

        return (
          <button
            key={key}
            id={`cat-chip-${key}`}
            onClick={() => handleSelect(key, cat)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              whitespace-nowrap transition-all duration-200 flex-shrink-0
              ${isActive
                ? 'text-white shadow-md scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }
            `}
            style={isActive ? { backgroundColor: cat.color } : {}}
            aria-pressed={isActive}
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>
            {showSpinner && (
              <Loader2 className="w-3.5 h-3.5 animate-spin ml-0.5 opacity-80" />
            )}
          </button>
        )
      })}
    </div>
  )
}
