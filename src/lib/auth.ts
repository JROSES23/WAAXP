/**
 * ARQUITECTURA AUTH — LEER ANTES DE MODIFICAR
 * ============================================
 * No hay middleware. La protección de rutas es responsabilidad de
 * requireAuth() en auth-guard.ts, llamado desde layouts y pages.
 *
 * REGLA 1: Usar getUser() — valida el token contra Supabase Auth.
 *   Sin middleware que haga el refresh, getSession() puede devolver
 *   tokens expirados sin error. getUser() refresca si es necesario.
 *
 * REGLA 2: getAuthContext() está envuelto en React.cache() — una sola
 *   llamada de red por render tree aunque múltiples componentes lo usen.
 *
 * REGLA 3: requireAuth() en auth-guard.ts hace la validación primero.
 *   getAuthContext() asume que el usuario YA está autenticado cuando
 *   corre dentro de un layout protegido.
 *
 * Ver: src/lib/supabase/auth-guard.ts
 */

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  AuthContext,
  Negocio,
  SectionPermission,
  UserProfile,
  UserRole,
} from '@/app/dashboard/types'

const ALL_PERMISSIONS: SectionPermission[] = [
  'dashboard',
  'inbox',
  'clientes',
  'productos',
  'reportes',
  'equipo',
  'configuracion_ia',
  'whatsapp_qr',
  'billing',
  'reservas',
]

/**
 * Get complete auth context for the current user.
 * Returns null ONLY when there is no authenticated session.
 * DB errors are caught and fall back to safe defaults.
 *
 * Wrapped with React.cache() so multiple Server Components in the same
 * render tree (e.g. layout + page) share a single call.
 *
 * Uses getSession() (local JWT read) instead of getUser() (network call)
 * to avoid competing with the middleware's token refresh on the same request.
 */
export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  try {
    const supabase = await createClient()

    // Valida el token contra Supabase Auth (refresca si expiró).
    // Sin middleware, getSession() puede devolver tokens expirados sin error.
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    const isSuperAdmin =
      user.app_metadata?.is_superadmin === true ||
      user.app_metadata?.is_superadmin === 'true'

    // Fetch user role + business
    let roleData: { id: string; business_id: string; role: string } | null = null
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('id, business_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      roleData = data ?? null
    } catch {
      // Table might not exist yet — treat as no role
    }

    const businessId = roleData?.business_id ?? null
    const role = (roleData?.role as UserRole) ?? null

    // Determine permissions
    let permissions: SectionPermission[] = []

    if (isSuperAdmin || role === 'owner' || !roleData) {
      // Owners, superadmins, and users without a role (new users) get full access
      permissions = ALL_PERMISSIONS
    } else if (roleData?.id) {
      try {
        const { data: permsData } = await supabase
          .from('user_permissions')
          .select('section')
          .eq('user_role_id', roleData.id)
          .eq('can_view', true)

        permissions = (permsData ?? []).map((p) => p.section as SectionPermission)
        if (!permissions.includes('inbox')) permissions.push('inbox')
      } catch {
        permissions = ['inbox']
      }
    }

    // Fetch profile
    let profile: UserProfile | null = null
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      profile = (profileData as UserProfile) ?? null
    } catch {
      // ignore
    }

    // Fetch business
    let business: Negocio | null = null
    if (businessId) {
      try {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .maybeSingle()
        business = (bizData as Negocio) ?? null
      } catch {
        // ignore
      }
    }

    return {
      userId: user.id,
      email: user.email ?? '',
      isSuperAdmin,
      businessId,
      role,
      permissions,
      profile,
      business,
    }
  } catch (err) {
    // Hard crash — only return null for true session failures
    console.error('[getAuthContext] unexpected error:', err)
    return null
  }
})

export function hasPermission(
  auth: AuthContext,
  section: SectionPermission
): boolean {
  if (auth.isSuperAdmin) return true
  if (auth.role === 'owner') return true
  return auth.permissions.includes(section)
}

export function isOwnerOrAdmin(auth: AuthContext): boolean {
  return auth.isSuperAdmin || auth.role === 'owner' || !auth.role
}
