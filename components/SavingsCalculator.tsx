import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp } from 'lucide-react'

interface RoiInputs {
  mensajes: number
  precio: number
}

interface SavingsCalculatorProps {
  roiInputs: RoiInputs
  onChange: (next: RoiInputs) => void
  tiempoAhorrado: number
  ahorroMensual: number
  ventasExtras: number
}

export default function SavingsCalculator({
  roiInputs,
  onChange,
  tiempoAhorrado,
  ahorroMensual,
  ventasExtras,
}: SavingsCalculatorProps) {
  return (
    <section id="como-funciona" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
            Calcula tu ahorro con Operly
          </h2>
          <p className="text-xl text-slate-600">
            Descubre cuánto tiempo y dinero puedes ahorrar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#F1FAEE] to-white rounded-2xl p-8 lg:p-12 border-2 border-[#0ABAB5]/20 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                Mensajes atendidos por día
              </label>
              <input
                type="number"
                value={roiInputs.mensajes}
                onChange={(e) => onChange({ ...roiInputs, mensajes: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 focus:border-[#0ABAB5] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                Ticket promedio por venta (CLP)
              </label>
              <input
                type="number"
                value={roiInputs.precio}
                onChange={(e) => onChange({ ...roiInputs, precio: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 focus:border-[#0ABAB5] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                label: 'Tiempo ahorrado por día',
                value: `${tiempoAhorrado}h`,
                icon: Clock,
                color: 'from-[#0ABAB5] to-[#A8DADC]',
              },
              {
                label: 'Ahorro mensual vs vendedor',
                value: `$${ahorroMensual.toLocaleString()}`,
                icon: DollarSign,
                color: 'from-[#1D3557] to-[#2D3748]',
              },
              {
                label: 'Ventas extras al mes',
                value: `$${ventasExtras.toLocaleString()}`,
                icon: TrendingUp,
                color: 'from-[#A8DADC] to-[#0ABAB5]',
              },
            ].map((metric, i) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${metric.color} p-6 rounded-xl text-white text-center shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <p className="text-sm opacity-90 mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
