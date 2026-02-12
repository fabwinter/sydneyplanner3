'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Category icons and colors mapping
const categoryConfig = {
  'Cafe': { 
    color: '#F97316', // orange
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`
  },
  'Restaurant': { 
    color: '#F97316', // orange
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
  },
  'Beach': { 
    color: '#0EA5E9', // blue
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z"/><path d="M6 11V7c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v4"/></svg>`
  },
  'Nature': { 
    color: '#22C55E', // green
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M12 22v-8"/><path d="M9 22h6"/><path d="M12 13c-1.81-.4-3.08-2.08-3-3.94C9.07 6.25 11.32 4 14 4c2.76 0 5 2.24 5 5 0 2.63-2.06 4.84-4.75 5"/><path d="M5 17c1.19-.24 2.11-.92 2.66-1.83C8.22 14.26 9 13 9 11a4 4 0 0 0-4-4c-2.21 0-4 1.79-4 4 0 2.12 1.67 3.9 3.81 4"/></svg>`
  },
  'Museum': { 
    color: '#8B5CF6', // purple
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M12 2 3 9h18Z"/></svg>`
  },
  'Attraction': { 
    color: '#EC4899', // pink
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  }
}

// Default config for unknown categories
const defaultConfig = {
  color: '#6B7280', // gray
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
}

// Create custom venue marker - simplified with name above pin
const createVenueIcon = (venue, isSelected = false) => {
  const config = categoryConfig[venue.category] || defaultConfig
  const scale = isSelected ? 1.15 : 1
  
  return L.divIcon({
    className: 'custom-venue-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(${scale});
        transform-origin: bottom center;
        transition: transform 0.2s ease;
      ">
        <!-- Venue Name Above -->
        <div style="
          font-size: 11px;
          font-weight: 700;
          color: ${config.color};
          text-shadow: 
            -1px -1px 0 white,
            1px -1px 0 white,
            -1px 1px 0 white,
            1px 1px 0 white,
            0 0 4px white;
          white-space: nowrap;
          margin-bottom: 2px;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        ">${venue.name}</div>
        
        <!-- Icon Badge with Rating -->
        <div style="
          display: flex;
          align-items: center;
          gap: 2px;
          background: ${config.color};
          padding: 4px 8px;
          border-radius: 16px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
        ">
          <span style="display: flex; align-items: center; justify-content: center;">
            ${config.icon}
          </span>
          <span style="
            color: white;
            font-size: 11px;
            font-weight: 700;
            margin-left: 1px;
          ">${venue.rating}</span>
        </div>
        
        <!-- Pointer Triangle -->
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${config.color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [100, 70],
    iconAnchor: [50, 70],
  })
}

// User location icon
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="relative">
      <div style="width: 16px; height: 16px; border-radius: 50%; background: #3B82F6; border: 3px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.5);"></div>
      <div style="position: absolute; inset: 0; width: 16px; height: 16px; border-radius: 50%; background: #3B82F6; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
})

// Component to fit bounds to all markers
const FitBounds = ({ venues, userLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    if (venues && venues.length > 0) {
      const points = venues.map(v => [v.lat, v.lng])
      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng])
      }
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    } else if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.5 })
    }
  }, [venues, userLocation, map])

  return null
}

// Component to handle map events
const MapEvents = ({ onMapMove, onMapClick }) => {
  const map = useMapEvents({
    moveend: () => {
      if (onMapMove) {
        const bounds = map.getBounds()
        const zoom = map.getZoom()
        onMapMove({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }, zoom)
      }
    },
    click: (e) => {
      // Check if click was on the map itself, not on a marker
      if (onMapClick && e.originalEvent.target.classList.contains('leaflet-container')) {
        onMapClick()
      }
    }
  })
  return null
}

// Component to handle selected venue
const MapController = ({ selectedVenue, userLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    if (selectedVenue) {
      map.flyTo([selectedVenue.lat, selectedVenue.lng], 15, { duration: 0.5 })
    }
  }, [selectedVenue, map])

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.5 })
    }
  }, [userLocation, map])

  return null
}

const MapComponent = ({ 
  venues = [], 
  selectedVenue, 
  onVenueSelect, 
  onVenueDeselect,
  fitBounds = false,
  userLocation = null,
  onMapMove = null
}) => {
  const [mapReady, setMapReady] = useState(false)
  
  // Sydney center coordinates
  const sydneyCenter = [-33.8688, 151.2093]
  
  useEffect(() => {
    setMapReady(true)
  }, [])

  const handleMapClick = () => {
    if (onVenueDeselect) {
      onVenueDeselect()
    }
  }

  if (!mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.lng] : sydneyCenter}
      zoom={12}
      className="w-full h-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {fitBounds && <FitBounds venues={venues} userLocation={userLocation} />}
      <MapController selectedVenue={selectedVenue} userLocation={userLocation} />
      <MapEvents onMapMove={onMapMove} onMapClick={handleMapClick} />
      
      {/* User location marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={userLocationIcon}
        />
      )}
      
      {/* Venue markers with category icons */}
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.lat, venue.lng]}
          icon={createVenueIcon(venue, selectedVenue?.id === venue.id)}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation()
              onVenueSelect(venue)
            }
          }}
        />
      ))}
    </MapContainer>
  )
}

export default MapComponent
