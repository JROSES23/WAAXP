
/**
 * MIDDLEWARE AUTH — LEER ANTES DE MODIFICAR
 * ==========================================
 * REGLA CRÍTICA: supabaseResponse DEBE re-asignarse dentro de setAll().
 *
 *   setAll(cookiesToSet) {
 *     cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
 *     supabaseResponse = NextResponse.next({ request })  // ← RE-ASIGNACIÓN OBLIGATORIA
 *     cookiesToSet.forEach(({ name, value, options }) =>
 *       supabaseResponse.cookies.set(name, value, options)
 *     )
 *   }
 *
 * Sin esta re-asignación, el response devuelve cookies viejas y los Server
 * Components del mismo ciclo verán el refresh token ya consumido → redirect a /login.
 *
 * NUNCA devolver un response diferente al supabaseResponse que construyó createServerClient.
 * NUNCA llamar NextResponse.redirect() sin copiar las cookies de supabaseResponse.
 *
 * getUser() aquí es INTENCIONAL — es la única llamada de red al servidor de Supabase Auth.
 * Los Server Components usan getSession() (local) para no competir con este refresh.
 */

export const runtime = 'nodejs'

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If env vars are missing, allow everything through — server components handle auth
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

    // Concurrent refresh race: the browser-side Supabase client won the token
    // refresh race and already has fresh cookies. The current request was sent
    // with the old (now-invalid) refresh token, so the server can't validate it.
    //
    // Fix: redirect back to the same URL so the browser retries with its fresh
    // cookies. A short-lived cookie prevents infinite redirect loops in case the
    // second attempt also fails (broken refresh token → redirect to login instead).
    if (getUserError) {
      const errCode = (getUserError as { code?: string }).code ?? ''
      const errMsg  = getUserError.message?.toLowerCase() ?? ''
      const isRefreshRace =
        errCode === 'refresh_token_already_used' ||
        errMsg.includes('already used') ||
        errMsg.includes('refresh_token_already_used')

      if (isRefreshRace) {
        const alreadyRetried = request.cookies.has('_supabase_race_retry')

        if (!alreadyRetried) {
          // First race detected — redirect same URL so the browser sends fresh cookies
          const retryResponse = NextResponse.redirect(request.url)
          retryResponse.cookies.set('_supabase_race_retry', '1', {
            maxAge: 10,        // expires in 10 seconds
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
          })
          return retryResponse
        }
        // Already retried once — fall through to the !user redirect-to-login below
      }
    }

    // On successful auth, clear the race-retry cookie if present
    if (user && request.cookies.has('_supabase_race_retry')) {
      supabaseResponse.cookies.delete('_supabase_race_retry')
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
  } catch {
    // If middleware crashes for any reason (Edge Runtime incompatibility,
    // network error, etc.) — never return 500. Let the request through.
    // Server components will handle auth independently.
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
