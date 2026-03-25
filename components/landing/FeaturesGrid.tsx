'use client'

import { motion } from 'framer-motion'
import { Zap, Moon, FileText, BarChart2, Clock, Shield, Repeat, MessageSquare } from 'lucide-react'

const BENTO = [
  {
    icon: Zap,
    title: 'Responde en menos de 3 segundos',
    desc: 'Tu asistente IA contesta instantáneamente cada mensaje de WhatsApp. Cero tiempo de espera, cero clientes perdidos.',
    size: 'large',
    glow: false,
    accent: true,
  },
  {
    icon: Moon,
    title: 'Atención 24/7',
    desc: 'Mientras duermes, WAAXP sigue vendiendo.',
    size: 'small',
    glow: false,
    accent: false,
  },
  {
    icon: FileText,
    title: 'Cotizaciones automáticas',
    desc: 'Genera presupuestos desde tu catálogo real.',
    size: 'small',
    glow: true,
    accent: false,
  },
  {
    icon: BarChart2,
    title: 'Analytics en tiempo real',
    desc: 'Métricas de ventas, conversión y rendimiento del bot actualizadas al instante.',
    size: 'medium',
    glow: false,
    accent: false,
  },
  {
    icon: Clock,
    title: 'Setup en 5 minutos',
    desc: 'Conecta y listo.',
    size: 'small',
    glow: false,
    accent: false,
  },
  {
    icon: Shield,
    title: 'Aprobación humana',
    desc: 'Tú decides qué respuestas aprueba un humano antes de enviar.',
    size: 'small',
    glow: false,
    accent: false,
  },
  {
    icon: Repeat,
    title: 'Recupera ventas perdidas',
    desc: 'Follow-up automático a leads que no cerraron. El bot retoma la conversación en el momento ideal.',
    size: 'medium',
    glow: false,
    accent: false,
  },
  {
    icon: MessageSquare,
    title: 'Multiconversación',
    desc: 'Atiende cientos de clientes en simultáneo.',
    size: 'small',
    glow: false,
    accent: false,
  },
]

export default function FeaturesGrid() {
  return (
    <section id="caracteristicas" className="py-24 px-5 sm:px-8 bg-[#080C14] relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(10,186,181,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(10,186,181,0.04) 0%, transparent 60%)
          `,
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Características
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display font-extrabold text-white text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] max-w-xl">
              Todo lo que necesitas
              <br />
              para no perder ventas.
            </h2>
            <p className="text-white/30 text-base max-w-xs md:text-right leading-relaxed">
              Herramientas diseñadas para PYMEs,
              no para ingenieros.
            </p>
          </div>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {BENTO.map((feature, i) => {
            const Icon = feature.icon
            const colSpan =
              feature.size === 'large'
                ? 'md:col-span-2 md:row-span-2'
                : feature.size === 'medium'
                ? 'md:col-span-2'
                : ''

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                className={`group relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-default ${colSpan} transition-all duration-300 ${
                  feature.glow
                    ? 'bg-[#0ABAB5]/[0.08] border border-[#0ABAB5]/30 hover:border-[#0ABAB5]/50 hover:bg-[#0ABAB5]/[0.12] shadow-[0_0_40px_rgba(10,186,181,0.08)] hover:shadow-[0_0_60px_rgba(10,186,181,0.15)]'
                    : 'bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.13]'
                }`}
              >
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                {/* Teal glow for accent card */}
                {feature.accent && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#0ABAB5]/20 via-transparent to-transparent opacity-40" />
                )}

                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                    feature.glow
                      ? 'bg-[#0ABAB5]/20 border border-[#0ABAB5]/40'
                      : feature.accent
                      ? 'bg-[#0ABAB5]/15 border border-[#0ABAB5]/30 group-hover:bg-[#0ABAB5]/25'
                      : 'bg-white/[0.05] border border-white/[0.08] group-hover:bg-[#0ABAB5]/10 group-hover:border-[#0ABAB5]/20'
                  }`}>
                    <Icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        feature.glow || feature.accent ? 'text-[#0ABAB5]' : 'text-white/40 group-hover:text-[#0ABAB5]'
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className={`font-semibold leading-snug mb-2 text-white ${
                    feature.size === 'large' ? 'text-xl' : 'text-base'
                  }`}>
                    {feature.title}
                  </h3>
                </div>

                <p className="relative text-sm leading-relaxed text-white/40 group-hover:text-white/55 transition-colors duration-300">
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
