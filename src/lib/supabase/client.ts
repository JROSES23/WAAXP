import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Module-level singleton — one client instance for the entire browser session.
// Without this, every component that calls createClient() gets a fresh instance;
// when multiple instances have an expired access token, they all try to use the
// same refresh token simultaneously → refresh_token_already_used race condition.
let client: SupabaseClient | undefined

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
