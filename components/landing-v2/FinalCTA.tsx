'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export default function FinalCTA({ onContact }: { onContact?: () => void }) {
  return (
    <section className="relative py-32 overflow-hidden"
      style={{ background: '#060a10', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}>

      {/* Big teal glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div style={{
          width: '60%', height: '80%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(10,186,181,0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(10,186,181,0.3), transparent)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: 'rgba(10,186,181,0.08)',
              border: '1px solid rgba(10,186,181,0.25)',
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0ABAB5' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>
              14 días gratis sin tarjeta
            </span>
          </div>

          <h2 className="font-display font-black leading-[0.96] mb-6"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: '#F0F6FF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.04em',
            }}>
            Tu competencia
            <br />
            ya está usando IA.
          </h2>

          <p className="text-lg mb-10" style={{ color: 'rgba(240,246,255,0.50)', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Empieza gratis hoy. Sin tarjeta de crédito. Sin compromiso.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: '#0ABAB5',
                boxShadow: '0 0 40px rgba(10,186,181,0.4), 0 4px 20px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(10,186,181,0.6), 0 4px 20px rgba(0,0,0,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(10,186,181,0.4), 0 4px 20px rgba(0,0,0,0.3)'}>
              Empezar gratis
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <button onClick={onContact}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200"
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(240,246,255,0.70)',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.color = '#F0F6FF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
                e.currentTarget.style.color = 'rgba(240,246,255,0.70)'
              }}>
              Hablar con ventas
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
