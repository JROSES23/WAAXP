'use client'

import { motion } from 'framer-motion'
import { QrCode, Bot, TrendingUp } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const STEPS = [
  {
    number: '01',
    icon: QrCode,
    title: 'Conecta en 2 minutos',
    desc: 'Escanea el código QR con tu número de WhatsApp Business. Sin instalar apps, sin configuración técnica.',
    detail: 'Compatible con cualquier número WhatsApp',
  },
  {
    number: '02',
    icon: Bot,
    title: 'Entrena a LEVI',
    desc: 'Le explicas tu negocio, tus productos y cómo quieres que hable. En menos de 15 minutos está listo.',
    detail: 'Todo en español, sin código',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'A vender solo',
    desc: 'LEVI atiende clientes 24/7, responde preguntas, toma pedidos y califica leads. Tú solo revisas lo importante.',
    detail: 'Dashboard en tiempo real',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060a10 0%, #080e18 100%)', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(10,186,181,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#0ABAB5' }}>
            Cómo funciona
          </p>
          <h2 className="font-display font-black leading-[1.05]"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              color: '#F0F6FF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.03em',
            }}>
            De cero a ventas en 15 minutos.
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-6">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[3.25rem] left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px"
            style={{ background: 'linear-gradient(90deg, rgba(10,186,181,0.4) 0%, rgba(10,186,181,0.1) 50%, rgba(10,186,181,0.4) 100%)' }} />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
                className="relative rounded-2xl p-6 flex flex-col overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'border-color 0.3s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(10,186,181,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                {/* Watermark number */}
                <div className="absolute -top-3 -right-2 font-display font-black select-none pointer-events-none"
                  style={{
                    fontSize: '6rem',
                    color: 'rgba(10,186,181,0.05)',
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1,
                  }}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative"
                  style={{
                    background: 'rgba(10,186,181,0.10)',
                    border: '1px solid rgba(10,186,181,0.20)',
                  }}>
                  <Icon className="w-5 h-5" style={{ color: '#0ABAB5' }} strokeWidth={1.5} />
                </div>

                <div className="text-xs font-bold mb-3 tabular-nums"
                  style={{ color: 'rgba(10,186,181,0.7)' }}>
                  {step.number}
                </div>

                <h3 className="font-semibold text-lg mb-3"
                  style={{
                    color: '#F0F6FF',
                    fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                  }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-4"
                  style={{ color: 'rgba(240,246,255,0.50)' }}>
                  {step.desc}
                </p>
                <div className="text-xs font-medium px-3 py-1.5 rounded-full w-fit"
                  style={{
                    background: 'rgba(10,186,181,0.08)',
                    border: '1px solid rgba(10,186,181,0.15)',
                    color: 'rgba(10,186,181,0.8)',
                  }}>
                  {step.detail}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
