'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Package,
  BarChart3,
  UserCog,
  Cpu,
  QrCode,
  CreditCard,
  ShieldCheck,
  Bot,
  Sun,
  Moon,
  LogOut,
  Settings,
  User,
  LifeBuoy,
  ChevronUp,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'
import type { AuthContext, SectionPermission } from '@/app/dashboard/types'
import { createClient } from '@/lib/supabase/client'

/* ─────────────────────────────────────────────
   NAV STRUCTURE
───────────────────────────────────────────── */

interface NavItem {
  id:              string
  label:           string
  icon:            React.ElementType
  href:            string
  section?:        SectionPermission
  badge?:          number
  ownerOnly?:      boolean
  superAdminOnly?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

function buildNavGroups(pendingCount: number, auth: AuthContext): NavGroup[] {
  const groups: NavGroup[] = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard',            section: 'dashboard' },
        { id: 'inbox',     label: 'Inbox',        icon: MessageSquare,   href: '/dashboard/inbox',       section: 'inbox',    badge: pendingCount > 0 ? pendingCount : undefined },
        { id: 'clientes',  label: 'Clientes',     icon: Users,           href: '/dashboard/clientes',    section: 'clientes' },
        { id: 'productos', label: 'Productos',    icon: Package,         href: '/dashboard/productos',   section: 'productos' },
      ],
    },
    {
      title: 'Análisis',
      items: [
        { id: 'reportes',  label: 'Reportes',     icon: BarChart3,       href: '/dashboard/reportes',    section: 'reportes' },
      ],
    },
    {
      title: 'Gestión',
      items: [
        { id: 'equipo',    label: 'Equipo',        icon: UserCog,    href: '/dashboard/equipo',        section: 'equipo',          ownerOnly: true },
        { id: 'config-ia', label: 'Config. IA',   icon: Cpu,        href: '/dashboard/configuracion', section: 'configuracion_ia' },
        { id: 'whatsapp',  label: 'WhatsApp',     icon: QrCode,     href: '/dashboard/whatsapp',      section: 'whatsapp_qr'      },
        { id: 'billing',   label: 'Facturación',  icon: CreditCard, href: '/dashboard/billing',       section: 'billing',         ownerOnly: true },
      ],
    },
    {
      title: 'Soporte',
      items: [
        { id: 'soporte', label: 'Soporte', icon: LifeBuoy, href: '/dashboard/soporte' },
      ],
    },
  ]

  if (auth.isSuperAdmin) {
    groups.push({
      title: 'Admin',
      items: [
        { id: 'god-mode',    label: 'God Mode',   icon: ShieldCheck, href: '/admin',        superAdminOnly: true },
        { id: 'devops-chat', label: 'DevOps Bot', icon: Bot,         href: '/admin/devops', superAdminOnly: true },
      ],
    })
  }

  return groups
}

function canSeeItem(item: NavItem, auth: AuthContext): boolean {
  if (item.superAdminOnly) return auth.isSuperAdmin
  if (item.ownerOnly) return auth.isSuperAdmin || auth.role === 'owner'
  if (item.section) {
    if (auth.isSuperAdmin || auth.role === 'owner') return true
    return auth.permissions.includes(item.section)
  }
  return true
}

/* ─────────────────────────────────────────────
   SIDEBAR COMPONENT
───────────────────────────────────────────── */

interface SidebarProps {
  auth:         AuthContext
  pendingCount: number
}

