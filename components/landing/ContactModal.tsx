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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-2">
                Habla con nuestro equipo
              </h3>
              <p className="text-sm text-slate-500">
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
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20 transition-all"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20 transition-all"
                    placeholder="juan@empresa.cl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20 transition-all"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Mensaje
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20 transition-all resize-none"
                  placeholder="Cuéntanos sobre tu negocio..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0ABAB5] text-white font-bold rounded-xl text-sm hover:bg-[#089a96] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(10,186,181,0.35)] transition-all"
              >
                Enviar mensaje
              </button>

              <p className="text-xs text-center text-slate-400">
                Te responderemos en menos de 24 horas
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
