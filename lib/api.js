import { supabase } from '@/lib/supabase'

export async function authFetch(url, options = {}) {
  let token = null
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (session?.access_token) {
      const expiresAt = session.expires_at
      const nowSecs = Math.floor(Date.now() / 1000)
      if (expiresAt && expiresAt - nowSecs < 60) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        token = refreshed?.session?.access_token
      } else {
        token = session.access_token
      }
    }
  } catch (e) {
    console.error('Auth token retrieval failed:', e)
  }
  const headers = { ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  return fetch(url, { ...options, headers })
}
