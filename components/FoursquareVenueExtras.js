'use client'

/**
 * FoursquareVenueExtras
 *
 * Renders the Foursquare-specific sections (photo gallery, hours, tips, contact)
 * inside VenueDetailSheet when the active venue came from the Foursquare API.
 *
 * Props:
 *   venue  Object  - normalised venue with { photos, tips, hours, phone, website, fsq_id }
 */

import { useState } from 'react'
import {
  Globe,
  Phone,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'

// ── Photo Gallery ────────────────────────────────────────────────────────────

function PhotoGallery({ photos = [] }) {
  const [expanded, setExpanded] = useState(false)

  if (!photos || photos.length === 0) return null

  const visible = expanded ? photos : photos.slice(0, 4)

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Photos</h3>
          <span className="text-sm text-gray-400">({photos.length})</span>
        </div>
        {photos.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#00A8CC] font-medium flex items-center gap-1"
          >
            {expanded ? (
              <>Show less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View all <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((url, i) => (
          <div
            key={i}
            className={`rounded-xl overflow-hidden ${i === 0 && !expanded ? 'col-span-2 h-40' : 'h-28'}`}
          >
            <img
              src={url}
              alt={`Venue photo ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Opening Hours ─────────────────────────────────────────────────────────────

function OpeningHours({ hours }) {
  const [expanded, setExpanded] = useState(false)

  if (!hours) return null

  const { display = [], is_local_holiday, open_now } = hours

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hours</h3>
          {typeof open_now === 'boolean' && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                open_now
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {open_now ? 'Open now' : 'Closed'}
            </span>
          )}
        </div>
        {display.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#00A8CC] font-medium flex items-center gap-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {is_local_holiday && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          ⚠️ Hours may vary due to a local holiday
        </p>
      )}

      {display.length > 0 && expanded && (
        <div className="mt-2 space-y-1">
          {display.map((line, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tips / Reviews ────────────────────────────────────────────────────────────

function TipsSection({ tips = [] }) {
  if (!tips || tips.length === 0) return null

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-gray-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Tips
        </h3>
        <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          Foursquare
        </span>
      </div>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div
            key={tip.id || i}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "{tip.text}"
            </p>
            {tip.created_at && (
              <p className="text-xs text-gray-400 mt-1.5">
                {new Date(tip.created_at).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Contact Info ──────────────────────────────────────────────────────────────

function ContactInfo({ phone, website }) {
  if (!phone && !website) return null

  return (
    <div className="mb-5 flex flex-col gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00A8CC]/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-[#00A8CC]" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{phone}</p>
          </div>
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00A8CC]/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-[#00A8CC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {website.replace(/^https?:\/\/(www\.)?/, '')}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </a>
      )}
    </div>
  )
}

// ── Foursquare Attribution ────────────────────────────────────────────────────

function FoursquareAttribution({ fsqId }) {
  if (!fsqId) return null

  return (
    <div className="flex items-center justify-center gap-1.5 py-2 mb-4">
      <span className="text-xs text-gray-400">Powered by</span>
      <a
        href={`https://foursquare.com/v/${fsqId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-[#F94877] hover:underline"
      >
        Foursquare
      </a>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Renders all Foursquare-specific sections for a venue.
 * Drop this inside VenueDetailSheet when venue.isFoursquare === true.
 */
export default function FoursquareVenueExtras({ venue }) {
  if (!venue || !venue.isFoursquare) return null

  const { photos, tips, hours, phone, website, fsq_id } = venue

  return (
    <div>
      <PhotoGallery photos={photos} />
      <OpeningHours hours={hours} />
      <ContactInfo phone={phone} website={website} />
      <TipsSection tips={tips} />
      <FoursquareAttribution fsqId={fsq_id} />
    </div>
  )
}
