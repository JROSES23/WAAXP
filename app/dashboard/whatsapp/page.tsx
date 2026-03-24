import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import WhatsAppClient from './WhatsAppClient'
import { DEMO_NEGOCIO } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function WhatsAppPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  return <WhatsAppClient negocio={auth.business ?? DEMO_NEGOCIO} />
}
