'use client'

import { useAuth } from '@/lib/AuthContext'
import { Shield, ShieldCheck } from 'lucide-react'

export default function GodModeToggle() {
  const { isGodMode, godModeActive, toggleGodMode } = useAuth()

  if (!isGodMode) return null

  return (
    <button
      onClick={toggleGodMode}
      className={`fixed top-4 left-4 z-[1100] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all ${
        godModeActive
          ? 'bg-amber-500 text-white ring-2 ring-amber-300'
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
      }`}
    >
      {godModeActive ? (
        <><ShieldCheck className="w-3.5 h-3.5" /><span>GOD MODE</span></>
      ) : (
        <><Shield className="w-3.5 h-3.5" /><span>God</span></>
      )}
    </button>
  )
}
