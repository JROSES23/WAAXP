import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import { obtenerVentasPorNegocio } from '@/app/dashboard/lib/data'
import ReportesClient from './ReportesClient'
import { DEMO_VENTAS, DEMO_NEGOCIO } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return (
      <ReportesClient
        ventas={DEMO_VENTAS}
        plan={DEMO_NEGOCIO.plan}
        businessName={DEMO_NEGOCIO.nombre}
      />
    )
  }

  const ventas = await obtenerVentasPorNegocio(auth.businessId, 90)

  return (
    <ReportesClient
      ventas={ventas}
      plan={auth.business?.plan ?? 'starter'}
      businessName={auth.business?.nombre ?? 'Negocio'}
    />
  )
}