export default function Sidebar({ auth, pendingCount }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted,   setMounted]   = useState(false)
  const [expanded,  setExpanded]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const navGroups  = buildNavGroups(pendingCount, auth)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = auth.profile?.display_name ?? auth.email.split('@')[0] ?? 'Usuario'
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const roleLabel   = auth.isSuperAdmin ? 'Super Admin' : auth.role === 'owner' ? 'Propietario' : 'Agente'
  const isDark      = mounted ? theme === 'dark' : true

  const W_COLLAPSED = 64
  const W_EXPANDED  = 240

  return (
    <TooltipProvider delayDuration={200}>
      <motion.aside
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        animate={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        className="h-screen sticky top-0 z-50 flex flex-col shrink-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRight:     '1px solid var(--border-subtle)',
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center h-[56px] px-4 shrink-0 overflow-hidden"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {/* Icon always visible */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'var(--accent)',
              boxShadow:  'var(--accent-glow)',
            }}
          >
            <span className="font-display font-black text-sm text-[#080c10]">W</span>
          </div>

          {/* Name — fades in when expanded */}
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="ml-3 font-display font-bold text-base tracking-[-0.02em] whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                WAAXP
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav Groups ── */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-none" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canSeeItem(item, auth))
            if (visibleItems.length === 0) return null

            return (
              <div key={group.title}>
                {/* Group label — only when expanded */}
                <AnimatePresence>
                  {expanded && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="px-2 mb-1.5 text-[10px] font-bold tracking-[0.08em] uppercase overflow-hidden whitespace-nowrap"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {group.title}
                    </motion.p>
                  )}
                </AnimatePresence>
                {!expanded && <div className="mb-1.5 h-[16px]" />}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon   = item.icon
                    const active = isActive(item.href)

                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className="relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden"
                            style={{
                              height: '40px',
                              justifyContent: expanded ? 'flex-start' : 'center',
                              ...(active
                                ? {
                                    background:  'var(--accent-dim)',
                                    color:       'var(--accent)',
                                    borderLeft:  expanded ? '2px solid var(--accent)' : 'none',
                                    paddingLeft: expanded ? '10px' : '0px',
                                  }
                                : {
                                    color: 'var(--text-secondary)',
                                  }
                              ),
                            }}
                            onMouseEnter={e => {
                              if (!active) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                e.currentTarget.style.color      = 'var(--text-primary)'
                              }
                            }}
                            onMouseLeave={e => {
                              if (!active) {
                                e.currentTarget.style.background = ''
                                e.currentTarget.style.color      = 'var(--text-secondary)'
                              }
                            }}
                          >
                            {/* Icon */}
                            <div className="relative shrink-0 flex items-center justify-center w-[40px]">
                              <Icon className="w-[17px] h-[17px]" strokeWidth={active ? 2 : 1.75} />
                              {item.badge != null && (
                                <span className="absolute top-1 right-1 h-[14px] min-w-[14px] px-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white flex items-center justify-center leading-none">
                                  {item.badge > 9 ? '9+' : item.badge}
                                </span>
                              )}
                            </div>

                            {/* Label — fades in when expanded */}
                            <AnimatePresence>
                              {expanded && (
                                <motion.span
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -6 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex-1 leading-none whitespace-nowrap overflow-hidden"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Link>
                        </TooltipTrigger>
                        {/* Tooltip only when collapsed */}
                        {!expanded && (
                          <TooltipContent side="right" sideOffset={8}>
                            {item.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* ── Bottom ── */}
        <div
          className="p-2 space-y-1 shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {/* Dark/light toggle */}
          <div className={`flex items-center ${expanded ? 'justify-end px-2 py-1' : 'justify-center py-1'}`}>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 focus:outline-none"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color      = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = ''
                e.currentTarget.style.color      = 'var(--text-secondary)'
              }}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {isDark
                    ? <Sun  className="w-[15px] h-[15px]" strokeWidth={1.75} />
                    : <Moon className="w-[15px] h-[15px]" strokeWidth={1.75} />
                  }
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* User menu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full flex items-center gap-2.5 rounded-xl text-sm transition-all duration-150 focus:outline-none overflow-hidden"
                    style={{
                      height: '44px',
                      paddingLeft: expanded ? '10px' : '0px',
                      justifyContent: expanded ? 'flex-start' : 'center',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.color      = 'var(--text-primary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color      = 'var(--text-secondary)'
                    }}
                  >
                    {/* Avatar — always visible, centered when collapsed */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[#080c10] text-xs font-bold"
                      style={{ background: 'var(--accent)', marginLeft: expanded ? '0' : 'auto', marginRight: expanded ? '0' : 'auto' }}
                    >
                      {initials}
                    </div>

                    {/* Name + role — only when expanded */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {displayName}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                            {roleLabel}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {expanded && <ChevronUp className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="end"
                  sideOffset={8}
                  className="z-[100] w-52 p-1.5 rounded-xl shadow-xl"
                  style={{
                    background:  'var(--bg-elevated)',
                    border:      '1px solid var(--border-default)',
                    boxShadow:   'var(--shadow-glass)',
                  }}
                >
                  {/* Header */}
                  <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {displayName}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {auth.email}
                    </p>
                  </div>

                  {[
                    { href: '/dashboard/perfil',        icon: User,     label: 'Perfil'        },
                    { href: '/dashboard/configuracion', icon: Settings, label: 'Configuración' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {label}
                    </Link>
                  ))}

                  <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Cerrar sesión
                  </button>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" sideOffset={8}>
                {displayName}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
