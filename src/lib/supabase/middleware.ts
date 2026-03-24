import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // IMPORTANT: start with NextResponse.next({ request }) — this is critical
  // for @supabase/ssr to properly propagate refreshed session cookies.
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // First update the request cookies (needed for same-request reads)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        // Then create a new response that propagates the updated request
        supabaseResponse = NextResponse.next({ request })
        // And set the cookies on the response so the browser stores them
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: Do NOT add any code between createServerClient and getUser().
  // Any mistake here can randomly log out users.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Unauthenticated user trying to access protected routes → redirect to login
  if (!user) {
    const isProtected =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/inbox') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/admin')

    if (isProtected) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  }

  // Authenticated user on auth pages → redirect to dashboard
  if (pathname === '/login' || pathname === '/register') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Superadmin-only routes
  if (pathname.startsWith('/admin')) {
    const isSuperAdmin =
      user.app_metadata?.is_superadmin === true ||
      user.app_metadata?.is_superadmin === 'true'

    if (!isSuperAdmin) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // IMPORTANT: always return supabaseResponse — never a different response object,
  // otherwise the session refresh cookies won't be forwarded to the browser.
  return supabaseResponse
}
