'use client'

import { motion } from 'framer-motion'
import { Zap, Clock, FileText, BarChart2, Settings, UserCheck, RefreshCw, MessageSquare } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

/* Liquid glass recipe for cards on colored bg */
const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 8px 32px rgba(10,186,181,0.07), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
}

const GLASS_CARD_HOVER: React.CSSProperties = {
  boxShadow: '0 16px 48px rgba(10,186,181,0.13), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
  border: '1px solid rgba(10,186,181,0.22)',
}

const BENTO = [
  {
    icon: Zap,
    title: 'Responde en menos de 3 segundos',
    desc: 'Tu asistente IA contesta instantáneamente cada mensaje de WhatsApp. Cero espera, cero clientes perdidos.',
    size: 'large',
  },
  {
    icon: Clock,
    title: 'Atención 24/7',
    desc: 'Mientras duermes, WAAXP sigue vendiendo.',
    size: 'small',
  },
  {
    icon: FileText,
    title: 'Cotizaciones automáticas',
    desc: 'Genera presupuestos desde tu catálogo real.',
    size: 'small',
  },
  {
    icon: BarChart2,
    title: 'Analytics en tiempo real',
    desc: 'Métricas de ventas, conversión y rendimiento del bot actualizadas al instante.',
    size: 'medium',
  },
  {
    icon: Settings,
    title: 'Setup en 5 minutos',
    desc: 'Conecta y listo.',
    size: 'small',
  },
  {
    icon: UserCheck,
    title: 'Aprobación humana',
    desc: 'Tú decides qué respuestas interviene un humano antes de enviar.',
    size: 'small',
  },
  {
    icon: RefreshCw,
    title: 'Recupera ventas perdidas',
    desc: 'Follow-up automático a leads que no cerraron. El bot retoma en el momento ideal.',
    size: 'medium',
  },
  {
    icon: MessageSquare,
    title: 'Multiconversación',
    desc: 'Atiende cientos de clientes en simultáneo.',
    size: 'small',
  },
]

function GlassCard({
  feature,
  index,
  colClass,
}: {
  feature: typeof BENTO[0]
  index: number
  colClass: string
}) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 380, damping: 28 } }}
      className={`group relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-default ${colClass}`}
      style={GLASS_CARD}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, GLASS_CARD_HOVER)
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, GLASS_CARD)
      }}
    >
      {/* Inner refraction overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 45%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Top specular */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
        pointerEvents: 'none',
      }} />

      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(10,186,181,0.14) 0%, rgba(10,186,181,0.06) 100%)',
            border: '1px solid rgba(10,186,181,0.22)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <Icon className="w-5 h-5 text-[#0ABAB5]" strokeWidth={1.5} />
        </div>
        <h3
          className="font-semibold leading-snug mb-2"
          style={{
            color: '#0D1B2A',
            fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
            fontSize: feature.size === 'large' ? '1.2rem' : '0.95rem',
          }}
        >
          {feature.title}
        </h3>
      </div>

      <p className="relative text-sm leading-relaxed" style={{ color: '#5C6B7A' }}>
        {feature.desc}
      </p>
    </motion.div>
  )
}

export default function FeaturesGrid() {
  return (
    <section
      id="caracteristicas"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#F2FAFA', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}
    >
      {/* Background blobs for glass effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '10%', right: '-5%',
          width: '50%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.18) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-8%',
          width: '45%', height: '50%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.12) 0%, transparent 65%)',
          filter: 'blur(90px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '40%',
          width: '35%', height: '40%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,210,204,0.09) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(255,255,255,0.70)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(10,186,181,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>
              Características
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2
              className="font-display font-black leading-[1.06]"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#0D1B2A',
                fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                letterSpacing: '-0.025em',
                maxWidth: '560px',
              }}
            >
              Todo lo que necesitas para no perder ventas.
            </h2>
            <p className="text-sm leading-relaxed md:text-right max-w-xs" style={{ color: '#5C6B7A' }}>
              Herramientas diseñadas para PYMEs, no para ingenieros.
            </p>
          </div>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {BENTO.map((feature, i) => {
            const colClass =
              feature.size === 'large'
                ? 'md:col-span-2 md:row-span-2'
                : feature.size === 'medium'
                ? 'md:col-span-2'
                : ''
            return <GlassCard key={i} feature={feature} index={i} colClass={colClass} />
          })}
        </div>
      </div>
    </section>
  )
}
