import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './components/DashboardClient'
import { obtenerConversacionesPorNegocio, obtenerNegocioActual } from '@/app/dashboard/lib/data'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    redirect('/login')
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const conversaciones = await obtenerConversacionesPorNegocio(negocio.id)
  const conversacionesPendientes = conversaciones.filter(
    (conv) => conv.status === 'pending_approval'
  )
  const usoPorcentaje = negocio.usage_limit
    ? Math.round((negocio.current_usage / negocio.usage_limit) * 100)
    : 0

  return (
    <DashboardClient
      usuario={usuario}
      resumen={{
        totalConversaciones: conversaciones.length,
        conversacionesPendientes: conversacionesPendientes.length,
        usoPorcentaje,
      }}
      pendientes={conversacionesPendientes}
    />
  )
}
