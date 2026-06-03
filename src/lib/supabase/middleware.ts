import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^"|"$/g, '') || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/^"|"$/g, '') || ''
  const isProtectedPath = request.nextUrl.pathname.startsWith('/app')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing Supabase config:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey })
    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath && !user) {
    // If the user is not logged in and tries to access a protected route
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, we check whether their beta access is still active.
  if (user) {
    // Fetch profile but be resilient if the DB schema doesn't include the
    // `beta_tester` column yet (older DBs). In that case we assume the user
    // is not a beta tester and continue normally.
    let profile: any = null
    let profileError: any = null

    try {
      const res = await supabase
        .from('profiles')
        .select('subscription_status, beta_tester, beta_expires_at')
        .eq('id', user.id)
        .single()
      profile = res.data
      profileError = res.error
    } catch (err: any) {
      profileError = err
    }

    if (profileError) {
      const msg = (profileError.message || String(profileError)).toLowerCase()
      if (msg.includes('beta_tester') || msg.includes('column') || msg.includes('does not exist')) {
        // Missing column in DB; fall back to a safe default profile
        console.warn('[Middleware] profiles.beta_tester column missing; assuming non-beta user')
        profile = { subscription_status: profile?.subscription_status || 'inactive', beta_tester: false, beta_expires_at: null }
      } else {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }

    if (profile?.beta_tester && profile.beta_expires_at && new Date(profile.beta_expires_at) <= new Date()) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // TEMPORARILY DISABLED: Allow all authenticated users to access planner during beta/testing
    if (request.nextUrl.pathname.startsWith('/app/planner') || request.nextUrl.pathname.startsWith('/app/exams')) {
      if (!profile) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
