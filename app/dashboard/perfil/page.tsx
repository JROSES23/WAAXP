import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import PerfilClient from './PerfilClient'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  return (
    <PerfilClient
      userId={auth.userId}
      email={auth.email}
      profile={auth.profile}
      role={auth.role}
      businessName={auth.business?.nombre ?? null}
    />
  )
}
