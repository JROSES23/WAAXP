import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import SoporteClient from './SoporteClient'
import { obtenerTicketsPorNegocio } from '@/app/dashboard/lib/data'
import { DEMO_TICKETS, DEMO_BUSINESS_ID } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function SoportePage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return (
      <SoporteClient
        tickets={DEMO_TICKETS}
        businessId={DEMO_BUSINESS_ID}
        userId={auth.userId}
      />
    )
  }

  const tickets = await obtenerTicketsPorNegocio(auth.businessId)

  return (
    <SoporteClient
      tickets={tickets}
      businessId={auth.businessId}
      userId={auth.userId}
    />
  )
}
