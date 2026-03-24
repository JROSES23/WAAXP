'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CreditCard, Check, Crown, Zap, AlertTriangle, TrendingUp } from 'lucide-react'
import type { Negocio } from '@/app/dashboard/types'

interface Plan {
  name:         string
  displayName:  string
  price:        string
  priceNum:     number
  conversations:string
  features:     string[]
  priceId:      string | null
  highlight?:   boolean
}

const PLANES: Plan[] = [
  {
    name: 'starter', displayName: 'Starter', price: 'Gratis', priceNum: 0,
    conversations: '100 conversaciones/mes',
    features: ['Bot IA básico', '1 usuario', 'Inbox básico', '2 reportes PDF/mes'],
    priceId: null,
  },
  {
    name: 'pro', displayName: 'Pro', price: '$19.990', priceNum: 19990,
    conversations: '1.500 conversaciones/mes',
    features: ['Bot IA avanzado', '5 usuarios', 'Inbox híbrido', 'CRM completo', '10 reportes PDF/mes', 'Soporte prioritario'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? null,
    highlight: true,
  },
  {
    name: 'enterprise', displayName: 'Enterprise', price: '$49.000', priceNum: 49000,
    conversations: 'Ilimitadas',
    features: ['Todo incluido', 'Usuarios ilimitados', 'API access', 'Reportes ilimitados', 'Soporte dedicado', 'Onboarding personalizado'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID ?? null,
  },
]

function BillingInner({ business, businessId }: { business: Negocio; businessId: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()

  if (searchParams.get('success') === 'true') toast.success('Plan actualizado correctamente')

  const currentPlan = business.plan ?? 'starter'
  const usoPct      = business.usage_limit
    ? Math.round((business.current_usage / business.usage_limit) * 100)
    : 0
  const planExpirado = business.plan_expires_at && new Date(business.plan_expires_at) < new Date()

  const handleUpgrade = async (plan: Plan) => {
    if (!plan.priceId) { toast.info('Contacta ventas para el plan Enterprise'); return }
    setLoading(plan.name)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId, businessId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Error al crear sesión de pago')
    } catch { toast.error('Error de conexión') }
    finally { setLoading(null) }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Facturación</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Administra tu plan y consumo mensual</p>
      </div>

      {/* Banner expirado */}
      {planExpirado && (
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: '#F59E0B' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>Tu plan ha expirado</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Has sido degradado al plan Starter. Renueva para recuperar tus funciones.
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
              <CreditCard className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Plan actual</p>
              <p className="font-display font-bold text-lg capitalize tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                {currentPlan}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
            {business.usage_limit?.toLocaleString('es-CL')} conv/mes
          </span>
        </div>

        {/* Usage bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: 'var(--text-secondary)' }}>Uso este mes</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {business.current_usage?.toLocaleString('es-CL')} / {business.usage_limit?.toLocaleString('es-CL')}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(usoPct, 100)}%`,
                backgroundColor: usoPct > 90 ? '#EF4444' : usoPct > 70 ? '#F59E0B' : 'var(--accent)',
              }} />
          </div>
          {usoPct > 80 && (
            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#F59E0B' }}>
              <TrendingUp className="w-3 h-3" /> Considera mejorar tu plan antes de alcanzar el límite
            </p>
          )}
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANES.map((plan, i) => {
          const isActive  = currentPlan === plan.name
          const isUpgrade = PLANES.findIndex((p) => p.name === plan.name) > PLANES.findIndex((p) => p.name === currentPlan)

          return (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex flex-col rounded-2xl p-6"
              style={{
                background: 'var(--bg-elevated)',
                border: plan.highlight
                  ? '2px solid var(--accent)'
                  : isActive
                    ? '2px solid var(--accent-border)'
                    : '1px solid var(--border-subtle)',
                boxShadow: plan.highlight ? 'var(--accent-glow)' : 'none',
              }}>

              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--accent)', color: '#080c10' }}>
                  POPULAR
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                {plan.name === 'enterprise'
                  ? <Crown className="w-5 h-5" style={{ color: '#F59E0B' }} strokeWidth={1.75} />
                  : plan.name === 'pro'
                    ? <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                    : <CreditCard className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
                }
                <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>{plan.displayName}</h3>
              </div>

              <div className="mb-1">
                <span className="font-display font-extrabold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                  {plan.price}
                </span>
                {plan.priceNum > 0 && <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>CLP/mes</span>}
              </div>
              <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>{plan.conversations}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              {isActive ? (
                <button disabled className="w-full py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={{ background: 'var(--bg-glass)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                  Plan actual
                </button>
              ) : isUpgrade ? (
                <button onClick={() => handleUpgrade(plan)} disabled={loading !== null}
                  className="btn-accent w-full py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">
                  {loading === plan.name ? 'Redirigiendo...' : 'Mejorar plan'}
                </button>
              ) : (
                <button disabled className="w-full py-2.5 text-sm font-medium rounded-xl"
                  style={{ background: 'var(--bg-glass)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  Incluido
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function BillingClient(props: { business: Negocio; businessId: string }) {
  return <Suspense><BillingInner {...props} /></Suspense>
}
