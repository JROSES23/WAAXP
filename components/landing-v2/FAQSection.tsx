'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const CUSTOM_EASE = [0.25, 0.46, 0.45, 0.94] as const

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: '¿Necesito una cuenta de WhatsApp Business?',
    answer:
      'No, funciona con cualquier número de WhatsApp. Recomendamos usar WhatsApp Business para acceder a funciones adicionales, pero no es obligatorio para comenzar.',
  },
  {
    question: '¿Cuánto tiempo toma configurarlo?',
    answer:
      'Menos de 15 minutos. Solo escaneas el QR con tu teléfono y configuras el bot desde nuestro dashboard. No necesitas saber de tecnología.',
  },
  {
    question: '¿Qué pasa si el bot no sabe responder algo?',
    answer:
      'WAAXP lo escala a un humano automáticamente. Tú decides qué conversaciones intervenir desde el inbox del dashboard. El bot te notifica cuando necesita ayuda.',
  },
  {
    question: '¿Mis clientes sabrán que es un bot?',
    answer:
      'Solo si tú quieres. Puedes configurarlo para que se presente como tu asistente con nombre propio. Muchos clientes nunca se dan cuenta — lo que importa es que reciben respuesta inmediata.',
  },
  {
    question: '¿Puedo probar antes de pagar?',
    answer:
      'Sí. El plan Starter es completamente gratuito y no requiere tarjeta de crédito. Tienes 100 conversaciones al mes para probar todo.',
  },
  {
    question: '¿Qué pasa con mis datos?',
    answer:
      'Tus conversaciones son privadas y cifradas en tránsito y en reposo. Cumplimos con la Ley 19.628 chilena de protección de datos personales. Nunca vendemos tu información.',
  },
]

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null)

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section
      id="faq"
      style={{
        background: '#FFFFFF',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: CUSTOM_EASE }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#0ABAB5' }}
          >
            FAQ
          </p>
          <h2
            className="font-display font-black"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              color: '#0D1B2A',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            Preguntas frecuentes
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openId === i

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: CUSTOM_EASE }}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: isOpen
                    ? '1px solid rgba(10,186,181,0.30)'
                    : '1px solid rgba(0,0,0,0.08)',
                  borderLeft: isOpen ? '2px solid #0ABAB5' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                  style={{
                    background: isOpen ? 'rgba(237,250,250,0.5)' : '#FFFFFF',
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    className="font-semibold text-sm leading-snug"
                    style={{ color: isOpen ? '#0ABAB5' : '#0D1B2A' }}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: CUSTOM_EASE }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      strokeWidth={1.5}
                      style={{ color: isOpen ? '#0ABAB5' : '#5C6B7A' }}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: CUSTOM_EASE }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="px-6 pb-5 text-sm leading-relaxed"
                        style={{
                          color: '#5C6B7A',
                          background: 'rgba(237,250,250,0.3)',
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
