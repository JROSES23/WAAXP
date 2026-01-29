import Image from 'next/image'
import { motion } from 'framer-motion'
import { BarChart3, MessageSquare, Sparkles, Zap } from 'lucide-react'

export default function DashboardPreview() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Un panel que lo controla todo
            </h2>
            <p className="text-xl text-slate-600">
              Interfaz intuitiva diseñada para vendedores, no programadores
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src="/images/dashboard.png"
                alt="Panel de Control Operly"
                width={1200}
                height={800}
                className="w-full h-auto"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557]/20 via-transparent to-transparent pointer-events-none"></div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200"
              >
                <p className="text-sm font-bold text-[#0ABAB5] inline-flex items-center gap-2">
                  <Sparkles className="h-6 w-6" strokeWidth={2} />
                  Vista en tiempo real
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: BarChart3, title: 'Analytics detallados', desc: 'Métricas en vivo' },
                { icon: MessageSquare, title: 'IA integrada', desc: 'Respuestas automáticas' },
                { icon: Zap, title: 'Súper rápido', desc: 'Carga instantánea' },
              ].map((feat, i) => {
                const Icon = feat.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-white/90 p-4 rounded-xl border border-slate-200 hover:border-[#0ABAB5] transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-[#0ABAB5]">
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h4 className="font-bold text-[#2D3748] text-sm mb-1">{feat.title}</h4>
                    <p className="text-xs text-slate-600">{feat.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
