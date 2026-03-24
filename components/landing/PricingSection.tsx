'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Zap, Building2, Sparkles } from 'lucide-react'

const PLANS = [
  {
    icon: Zap,
    name: 'Starter',
    price: 'Gratis',
    period: 'Para probar sin compromiso',
    features: [
      '100 conversaciones/mes',
      '1 asistente IA',
      'Inbox básico',
      'Analytics básicos',
    ],
    cta: 'Empezar gratis',
    popular: false,
    href: '/login',
    accentColor: '#6B7280',
  },
  {
    icon: Sparkles,
    name: 'Pro',
    price: '$19.990',
    period: 'CLP / mes',
    features: [
      '1.500 conversaciones/mes',
      'Bot IA avanzado',
      'Inbox híbrido IA + humano',
      'CRM completo',
      '5 usuarios',
      'Soporte prioritario',
      'Exportar PDF y Excel',
    ],
    cta: 'Comenzar ahora',
    popular: true,
    href: '/login',
    accentColor: '#0ABAB5',
  },
  {
    icon: Building2,
    name: 'Enterprise',
    price: '$49.000',
    period: 'CLP / mes',
    features: [
      'Conversaciones ilimitadas',
      'Usuarios ilimitados',
      'API access',
      'Onboarding personalizado',
      'Soporte dedicado 24/7',
      'SLA garantizado',
    ],
    cta: 'Contactar ventas',
    popular: false,
    href: '#contacto',
    accentColor: '#8B5CF6',
  },
]

export default function PricingSection() {
  return (
    <section id="planes" className="py-24 px-5 sm:px-8 bg-[#080C14]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[#0ABAB5] text-xs font-semibold uppercase tracking-wide mb-4">
            Planes
          </span>
          <h2 className="font-display font-extrabold text-white text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.03em] mb-4">
            Comienza gratis,
            <br />
            escala cuando crezcas.
          </h2>
          <p className="text-white/40 text-base">
            Un vendedor humano cuesta $500.000/mes. WAAXP cuesta $660/día.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white border-2 border-[#0ABAB5] shadow-[0_0_0_1px_rgba(10,186,181,0.15),0_24px_48px_rgba(10,186,181,0.12)]'
                    : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0ABAB5] to-transparent" />
                )}

                <div className="p-6 flex-1">
                  {/* Plan icon + popular badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${plan.accentColor}18`, border: `1px solid ${plan.accentColor}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: plan.accentColor }} strokeWidth={1.75} />
                    </div>
                    {plan.popular && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0ABAB5] text-white uppercase tracking-wide">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <p className={`text-sm font-semibold mb-1 ${plan.popular ? 'text-[#374151]' : 'text-white/40'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`font-display font-extrabold text-4xl tracking-[-0.04em] ${
                      plan.popular ? 'text-[#0A0A0F]' : 'text-white'
                    }`}>
                      {plan.price}
                    </span>
                  </div>
                  <p className={`text-xs mb-6 ${plan.popular ? 'text-[#9CA3AF]' : 'text-white/25'}`}>
                    {plan.period}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: plan.accentColor }}
                          strokeWidth={2.5}
                        />
                        <span className={`text-sm ${plan.popular ? 'text-[#374151]' : 'text-white/50'}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  <Link
                    href={plan.href}
                    className={`block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all duration-200 ${
                      plan.popular
                        ? 'bg-[#0ABAB5] text-white hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(10,186,181,0.4)]'
                        : 'bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.10] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-white/20 mt-8"
        >
          14 días de prueba gratuita en todos los planes · Sin tarjeta de crédito · Cancela cuando quieras
        </motion.p>
      </div>
    </section>
  )
}
