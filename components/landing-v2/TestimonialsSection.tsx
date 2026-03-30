'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const TESTIMONIALS = [
  {
    quote: 'Antes perdía el 40% de las consultas por WhatsApp. Ahora LEVI responde en segundos y yo solo cierro las ventas. Increíble.',
    name: 'Valentina Torres',
    role: 'Dueña · Tienda de ropa, Santiago',
    initials: 'VT',
    color: '#0ABAB5',
  },
  {
    quote: 'Lo que más me sorprendió es que mis clientes no se dan cuenta de que es un bot. Las conversaciones se sienten completamente naturales.',
    name: 'Diego Contreras',
    role: 'Director · Clínica dental, Viña del Mar',
    initials: 'DC',
    color: '#7c3aed',
  },
  {
    quote: 'Teníamos 3 personas contestando WhatsApp. Hoy WAAXP hace el 90% del trabajo. Esas personas ahora hacen cosas que realmente importan.',
    name: 'Sofía Herrera',
    role: 'Gerenta · Distribuidora, Concepción',
    initials: 'SH',
    color: '#0891b2',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: '#060a10', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: '50%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(10,186,181,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#0ABAB5' }}>Testimonios</p>
          <h2 className="font-display font-black leading-[1.05]"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#F0F6FF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.03em',
            }}>
            Lo que dicen quienes ya no pierden ventas.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 380, damping: 28 } }}
              className="relative rounded-2xl p-6 flex flex-col overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
              }}>
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${t.color}40, transparent)` }} />
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5" style={{ color: t.color }} fill={t.color} strokeWidth={0} />
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: 'rgba(240,246,255,0.65)' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${t.color}20`, border: `1px solid ${t.color}40`, color: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#F0F6FF' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(240,246,255,0.40)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
