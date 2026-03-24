import { redirect } from 'next/navigation'
import DashboardClient from './components/DashboardClient'
import { getAuthContext } from '@/lib/auth'
import { obtenerKPIs } from '@/app/dashboard/lib/data'
import { DEMO_KPIS, DEMO_NEGOCIO } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const auth = await getAuthContext()

  if (!auth) {
    redirect('/login')
  }

  if (!auth.businessId || !auth.business) {
    return (
      <DashboardClient
        kpis={DEMO_KPIS}
        plan={DEMO_NEGOCIO.plan}
        usoPorcentaje={Math.round((DEMO_NEGOCIO.current_usage / DEMO_NEGOCIO.usage_limit) * 100)}
        isDemo
      />
    )
  }

  const kpis = await obtenerKPIs(auth.businessId)

  return (
    <DashboardClient
      kpis={kpis}
      plan={auth.business.plan}
      usoPorcentaje={
        auth.business.usage_limit
          ? Math.round((auth.business.current_usage / auth.business.usage_limit) * 100)
          : 0
      }
    />
  )
}
