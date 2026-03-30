'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const
const NAV_LINKS = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Planes', href: '#planes' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(6,10,16,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: '#0ABAB5', fontFamily: 'var(--font-display)' }}>W</div>
            <span className="font-bold text-white tracking-tight text-base"
              style={{ fontFamily: 'var(--font-display)' }}>WAAXP</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                className="text-sm font-medium transition-colors duration-150"
                style={{ color: 'rgba(240,246,255,0.60)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0ABAB5')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,246,255,0.60)')}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: 'rgba(240,246,255,0.60)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,246,255,0.60)'}>
              Iniciar sesión
            </Link>
            <Link href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: '#0ABAB5', boxShadow: '0 0 20px rgba(10,186,181,0.3)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(10,186,181,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(10,186,181,0.3)'}>
              Empezar gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg" style={{ color: 'rgba(240,246,255,0.8)' }}
            onClick={() => setOpen(v => !v)}>
            {open ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{
              background: 'rgba(6,10,16,0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-ui)',
            }}>
            <nav className="flex flex-col px-6 py-6 gap-1">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: 'rgba(240,246,255,0.70)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,186,181,0.08)'; (e.currentTarget as HTMLElement).style.color = '#0ABAB5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,246,255,0.70)' }}>
                  {l.label}
                </a>
              ))}
              <div className="pt-4 mt-3 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="text-center px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: 'rgba(240,246,255,0.70)' }}>
                  Iniciar sesión
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#0ABAB5' }}>
                  Empezar gratis
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
