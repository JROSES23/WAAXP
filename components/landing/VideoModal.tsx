'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Play } from 'lucide-react'
import Link from 'next/link'

interface VideoModalProps {
  open: boolean
  onClose: () => void
}

export default function VideoModal({ open, onClose }: VideoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              aria-label="Cerrar video"
            >
              <X className="w-7 h-7" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="aspect-video bg-[#0A0A0A] rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center mx-auto mb-5">
                    <Play className="w-10 h-10 text-[#0ABAB5]" />
                  </div>
                  <p className="text-lg font-semibold mb-2">Video demo próximamente</p>
                  <p className="text-sm text-white/40 mb-6">
                    Por ahora puedes probar el producto gratis
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-3 bg-[#0ABAB5] text-white font-semibold rounded-xl text-sm hover:bg-[#089a96] transition-colors"
                  >
                    Probar gratis
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
