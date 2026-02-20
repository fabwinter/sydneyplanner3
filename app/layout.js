import './globals.css'
import { Toaster } from 'sonner'
import { VenueProvider } from '@/lib/VenueContext'
import { AuthProvider } from '@/lib/AuthContext'
import QueryProvider from '@/lib/QueryProvider'

export const metadata = {
  title: 'Sydney Planner - Discover, Check-in, Relive Sydney',
  description: 'Your AI-powered guide to discovering the best venues, beaches, cafes, and hidden gems in Sydney.',
  keywords: 'Sydney, travel, venues, cafes, beaches, check-in, discover',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#00A8CC',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <QueryProvider>
          <AuthProvider>
            <VenueProvider>
              <main className="overflow-x-hidden">
                {children}
              </main>
              <Toaster position="top-center" richColors />
            </VenueProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
