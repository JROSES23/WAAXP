'use client'

import { motion, useSpring } from 'framer-motion'
import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { Check, Zap, Sparkles, Building2 } from 'lucide-react'
import NumberFlow from '@number-flow/react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ── Tipos ── */
interface PricingPlan {
  icon:         React.ElementType
  name:         string
  description:  string
  price:        number   // mensual en CLP (0 = gratis)
  yearlyPrice:  number   // anual en CLP (0 = gratis)
  period:       string
  features:     string[]
  buttonText:   string
  href:         string
  isPopular?:   boolean
  isFree?:      boolean
}

/* ── Planes WAAXP ── */
const PLANS: PricingPlan[] = [
  {
    icon:        Zap,
    name:        'Starter',
    description: 'Para probar sin compromiso',
    price:       0,
    yearlyPrice: 0,
    period:      'mes',
    features: [
      '100 conversaciones/mes',
      '1 asistente IA',
      'Inbox básico',
      'Analytics básicos',
    ],
    buttonText: 'Empezar gratis',
    href:       '/login',
    isFree:     true,
  },
  {
    icon:        Sparkles,
    name:        'Pro',
    description: 'El favorito de los negocios que escalan',
    price:       19990,
    yearlyPrice: 15990,
    period:      'mes',
    features: [
      '1.500 conversaciones/mes',
      'Bot IA avanzado',
      'Inbox híbrido IA + humano',
      'CRM completo',
      '5 usuarios',
      'Soporte prioritario',
      'Exportar PDF y Excel',
    ],
    buttonText: 'Comenzar ahora',
    href:       '/login',
    isPopular:  true,
  },
  {
    icon:        Building2,
    name:        'Enterprise',
    description: 'Para equipos grandes con demanda alta',
    price:       49000,
    yearlyPrice: 39000,
    period:      'mes',
    features: [
      'Conversaciones ilimitadas',
      'Usuarios ilimitados',
      'API access completo',
      'Onboarding personalizado',
      'Soporte dedicado 24/7',
      'SLA garantizado',
    ],
    buttonText: 'Contactar ventas',
    href:       '#contacto',
  },
]

/* ── Contexto ── */
const PricingCtx = createContext<{
  isMonthly: boolean
  setIsMonthly: (v: boolean) => void
}>({ isMonthly: true, setIsMonthly: () => {} })

