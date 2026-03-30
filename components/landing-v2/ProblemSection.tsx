'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

function NumberTicker({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, motionValue, value])

  useEffect(() =>
    springValue.on('change', latest => {
      if (ref.current) {
        ref.current.textContent = prefix + Intl.NumberFormat('es-CL').format(Math.round(latest)) + suffix
      }
    }),
  [springValue, prefix, suffix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

const STATS = [
  { value: 340, suffix: '+', label: 'negocios activos' },
  { value: 94, suffix: '%', label: 'automatización promedio' },
  { value: 3, prefix: '<', suffix: 's', label: 'tiempo de respuesta' },
  { value: 2, suffix: 'M+', label: 'mensajes procesados' },
]

const TYPES = [
  'Tiendas de ropa', 'Clínicas dentales', 'Distribuidoras', 'Restaurantes',
  'Centros de estética', 'Inmobiliarias', 'Talleres mecánicos', 'Farmacias',
  'Peluquerías', 'Academias', 'Ferreterías', 'Clínicas veterinarias',
]

export default function ProblemSection() {
  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: '#060a10', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}>

      {/* Separator line at top */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(10,186,181,0.3), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Problem statement */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#0ABAB5' }}>
            El problema
          </p>
          <h2 className="font-display font-black leading-[1.05] mb-5"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              color: '#F0F6FF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.03em',
            }}>
            Pierdes ventas mientras duermes. Nosotros lo resolvemos.
          </h2>
          <p style={{ color: 'rgba(240,246,255,0.50)', lineHeight: 1.7 }}>
            El 78% de los clientes espera respuesta en menos de 5 minutos. La mayoría de las PyMEs no pueden cumplirlo.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              className="rounded-2xl p-6 text-center relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
              {/* glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(10,186,181,0.07) 0%, transparent 70%)' }} />
              <div className="relative font-display font-black text-4xl tracking-tight mb-1"
                style={{
                  color: '#0ABAB5',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                }}>
                <NumberTicker value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="text-xs" style={{ color: 'rgba(240,246,255,0.45)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Marquee */}
        <div className="overflow-hidden [--gap:1.5rem] [--duration:35s]">
          <p className="text-xs font-medium uppercase tracking-widest text-center mb-5"
            style={{ color: 'rgba(240,246,255,0.25)' }}>
            Funciona para todo tipo de negocio
          </p>
          <div className="group flex overflow-hidden [gap:var(--gap)]">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex shrink-0 [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused]">
                {TYPES.map(t => (
                  <div key={t} className="shrink-0 px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(240,246,255,0.45)',
                    }}>
                    {t}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
