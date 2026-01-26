'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  LayoutDashboard,
  Inbox,
  Users, 
  Package, 
  TrendingUp, 
  Settings,
  Shield,
  Zap,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { useEffect, useState } from 'react'

const tabs = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    href: '/dashboard',
    badge: null 
  },
  { 
    id: 'inbox', 
    label: 'Inbox', 
    icon: Inbox, 
    href: '/dashboard/inbox',
    badge: '3' 
  },
  { 
    id: 'clientes', 
    label: 'Clientes', 
    icon: Users, 
    href: '/dashboard/clientes',
    badge: null 
  },
  { 
    id: 'productos', 
    label: 'Productos', 
    icon: Package, 
    href: '/dashboard/productos',
    badge: null 
  },
  { 
    id: 'reportes', 
    label: 'Reportes', 
    icon: TrendingUp, 
    href: '/dashboard/reportes',
    badge: null 
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeConversations: 0,
    usagePercentage: 0
  })

  // Simular carga de datos reales (aquí conectarías con tu API/Supabase)
  useEffect(() => {
    // Simular llamada a API
    const loadStats = async () => {
      // Aquí harías: const data = await supabase.from('conversations').select()
      setStats({
        totalConversations: 847,
        activeConversations: 12,
        usagePercentage: 65
      })
    }
    loadStats()
  }, [])

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Header con Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/dashboard" className="block">
          <Logo size="md" showText={true} />
        </Link>
        <p className="text-xs text-slate-500 mt-2">Panel de control</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || (pathname.startsWith(tab.href + '/') && tab.href !== '/dashboard')
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span className="text-sm font-medium flex-1">{tab.label}</span>
              
              {/* Badge */}
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive 
                    ? 'bg-white text-teal-600' 
                    : 'bg-teal-100 text-teal-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          )
        })}
        
        {/* Configuración separada */}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <Link
            href="/dashboard/configuracion"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              pathname.startsWith('/dashboard/configuracion')
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
        </div>
      </nav>

      {/* Status Cards */}
      <div className="p-4 border-t border-slate-200 space-y-2">
      
      

        {/* Security Status */}
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

      {/* Stats Card */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500">Este mes</p>
              <p className="text-lg font-bold text-slate-900">{stats.totalConversations}</p>
              <p className="text-xs text-slate-600">conversaciones</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Activas ahora</span>
              <span className="font-bold text-slate-900">{stats.activeConversations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Info */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-800 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400">Plan actual</p>
              <p className="text-sm font-bold">Pro</p>
            </div>
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Uso mensual</span>
              <span className="font-bold">{stats.usagePercentage}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                style={{ width: `${stats.usagePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400">
              {stats.totalConversations} de ∞ conversaciones
            </p>
          </div>
          
          <button className="w-full mt-3 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg text-xs font-semibold transition-colors border border-white/10">
            Actualizar plan
          </button>
        </div>
      </div>
    </aside>
  )
}
