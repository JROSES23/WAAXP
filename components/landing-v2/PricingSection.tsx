'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Sparkles, Building2 } from 'lucide-react'
import Link from 'next/link'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

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
  },
  {
    icon: Building2,
    name: 'Enterprise',
    price: '$49.000',
    period: 'CLP / mes',
    features: [
      'Conversaciones ilimitadas',
      'Usuarios ilimitados',
      'API access completo',
      'Onboarding personalizado',
      'Soporte dedicado 24/7',
      'SLA garantizado',
    ],
    cta: 'Contactar ventas',
    popular: false,
    href: '#contacto',
  },
]

/* Glass card for non-popular */
const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 8px 32px rgba(10,186,181,0.06), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
}

/* Teal glass for popular */
const TEAL_GLASS: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(10,186,181,0.92) 0%, rgba(8,149,145,0.95) 100%)',
  backdropFilter: 'blur(20px) saturate(200%)',
  WebkitBackdropFilter: 'blur(20px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.30)',
  boxShadow:
    '0 20px 60px rgba(10,186,181,0.35), 0 4px 16px rgba(10,186,181,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
}

export default function PricingSection() {
  return (
    <section
      id="planes"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#FFFFFF', fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.10) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', right: '5%',
          width: '45%', height: '50%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,186,181,0.07) 0%, transparent 65%)',
          filter: 'blur(90px)',
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(10,186,181,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>Planes</span>
          </div>
          <h2
            className="font-display font-black leading-[1.06] mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#0D1B2A',
              fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              letterSpacing: '-0.025em',
            }}
          >
            Comienza gratis,<br />escala cuando crezcas.
          </h2>
          <p style={{ color: '#5C6B7A' }}>
            Un vendedor humano cuesta $500.000/mes. WAAXP cuesta $660/día.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 380, damping: 28 } }}
                className="relative rounded-2xl flex flex-col overflow-hidden"
                style={plan.popular ? TEAL_GLASS : GLASS_CARD}
              >
                {/* Inner refraction */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 'inherit',
                  background: plan.popular
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 45%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 55%)',
                  pointerEvents: 'none',
                }} />
                {/* Top specular */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: plan.popular
                    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
                  pointerEvents: 'none',
                }} />

                {plan.popular && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      color: '#FFFFFF',
                      borderBottom: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    Más popular
                  </div>
                )}

                <div className={`relative p-6 flex-1 ${plan.popular ? 'pt-10' : ''}`}>
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: plan.popular
                        ? 'rgba(255,255,255,0.22)'
                        : 'rgba(10,186,181,0.10)',
                      border: plan.popular
                        ? '1px solid rgba(255,255,255,0.30)'
                        : '1px solid rgba(10,186,181,0.20)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: plan.popular ? '#FFFFFF' : '#0ABAB5' }}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p className="text-sm font-semibold mb-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.65)' : '#5C6B7A' }}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className="font-display font-black tracking-[-0.04em]"
                      style={{
                        fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                        color: plan.popular ? '#FFFFFF' : '#0D1B2A',
                        fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                      }}
                    >
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs mb-6" style={{ color: plan.popular ? 'rgba(255,255,255,0.55)' : '#5C6B7A' }}>
                    {plan.period}
                  </p>

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: plan.popular ? 'rgba(255,255,255,0.85)' : '#0ABAB5' }}
                          strokeWidth={2.5}
                        />
                        <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.80)' : '#5C6B7A' }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative p-6 pt-0">
                  <Link
                    href={plan.href}
                    className="block w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all duration-200 hover:-translate-y-0.5"
                    style={
                      plan.popular
                        ? {
                            background: 'rgba(255,255,255,0.95)',
                            color: '#0ABAB5',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
                          }
                        : {
                            background: 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)',
                            color: '#FFFFFF',
                            boxShadow: '0 4px 20px rgba(10,186,181,0.30), inset 0 1px 0 rgba(255,255,255,0.18)',
                          }
                    }
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
          className="text-center text-xs mt-8"
          style={{ color: '#8FA3B5' }}
        >
          14 días de prueba gratuita · Sin tarjeta de crédito · Cancela cuando quieras
        </motion.p>
      </div>
    </section>
  )
}
