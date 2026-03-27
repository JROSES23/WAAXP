'use client'

import { motion } from 'framer-motion'

const CUSTOM_EASE = [0.25, 0.46, 0.45, 0.94] as const

const stats = [
  {
    number: '73%',
    label: 'de los clientes no espera más de 5 minutos antes de irse con la competencia',
  },
  {
    number: '$2.1M',
    label: 'CLP pierden en promedio las PYMEs chilenas por mes en ventas no atendidas',
  },
  {
    number: '1 de 3',
    label: 'clientes potenciales jamás recibe respuesta al primer mensaje',
  },
]

export default function ProblemSection() {
  return (
    <section
      id="problema"
      className="relative overflow-hidden"
      style={{
        background: '#0D1B2A',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(10,186,181,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: CUSTOM_EASE }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#0ABAB5' }}
          >
            La realidad
          </p>
          <h2
            className="font-display font-black leading-tight"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            El problema que nadie quiere ver
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: CUSTOM_EASE }}
              className="text-center px-4"
            >
              <div
                className="font-display font-black leading-none mb-4"
                style={{
                  fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                  color: '#0ABAB5',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                  letterSpacing: '-0.03em',
                }}
              >
                {stat.number}
              </div>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Teal horizontal rule */}
      <div
        className="w-full h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(10,186,181,0.40), transparent)' }}
      />
    </section>
  )
}
