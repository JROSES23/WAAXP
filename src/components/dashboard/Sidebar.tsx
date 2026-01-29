'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'

interface SidebarProps {
  conversacionesTotales: number
  conversacionesPendientes: number
  usoPorcentaje: number
  planActual: string
}

const pestanas = [
  {
    id: 'dashboard',
    label: 'Panel',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'inbox',
    label: 'Bandeja',
    icon: Inbox,
    href: '/dashboard/inbox',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    href: '/dashboard/clientes',
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: Package,
    href: '/dashboard/productos',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: TrendingUp,
    href: '/dashboard/reportes',
  },
]

export default function Sidebar({
  conversacionesTotales,
  conversacionesPendientes,
  usoPorcentaje,
  planActual,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link href="/dashboard" className="block">
          <Logo size="md" showText={true} />
        </Link>
        <p className="text-xs text-slate-500 mt-2">Panel de control</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {pestanas.map((pestana) => {
          const Icono = pestana.icon
          const estaActivo =
            pathname === pestana.href || (pathname.startsWith(pestana.href + '/') && pestana.href !== '/dashboard')

          return (
            <Link
              key={pestana.id}
              href={pestana.href}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                estaActivo ? 'bg-[#0f9d58] text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icono className={`w-5 h-5 transition-transform ${
                estaActivo ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span className="text-sm font-medium flex-1">{pestana.label}</span>
              {pestana.id === 'inbox' && conversacionesPendientes > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    estaActivo ? 'bg-white text-[#0f9d58]' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {conversacionesPendientes}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-slate-200">
          <Link
            href="/dashboard/configuracion"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              pathname.startsWith('/dashboard/configuracion')
                ? 'bg-[#0f9d58] text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-2">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">Seguridad RLS</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                <span className="text-xs text-slate-700 font-medium">Protegido</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500">Este mes</p>
              <p className="text-lg font-bold text-slate-900">{conversacionesTotales}</p>
              <p className="text-xs text-slate-600">conversaciones</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4 text-slate-900 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-600">Plan actual</p>
              <p className="text-sm font-bold text-slate-900">Plan actual: {planActual}</p>
              <p className="mt-1 text-xs text-slate-500">{usoPorcentaje}% / 100% uso mensual</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-emerald-100">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-[#0f9d58] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, usoPorcentaje)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
