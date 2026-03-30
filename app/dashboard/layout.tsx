import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardBottomNav from '@/components/DashboardBottomNav'
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* WAAXPTEAM — barra de marca para usuarios agente/staff */}
      {auth.role === 'agent' && (
        <div
          className="shrink-0 flex items-center justify-center gap-2 py-2 px-4"
          style={{
            background: 'linear-gradient(90deg, rgba(10,186,181,0.06) 0%, rgba(10,186,181,0.03) 100%)',
            borderBottom: '1px solid rgba(10,186,181,0.12)',
          }}
        >
          <span
            className="text-sm font-black uppercase tracking-[0.12em]"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.12em' }}
          >
            WAAXP
          </span>
          <span
            className="text-sm font-black uppercase tracking-[0.06em]"
            style={{
              color: 'var(--accent)',
              fontStyle: 'italic',
              letterSpacing: '0.08em',
              textShadow: '0 0 12px rgba(10,186,181,0.35)',
            }}
          >
            TEAM
          </span>
        </div>
      )}

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
      <main className="flex-1 overflow-auto pb-24">{children}</main>
      <DashboardBottomNav auth={auth} pendingCount={pendientes} />
      <FloatingAssistant />
    </div>
  )
}
