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
  LifeBuoy,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronUp,
  CalendarDays,
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
import { useModalStore } from '@/lib/modal-store'

/* ── Nav item definition ── */
interface NavItem {
  id:              string
  label:           string
  icon:            React.ElementType
  href:            string
  section?:        SectionPermission
  badge?:          number
  ownerOnly?:      boolean
  superAdminOnly?: boolean
  dividerBefore?:  boolean
}

function buildItems(pendingCount: number, auth: AuthContext): NavItem[] {
  // Mostrar Reservas solo si el negocio tiene el modo activo, o si es demo
  const tieneReservas =
    !auth.businessId ||
    auth.business?.modos_activos?.includes('reservas') ||
    auth.business?.modo_principal === 'reservas' ||
    auth.business?.modo_principal === 'hibrido'

  return [
    { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard',            section: 'dashboard' },
    { id: 'inbox',     label: 'Inbox',        icon: MessageSquare,   href: '/dashboard/inbox',       section: 'inbox',           badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'clientes',  label: 'Clientes',     icon: Users,           href: '/dashboard/clientes',    section: 'clientes' },
    ...(tieneReservas
      ? [{ id: 'reservas', label: 'Reservas', icon: CalendarDays, href: '/dashboard/reservas', section: 'reservas' as const }]
      : []),
    { id: 'productos', label: 'Productos',    icon: Package,         href: '/dashboard/productos',   section: 'productos' },
    { id: 'reportes',  label: 'Reportes',     icon: BarChart3,       href: '/dashboard/reportes',    section: 'reportes' },
    { id: 'config',    label: 'Config. IA',   icon: Cpu,             href: '/dashboard/configuracion', section: 'configuracion_ia', dividerBefore: true },
    { id: 'whatsapp',  label: 'WhatsApp',     icon: QrCode,          href: '/dashboard/whatsapp',    section: 'whatsapp_qr' },
    { id: 'billing',   label: 'Facturación',  icon: CreditCard,      href: '/dashboard/billing',     section: 'billing',         ownerOnly: true },
    { id: 'equipo',    label: 'Equipo',       icon: UserCog,         href: '/dashboard/equipo',      section: 'equipo',          ownerOnly: true },
    { id: 'soporte',   label: 'Soporte',      icon: LifeBuoy,        href: '/dashboard/soporte' },
    ...(auth.isSuperAdmin
      ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck, href: '/admin', superAdminOnly: true, dividerBefore: true }]
      : []),
  ]
}

function canSee(item: NavItem, auth: AuthContext): boolean {
  if (item.superAdminOnly) return auth.isSuperAdmin
  if (item.ownerOnly) return auth.isSuperAdmin || auth.role === 'owner'
  if (item.section) {
    if (auth.isSuperAdmin || auth.role === 'owner') return true
    return auth.permissions.includes(item.section)
  }
  return true
}

/* ── Component ── */
export interface DashboardBottomNavProps {
  auth:         AuthContext
  pendingCount: number
}

