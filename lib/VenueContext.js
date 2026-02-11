'use client'

import { createContext, useContext, useState } from 'react'

const VenueContext = createContext()

export function VenueProvider({ children }) {
  const [currentVenues, setCurrentVenues] = useState([])
  const [chatMessages, setChatMessages] = useState([])

  return (
    <VenueContext.Provider value={{ 
      currentVenues, 
      setCurrentVenues,
      chatMessages,
      setChatMessages
    }}>
      {children}
    </VenueContext.Provider>
  )
}

export function useVenues() {
  const context = useContext(VenueContext)
  if (!context) {
    throw new Error('useVenues must be used within a VenueProvider')
  }
  return context
}
