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
  const ventasCerradas = [180000, 240000, 210000, 320000, 280000, 360000]
  const maxVentas = Math.max(...ventasCerradas, 1)
  const estadosConversacion = [
    { label: 'Pendientes', value: resumen.conversacionesPendientes },
    { label: 'Activas', value: Math.max(resumen.totalConversaciones - resumen.conversacionesPendientes, 0) },
  ]
  const totalEstados = estadosConversacion.reduce((acc, estado) => acc + estado.value, 0) || 1
  const recuperadas = 60
  const perdidas = 40

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    enrutador.push('/login')
    enrutador.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" showText={false} />
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Operly / Dashboard
                </p>
                <h1 className="text-xl font-bold text-slate-900">Panel principal</h1>
                <p className="text-xs text-slate-500">Resumen operativo del negocio</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0f9d58] to-[#2563eb] rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg font-medium transition-all duration-300 text-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Ventas cerradas por guía</p>
                <p className="text-lg font-semibold text-slate-900">$1.8M CLP</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <svg viewBox="0 0 200 80" className="mt-4 h-16 w-full">
              <polyline
                fill="none"
                stroke="#0f9d58"
                strokeWidth="3"
                points={ventasCerradas
                  .map((valor, index) => {
                    const x = (index / (ventasCerradas.length - 1)) * 200
                    const y = 80 - (valor / maxVentas) * 60 - 10
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
              <circle cx="200" cy="20" r="4" fill="#2563eb" />
            </svg>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Conversaciones por estado</p>
                <p className="text-lg font-semibold text-slate-900">{totalEstados} totales</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {estadosConversacion.map((estado, index) => (
                <div key={estado.label}>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{estado.label}</span>
                    <span className="font-semibold text-slate-900">{estado.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${index === 0 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${(estado.value / totalEstados) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Ventas recuperadas</p>
                <p className="text-lg font-semibold text-slate-900">{recuperadas}% recuperadas</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-[10px] border-emerald-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-[10px] border-emerald-500 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent"
                  style={{ transform: `rotate(${(recuperadas / 100) * 360}deg)` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-900">
                  {recuperadas}%
                </div>
              </div>
              <div className="ml-6 text-sm text-slate-600">
                <p className="font-semibold text-emerald-600">Recuperadas {recuperadas}%</p>
                <p className="mt-1 text-slate-500">Perdidas {perdidas}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Conversaciones totales</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.totalConversaciones}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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
              className="px-4 py-2 bg-gradient-to-r from-[#0f9d58] to-[#2563eb] text-white rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-md"
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
