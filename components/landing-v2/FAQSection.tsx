'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const FAQS = [
  {
    q: '¿Necesito conocimientos técnicos para configurar WAAXP?',
    a: 'No. Todo el proceso es visual y en español. Conectas tu WhatsApp escaneando un QR, describes tu negocio y listo. No se requiere instalar nada ni escribir código.',
  },
  {
    q: '¿Mis clientes sabrán que están hablando con un bot?',
    a: 'Solo si quieres que lo sepan. LEVI está entrenado para conversar de forma natural. La mayoría de los negocios no lo revelan y sus clientes no lo perciben.',
  },
  {
    q: '¿Qué pasa si LEVI no sabe responder algo?',
    a: 'LEVI escala la conversación a un agente humano de tu equipo con todo el contexto del chat. Tú defines qué tipo de preguntas quieres manejar manualmente.',
  },
  {
    q: '¿Puedo usar mi número de WhatsApp Business actual?',
    a: 'Sí. WAAXP se conecta a tu número existente a través de la API de WhatsApp. No necesitas cambiar de número ni crear uno nuevo.',
  },
  {
    q: '¿Cuánto tiempo tarda en configurarse?',
    a: 'La mayoría de los negocios están activos en menos de 15 minutos. La configuración básica (catálogo, tono, horarios) es simple y guiada.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin contratos de permanencia, sin letra chica. Cancelas cuando quieras desde el panel. Los primeros 14 días son gratis sin tarjeta de crédito.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: '#080e18', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#0ABAB5' }}>FAQ</p>
          <h2 className="font-display font-black leading-[1.05]"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#F0F6FF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.03em',
            }}>
            Preguntas frecuentes.
          </h2>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: open === i ? '1px solid rgba(10,186,181,0.25)' : '1px solid rgba(255,255,255,0.06)',
                transition: 'border-color 0.2s ease',
              }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-sm pr-4" style={{ color: '#F0F6FF' }}>{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{
                    background: open === i ? 'rgba(10,186,181,0.15)' : 'rgba(255,255,255,0.05)',
                    border: open === i ? '1px solid rgba(10,186,181,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <Plus className="w-3.5 h-3.5" style={{ color: open === i ? '#0ABAB5' : 'rgba(240,246,255,0.50)' }} strokeWidth={2.5} />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(240,246,255,0.50)' }}>
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
