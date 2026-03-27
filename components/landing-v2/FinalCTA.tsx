'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const CUSTOM_EASE = [0.25, 0.46, 0.45, 0.94] as const

interface FinalCTAProps {
  onContact: () => void
}

export default function FinalCTA({ onContact }: FinalCTAProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0A1628 0%, #0D1B2A 100%)',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}
    >
      {/* Teal radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(10,186,181,0.12) 0%, transparent 65%)',
        }}
      />

      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(10,186,181,0.50), transparent)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: CUSTOM_EASE }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: '#0ABAB5' }}
          >
            Empieza hoy
          </p>

          <h2
            className="font-display font-black leading-tight mb-6"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.025em',
            }}
          >
            Tu primer cliente IA te espera.
          </h2>

          <p
            className="text-lg mb-10"
            style={{ color: 'rgba(255,255,255,0.50)' }}
          >
            Únete a +340 PYMEs que ya no pierden mensajes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl text-base font-bold text-white transition-all duration-200 hover:-translate-y-1"
              style={{
                background: '#0ABAB5',
                boxShadow: '0 8px 30px rgba(10,186,181,0.35)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  '0 12px 40px rgba(10,186,181,0.50)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  '0 8px 30px rgba(10,186,181,0.35)'
              }}
            >
              Activar WAAXP gratis
            </Link>

            <button
              onClick={onContact}
              className="px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.20)',
                color: 'rgba(255,255,255,0.80)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                  'rgba(10,186,181,0.50)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'
                ;(e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(10,186,181,0.08)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                  'rgba(255,255,255,0.20)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              Hablar con ventas
            </button>
          </div>

          <p
            className="text-xs mt-8"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            Sin tarjeta de crédito · Configuración en 5 minutos · Cancela cuando quieras
          </p>
        </motion.div>
      </div>
    </section>
  )
}