export default function DashboardBottomNav({ auth, pendingCount }: DashboardBottomNavProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  // Estado global de modales — oculta el nav cuando hay un overlay activo
  const { isModalOpen } = useModalStore()

  useEffect(() => { setMounted(true) }, [])

  const isDark     = mounted ? theme === 'dark' : true
  const items      = buildItems(pendingCount, auth).filter((i) => canSee(i, auth))
  const displayName = auth.profile?.display_name ?? auth.email.split('@')[0] ?? 'Usuario'
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const roleLabel   = auth.isSuperAdmin ? 'Super Admin' : auth.role === 'owner' ? 'Propietario' : 'WAAXPTEAM'

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

  /* Glass style adapts to dark / light */
  const dockStyle: React.CSSProperties = isDark
    ? {
        background: 'rgba(8,12,16,0.82)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.40), 0 8px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
      }
    : {
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(255,255,255,0.90)',
        boxShadow: '0 -4px 32px rgba(10,186,181,0.08), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
      }

  const itemBase = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
    overflow: 'hidden',
    ...(active
      ? {
          background: isDark ? 'rgba(10,186,181,0.14)' : 'rgba(10,186,181,0.10)',
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'inset 0 1px 0 rgba(255,255,255,0.80)',
        }
      : {}),
  })

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={
            isModalOpen
              ? { y: 100, opacity: 0, pointerEvents: 'none' }
              : { y: 0,   opacity: 1, pointerEvents: 'auto' }
          }
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="pointer-events-auto relative flex items-center gap-0.5 px-2 py-2 rounded-2xl max-w-[96vw] overflow-x-auto scrollbar-none"
          style={dockStyle}
        >
          {/* Top refraction highlight */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 30%)',
            pointerEvents: 'none',
          }} />

          {/* ── Nav items ── */}
          {items.map((item, i) => {
            const Icon   = item.icon
            const active = isActive(item.href)
            const hovered = hoveredId === item.id

            return (
              <div key={item.id} className="flex items-center shrink-0">
                {/* Divider */}
                {item.dividerBefore && i > 0 && (
                  <div
                    className="w-px mx-1.5 h-5 shrink-0"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                  />
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      style={itemBase(active)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Active teal accent bar */}
                      {active && (
                        <div style={{
                          position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px',
                          background: 'var(--accent)', borderRadius: '0 0 4px 4px',
                        }} />
                      )}

                      {/* Icon with badge */}
                      <div className="relative shrink-0">
                        <Icon
                          style={{
                            width: '17px', height: '17px',
                            color: active
                              ? 'var(--accent)'
                              : isDark
                              ? hovered ? '#edf2f7' : 'rgba(255,255,255,0.40)'
                              : hovered ? '#0D1B2A' : '#5C6B7A',
                            strokeWidth: active ? 2 : 1.75,
                            transition: 'color 0.15s ease',
                          }}
                        />
                        {item.badge != null && (
                          <span style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            minWidth: '14px', height: '14px', padding: '0 3px',
                            background: '#EF4444', color: '#fff',
                            borderRadius: '7px', fontSize: '9px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                          }}>
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </div>

                      {/* Label — expands on hover */}
                      <AnimatePresence>
                        {(hovered || active) && (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0, maxWidth: 0 }}
                            animate={{ opacity: 1, maxWidth: 100 }}
                            exit={{ opacity: 0, maxWidth: 0 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            style={{
                              fontSize: '12px', fontWeight: 600,
                              whiteSpace: 'nowrap', overflow: 'hidden',
                              color: active
                                ? 'var(--accent)'
                                : isDark ? '#edf2f7' : '#0D1B2A',
                            }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </TooltipTrigger>
                  {/* Tooltip only when not hovered/active */}
                  {!hovered && !active && (
                    <TooltipContent side="top" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            )
          })}

          {/* ── Divider ── */}
          <div
            className="w-px mx-2 h-5 shrink-0"
            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          />

          {/* ── Dark/Light Toggle ── */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 focus:outline-none"
            style={{
              color: isDark ? 'rgba(255,255,255,0.40)' : '#5C6B7A',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,186,181,0.08)'
              e.currentTarget.style.color = isDark ? '#edf2f7' : '#0ABAB5'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.40)' : '#5C6B7A'
            }}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {isDark
                  ? <Sun  style={{ width: '16px', height: '16px' }} strokeWidth={1.75} />
                  : <Moon style={{ width: '16px', height: '16px' }} strokeWidth={1.75} />
                }
              </motion.span>
            </AnimatePresence>
          </button>

          {/* ── User Avatar + Popover ── */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 focus:outline-none ml-1"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.55)' : '#5C6B7A',
                  background: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,186,181,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'var(--accent)',
                    color: '#080c10',
                    boxShadow: 'var(--accent-glow)',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <ChevronUp style={{ width: '12px', height: '12px', flexShrink: 0 }} strokeWidth={2} />
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="end"
              sideOffset={10}
              className="z-[100] w-52 p-1.5 rounded-xl shadow-xl outline-none"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              {/* User header */}
              <div
                className="px-3 py-2.5 mb-1"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {auth.email}
                </p>
                {auth.role === 'agent' ? (
                  /* WAAXPTEAM — tipografía dual para agentes */
                  <span className="inline-flex items-center mt-1">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: 'var(--text-primary)', letterSpacing: '0.12em' }}
                    >
                      WAAXP
                    </span>
                    <span
                      className="text-[9px] font-black uppercase italic"
                      style={{ color: 'var(--accent)', letterSpacing: '0.06em', textShadow: '0 0 8px rgba(10,186,181,0.4)' }}
                    >
                      TEAM
                    </span>
                  </span>
                ) : (
                  <span
                    className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>

              {[
                { href: '/dashboard/perfil',        icon: User,     label: 'Perfil'        },
                { href: '/dashboard/configuracion', icon: Settings, label: 'Configuración' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors w-full"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-glass)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} strokeWidth={1.75} />
                  {label}
                </Link>
              ))}

              <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: '#EF4444' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
              >
                <LogOut style={{ width: '14px', height: '14px' }} strokeWidth={1.75} />
                Cerrar sesión
              </button>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}
