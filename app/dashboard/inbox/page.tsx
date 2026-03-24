import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import InboxClient from './InboxClient'
import { obtenerConversacionesPorNegocio, obtenerProductosPorNegocio, obtenerStaffPorNegocio } from '@/app/dashboard/lib/data'
import { DEMO_CONVERSACIONES, DEMO_PRODUCTOS, DEMO_STAFF, DEMO_NEGOCIO } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return (
      <InboxClient
        negocio={DEMO_NEGOCIO}
        conversaciones={DEMO_CONVERSACIONES}
        productos={DEMO_PRODUCTOS}
        equipo={DEMO_STAFF}
      />
    )
  }

  const [conversaciones, productos, equipo] = await Promise.all([
    obtenerConversacionesPorNegocio(auth.businessId),
    obtenerProductosPorNegocio(auth.businessId),
    obtenerStaffPorNegocio(auth.businessId),
  ])

  return (
    <InboxClient
      negocio={auth.business!}
      conversaciones={conversaciones}
      productos={productos}
      equipo={equipo}
    />
  )
}
