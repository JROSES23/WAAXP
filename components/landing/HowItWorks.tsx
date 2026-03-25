'use client'

import { motion } from 'framer-motion'
import { ScanLine, Sliders, Zap } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    icon: ScanLine,
    title: 'Conecta tu WhatsApp',
    desc: 'Escanea un QR desde el panel. Sin APIs complejas, sin esperas. Listo en menos de 2 minutos.',
    detail: 'Compatible con WhatsApp Business y número personal',
  },
  {
    n: '02',
    icon: Sliders,
    title: 'Configura tu negocio',
    desc: 'Sube tu catálogo, define el tono del bot y el prompt. WAAXP aprende de tus productos y tu estilo.',
    detail: 'El asistente se adapta a retail, salud, restaurantes, servicios y más',
  },
  {
    n: '03',
    icon: Zap,
    title: 'Vende mientras duermes',
    desc: 'Tu asistente responde, cotiza y cierra ventas en tiempo real. Tú solo revisas lo que necesita tu atención.',
    detail: 'Inbox híbrido: la IA maneja el 94%, tú supervisas el 6%',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-5 sm:px-8 bg-[#080C14] relative overflow-hidden border-t border-white/[0.04]">
      {/* Atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 70% at 50% 50%, rgba(10,186,181,0.05) 0%, transparent 65%)`,
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-16 text-center"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Cómo funciona
          </span>
          <h2 className="font-display font-extrabold text-white text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] mb-4">
            De cero a ventas automáticas
            <br />
            en 5 minutos.
          </h2>
          <p className="text-white/35 text-lg max-w-lg mx-auto">
            Sin código. Sin meses de implementación. Sin vendedor técnico.
          </p>
        </motion.div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 relative">
          {/* Connector line desktop */}
          <div className="hidden md:block absolute top-[2.75rem] left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-px bg-gradient-to-r from-transparent via-[#0ABAB5]/30 to-transparent" />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group relative"
              >
                {/* Step number indicator */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/30 flex items-center justify-center group-hover:bg-[#0ABAB5]/20 group-hover:border-[#0ABAB5]/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(10,186,181,0.2)]">
                      <Icon className="w-5 h-5 text-[#0ABAB5]" strokeWidth={1.5} />
                    </div>
                    {/* Step number badge */}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#080C14] border border-[#0ABAB5]/40 flex items-center justify-center text-[9px] font-black text-[#0ABAB5] tracking-wider">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0ABAB5]/60 tracking-widest uppercase">{step.n}</span>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 group-hover:bg-white/[0.05] group-hover:border-[#0ABAB5]/20 transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(10,186,181,0.06)]">
                  <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-3 group-hover:text-white/55 transition-colors duration-300">
                    {step.desc}
                  </p>
                  <p className="text-xs text-[#0ABAB5]/60 font-medium leading-snug">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
