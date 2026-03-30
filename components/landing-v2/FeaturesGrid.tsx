'use client'

import { motion } from 'framer-motion'
import {
  MessageSquare, BarChart3, Users, Cpu, Clock, Globe,
} from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

// Mock chat bubbles for the main feature card
const SAMPLE_MSGS = [
  { text: 'Hola, tienen el modelo X200?', from: 'client' },
  { text: 'Sí, lo tenemos en stock. Te lo envío en 24h por $45.990.', from: 'levi' },
  { text: 'Perfecto, agendo la entrega para mañana.', from: 'levi' },
]

export default function FeaturesGrid() {
  return (
    <section id="funciones" className="relative py-24 overflow-hidden"
      style={{ background: '#080e18', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '-5%', right: '-5%',
          width: '55%', height: '50%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.08) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0ABAB5' }}>Funciones</p>
          <h2 className="font-display font-black leading-[1.05] max-w-xl"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#F0F6FF',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.03em',
            }}>
            Todo lo que tu equipo de ventas necesita.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4">

          {/* Card 1: Big — "IA conversacional" col-span-7 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="col-span-12 lg:col-span-7 rounded-2xl p-6 overflow-hidden relative"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              minHeight: '280px',
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 20%, rgba(10,186,181,0.08) 0%, transparent 60%)' }} />
            <div className="flex items-center gap-3 mb-5 relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(10,186,181,0.12)', border: '1px solid rgba(10,186,181,0.2)' }}>
                <MessageSquare className="w-5 h-5" style={{ color: '#0ABAB5' }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-base" style={{ color: '#F0F6FF', fontFamily: 'var(--font-display)' }}>IA conversacional</h3>
                <p className="text-xs" style={{ color: 'rgba(240,246,255,0.40)' }}>Responde como un humano</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 relative">
              {SAMPLE_MSGS.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: msg.from === 'client' ? 12 : -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.12, ease: EASE }}
                  className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                    style={msg.from === 'client'
                      ? { background: 'rgba(255,255,255,0.07)', color: 'rgba(240,246,255,0.80)', border: '1px solid rgba(255,255,255,0.07)', borderBottomRightRadius: 4 }
                      : { background: 'rgba(10,186,181,0.12)', color: 'rgba(240,246,255,0.85)', border: '1px solid rgba(10,186,181,0.2)', borderBottomLeftRadius: 4 }
                    }>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: "Disponible 24/7" col-span-5 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="col-span-12 lg:col-span-5 rounded-2xl p-6 relative overflow-hidden flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              minHeight: '280px',
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 70%, rgba(10,186,181,0.10) 0%, transparent 60%)' }} />
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(10,186,181,0.12)', border: '1px solid rgba(10,186,181,0.2)' }}>
                <Clock className="w-5 h-5" style={{ color: '#0ABAB5' }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-base" style={{ color: '#F0F6FF', fontFamily: 'var(--font-display)' }}>Disponible 24/7</h3>
                <p className="text-xs" style={{ color: 'rgba(240,246,255,0.40)' }}>Sin días libres</p>
              </div>
            </div>
            {/* Clock visual */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full animate-[glow-pulse_3s_ease-in-out_infinite]"
                  style={{ border: '2px solid rgba(10,186,181,0.3)' }} />
                <div className="absolute inset-2 rounded-full"
                  style={{ border: '1px solid rgba(10,186,181,0.15)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-black text-2xl" style={{ color: '#0ABAB5', fontFamily: 'var(--font-display)' }}>24/7</span>
                </div>
              </div>
            </div>
            <p className="text-sm mt-4 relative" style={{ color: 'rgba(240,246,255,0.45)' }}>
              LEVI nunca duerme, nunca toma vacaciones, nunca está ocupado.
            </p>
          </motion.div>

          {/* Row 2: Three small cards */}
          {[
            {
              icon: Users, title: 'CRM integrado', desc: 'Historial completo de cada cliente. Leads calificados automáticamente.', delay: 0,
            },
            {
              icon: Cpu, title: 'Aprende tu negocio', desc: 'Le enseñas una vez, recuerda para siempre. Catálogo, precios y políticas.', delay: 0.08,
            },
            {
              icon: BarChart3, title: 'Analytics en tiempo real', desc: 'Métricas de conversaciones, tasa de cierre y revenue en un solo lugar.', delay: 0.16,
            },
          ].map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 + card.delay, ease: EASE }}
                className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-2xl p-6 relative overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'border-color 0.3s ease, background 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(10,186,181,0.25)'
                  e.currentTarget.style.background = 'rgba(10,186,181,0.04)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(10,186,181,0.10)', border: '1px solid rgba(10,186,181,0.18)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#0ABAB5' }} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#F0F6FF', fontFamily: 'var(--font-display)' }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,246,255,0.45)' }}>
                  {card.desc}
                </p>
              </motion.div>
            )
          })}

          {/* Full-width card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
            className="col-span-12 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10,186,181,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(10,186,181,0.15)',
            }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(10,186,181,0.15)', border: '1px solid rgba(10,186,181,0.25)' }}>
                  <Globe className="w-6 h-6" style={{ color: '#0ABAB5' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: '#F0F6FF', fontFamily: 'var(--font-display)' }}>
                    Inbox híbrido: IA + humano
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(240,246,255,0.50)' }}>
                    LEVI maneja el 94% solo. Los casos complejos los escala a tu equipo con todo el contexto listo.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                {['Auto', 'Equipo', 'Cerrado'].map((label, i) => (
                  <div key={label} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={i === 0
                      ? { background: 'rgba(10,186,181,0.15)', color: '#0ABAB5', border: '1px solid rgba(10,186,181,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(240,246,255,0.40)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
