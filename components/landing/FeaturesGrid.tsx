'use client'

import { motion } from 'framer-motion'
import { Zap, Moon, FileText, BarChart2, Clock, MessageSquare, Shield, Repeat } from 'lucide-react'

const BENTO = [
  {
    icon: Zap,
    title: 'Responde en menos de 3 segundos',
    desc: 'Tu asistente IA contesta instantáneamente cada mensaje de WhatsApp. Cero tiempo de espera, cero clientes perdidos.',
    size: 'large', // col-span-2 row-span-2
    accent: false,
  },
  {
    icon: Moon,
    title: 'Atención 24/7',
    desc: 'Mientras duermes, WAAXP sigue vendiendo.',
    size: 'small',
    accent: false,
  },
  {
    icon: FileText,
    title: 'Cotizaciones automáticas',
    desc: 'Genera presupuestos desde tu catálogo real.',
    size: 'small',
    accent: true,
  },
  {
    icon: BarChart2,
    title: 'Analytics en tiempo real',
    desc: 'Métricas de ventas, conversión y rendimiento del bot actualizadas al instante.',
    size: 'medium', // col-span-2
    accent: false,
  },
  {
    icon: Clock,
    title: 'Setup en 5 minutos',
    desc: 'Conecta y listo.',
    size: 'small',
    accent: false,
  },
  {
    icon: Shield,
    title: 'Aprobación humana',
    desc: 'Tú decides qué respuestas aprueba un humano antes de enviar.',
    size: 'small',
    accent: false,
  },
  {
    icon: Repeat,
    title: 'Recupera ventas perdidas',
    desc: 'Follow-up automático a leads que no cerraron. El bot retoma la conversación en el momento ideal.',
    size: 'medium',
    accent: false,
  },
  {
    icon: MessageSquare,
    title: 'Multiconversación',
    desc: 'Atiende cientos de clientes en simultáneo.',
    size: 'small',
    accent: false,
  },
]

export default function FeaturesGrid() {
  return (
    <section id="caracteristicas" className="py-24 px-5 sm:px-8 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/8 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Características
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display font-extrabold text-[#0A0A0F] text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] max-w-xl">
              Todo lo que necesitas
              <br />
              para no perder ventas.
            </h2>
            <p className="text-[#6B7280] text-base max-w-xs md:text-right">
              Herramientas diseñadas para PYMEs,
              no para ingenieros.
            </p>
          </div>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {BENTO.map((feature, i) => {
            const Icon = feature.icon
            const colSpan = feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : feature.size === 'medium' ? 'md:col-span-2' : ''

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                className={`group relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-default ${colSpan} ${
                  feature.accent
                    ? 'bg-[#0ABAB5] shadow-[0_8px_32px_rgba(10,186,181,0.25)]'
                    : 'bg-white border border-[#E5E7EB] hover:border-[#0ABAB5]/25 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]'
                } transition-all duration-300`}
              >
                {/* Accent glow for non-accent cards on hover */}
                {!feature.accent && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0ABAB5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    feature.accent
                      ? 'bg-white/20'
                      : 'bg-[#0ABAB5]/8 group-hover:bg-[#0ABAB5]/14 transition-colors duration-300'
                  }`}>
                    <Icon
                      className={`w-5 h-5 ${feature.accent ? 'text-white' : 'text-[#0ABAB5]'}`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className={`font-semibold text-base leading-snug mb-2 ${
                    feature.accent ? 'text-white' : 'text-[#0A0A0F]'
                  } ${feature.size === 'large' ? 'text-xl' : ''}`}>
                    {feature.title}
                  </h3>
                </div>

                <p className={`text-sm leading-relaxed ${
                  feature.accent ? 'text-white/75' : 'text-[#6B7280]'
                }`}>
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
