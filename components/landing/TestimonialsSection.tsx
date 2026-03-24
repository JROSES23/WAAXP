'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    name: 'Camila Reyes',
    business: 'Tienda de ropa · Santiago',
    initials: 'CR',
    color: '#0ABAB5',
    stat: '+350%',
    statLabel: 'más ventas en 60 días',
    quote: 'Antes perdía el 40% de las consultas por WhatsApp porque no alcanzaba a responder. Con WAAXP, pasé de 10 a 45 ventas al mes sin contratar a nadie.',
  },
  {
    name: 'Rodrigo Muñoz',
    business: 'Peluquería Premium · Concepción',
    initials: 'RM',
    color: '#8B5CF6',
    stat: '100%',
    statLabel: 'agenda llena cada semana',
    quote: 'Mis clientes ahora agendan solos a las 2 de la mañana. El bot les confirma hora, les manda recordatorio y yo llego a trabajar con la agenda llena.',
  },
  {
    name: 'Valentina Soto',
    business: 'E-commerce accesorios · Online',
    initials: 'VS',
    color: '#F59E0B',
    stat: '+60%',
    statLabel: 'de ventas en el primer mes',
    quote: 'El ROI fue inmediato. En el primer mes recuperé carritos abandonados y las ventas subieron 60%. El bot responde mejor que mi vendedora anterior.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/8 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Casos reales
          </span>
          <h2 className="font-display font-extrabold text-[#0A0A0F] text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] max-w-2xl">
            PYMEs que dejaron de perder ventas.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 28 } }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#0ABAB5]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col"
            >
              {/* Stat */}
              <div className="mb-5">
                <p className="font-display font-extrabold text-3xl tracking-[-0.04em]" style={{ color: t.color }}>
                  {t.stat}
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">{t.statLabel}</p>
              </div>

              {/* Quote */}
              <p className="text-sm text-[#374151] leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-[#F3F4F6]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0F]">{t.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{t.business}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
