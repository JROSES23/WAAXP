'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Store,
  Scissors,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Calendar,
  Wrench,
  Globe,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  MessageSquare,
  Zap,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   TYPES & DATA
───────────────────────────────────────────── */

interface Vertical {
  value: string
  label: string
  icon:  React.ElementType
  desc:  string
}

const VERTICALES: Vertical[] = [
  { value: 'retail',      label: 'Retail',        icon: ShoppingBag,     desc: 'Ropa, accesorios, productos físicos'     },
  { value: 'salon',       label: 'Salón / Spa',   icon: Scissors,        desc: 'Peluquería, estética, belleza'           },
  { value: 'restaurant',  label: 'Restaurante',   icon: UtensilsCrossed, desc: 'Comida, bebidas, delivery'               },
  { value: 'tienda',      label: 'Tienda Online',  icon: Store,           desc: 'E-commerce, tienda digital'              },
  { value: 'delivery',    label: 'Delivery',      icon: Bike,            desc: 'Reparto, mensajería, logística'          },
  { value: 'eventos',     label: 'Eventos',       icon: Calendar,        desc: 'Fiestas, conferencias, reservas'         },
  { value: 'services',    label: 'Servicios',     icon: Wrench,          desc: 'Consultora, mantención, servicios prof.' },
  { value: 'other',       label: 'Otro',          icon: Globe,           desc: 'Otro rubro o categoría'                  },
]

const MODOS = [
  { value: 'ventas',    label: 'Ventas',      desc: 'Cerrar pedidos y ventas por WhatsApp' },
  { value: 'soporte',   label: 'Soporte',     desc: 'Atender consultas y ayuda al cliente' },
  { value: 'productos', label: 'Catálogo',    desc: 'Mostrar productos y servicios'        },
  { value: 'reservas',  label: 'Reservas',    desc: 'Agendar citas y reservas'             },
]

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width:      i === step ? 20 : 6,
            opacity:    i <= step ? 1 : 0.3,
            background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)' : 'var(--border-default)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

interface OnboardingClientProps {
  userId: string
  email:  string
}

const TOTAL_STEPS = 3

