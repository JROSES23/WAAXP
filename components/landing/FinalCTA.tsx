'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'

interface FinalCTAProps {
  onContact: () => void
}

export default function FinalCTA({ onContact }: FinalCTAProps) {
  return (
    <section className="py-24 px-5 sm:px-8 bg-[#080C14] relative overflow-hidden border-t border-white/[0.04]">
      {/* Background orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 90% at 50% 130%, rgba(10,186,181,0.15) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 20% 0%, rgba(10,186,181,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 30% 30% at 80% 10%, rgba(10,186,181,0.04) 0%, transparent 55%)
          `,
        }}
      />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-pulse" />
            Comienza hoy
          </div>

          <h2
            className="font-display font-extrabold text-white leading-[0.95] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            ¿Listo para que tu
            <br />
            WhatsApp venda solo?
          </h2>

          <p className="text-white/40 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Únete a más de 340 PYMEs que ya automatizaron sus ventas.
            14 días gratis. Sin tarjeta. Sin compromisos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-[#0ABAB5] text-white font-semibold rounded-xl text-base transition-all duration-200 hover:-translate-y-px hover:shadow-[0_16px_40px_rgba(10,186,181,0.45)] active:scale-[0.98] "
            >
              <MessageCircle className="w-4.5 h-4.5" strokeWidth={2} />
              Activar mi asistente gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>

            <button
              onClick={onContact}
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-medium text-white/50 border border-white/[0.10] rounded-xl hover:bg-white/[0.06] hover:text-white hover:border-white/20 transition-all duration-200"
            >
              Hablar con ventas
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
