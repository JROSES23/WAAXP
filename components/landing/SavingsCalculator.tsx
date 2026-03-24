'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign } from 'lucide-react'

export default function SavingsCalculator() {
  const [conversations, setConversations] = useState(150)
  const [closeRate, setCloseRate] = useState(30)
  const [avgTicket, setAvgTicket] = useState(25000)

  const monthlyRevenue = Math.round(conversations * (closeRate / 100) * avgTicket)
  const waaxpPlanCost = 19990
  const roi = Math.round(((monthlyRevenue - waaxpPlanCost) / waaxpPlanCost) * 100)

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')}`

  return (
    <section className="py-24 px-5 sm:px-8 bg-[#080C14]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Calcula tu ROI
          </span>
          <h2 className="font-display font-extrabold text-white text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] mb-4">
            ¿Cuánto ganas
            <br />
            automatizando?
          </h2>
          <p className="text-white/40 text-base">
            Mueve los sliders y descubre tu potencial con WAAXP.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden"
        >
          <div className="grid md:grid-cols-[1fr_340px]">
            {/* Sliders */}
            <div className="p-8 space-y-8 border-b md:border-b-0 md:border-r border-white/[0.06]">
              {[
                {
                  label: 'Conversaciones de WhatsApp por mes',
                  value: conversations,
                  min: 20, max: 1000, step: 10,
                  onChange: (v: number) => setConversations(v),
                  display: conversations.toString(),
                },
                {
                  label: 'Tasa de cierre estimada',
                  value: closeRate,
                  min: 5, max: 80, step: 1,
                  onChange: (v: number) => setCloseRate(v),
                  display: `${closeRate}%`,
                },
                {
                  label: 'Ticket promedio por venta',
                  value: avgTicket,
                  min: 3000, max: 500000, step: 1000,
                  onChange: (v: number) => setAvgTicket(v),
                  display: formatCLP(avgTicket),
                },
              ].map((slider) => (
                <div key={slider.label}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-white/50 font-medium">{slider.label}</label>
                    <span className="text-sm font-bold text-white font-display">{slider.display}</span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => slider.onChange(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #0ABAB5 0%, #0ABAB5 ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, rgba(255,255,255,0.1) ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Result */}
            <div className="p-8 flex flex-col justify-center">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Ingreso potencial mensual</p>
              <motion.p
                key={monthlyRevenue}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="font-display font-extrabold text-4xl text-white tracking-[-0.04em] mb-1"
              >
                {formatCLP(monthlyRevenue)}
              </motion.p>
              <p className="text-xs text-white/30 mb-8">CLP / mes estimado</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-white/25" strokeWidth={1.5} />
                    <span className="text-xs text-white/40">Costo plan Pro</span>
                  </div>
                  <span className="text-sm font-semibold text-white/60">{formatCLP(waaxpPlanCost)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0ABAB5]" strokeWidth={1.5} />
                    <span className="text-xs text-white/40">ROI estimado</span>
                  </div>
                  <span className={`text-sm font-bold ${roi > 0 ? 'text-[#0ABAB5]' : 'text-white/40'}`}>
                    {roi > 0 ? `+${roi.toLocaleString('es-CL')}%` : `${roi}%`}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-white/20 mt-6 leading-relaxed">
                * Estimación basada en tus datos. Resultados reales pueden variar.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
