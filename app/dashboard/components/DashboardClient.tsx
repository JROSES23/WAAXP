'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Logo from '@/components/Logo'
import type { Conversacion } from '@/app/dashboard/types'
import { BarChart3, MessageSquare, TrendingUp } from 'lucide-react'

interface ResumenDashboard {
  totalConversaciones: number
  conversacionesPendientes: number
  usoPorcentaje: number
}

interface DashboardClientProps {
  usuario: User
  resumen: ResumenDashboard
  pendientes: Conversacion[]
}

export default function DashboardClient({ usuario, resumen, pendientes }: DashboardClientProps) {
  const enrutador = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    enrutador.push('/login')
    enrutador.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo size="md" showText={true} />
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Panel principal</h1>
                <p className="text-xs text-slate-500">Resumen operativo del negocio</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {usuario.email?.[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">Administrador</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {usuario.email?.split('@')[0]}
                  </p>
                </div>
              </div>

              <button
                onClick={cerrarSesion}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-all text-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Conversaciones totales</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.totalConversaciones}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pendientes aprobación</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.conversacionesPendientes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Uso mensual</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.usoPorcentaje}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Conversaciones pendientes</h3>
              <p className="text-sm text-slate-600">Revisa mensajes que requieren aprobación</p>
            </div>
            <Link
              href="/dashboard/inbox"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-medium text-sm"
            >
              Ver bandeja
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendientes.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No hay pendientes por ahora.</p>
            ) : (
              pendientes.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => enrutador.push(`/dashboard/inbox?conversation=${conv.id}`)}
                  className="w-full text-left px-6 py-4 hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {conv.client_name || conv.phone_number}
                  </p>
                  <p className="text-xs text-slate-500">Última actividad: {conv.last_message_at}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
