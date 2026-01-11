'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Inbox,
  Users, 
  Package, 
  TrendingUp, 
  Settings,
  Shield,
  Wifi
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/dashboard/inbox' },
  { id: 'clientes', label: 'Clientes', icon: Users, href: '/dashboard/clientes' },
  { id: 'productos', label: 'Productos', icon: Package, href: '/dashboard/productos' },
  { id: 'reportes', label: 'Reportes', icon: TrendingUp, href: '/dashboard/reportes' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-teal-600">Vendia</h1>
        <p className="text-xs text-gray-500 mt-1">Panel de ventas</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{tab.label}</span>
            </Link>
          )
        })}
        
        <div className="pt-4 mt-4 border-t border-gray-100">
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Configuración</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">
          <Wifi className="w-4 h-4" />
          <span className="font-medium">WhatsApp conectado</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
          <Shield className="w-4 h-4" />
          <span className="font-medium">RLS Activo</span>
        </div>
      </div>
    </aside>
  )
}