/* ── Estrella interactiva ── */
function Star({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null }
  containerRef:  React.RefObject<HTMLDivElement>
}) {
  const [pos] = useState({
    top:  `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
  })

  const cfg = { stiffness: 100, damping: 15, mass: 0.1 }
  const sx = useSpring(0, cfg)
  const sy = useSpring(0, cfg)

  useEffect(() => {
    if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
      sx.set(0); sy.set(0); return
    }
    const rect   = containerRef.current.getBoundingClientRect()
    const starX  = rect.left + (parseFloat(pos.left) / 100) * rect.width
    const starY  = rect.top  + (parseFloat(pos.top)  / 100) * rect.height
    const dx     = mousePosition.x - starX
    const dy     = mousePosition.y - starY
    const dist   = Math.sqrt(dx * dx + dy * dy)
    const radius = 500
    if (dist < radius) {
      const f = 1 - dist / radius
      sx.set(dx * f * 0.45)
      sy.set(dy * f * 0.45)
    } else {
      sx.set(0); sy.set(0)
    }
  }, [mousePosition, pos, containerRef, sx, sy])

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        top: pos.top, left: pos.left,
        width: pos.size, height: pos.size,
        background: '#0ABAB5',
        x: sx, y: sy,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.7, 0] }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 5,
      }}
    />
  )
}

function Starfield({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null }
  containerRef:  React.RefObject<HTMLDivElement>
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 120 }).map((_, i) => (
        <Star key={i} mousePosition={mousePosition} containerRef={containerRef} />
      ))}
    </div>
  )
}

/* ── Toggle mensual / anual ── */
function PricingToggle() {
  const { isMonthly, setIsMonthly } = useContext(PricingCtx)
  const monthlyRef = useRef<HTMLButtonElement>(null)
  const annualRef  = useRef<HTMLButtonElement>(null)
  const [pill, setPill] = useState<React.CSSProperties>({})

  useEffect(() => {
    const ref = isMonthly ? monthlyRef : annualRef
    if (ref.current) {
      setPill({
        width:     ref.current.offsetWidth,
        transform: `translateX(${ref.current.offsetLeft}px)`,
      })
    }
  }, [isMonthly])

  const toggle = (monthly: boolean) => {
    if (isMonthly === monthly) return
    setIsMonthly(monthly)
    if (!monthly && annualRef.current) {
      const rect    = annualRef.current.getBoundingClientRect()
      const originX = (rect.left + rect.width / 2)  / window.innerWidth
      const originY = (rect.top  + rect.height / 2) / window.innerHeight
      confetti({
        particleCount:  80,
        spread:         80,
        origin:         { x: originX, y: originY },
        colors:         ['#0ABAB5', '#ffffff', '#079490', '#EDFAFA'],
        ticks:          280,
        gravity:        1.1,
        decay:          0.93,
        startVelocity: 28,
      })
    }
  }

  return (
    <div className="flex justify-center">
      <div
        className="relative flex w-fit items-center rounded-full p-1"
        style={{
          background: 'rgba(10,186,181,0.10)',
          border:     '1px solid rgba(10,186,181,0.22)',
        }}
      >
        {/* sliding pill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ ...pill, background: '#0ABAB5' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />

        <button
          ref={monthlyRef}
          onClick={() => toggle(true)}
          className="relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          style={{ color: isMonthly ? '#ffffff' : '#5C6B7A' }}
        >
          Mensual
        </button>
        <button
          ref={annualRef}
          onClick={() => toggle(false)}
          className="relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          style={{ color: !isMonthly ? '#ffffff' : '#5C6B7A' }}
        >
          Anual
          <span
            className="hidden sm:inline ml-1 text-xs"
            style={{ color: !isMonthly ? 'rgba(255,255,255,0.75)' : 'rgba(10,186,181,0.8)' }}
          >
            (−20%)
          </span>
        </button>
      </div>
    </div>
  )
}

/* ── Tarjeta de plan ── */
function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { isMonthly } = useContext(PricingCtx)
  const Icon  = plan.icon
  const price = isMonthly ? plan.price : plan.yearlyPrice

  const GLASS_BASE: React.CSSProperties = {
    background:         'rgba(255,255,255,0.65)',
    backdropFilter:     'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border:             '1px solid rgba(255,255,255,0.82)',
    boxShadow:          '0 8px 32px rgba(10,186,181,0.06), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
  }

  const GLASS_POPULAR: React.CSSProperties = {
    background:         'linear-gradient(145deg, rgba(10,186,181,0.92) 0%, rgba(7,148,144,0.95) 100%)',
    backdropFilter:     'blur(20px) saturate(200%)',
    WebkitBackdropFilter: 'blur(20px) saturate(200%)',
    border:             '1px solid rgba(255,255,255,0.30)',
    boxShadow:          '0 20px 60px rgba(10,186,181,0.35), 0 4px 16px rgba(10,186,181,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{
        y:       0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{
        duration:   0.6,
        type:       'spring',
        stiffness:  100,
        damping:    20,
        delay:      index * 0.12,
      }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 380, damping: 28 } }}
      className="relative rounded-2xl flex flex-col overflow-hidden"
      style={plan.isPopular ? GLASS_POPULAR : GLASS_BASE}
    >
      {/* Refraction overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: plan.isPopular
          ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 45%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 55%)',
      }} />
      {/* Top specular line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px', pointerEvents: 'none',
        background: plan.isPopular
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
      }} />

      {/* Popular badge */}
      {plan.isPopular && (
        <div
          className="text-center py-2 text-[10px] font-bold uppercase tracking-widest relative"
          style={{
            background:    'rgba(255,255,255,0.18)',
            color:         '#ffffff',
            borderBottom:  '1px solid rgba(255,255,255,0.15)',
          }}
        >
          Más popular
        </div>
      )}

      <div className={cn('relative flex-1 flex flex-col p-6', plan.isPopular && 'pt-5')}>
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{
            background:  plan.isPopular ? 'rgba(255,255,255,0.22)' : 'rgba(10,186,181,0.10)',
            border:      plan.isPopular ? '1px solid rgba(255,255,255,0.30)' : '1px solid rgba(10,186,181,0.20)',
            boxShadow:   'inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: plan.isPopular ? '#ffffff' : '#0ABAB5' }}
            strokeWidth={1.5}
          />
        </div>

        {/* Name */}
        <p
          className="text-sm font-semibold mb-1"
          style={{ color: plan.isPopular ? 'rgba(255,255,255,0.65)' : '#5C6B7A' }}
        >
          {plan.name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          {plan.isFree ? (
            <span
              className="font-display font-black tracking-[-0.04em]"
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                color:    plan.isPopular ? '#ffffff' : '#0D1B2A',
                fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              }}
            >
              Gratis
            </span>
          ) : (
            <span
              className="font-display font-black tracking-[-0.04em]"
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                color:    plan.isPopular ? '#ffffff' : '#0D1B2A',
                fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
              }}
            >
              <NumberFlow
                value={price}
                locales="es-CL"
                format={{ style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }}
              />
            </span>
          )}
        </div>

        <p
          className="text-xs mb-1"
          style={{ color: plan.isPopular ? 'rgba(255,255,255,0.55)' : '#5C6B7A' }}
        >
          {plan.isFree
            ? 'Para siempre gratis'
            : isMonthly
              ? `CLP / ${plan.period}`
              : `CLP / ${plan.period} · cobrado anualmente`}
        </p>

        <p
          className="text-xs mb-5"
          style={{ color: plan.isPopular ? 'rgba(255,255,255,0.50)' : '#8FA3B5' }}
        >
          {plan.description}
        </p>

        {/* Features */}
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: plan.isPopular ? 'rgba(255,255,255,0.85)' : '#0ABAB5' }}
                strokeWidth={2.5}
              />
              <span
                className="text-sm"
                style={{ color: plan.isPopular ? 'rgba(255,255,255,0.80)' : '#5C6B7A' }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="relative px-6 pb-6">
        <Link
          href={plan.href}
          className="block w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all duration-200 hover:-translate-y-0.5"
          style={
            plan.isPopular
              ? {
                  background:  'rgba(255,255,255,0.95)',
                  color:       '#0ABAB5',
                  boxShadow:   '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
                }
              : {
                  background: 'linear-gradient(135deg, #0ABAB5 0%, #08a5a0 100%)',
                  color:      '#ffffff',
                  boxShadow:  '0 4px 20px rgba(10,186,181,0.30), inset 0 1px 0 rgba(255,255,255,0.18)',
                }
          }
        >
          {plan.buttonText}
        </Link>
      </div>
    </motion.div>
  )
}

/* ── Sección principal ── */
export default function PricingSection() {
  const [isMonthly,      setIsMonthly]      = useState(true)
  const [mousePosition,  setMousePosition]  = useState<{ x: number | null; y: number | null }>({ x: null, y: null })
  const containerRef = useRef<HTMLDivElement>(null!)

  return (
    <PricingCtx.Provider value={{ isMonthly, setIsMonthly }}>
      <section
        id="planes"
        ref={containerRef}
        onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setMousePosition({ x: null, y: null })}
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background:  '#FFFFFF',
          fontFamily:  'var(--font-ui), DM Sans, system-ui, sans-serif',
        }}
      >
        {/* Teal blobs */}
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

        {/* Starfield sobre los blobs */}
        <Starfield mousePosition={mousePosition} containerRef={containerRef} />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
              style={{
                background:        'rgba(255,255,255,0.80)',
                backdropFilter:    'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border:            '1px solid rgba(10,186,181,0.22)',
                boxShadow:         'inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ABAB5' }}>
                Planes
              </span>
            </div>

            <h2
              className="font-display font-black leading-[1.06] mb-4"
              style={{
                fontSize:    'clamp(2rem, 4vw, 3rem)',
                color:       '#0D1B2A',
                fontFamily:  'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                letterSpacing: '-0.025em',
              }}
            >
              Comienza gratis,<br />escala cuando crezcas.
            </h2>
            <p style={{ color: '#5C6B7A' }}>
              Un vendedor humano cuesta $500.000/mes. WAAXP cuesta $660/día.
            </p>
          </motion.div>

          {/* Toggle */}
          <div className="mb-10">
            <PricingToggle />
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan, i) => (
              <PricingCard key={plan.name} plan={plan} index={i} />
            ))}
          </div>

          {/* Footnote */}
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
    </PricingCtx.Provider>
  )
}
