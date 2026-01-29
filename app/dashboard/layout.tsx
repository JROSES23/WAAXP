import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { obtenerConversacionesPorNegocio, obtenerNegocioActual } from '@/app/dashboard/lib/data'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user: usuario } } = await supabase.auth.getUser()

  if (!usuario) {
    redirect('/login')
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const conversaciones = await obtenerConversacionesPorNegocio(negocio.id)
  const pendientes = conversaciones.filter((conv) => conv.status === 'pending_approval').length
  const usoPorcentaje = negocio.usage_limit
    ? Math.round((negocio.current_usage / negocio.usage_limit) * 100)
    : 0

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        conversacionesTotales={conversaciones.length}
        conversacionesPendientes={pendientes}
        usoPorcentaje={usoPorcentaje}
        planActual={negocio.plan}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
