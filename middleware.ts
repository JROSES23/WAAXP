import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // When multiple concurrent requests try to refresh at the same time,
  // only the first succeeds. Subsequent ones get refresh_token_already_used.
  // The session is still valid — don't redirect to login.
  const isStaleRefreshError =
    getUserError?.message?.toLowerCase().includes('refresh_token_already_used') ||
    (getUserError as { code?: string } | null)?.code === 'refresh_token_already_used'

  if (isStaleRefreshError) {
    return supabaseResponse
  }

  // Unauthenticated → redirect protected routes to login
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

  // Authenticated → skip login/register pages
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
