'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, TrendingDown, Users } from 'lucide-react'

const PROBLEMS = [
  {
    icon: Clock,
    stat: '73%',
    label: 'de los clientes espera respuesta en menos de 5 minutos.',
    emphasis: 'Tú tardas horas.',
  },
  {
    icon: TrendingDown,
    stat: '$480M',
    label: 'CLP al año se pierden en PYMEs chilenas por no responder a tiempo en WhatsApp.',
    emphasis: 'Tu competencia sí responde.',
  },
  {
    icon: Users,
    stat: '6 de 10',
    label: 'clientes que no reciben respuesta rápida compran donde sí los atienden.',
    emphasis: 'Sin excusas.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-[#080C14] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[360px_1fr] gap-16 items-start">
          {/* Left: Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:sticky lg:top-28"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">El problema</span>
            </div>
            <h2 className="font-display font-extrabold text-white text-4xl md:text-[2.75rem] leading-[1.05] tracking-[-0.03em] mb-5">
              Cada mensaje
              <br />
              sin responder
              <br />
              <span className="text-white/30">es una venta perdida.</span>
            </h2>
            <p className="text-white/40 text-base leading-relaxed">
              No es falta de clientes. Es que no puedes atender
              100 conversaciones al mismo tiempo.
            </p>
          </motion.div>

          {/* Right: Stats */}
          <div className="space-y-4">
            {PROBLEMS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-5">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white/30" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-display font-extrabold text-3xl text-white tracking-[-0.04em] mb-1">
                        {p.stat}
                      </p>
                      <p className="text-sm text-white/40 leading-relaxed">
                        {p.label}{' '}
                        <span className="text-red-400 font-semibold">{p.emphasis}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
