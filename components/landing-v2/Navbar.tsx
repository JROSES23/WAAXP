'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const CUSTOM_EASE = [0.25, 0.46, 0.45, 0.94] as const

const navLinks = [
  { label: 'Funciones', href: '#caracteristicas' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Planes', href: '#planes' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: CUSTOM_EASE }}
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0)',
          backdropFilter: scrolled ? 'blur(24px) saturate(200%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(200%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.80)' : '1px solid transparent',
          boxShadow: scrolled
            ? '0 8px 32px rgba(10,186,181,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 -1px 0 rgba(0,0,0,0.04)'
            : 'none',
          fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                style={{
                  background: '#0ABAB5',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                }}
              >
                W
              </div>
              <span
                className="text-base font-bold tracking-tight"
                style={{
                  color: '#0D1B2A',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                }}
              >
                WAAXP
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: '#5C6B7A' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#5C6B7A'
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: '#0D1B2A' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = '#0D1B2A'
                }}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: '#0ABAB5',
                  boxShadow: '0 2px 12px rgba(10,186,181,0.25)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    '0 6px 20px rgba(10,186,181,0.40)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    '0 2px 12px rgba(10,186,181,0.25)'
                }}
              >
                Probar gratis
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#0D1B2A' }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: CUSTOM_EASE }}
            className="fixed top-16 left-0 right-0 z-30 md:hidden"
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
            }}
          >
            <nav className="flex flex-col px-6 py-6 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: '#0D1B2A' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = '#EDFAFA'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#0D1B2A'
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t flex flex-col gap-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: '#0D1B2A' }}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#0ABAB5' }}
                >
                  Probar gratis
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
