'use client'

import { motion } from 'framer-motion'
import { ScanLine, Sliders, Zap, ArrowDown } from 'lucide-react'

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
    <section id="como-funciona" className="py-24 px-5 sm:px-8 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-16 text-center"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/8 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Cómo funciona
          </span>
          <h2 className="font-display font-extrabold text-[#0A0A0F] text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] mb-4">
            De cero a ventas automáticas
            <br />
            en 5 minutos.
          </h2>
          <p className="text-[#6B7280] text-lg max-w-lg mx-auto">
            Sin código. Sin meses de implementación. Sin vendedor técnico.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-2xl mx-auto space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#0ABAB5]/30 hover:shadow-[0_8px_32px_rgba(10,186,181,0.08)] transition-all duration-300">
                  <div className="flex items-start gap-5">
                    {/* Number + Icon */}
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#0ABAB5]/8 border border-[#0ABAB5]/20 flex items-center justify-center group-hover:bg-[#0ABAB5]/14 transition-colors duration-300">
                        <Icon className="w-5 h-5 text-[#0ABAB5]" strokeWidth={1.75} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-[#0ABAB5] tracking-widest uppercase">{step.n}</span>
                        <h3 className="font-semibold text-[#0A0A0F] text-lg">{step.title}</h3>
                      </div>
                      <p className="text-[#6B7280] text-sm leading-relaxed mb-2">{step.desc}</p>
                      <p className="text-xs text-[#0ABAB5]/70 font-medium">{step.detail}</p>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-[#0ABAB5]/30" strokeWidth={2} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
