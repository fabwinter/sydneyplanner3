'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2, Eye, EyeOff, MapPin, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (isLogin) {
        await signInWithEmail(email, password)
        toast.success('Welcome back!')
      } else {
        await signUpWithEmail(email, password, name)
        toast.success('Account created! Check your email to verify.')
      }
      router.push('/chat')
    } catch (error) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2540] to-[#00A8CC]/20 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A8CC] to-[#F4A261] flex items-center justify-center shadow-2xl">
            <MapPin className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {isLogin ? 'Welcome back' : 'Create account'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white/70 mb-8"
        >
          {isLogin ? 'Sign in to continue exploring' : 'Join Sydney Planner today'}
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-[#00A8CC] hover:bg-[#00A8CC]/90 text-white font-medium"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </motion.form>

        {/* Toggle */}
        <p className="mt-8 text-white/70">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#00A8CC] font-medium hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Demo hint */}
        <p className="mt-4 text-white/40 text-sm text-center">
          Use any email and password (min 6 chars) to create a test account
        </p>
      </div>
    </div>
  )
}
