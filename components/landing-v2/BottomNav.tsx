'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Zap, GitBranch, CreditCard, HelpCircle, LogIn } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home,        label: 'Inicio',         href: '#inicio',          external: false },
  { icon: Zap,         label: 'Funciones',      href: '#caracteristicas', external: false },
  { icon: GitBranch,   label: 'Cómo funciona',  href: '#como-funciona',   external: false },
  { icon: CreditCard,  label: 'Planes',          href: '#planes',          external: false },
  { icon: HelpCircle,  label: 'FAQ',             href: '#faq',             external: false },
  { icon: LogIn,       label: 'Ingresar',        href: '/login',           external: true  },
]

export default function BottomNav() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="pointer-events-auto relative flex items-center gap-1 p-1.5 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.90)',
          boxShadow:
            '0 12px 40px rgba(10,186,181,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {/* Inner top refraction */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 35%)',
          pointerEvents: 'none',
        }} />

        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon
          const isHovered = hoveredId === i
          const isLogin = item.external

          const inner = (
            <motion.div
              className="relative flex items-center gap-2 overflow-hidden rounded-xl"
              style={{
                padding: '10px 12px',
                paddingRight: isHovered || isLogin ? '14px' : '12px',
                background: isLogin
                  ? 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)'
                  : isHovered
                  ? 'rgba(10,186,181,0.09)'
                  : 'transparent',
                boxShadow: isLogin
                  ? '0 4px 16px rgba(10,186,181,0.30), inset 0 1px 0 rgba(255,255,255,0.18)'
                  : 'none',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer',
              }}
              onHoverStart={() => setHoveredId(i)}
              onHoverEnd={() => setHoveredId(null)}
            >
              {isLogin && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 'inherit',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, transparent 55%)',
                  pointerEvents: 'none',
                }} />
              )}

              <Icon
                className="relative shrink-0"
                style={{
                  width: '17px', height: '17px',
                  color: isLogin ? '#FFFFFF' : isHovered ? '#0ABAB5' : '#5C6B7A',
                  strokeWidth: isHovered || isLogin ? 2 : 1.5,
                  transition: 'color 0.15s ease',
                }}
              />

              <AnimatePresence>
                {(isHovered || isLogin) && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, maxWidth: 0 }}
                    animate={{ opacity: 1, maxWidth: 120 }}
                    exit={{ opacity: 0, maxWidth: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="relative text-xs font-semibold whitespace-nowrap overflow-hidden"
                    style={{ color: isLogin ? '#FFFFFF' : '#0ABAB5' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )

          return item.external ? (
            <Link key={i} href={item.href}>{inner}</Link>
          ) : (
            <a key={i} href={item.href}>{inner}</a>
          )
        })}
      </motion.div>
    </div>
  )
}
