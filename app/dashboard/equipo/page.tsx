import { redirect } from 'next/navigation'
import { getAuthContext, isOwnerOrAdmin } from '@/lib/auth'
import EquipoClient from './EquipoClient'
import { createClient } from '@/lib/supabase/server'
import { DEMO_BUSINESS_ID } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function EquipoPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')
  if (!isOwnerOrAdmin(auth)) redirect('/dashboard')

  if (!auth.businessId) {
    return (
      <EquipoClient
        businessId={DEMO_BUSINESS_ID}
        roles={[]}
        profiles={[]}
        invitations={[]}
      />
    )
  }

  const supabase = await createClient()

  const { data: roles } = await supabase
    .from('user_roles')
    .select('*, user_permissions(*)')
    .eq('business_id', auth.businessId)
    .order('created_at', { ascending: false })

  const userIds = (roles ?? []).map((r: { user_id: string }) => r.user_id)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name')
    .in('user_id', userIds.length > 0 ? userIds : ['none'])

  const { data: invitations } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('business_id', auth.businessId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <EquipoClient
      businessId={auth.businessId}
      roles={roles ?? []}
      profiles={profiles ?? []}
      invitations={invitations ?? []}
    />
  )
}