export default function OnboardingClient({ userId, email }: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Form state
  const [nombre,    setNombre]    = useState('')
  const [vertical,  setVertical]  = useState('')
  const [modos,     setModos]     = useState<string[]>(['ventas', 'soporte'])
  const [aiTone,    setAiTone]    = useState('friendly')
  const [displayName, setDisplayName] = useState(email.split('@')[0])

  const toggleModo = (v: string) => {
    setModos(prev => prev.includes(v) ? prev.filter(m => m !== v) : [...prev, v])
  }

  const canProceed = [
    nombre.trim().length >= 2 && vertical !== '',
    modos.length >= 1,
    displayName.trim().length >= 2,
  ]

  const handleFinish = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Create business
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .insert({
          supabase_user_id:    userId,
          nombre:              nombre.trim(),
          vertical_principal:  vertical,
          modos_activos:       modos,
          plan:                'starter',
          usage_limit:         200,
          current_usage:       0,
          ai_tone:             aiTone,
        })
        .select('id')
        .single()

      if (bizErr) throw bizErr

      // 2. Create user_role
      await supabase.from('user_roles').insert({
        user_id:     userId,
        business_id: biz.id,
        role:        'owner',
      })

      // 3. Upsert profile
      await supabase.from('user_profiles').upsert({
        user_id:      userId,
        display_name: displayName.trim(),
        theme_mode:   'dark',
        theme_color:  'teal',
        locale:       'es-CL',
      })

      toast.success('¡Negocio creado! Bienvenido a WAAXP')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Error al crear el negocio. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const fadeSlide = {
    initial:  { opacity: 0, x: 24 },
    animate:  { opacity: 1, x: 0 },
    exit:     { opacity: 0, x: -24 },
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-xl rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border-default)',
          boxShadow:  'var(--shadow-glass)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: 'var(--accent)' }} />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)', boxShadow: 'var(--accent-glow)' }}
              >
                <span className="font-display font-black text-sm text-[#080c10]">W</span>
              </div>
              <span className="font-display font-bold text-lg tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                WAAXP
              </span>
            </div>
            <StepDots step={step} total={TOTAL_STEPS} />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Nombre + Vertical ── */}
            {step === 0 && (
              <motion.div key="step0" {...fadeSlide} className="space-y-6">
                <div>
                  <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                    Cuéntanos de tu negocio
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Con esto LEVI sabrá cómo representarte.
                  </p>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Nombre del negocio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Boutique Valentina, Sushi Express…"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background:  'var(--bg-input)',
                      border:      '1px solid var(--border-default)',
                      color:       'var(--text-primary)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                    onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                  />
                </div>

                {/* Vertical */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    ¿A qué rubro perteneces?
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {VERTICALES.map((v) => {
                      const Icon = v.icon
                      const active = vertical === v.value
                      return (
                        <button
                          key={v.value}
                          onClick={() => setVertical(v.value)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150"
                          style={{
                            background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                            border:     `1px solid ${active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                            color:      active ? 'var(--accent)' : 'var(--text-secondary)',
                          }}
                        >
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                              {v.label}
                            </p>
                            <p className="text-[10px] leading-tight truncate" style={{ color: 'var(--text-tertiary)' }}>
                              {v.desc}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Modos del bot ── */}
            {step === 1 && (
              <motion.div key="step1" {...fadeSlide} className="space-y-6">
                <div>
                  <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                    ¿Para qué usarás LEVI?
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Activa los módulos que necesitas. Puedes cambiarlos después.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {MODOS.map(m => {
                    const active = modos.includes(m.value)
                    return (
                      <button
                        key={m.value}
                        onClick={() => toggleModo(m.value)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-150"
                        style={{
                          background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                          border:     `1px solid ${active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: active ? 'var(--accent)' : 'var(--border-default)',
                          }}
                        >
                          {active && <Check className="w-3 h-3 text-[#080c10]" strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {m.label}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {m.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Tono de LEVI
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'friendly',     label: 'Amigable'     },
                      { value: 'professional', label: 'Profesional'  },
                      { value: 'casual',       label: 'Casual'       },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setAiTone(t.value)}
                        className="py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: aiTone === t.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                          border:     `1px solid ${aiTone === t.value ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                          color:      aiTone === t.value ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Tu perfil + resumen ── */}
            {step === 2 && (
              <motion.div key="step2" {...fadeSlide} className="space-y-6">
                <div>
                  <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                    Casi listo
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                    ¿Cómo quieres que te llamen en el dashboard?
                  </p>
                </div>

                {/* Display name */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Valentina, Carlos…"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg-input)',
                      border:     '1px solid var(--border-default)',
                      color:      'var(--text-primary)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                    onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                  />
                </div>

                {/* Summary card */}
                <div
                  className="rounded-2xl p-4 space-y-3"
                  style={{
                    background: 'var(--bg-elevated)',
                    border:     '1px solid var(--border-subtle)',
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                    Resumen
                  </p>
                  <div className="space-y-2">
                    <Row icon={<Store className="w-3.5 h-3.5" />} label="Negocio" value={nombre || '—'} />
                    <Row icon={<MessageSquare className="w-3.5 h-3.5" />} label="Módulos" value={modos.join(', ') || '—'} />
                    <Row icon={<Sparkles className="w-3.5 h-3.5" />} label="Tono LEVI" value={aiTone} />
                    <Row icon={<Zap className="w-3.5 h-3.5" />} label="Plan" value="Starter (gratis)" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-0"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed[step]}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#080c10', boxShadow: canProceed[step] ? 'var(--accent-glow)' : 'none' }}
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canProceed[2] || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#080c10', boxShadow: canProceed[2] ? 'var(--accent-glow)' : 'none' }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-[#080c10] border-t-transparent rounded-full"
                  />
                ) : (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                )}
                {loading ? 'Creando…' : 'Crear mi negocio'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Row helper ── */
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}:</span>
      <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
