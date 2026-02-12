'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom marker icon
const createCustomIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-[#F4A261]' : 'bg-[#00A8CC]'} flex items-center justify-center shadow-lg transform ${isSelected ? 'scale-125' : ''} transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="${isSelected ? '#F4A261' : '#00A8CC'}"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
}

// User location icon
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="relative">
      <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
      <div class="absolute inset-0 w-4 h-4 rounded-full bg-blue-500 animate-ping opacity-75"></div>
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
const MapEvents = ({ onMapMove }) => {
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
      <MapEvents onMapMove={onMapMove} />
      
      {/* User location marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={userLocationIcon}
        />
      )}
      
      {/* Venue markers - NO popup, just select on click */}
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.lat, venue.lng]}
          icon={createCustomIcon(selectedVenue?.id === venue.id)}
          eventHandlers={{
            click: () => onVenueSelect(venue)
          }}
        />
      ))}
    </MapContainer>
  )
}

export default MapComponent
