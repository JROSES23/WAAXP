import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const redirect = searchParams.get('redirect') ?? searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Build the success redirect response BEFORE calling exchangeCodeForSession
    // so we can write session cookies directly onto it.
    const redirectResponse = NextResponse.redirect(`${origin}${redirect}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Read cookies from the incoming request (needed for PKCE verifier)
          getAll() {
            return request.cookies.getAll()
          },
          // Write session cookies directly onto the redirect response
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return redirectResponse
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
