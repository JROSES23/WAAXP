'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Características', href: '#caracteristicas' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Planes', href: '#planes' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080C14]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_24px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#0ABAB5] flex items-center justify-center shadow-[0_0_16px_rgba(10,186,181,0.4)] transition-shadow group-hover:shadow-[0_0_24px_rgba(10,186,181,0.6)]">
              <span className="font-display font-black text-white text-sm leading-none">W</span>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-[-0.02em]">
              WAAXP
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA group */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#0ABAB5] text-white text-sm font-semibold rounded-lg hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(10,186,181,0.4)] active:translate-y-0 transition-all duration-150"
            >
              Probar gratis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="lg:hidden bg-[#080C14]/98 backdrop-blur-xl border-t border-white/[0.06] px-5 py-4 space-y-1"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.06]">
            <Link
              href="/login"
              className="block px-4 py-3 text-sm font-medium text-white/60 text-center hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="block px-4 py-3 bg-[#0ABAB5] text-white text-sm font-semibold rounded-lg text-center"
            >
              Probar gratis
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
