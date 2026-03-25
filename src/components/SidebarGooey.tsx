'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Inbox,
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  Settings,
} from 'lucide-react'
import { ThemeToggleButton as ThemeToggle } from '@/components/providers/theme-provider'

const items = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'inbox', label: 'Bandeja', icon: Inbox, href: '/dashboard/inbox' },
  { id: 'clientes', label: 'Clientes', icon: Users, href: '/dashboard/clientes' },
  { id: 'productos', label: 'Productos', icon: Package, href: '/dashboard/productos' },
  { id: 'reportes', label: 'Reportes', icon: TrendingUp, href: '/dashboard/reportes' },
  { id: 'config', label: 'Config', icon: Settings, href: '/dashboard/configuracion' },
]

type Props = {
  conversacionesPendientes: number
}

export default function SidebarGooey({ conversacionesPendientes }: Props) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const realActiveIndex = useMemo(() => {
    const idx = items.findIndex((it) => {
      if (it.href === '/dashboard') {
        return pathname === '/dashboard'
      }
      return pathname === it.href || pathname.startsWith(it.href + '/')
    })
    return Math.max(idx, 0)
  }, [pathname])

  useEffect(() => {
    setActiveIndex(realActiveIndex)
  }, [realActiveIndex])

  const targetIndex = hoverIndex ?? activeIndex

  const [y, setY] = useState(0)

  const measure = () => {
    const el = itemRefs.current[targetIndex]
    const parent = containerRef.current
    if (!el || !parent) return
    const r = el.getBoundingClientRect()
    const pr = parent.getBoundingClientRect()
    // centramos el indicador respecto del item
    const centerY = r.top - pr.top + r.height / 2
    setY(centerY - 26) // 52px indicator => 26px offset
  }

  useLayoutEffect(() => {
    measure()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex])

  useEffect(() => {
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex])

  return (
    <aside className="h-screen sticky top-0 z-40 w-[84px] flex flex-col items-center py-4">
      {/* SVG filter para gooey */}
      <svg width="0" height="0" className="absolute">
        <filter id="operly-gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 20 -10"
            result="gooey"
          />
          <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
        </filter>
      </svg>

      {/* Rail */}
      <div className="glass glow-ring w-[72px] flex-1 rounded-[26px] border border-white/10 overflow-hidden">
        <div
          ref={containerRef}
          className="relative h-full px-2 py-3 flex flex-col items-center gap-2"
        >
          {/* Indicador gooey */}
          <div className="gooey-wrap absolute inset-0 pointer-events-none">
            <div
              className="gooey-indicator"
              style={{ transform: `translateY(${y}px)` }}
            />
            <div
              className="gooey-blob"
              style={{ transform: `translateY(${y + 8}px)` }}
            />
          </div>

          {/* Items */}
          <div className="mt-1 flex flex-col items-center gap-2">
            {items.map((it, idx) => {
              const Icon = it.icon
              const isInbox = it.id === 'inbox'
              const badge = isInbox && conversacionesPendientes > 0 ? conversacionesPendientes : null
              const isActive = idx === activeIndex

              return (
                <Link
                  key={it.id}
                  href={it.href}
                  ref={(el) => { itemRefs.current[idx] = el }}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className={[
                    'gooey-item relative',
                    'w-[64px] h-[56px] rounded-[20px]',
                    'flex items-center justify-center',
                    'transition-colors duration-150',
                    isActive ? 'text-white' : 'text-white/70 hover:text-white',
                  ].join(' ')}
                >
                  <Icon className="w-5 h-5 relative z-10" />

                  {/* Tooltip */}
                  <span className="gooey-tooltip">{it.label}</span>

                  {/* Badge inbox */}
                  {badge !== null && (
                    <span className="absolute top-2 right-2 z-10 h-5 min-w-[20px] px-1 rounded-full text-[11px] font-extrabold bg-white text-black flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Bottom actions */}
          <div className="mt-auto w-full px-1 pb-1 flex flex-col items-center gap-2">
            {/* tu toggle dark/crystal */}
            <div className="w-full flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
