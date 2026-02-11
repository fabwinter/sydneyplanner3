import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Sydney Planner - Discover, Check-in, Relive Sydney',
  description: 'Your AI-powered guide to discovering the best venues, beaches, cafes, and hidden gems in Sydney. Check-in, earn badges, and share with friends.',
  keywords: 'Sydney, travel, venues, cafes, beaches, check-in, discover',
  manifest: '/manifest.json',
  themeColor: '#00A8CC',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
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
      <body className="min-h-screen">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
