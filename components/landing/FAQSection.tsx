'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

const FAQS = [
  {
    q: '¿Cómo funciona la prueba gratuita?',
    a: 'Registras tu WhatsApp Business, configuras tu catálogo y empiezas a recibir mensajes. Sin tarjeta de crédito, sin compromisos. Después de 14 días, si quieres seguir, eliges un plan.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, puedes cancelar cuando quieras. No hay contratos ni permanencias. Si cancelas, tus datos se guardan por 30 días por si decides volver.',
  },
  {
    q: '¿Qué pasa si necesito más conversaciones?',
    a: 'Puedes cambiar de plan en cualquier momento desde tu panel. Si superas el límite del plan Starter, te avisamos para que hagas upgrade al Pro sin interrumpir el servicio.',
  },
  {
    q: '¿Es compatible con WhatsApp Business API?',
    a: 'Sí, WAAXP funciona con la API oficial de WhatsApp Business. Nosotros gestionamos toda la integración técnica por ti.',
  },
  {
    q: '¿Necesito conocimientos técnicos?',
    a: 'No. La interfaz está diseñada para vendedores, no programadores. Si sabes usar Gmail o Instagram, sabes usar WAAXP. El setup toma menos de 5 minutos.',
  },
  {
    q: '¿Cómo se entrena el asistente IA?',
    a: 'Subes tu catálogo de productos/servicios, defines el tono y prompt del bot, y el asistente aprende automáticamente. También mejora con cada conversación registrada.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-5 sm:px-8 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/8 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            FAQ
          </span>
          <h2 className="font-display font-extrabold text-[#0A0A0F] text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em]">
            Preguntas frecuentes.
          </h2>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden hover:border-[#0ABAB5]/25 transition-colors duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <h3 className="text-base font-semibold text-[#0A0A0F] pr-4">
                  {faq.q}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="shrink-0 w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2.5} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#F3F4F6] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
