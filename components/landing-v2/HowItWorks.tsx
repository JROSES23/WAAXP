'use client'

import { motion } from 'framer-motion'
import { QrCode, Bot, TrendingUp, ArrowRight } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const STEPS = [
  {
    number: '01',
    icon: QrCode,
    title: 'Conecta tu WhatsApp',
    desc: 'Escanea el QR con tu número Business. Sin instalar nada. Funciona con cualquier WhatsApp.',
  },
  {
    number: '02',
    icon: Bot,
    title: 'Configura a LEVI',
    desc: 'Le dices cómo hablar, qué vender y cómo responder. Todo en español, en menos de 15 minutos.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Empieza a vender',
    desc: 'WAAXP atiende clientes 24/7. Tú revisas el dashboard y apruebas lo que quieras.',
  },
]

/* Liquid glass card style */
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 8px 32px rgba(10,186,181,0.07), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
}

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#FFFFFF', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '20%', left: '-8%',
          width: '50%', height: '65%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.15) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-5%',
          width: '45%', height: '55%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.09) 0%, transparent 65%)',
          filter: 'blur(90px)',
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(10,186,181,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>
              Cómo funciona
            </span>
          </div>
          <h2
            className="font-display font-black leading-[1.06]"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#0D1B2A',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.025em',
            }}
          >
            De cero a ventas en 15 minutos.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 380, damping: 28 } }}
                className="relative rounded-2xl p-6 flex flex-col overflow-hidden"
                style={{
                  ...GLASS,
                  borderLeft: '2px solid #0ABAB5',
                }}
              >
                {/* Inner refraction */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 'inherit',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.50) 0%, transparent 55%)',
                  pointerEvents: 'none',
                }} />

                {/* Watermark step number */}
                <div
                  className="absolute -top-4 -left-2 font-display font-black leading-none select-none pointer-events-none"
                  style={{
                    fontSize: '7rem',
                    color: 'rgba(10,186,181,0.07)',
                    fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10,186,181,0.15) 0%, rgba(10,186,181,0.06) 100%)',
                    border: '1px solid rgba(10,186,181,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                  }}
                >
                  <Icon className="w-5 h-5 text-[#0ABAB5]" strokeWidth={1.5} />
                </div>

                <h3
                  className="font-semibold text-lg mb-2 relative"
                  style={{
                    color: '#0D1B2A',
                    fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                  }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed relative flex-1" style={{ color: '#5C6B7A' }}>
                  {step.desc}
                </p>

                {/* Step number badge */}
                <div
                  className="mt-4 relative inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: '#0ABAB5' }}
                >
                  <span>{step.number}</span>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
