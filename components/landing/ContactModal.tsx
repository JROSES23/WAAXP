'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone } from 'lucide-react'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.7)] p-8 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(40px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Teal glow top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#0ABAB5]/50 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-pulse" />
                Contactar ventas
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                Habla con nuestro equipo
              </h3>
              <p className="text-sm text-white/40">
                Cuéntanos sobre tu negocio y te ayudaremos a encontrar la mejor solución
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                onClose()
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.10] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0ABAB5]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#0ABAB5]/15 transition-all"
                  placeholder="Sofía Herrera"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/[0.10] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0ABAB5]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#0ABAB5]/15 transition-all"
                    placeholder="sofia@empresa.cl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" strokeWidth={1.5} />
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/[0.10] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0ABAB5]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#0ABAB5]/15 transition-all"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">
                  Mensaje
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.10] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0ABAB5]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#0ABAB5]/15 transition-all resize-none"
                  placeholder="Cuéntanos sobre tu negocio..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0ABAB5] text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(10,186,181,0.4)] transition-all duration-200"
              >
                Enviar mensaje
              </button>

              <p className="text-xs text-center text-white/25">
                Te responderemos en menos de 24 horas
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
