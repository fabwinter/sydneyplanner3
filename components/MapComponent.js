'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Star, MapPin } from 'lucide-react'

// Fix for default marker icons in Leaflet with Next.js
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
        ${isSelected ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#F4A261] rotate-45"></div>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}

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

// Component to handle map center changes
const MapController = ({ center, selectedVenue }) => {
  const map = useMap()
  
  useEffect(() => {
    if (selectedVenue) {
      map.flyTo([selectedVenue.lat, selectedVenue.lng], 15, {
        duration: 0.5
      })
    }
  }, [selectedVenue, map])

  return null
}

const MapComponent = ({ venues = [], selectedVenue, onVenueSelect, userLocation }) => {
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
      zoom={13}
      className="w-full h-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      <MapController center={sydneyCenter} selectedVenue={selectedVenue} />
      
      {/* User location marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={userLocationIcon}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}
      
      {/* Venue markers */}
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.lat, venue.lng]}
          icon={createCustomIcon(selectedVenue?.id === venue.id)}
          eventHandlers={{
            click: () => onVenueSelect(venue)
          }}
        >
          <Popup className="custom-popup">
            <div className="p-1 min-w-[200px]">
              <img 
                src={venue.image} 
                alt={venue.name}
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <h3 className="font-bold text-gray-900">{venue.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{venue.category}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#F4A261] fill-[#F4A261]" />
                <span className="text-sm font-medium">{venue.rating}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapComponent
