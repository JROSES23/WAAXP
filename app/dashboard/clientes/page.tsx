import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import ClientesClient from './ClientesClient'
import { obtenerClientesPorNegocio } from '@/app/dashboard/lib/data'
import { DEMO_CLIENTES, DEMO_BUSINESS_ID } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return <ClientesClient clientes={DEMO_CLIENTES as never} businessId={DEMO_BUSINESS_ID} isDemo />
  }

  const clientes = await obtenerClientesPorNegocio(auth.businessId)
  return <ClientesClient clientes={clientes} businessId={auth.businessId} />
}
