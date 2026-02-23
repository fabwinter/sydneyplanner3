import { supabase } from '@/lib/supabase'

export async function authFetch(url, options = {}) {
  let token = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token
    if (!token) {
      const { data: { session: refreshed } } = await supabase.auth.refreshSession()
      token = refreshed?.access_token
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
