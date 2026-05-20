import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^"|"$/g, '') || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/^"|"$/g, '') || ''

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
