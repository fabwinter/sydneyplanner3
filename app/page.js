'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const HeroPage = () => {
  const [showContent, setShowContent] = useState(false)
  const [hasVisited, setHasVisited] = useState(false)

  useEffect(() => {
    const visited = localStorage.getItem('sydney_planner_visited')
    if (visited) {
      setHasVisited(true)
    }
    // Trigger animation after mount
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleExplore = () => {
    localStorage.setItem('sydney_planner_visited', 'true')
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1568246654191-5d306d62227d?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/70 via-[#0A2540]/50 to-[#0A2540]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 safe-top safe-bottom">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center text-center max-w-lg"
            >
              {/* Logo/Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A8CC] to-[#F4A261] flex items-center justify-center shadow-2xl">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight"
              >
                <span className="text-[#F4A261]">Sydney</span> Planner
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl md:text-2xl text-white/90 mb-8 font-medium"
              >
                Discover, Check-in, Relive Sydney
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-3 mb-10"
              >
                {['AI-Powered', 'Check-ins', 'Badges', 'Friends'].map((feature, i) => (
                  <span
                    key={feature}
                    className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium border border-white/20"
                  >
                    {feature}
                  </span>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              >
                <Link href="/chat" onClick={handleExplore}>
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-[#00A8CC] to-[#00D4FF] hover:from-[#00D4FF] hover:to-[#00A8CC] text-white font-bold text-lg px-10 py-7 rounded-full shadow-2xl shadow-[#00A8CC]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#00A8CC]/50"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explore Now
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    
                    {/* Pulse animation */}
                    <span className="absolute inset-0 rounded-full animate-ping bg-[#00A8CC]/20" style={{ animationDuration: '2s' }} />
                  </Button>
                </Link>
              </motion.div>

              {/* Skip hint for returning users */}
              {hasVisited && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-white/60 text-sm"
                >
                  Welcome back! Ready to explore more?
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.18,69.71,321.39,56.44Z"
              className="fill-white/10"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default HeroPage
