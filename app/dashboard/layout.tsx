import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import FloatingAssistant from '@/components/assistant/FloatingAssistant'
import { getAuthContext } from '@/lib/auth'
import { obtenerConversacionesPorNegocio } from '@/app/dashboard/lib/data'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const auth = await getAuthContext()

  if (!auth) {
    redirect('/login')
  }

  let pendientes = 0
  if (auth.businessId) {
    const conversaciones = await obtenerConversacionesPorNegocio(
      auth.businessId
    )
    pendientes = conversaciones.filter(
      (conv) => conv.status === 'pending_approval'
    ).length
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Sidebar auth={auth} pendingCount={pendientes} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Setup nudge banner */}
        {!auth.businessId && (
          <div
            className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm shrink-0"
            style={{
              background: 'rgba(10,186,181,0.07)',
              borderBottom: '1px solid rgba(10,186,181,0.2)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              Estás en modo demo. Configura tu negocio para activar todas las funciones.
            </p>
            <Link
              href="/onboarding"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
              style={{ background: 'var(--accent)', color: '#080c10' }}
            >
              Configurar ahora
            </Link>
          </div>
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <FloatingAssistant />
    </div>
  )
}
