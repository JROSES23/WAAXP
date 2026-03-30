'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, CheckCircle2 } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

// Chat conversation sequence
const CHAT_SEQUENCE = [
  { id: 1, from: 'client' as const, text: 'Hola! tienen zapatillas Nike Air Max?', delay: 800 },
  { id: 2, from: 'levi' as const, text: 'Hola! Sí, tenemos Air Max 270 en negro, blanco y gris. Tallas 38–45. ¿Cuál buscas?', delay: 2400 },
  { id: 3, from: 'client' as const, text: 'La blanca talla 42. Cuánto cuesta?', delay: 4800 },
  { id: 4, from: 'levi' as const, text: '$89.990 CLP. Stock disponible. ¿Te la reservo con tu nombre?', delay: 6400 },
  { id: 5, from: 'client' as const, text: 'Sí! Me llamo Diego Contreras', delay: 8800 },
  { id: 6, from: 'levi' as const, text: 'Perfecto Diego. Te envío el link de pago por Webpay ahora.', delay: 10400 },
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm w-fit"
      style={{ background: 'rgba(10,186,181,0.12)', border: '1px solid rgba(10,186,181,0.2)' }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]"
          style={{ background: '#0ABAB5', animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  )
}

// ShimmerButton inline
function ShimmerBtn({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  return (
    <Link href={href}
      className={`group relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/[0.12] px-6 py-3.5 font-semibold text-white [border-radius:14px] ${className ?? ''}`}
      style={{ '--speed': '3s', '--bg': 'rgba(10,186,181,0.15)' } as React.CSSProperties}
    >
      <div className="absolute inset-0 overflow-visible [container-type:size] z-0">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none] blur-[3px]">
          <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(90deg*0.5)),transparent_0,rgba(10,186,181,0.9)_90deg,transparent_90deg)]" />
        </div>
      </div>
      <div className="absolute inset-[1px] rounded-[13px] z-0" style={{ background: 'rgba(6,10,16,0.85)' }} />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  )
}

export default function HeroSection({ onOpenVideo }: { onOpenVideo?: () => void }) {
  const [messages, setMessages] = useState<typeof CHAT_SEQUENCE>([])
  const [typing, setTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const startSequence = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setMessages([])
    setTyping(false)

    CHAT_SEQUENCE.forEach((msg) => {
      if (msg.from === 'levi') {
        const typingDelay = msg.delay - 1100
        const t1 = setTimeout(() => setTyping(true), typingDelay)
        timeoutsRef.current.push(t1)
      }
      const t2 = setTimeout(() => {
        setTyping(false)
        setMessages(prev => [...prev, msg])
      }, msg.delay)
      timeoutsRef.current.push(t2)
    })

    const last = CHAT_SEQUENCE[CHAT_SEQUENCE.length - 1]
    const restartTimer = setTimeout(() => startSequence(), last.delay + 4000)
    timeoutsRef.current.push(restartTimer)
  }

  useEffect(() => {
    startSequence()
    return () => timeoutsRef.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, typing])

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: '#060a10',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      {/* Radial glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60%', height: '80%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: '50%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 lg:py-0">
        <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* LEFT: Editorial */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: 'rgba(10,186,181,0.08)',
                border: '1px solid rgba(10,186,181,0.25)',
              }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#0ABAB5' }} strokeWidth={2} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>
                IA para WhatsApp Business
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-black leading-[0.95] mb-6"
              style={{
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                letterSpacing: '-0.04em',
                fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                color: '#F0F6FF',
              }}
            >
              Vende más.
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #0ABAB5 0%, #2dd4bf 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Sin contratar
              </span>
              <br />
              a nadie más.
            </h1>

            {/* Sub */}
            <p className="text-base sm:text-lg leading-relaxed mb-10 max-w-lg"
              style={{ color: 'rgba(240,246,255,0.55)', fontWeight: 400 }}>
              LEVI aprende tu negocio, atiende clientes por WhatsApp 24/7, califica leads y cierra ventas — automáticamente.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <ShimmerBtn href="/login" className="text-sm">
                Empezar gratis
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </ShimmerBtn>
              <button
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] text-sm font-semibold transition-colors duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(240,246,255,0.75)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = '#F0F6FF'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(240,246,255,0.75)'
                }}>
                Ver demo
              </button>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                '340+ negocios activos',
                '$4.2B CLP procesados',
                '94% automatización',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#0ABAB5' }} strokeWidth={2} />
                  <span className="text-sm" style={{ color: 'rgba(240,246,255,0.50)' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Animated chat */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="relative"
          >
            {/* Floating response time badge */}
            <div className="absolute -top-4 -right-2 lg:-right-6 z-20 px-3 py-2 rounded-2xl text-xs font-semibold"
              style={{
                background: 'rgba(6,10,16,0.9)',
                border: '1px solid rgba(10,186,181,0.3)',
                color: '#0ABAB5',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 20px rgba(10,186,181,0.2)',
              }}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-pulse" />
                Responde en &lt;3s
              </div>
            </div>

            {/* Chat widget */}
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(24px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(10,186,181,0.08)',
              }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg, #0ABAB5, #079490)', color: '#fff' }}>
                  L
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#F0F6FF' }}>LEVI</div>
                  <div className="text-xs flex items-center gap-1.5" style={{ color: '#0ABAB5' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
                    Asistente activo
                  </div>
                </div>
                {/* macOS dots */}
                <div className="ml-auto flex gap-1.5">
                  {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full opacity-60" style={{ background: c }} />
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="flex flex-col gap-2.5 p-4 overflow-y-auto"
                style={{ height: '320px', scrollBehavior: 'smooth' }}>
                <AnimatePresence>
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'client'
                          ? 'rounded-br-sm'
                          : 'rounded-bl-sm'
                      }`}
                        style={msg.from === 'client'
                          ? {
                              background: 'rgba(255,255,255,0.08)',
                              color: 'rgba(240,246,255,0.90)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }
                          : {
                              background: 'rgba(10,186,181,0.12)',
                              color: 'rgba(240,246,255,0.90)',
                              border: '1px solid rgba(10,186,181,0.25)',
                            }
                        }>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {typing && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-start"
                    >
                      <TypingDots />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mock input bar */}
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex-1 px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(240,246,255,0.30)',
                  }}>
                  Escribe un mensaje...
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#0ABAB5' }}>
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-4 -left-4 lg:-left-8 px-4 py-3 rounded-2xl z-20"
              style={{
                background: 'rgba(6,10,16,0.90)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
              <div className="text-2xl font-black" style={{ color: '#0ABAB5', fontFamily: 'var(--font-display)' }}>94%</div>
              <div className="text-xs" style={{ color: 'rgba(240,246,255,0.50)' }}>conversaciones resueltas</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
