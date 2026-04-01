import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from './server'

/**
 * Protege rutas que requieren autenticación.
 * Llamar al inicio de layouts y pages protegidas.
 * Redirige a /login?redirect={pathname} si no hay sesión activa.
 *
 * NOTA: Usa getUser() (validación de red) — correcto porque no hay middleware
 * que compita por el refresh token. React.cache() en getAuthContext() deduplica
 * la llamada dentro del mismo render tree.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    const headersList = await headers()
    const pathname = headersList.get('x-invoke-path') ?? '/dashboard'
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  return user
}

/**
 * Protege rutas exclusivas de superadmin.
 * Llamar en layouts de /admin después de verificar auth básica.
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()

  const isSuperAdmin =
    user.app_metadata?.is_superadmin === true ||
    user.app_metadata?.is_superadmin === 'true'

  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  return user
}
