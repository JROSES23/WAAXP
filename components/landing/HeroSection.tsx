'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, CheckCircle2, MessageCircle, Bot, TrendingUp, Clock } from 'lucide-react'

interface HeroSectionProps {
  onOpenVideo: () => void
}

const STATS = [
  { value: '+340', label: 'PYMEs activas' },
  { value: '94%', label: 'Respuesta automática' },
  { value: '3 seg', label: 'Tiempo de respuesta' },
]

const CHAT_PREVIEW = [
  { role: 'user', text: 'Hola! tienen el vestido negro talla M disponible?' },
  { role: 'bot',  text: 'Hola Sofía! Sí, tenemos el Vestido Milano en talla M a $29.990. ¿Te lo reservo?' },
  { role: 'user', text: 'Perfecto, cuánto demora el envío?' },
  { role: 'bot',  text: 'Envío express en 24-48h a todo Chile. ¿Quieres que genere tu pedido ahora?' },
]

export default function HeroSection({ onOpenVideo }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080C14]">
      {/* Background ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 10% 50%, rgba(10,186,181,0.10) 0%, transparent 70%),
              radial-gradient(ellipse 50% 50% at 90% 70%, rgba(10,186,181,0.05) 0%, transparent 60%),
              radial-gradient(ellipse 80% 40% at 50% 100%, rgba(6,78,74,0.15) 0%, transparent 60%)
            `,
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full pt-24 pb-16 lg:py-0">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center min-h-screen lg:min-h-0 lg:py-28">

          {/* Left: Content */}
          <div className="space-y-8">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0ABAB5]/25 bg-[#0ABAB5]/8 text-[#0ABAB5] text-xs font-semibold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-pulse" />
                Agente IA para WhatsApp
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1
                className="font-display font-extrabold text-white leading-[0.95] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
              >
                Tu negocio
                <br />
                vende mientras
                <br />
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #0ABAB5 0%, #14d4ce 60%, #0ABAB5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  duermes.
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-lg text-white/50 max-w-md leading-relaxed"
            >
              WAAXP atiende, cotiza y cierra ventas por WhatsApp 24/7.
              Para PYMEs que no quieren perder ni un cliente.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#0ABAB5] text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(10,186,181,0.4)] active:scale-[0.98] animate-glow-pulse"
              >
                Activar gratis
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>

              <button
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-white/60 border border-white/10 rounded-xl hover:bg-white/[0.06] hover:text-white hover:border-white/20 transition-all duration-200"
              >
                <div className="w-5 h-5 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-[#0ABAB5]" fill="currentColor" />
                </div>
                Ver demo en vivo
              </button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.56 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {[
                'Sin tarjeta de crédito',
                'Setup en 5 minutos',
                'Cancela cuando quieras',
              ].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5 text-xs text-white/35 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0ABAB5]/70" strokeWidth={2} />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.66 }}
              className="flex items-center gap-6 pt-2"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-display font-extrabold text-2xl text-white tracking-[-0.03em]">
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/35 font-medium mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: WhatsApp Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 -m-8 rounded-3xl bg-[#0ABAB5]/6 blur-3xl pointer-events-none" />

            {/* Chat card */}
            <div className="relative rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
              {/* WhatsApp header */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.04] border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center border border-[#0ABAB5]/30">
                  <Bot className="w-4.5 h-4.5 text-[#0ABAB5]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">WAAXP Bot</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs text-white/40">En línea · responde en segundos</p>
                  </div>
                </div>
                <MessageCircle className="w-4 h-4 text-[#0ABAB5] ml-auto opacity-60" strokeWidth={1.5} />
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[240px]">
                {CHAT_PREVIEW.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + i * 0.18 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${
                        msg.role === 'user'
                          ? 'bg-[#0ABAB5] text-white rounded-tr-sm'
                          : 'bg-white/[0.08] text-white/80 rounded-tl-sm border border-white/[0.06]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.65 }}
                className="px-4 pb-4"
              >
                <div className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white/[0.06] border border-white/[0.06]">
                  <span className="text-xs text-white/30 mr-1">WAAXP escribe</span>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-[#0ABAB5]/60 animate-bounce"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 1.2 }}
              className="absolute -top-4 -right-4 bg-white/[0.07] backdrop-blur-sm border border-white/[0.1] rounded-xl px-3 py-2 flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#0ABAB5]" strokeWidth={2} />
              <span className="text-xs font-semibold text-white">+62% ventas</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 1.35 }}
              className="absolute -bottom-4 -left-4 bg-white/[0.07] backdrop-blur-sm border border-white/[0.1] rounded-xl px-3 py-2 flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#0ABAB5]" strokeWidth={2} />
              <span className="text-xs font-semibold text-white">Respuesta: 2.8s</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
