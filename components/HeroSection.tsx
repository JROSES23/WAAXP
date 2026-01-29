import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

interface HeroSectionProps {
  onOpenVideo: () => void
}

export default function HeroSection({ onOpenVideo }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D3557]/10 via-[#F1FAEE] to-[#0ABAB5]/5"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-[#2D3748] leading-tight mb-6">
              Automatiza tu WhatsApp y vende 24/7 sin contratar más vendedores
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Atiende cientos de clientes simultáneamente, genera cotizaciones automáticas y cierra ventas mientras duermes.
              Tu asistente IA trabaja sin descanso.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-[#0ABAB5] text-white font-bold rounded-lg hover:bg-[#089a96] hover:shadow-xl hover:shadow-[#0ABAB5]/30 transition-all text-center inline-block"
                >
                  Comenzar prueba gratuita
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenVideo}
                className="px-8 py-4 bg-white text-[#2D3748] font-bold rounded-lg border-2 border-slate-200 hover:border-[#0ABAB5] hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-[#0ABAB5]" />
                Ver demostración
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0ABAB5]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">14 días gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0ABAB5]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Datos protegidos</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0ABAB5]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Setup en 5 minutos</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/dashboard.png"
                alt="Dashboard Operly"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0ABAB5]/10 to-transparent pointer-events-none"></div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#0ABAB5] to-[#A8DADC] rounded-full blur-2xl opacity-50"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
