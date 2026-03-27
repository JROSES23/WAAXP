'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const STATS = [
  { value: '+340', label: 'negocios activos' },
  { value: '$4.2B', label: 'CLP procesados' },
  { value: '94%', label: 'automatización' },
]

const TESTIMONIALS = [
  {
    quote: 'WAAXP cambió mi negocio. Antes perdía el 40% de las consultas por WhatsApp porque no podía responder rápido. Ahora LEVI responde en segundos y yo cierro la venta.',
    name: 'Valentina Torres',
    role: 'Dueña',
    company: 'Tienda de ropa, Santiago',
  },
  {
    quote: 'Lo que más me sorprendió es que mis clientes no se dan cuenta de que es un bot. Las conversaciones son naturales y el bot ya sabe todo sobre mis tratamientos.',
    name: 'Diego Contreras',
    role: 'Director',
    company: 'Clínica dental, Viña del Mar',
  },
  {
    quote: 'Teníamos 3 personas contestando WhatsApp. Hoy WAAXP hace el 90% del trabajo y esas personas hacen cosas que realmente valen la pena. Claramente la mejor inversión del año.',
    name: 'Sofía Herrera',
    role: 'Gerenta',
    company: 'Distribuidora de insumos, Concepción',
  },
]

export default function TestimonialsSection() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0ABAB5 0%, #079490 100%)',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}
    >
      {/* Background teal blobs for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60%', height: '70%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: '50%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.10) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
        {/* Large decorative quote mark */}
        <div
          className="absolute -top-4 left-8 font-display font-black leading-none select-none"
          style={{
            fontSize: '20rem',
            color: 'rgba(255,255,255,0.06)',
            fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
            lineHeight: 1,
          }}
        >
          "
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Social proof bar — glass pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="px-5 py-3 rounded-2xl relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30)',
              }}
            >
              {/* Inner refraction */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, transparent 55%)',
                pointerEvents: 'none',
              }} />
              <div
                className="font-display font-black text-2xl leading-none relative"
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                }}
              >
                {s.value}
              </div>
              <div className="text-xs relative" style={{ color: 'rgba(255,255,255,0.70)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="text-center mb-12"
        >
          <h2
            className="font-display font-black leading-[1.06]"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.025em',
            }}
          >
            Lo que dicen quienes ya no pierden ventas.
          </h2>
        </motion.div>

        {/* Testimonial cards — liquid glass on teal */}
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
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.35)',
              }}
            >
              {/* Refraction */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4 relative">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.85)' }} fill="rgba(255,255,255,0.85)" strokeWidth={0} />
                ))}
              </div>

              <p
                className="text-sm leading-relaxed flex-1 mb-5 relative"
                style={{ color: 'rgba(255,255,255,0.88)' }}
              >
                "{t.quote}"
              </p>

              <div className="relative flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.22)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#FFFFFF',
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
