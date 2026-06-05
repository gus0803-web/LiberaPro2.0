import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^"|"$/g, '') || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/^"|"$/g, '') || ''

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const opt = { ...options }
            delete opt.maxAge
            cookieStore.set({ name, value, ...opt })
          } catch (error) {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const opt = { ...options }
            delete opt.maxAge
            cookieStore.set({ name, value: '', ...opt })
          } catch (error) {
            // The `remove` method was called from a Server Component.
          }
        },
      },
    }
  )
}
