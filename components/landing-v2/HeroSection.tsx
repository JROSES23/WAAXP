'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Bot, Wifi, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

interface HeroSectionProps {
  onOpenVideo: () => void
}

const CHAT = [
  { role: 'user', text: 'Hola, quiero cotizar uniformes para mi empresa' },
  { role: 'bot',  text: 'Hola! Soy LEVI. ¿Cuántas unidades necesitas y para cuándo?' },
  { role: 'user', text: '50 poleras con logo, para la próxima semana' },
  { role: 'bot',  text: 'Para 50 poleras bordadas el precio es $14.900 c/u. Te envío la cotización ahora.' },
]

/* ── Liquid glass token ── */
const GLASS = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(24px) saturate(200%)',
  WebkitBackdropFilter: 'blur(24px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.80)',
  boxShadow:
    '0 24px 64px rgba(10,186,181,0.10), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
} as React.CSSProperties

const GLASS_BADGE = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow:
    '0 8px 24px rgba(10,186,181,0.12), inset 0 1px 0 rgba(255,255,255,1)',
} as React.CSSProperties

export default function HeroSection({ onOpenVideo }: HeroSectionProps) {
  const [counter, setCounter] = useState(1247)

  useEffect(() => {
    const id = setInterval(
      () => setCounter((c) => c + Math.floor(Math.random() * 3) + 1),
      800
    )
    return () => clearInterval(id)
  }, [])

  const stats = [
    { value: '+340', label: 'PYMEs activas' },
    { value: '94%', label: 'automatizado' },
    { value: '2.8s', label: 'respuesta' },
  ]

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ background: '#FFFFFF', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}
    >
      {/* ── Liquid glass background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary teal blob — top left */}
        <div
          style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: '65%', height: '75%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10,186,181,0.22) 0%, transparent 68%)',
            filter: 'blur(72px)',
          }}
        />
        {/* Secondary blob — bottom right */}
        <div
          style={{
            position: 'absolute', bottom: '5%', right: '-5%',
            width: '55%', height: '65%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10,186,181,0.13) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Accent blob — center */}
        <div
          style={{
            position: 'absolute', top: '35%', left: '35%',
            width: '38%', height: '45%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,210,204,0.09) 0%, transparent 65%)',
            filter: 'blur(56px)',
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.018,
            backgroundImage:
              'linear-gradient(rgba(10,186,181,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(10,186,181,0.8) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">

        {/* ── Live counter ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-10"
        >
          {/* Glass pill label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(10,186,181,0.20)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>
              En este momento en Chile
            </span>
          </div>

          {/* Huge counter */}
          <div
            className="font-display font-black leading-none tracking-[-0.04em]"
            style={{
              fontSize: 'clamp(5rem, 14vw, 10rem)',
              color: '#0ABAB5',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              textShadow: '0 0 80px rgba(10,186,181,0.25)',
            }}
            suppressHydrationWarning
          >
            {counter.toLocaleString('es-CL')}
          </div>

          <p className="text-lg mt-3 font-medium" style={{ color: '#5C6B7A' }}>
            mensajes sin responder
          </p>

          <div className="mt-8 max-w-2xl mx-auto h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(10,186,181,0.25), transparent)' }}
          />
        </motion.div>

        {/* ── Two columns ── */}
        <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
          >
            <h1
              className="font-display font-black leading-[1.06] mb-5"
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                color: '#0D1B2A',
                fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                letterSpacing: '-0.025em',
              }}
            >
              Cada mensaje sin responder es dinero que no vuelve.
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: '#5C6B7A' }}>
              WAAXP atiende, cotiza y cierra ventas por WhatsApp 24/7.
              Para PYMEs que no pueden darse el lujo de perder clientes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)',
                  boxShadow: '0 4px 20px rgba(10,186,181,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                Activar gratis
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>

              <button
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  ...GLASS_BADGE,
                  color: '#0D1B2A',
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#EDFAFA', border: '1px solid rgba(10,186,181,0.28)' }}
                >
                  <Play className="w-[10px] h-[10px] text-[#0ABAB5]" fill="#0ABAB5" strokeWidth={0} />
                </div>
                Ver demo
              </button>
            </div>

            {/* Trust */}
            <p className="text-xs mb-8" style={{ color: '#8FA3B5' }}>
              Sin tarjeta · Setup 5 min · Cancela cuando quieras
            </p>

            {/* Stats row — glass pills */}
            <div className="flex flex-wrap gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="px-4 py-2.5 rounded-xl relative overflow-hidden"
                  style={GLASS_BADGE}
                >
                  {/* Inner refraction */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 'inherit',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 55%)',
                    pointerEvents: 'none',
                  }} />
                  <div className="font-display font-black text-xl relative"
                    style={{ color: '#0D1B2A', fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[11px] relative" style={{ color: '#5C6B7A' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — liquid glass chat card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: EASE }}
            className="relative"
          >
            {/* Floating badge — top right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute -top-4 -right-4 z-20 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
              style={GLASS_BADGE}
            >
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 55%)',
                pointerEvents: 'none',
              }} />
              <TrendingUp className="w-3.5 h-3.5 relative" style={{ color: '#0ABAB5' }} strokeWidth={2} />
              <span className="text-xs font-bold relative" style={{ color: '#0D1B2A' }}>+62% ventas</span>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute -bottom-4 -left-4 z-20 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
              style={GLASS_BADGE}
            >
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 55%)',
                pointerEvents: 'none',
              }} />
              <Clock className="w-3.5 h-3.5 relative" style={{ color: '#0ABAB5' }} strokeWidth={2} />
              <span className="text-xs font-bold relative" style={{ color: '#0D1B2A' }}>Respuesta: 2.8s</span>
            </motion.div>

            {/* Chat card — liquid glass */}
            <div
              className="relative rounded-[2rem] overflow-hidden"
              style={GLASS}
            >
              {/* Inner refraction overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit', zIndex: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 45%, transparent 65%)',
                pointerEvents: 'none',
              }} />
              {/* Top specular line */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit', zIndex: 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 8%)',
                pointerEvents: 'none',
              }} />

              {/* Status bar */}
              <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
                <span className="text-[11px] font-semibold" style={{ color: '#0D1B2A' }}>9:41</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" style={{ color: '#5C6B7A' }} strokeWidth={1.5} />
                  <div className="flex gap-0.5">
                    {[3, 4, 5, 4].map((h, i) => (
                      <div key={i} className="w-1 rounded-sm" style={{ height: h * 2, background: '#0D1B2A', opacity: 0.4 }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp header */}
              <div
                className="relative z-10 flex items-center gap-3 px-5 py-3"
                style={{ background: 'rgba(249,250,251,0.70)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)',
                    boxShadow: '0 0 12px rgba(10,186,181,0.30)',
                  }}
                >
                  <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#0D1B2A' }}>LEVI · Asistente WAAXP</div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#5C6B7A' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.6)' }} />
                    En línea · responde en segundos
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                className="relative z-10 px-4 py-4 space-y-3 min-h-[260px]"
                style={{ background: 'rgba(248,250,252,0.55)' }}
              >
                {CHAT.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + i * 0.18, ease: EASE }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium"
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)',
                              color: '#FFFFFF',
                              borderBottomRightRadius: '4px',
                              boxShadow: '0 4px 12px rgba(10,186,181,0.28)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.80)',
                              backdropFilter: 'blur(8px)',
                              WebkitBackdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.90)',
                              color: '#0D1B2A',
                              borderBottomLeftRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }
                      }
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-3.5 py-2.5 rounded-2xl flex items-center gap-1"
                    style={{
                      background: 'rgba(255,255,255,0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderBottomLeftRadius: '4px',
                    }}
                  >
                    {[0, 0.2, 0.4].map((d, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#0ABAB5', animationDelay: `${d}s`, opacity: 0.7 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Input bar */}
              <div
                className="relative z-10 px-4 py-3 flex items-center gap-2"
                style={{ background: 'rgba(243,244,246,0.65)', borderTop: '1px solid rgba(255,255,255,0.60)' }}
              >
                <div
                  className="flex-1 px-4 py-2.5 rounded-full text-xs"
                  style={{ background: 'rgba(255,255,255,0.80)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.90)' }}
                >
                  Escribe un mensaje...
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)',
                    boxShadow: '0 2px 8px rgba(10,186,181,0.35)',
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
