'use client'

/**
 * OnboardingClient.tsx
 * Wizard "Primeros Pasos" — se muestra tras el login cuando el usuario
 * no tiene negocio configurado todavía.
 *
 * Pasos:
 *  0 — Bienvenida
 *  1 — Modo principal: Reservas | Productos
 *  2 — Detalles del negocio (nombre, teléfono, vertical)
 *  3 — (Solo Reservas) Configurar recursos
 *  4 — ¡Listo!
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Scissors,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Calendar,
  Wrench,
  Globe,
  Store,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  Armchair,
  Table2,
  User,
  Sparkles,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react'
import type { TipoRecurso } from '@/app/dashboard/types'

// ─── Tipos internos ───

interface RecursoForm {
  nombre: string
  tipo: TipoRecurso
}

type ModoPrincipal = 'reservas' | 'productos'

interface FormState {
  modoPrincipal: ModoPrincipal | null
  nombreNegocio: string
  telefono: string
  vertical: string
  recursos: RecursoForm[]
}

// ─── Constantes ───

const VERTICALES = [
  { value: 'salon',       label: 'Salón / Barbería', icon: Scissors        },
  { value: 'retail',      label: 'Tienda / Retail',  icon: ShoppingBag     },
  { value: 'restaurant',  label: 'Restaurante',       icon: UtensilsCrossed },
  { value: 'services',    label: 'Servicios',          icon: Wrench          },
  { value: 'eventos',     label: 'Eventos',            icon: Calendar        },
  { value: 'delivery',    label: 'Delivery',           icon: Bike            },
  { value: 'tienda',      label: 'E-commerce',         icon: Store           },
  { value: 'other',       label: 'Otro',               icon: Globe           },
]

const TIPOS_RECURSO: { value: TipoRecurso; label: string; icon: React.ElementType }[] = [
  { value: 'silla',       label: 'Silla',        icon: Armchair    },
  { value: 'mesa',        label: 'Mesa',         icon: Table2      },
  { value: 'profesional', label: 'Profesional',  icon: User        },
  { value: 'cabina',      label: 'Cabina',       icon: Sparkles    },
  { value: 'sala',        label: 'Sala',         icon: LayoutGrid  },
  { value: 'custom',      label: 'Personalizado', icon: Globe      },
]

// ─── Animaciones ───

const EASE_CUBIC = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 64 : -64,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: EASE_CUBIC },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -64 : 64,
    opacity: 0,
    transition: { duration: 0.28, ease: EASE_CUBIC },
  }),
}

// ─── Componente principal ───

interface Props {
  userId: string
  email: string
}

export default function OnboardingClient({ userId, email }: Props) {
  const router = useRouter()
  const [paso, setPaso] = useState(0)
  const [dir, setDir] = useState(1)
  const [cargando, setCargando] = useState(false)

  const [form, setForm] = useState<FormState>({
    modoPrincipal: null,
    nombreNegocio: '',
    telefono: '',
    vertical: '',
    recursos: [],
  })

  // Pasos totales según modo
  const pasosTotales = form.modoPrincipal === 'reservas' ? 5 : 4

  // ─── Navegación ───

  const avanzar = useCallback(() => {
    setDir(1)
    setPaso((p) => p + 1)
  }, [])

  const retroceder = useCallback(() => {
    setDir(-1)
    setPaso((p) => p - 1)
  }, [])

  // ─── Recursos ───

  const agregarRecurso = () => {
    setForm((f) => ({
      ...f,
      recursos: [...f.recursos, { nombre: '', tipo: 'silla' }],
    }))
  }

  const eliminarRecurso = (idx: number) => {
    setForm((f) => ({
      ...f,
      recursos: f.recursos.filter((_, i) => i !== idx),
    }))
  }

  const actualizarRecurso = (idx: number, campo: keyof RecursoForm, valor: string) => {
    setForm((f) => {
      const nuevo = [...f.recursos]
      nuevo[idx] = { ...nuevo[idx], [campo]: valor as TipoRecurso }
      return { ...f, recursos: nuevo }
    })
  }

  // ─── Guardar en Supabase ───

  const guardar = async () => {
    setCargando(true)
    try {
      const supabase = createClient()

      // 1. Crear el negocio
      const modosActivos =
        form.modoPrincipal === 'reservas'
          ? ['reservas']
          : ['productos', 'ventas', 'soporte']

      const { data: negocio, error: errNegocio } = await supabase
        .from('businesses')
        .insert({
          supabase_user_id:   userId,
          nombre:             form.nombreNegocio.trim(),
          vertical_principal: form.vertical || 'other',
          modos_activos:      modosActivos,
          modo_principal:     form.modoPrincipal,
          whatsapp_phone:     form.telefono.trim() || null,
          plan:               'starter',
          usage_limit:        200,
          current_usage:      0,
        })
        .select()
        .single()

      if (errNegocio) throw errNegocio

      // 2. Crear rol owner
      await supabase.from('user_roles').insert({
        user_id:     userId,
        business_id: negocio.id,
        role:        'owner',
      })

      // 3. Crear recursos (solo si modo reservas)
      if (form.modoPrincipal === 'reservas' && form.recursos.length > 0) {
        const recursosValidos = form.recursos.filter((r) => r.nombre.trim())
        if (recursosValidos.length > 0) {
          await supabase.from('resources').insert(
            recursosValidos.map((r, idx) => ({
              business_id: negocio.id,
              nombre:      r.nombre.trim(),
              tipo:        r.tipo,
              activo:      true,
              orden:       idx,
            }))
          )
        }
      }

      avanzar()
    } catch (err) {
      toast.error('Hubo un error al guardar. Intenta de nuevo.')
      console.error('[Onboarding] error:', err)
    } finally {
      setCargando(false)
    }
  }

  // ─── Validaciones por paso ───

  const puedeAvanzar = (): boolean => {
    switch (paso) {
      case 0: return true
      case 1: return form.modoPrincipal !== null
      case 2: return form.nombreNegocio.trim().length >= 2
      case 3: return form.modoPrincipal !== 'reservas' || form.recursos.some((r) => r.nombre.trim())
      default: return true
    }
  }

  // ─── Render ───

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base, #08090f)' }}
    >
      {/* Fondo con glow radial */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10,186,181,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Barra de progreso */}
      {paso > 0 && paso < pasosTotales - 1 && (
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: 'var(--border-subtle)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'var(--accent)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${((paso - 1) / (pasosTotales - 3)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Contenedor del wizard */}
      <div className="relative w-full max-w-xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={paso}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {paso === 0 && <PasoBienvenida email={email} onSiguiente={avanzar} />}
            {paso === 1 && (
              <PasoModo
                valor={form.modoPrincipal}
                onSeleccionar={(m) => setForm((f) => ({ ...f, modoPrincipal: m }))}
                onSiguiente={avanzar}
                onAtras={retroceder}
              />
            )}
            {paso === 2 && (
              <PasoDetalles
                form={form}
                onChange={(campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))}
                onSiguiente={() => {
                  if (form.modoPrincipal === 'reservas') {
                    avanzar()
                  } else {
                    guardar()
                  }
                }}
                onAtras={retroceder}
                cargando={cargando}
                puedeAvanzar={puedeAvanzar()}
                esUltimo={form.modoPrincipal !== 'reservas'}
              />
            )}
            {paso === 3 && form.modoPrincipal === 'reservas' && (
              <PasoRecursos
                recursos={form.recursos}
                onAgregar={agregarRecurso}
                onEliminar={eliminarRecurso}
                onActualizar={actualizarRecurso}
                onSiguiente={guardar}
                onAtras={retroceder}
                cargando={cargando}
              />
            )}
            {((paso === 3 && form.modoPrincipal !== 'reservas') ||
              (paso === 4 && form.modoPrincipal === 'reservas')) && (
              <PasoListo
                modo={form.modoPrincipal ?? 'productos'}
                onIr={() => router.push('/dashboard')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PASO 0 — Bienvenida
// ─────────────────────────────────────────────

function PasoBienvenida({ email, onSiguiente }: { email: string; onSiguiente: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      {/* Logo oversize */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center gap-3"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent)', boxShadow: '0 0 48px rgba(10,186,181,0.4)' }}
        >
          <span className="font-display font-black text-2xl text-[#080c10]">W</span>
        </div>
        <div className="leading-none">
          <span
            className="font-display font-black text-5xl tracking-[-0.04em]"
            style={{ color: 'var(--text-primary)' }}
          >
            WAAXP
          </span>
          <span
            className="font-ui font-light text-xl tracking-[0.12em] ml-1.5"
            style={{ color: 'var(--accent)' }}
          >
            STORE
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col gap-3"
      >
        <h1
          className="font-display font-bold text-3xl tracking-[-0.02em]"
          style={{ color: 'var(--text-primary)' }}
        >
          Primeros pasos con tu
          <br />
          WAAXPSTORE
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Hola, <span style={{ color: 'var(--text-primary)' }}>{email}</span>. En 2 minutos
          <br />
          tu negocio estará listo para vender con IA.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSiguiente}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm"
        style={{ background: 'var(--accent)', color: '#080c10' }}
      >
        Empezar
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PASO 1 — Modo principal
// ─────────────────────────────────────────────

function PasoModo({
  valor,
  onSeleccionar,
  onSiguiente,
  onAtras,
}: {
  valor: ModoPrincipal | null
  onSeleccionar: (m: ModoPrincipal) => void
  onSiguiente: () => void
  onAtras: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
          Paso 1 de 3
        </p>
        <h2 className="font-display font-bold text-2xl tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          ¿Cómo funciona tu negocio?
        </h2>
        <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          Esto adapta tu panel y las herramientas que LEVI usa.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Card Reservas */}
        <ModoCard
          activo={valor === 'reservas'}
          onClick={() => onSeleccionar('reservas')}
          icono={
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,186,181,0.12)' }}>
              <Calendar className="w-6 h-6" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            </div>
          }
          titulo="Reservas y turnos"
          descripcion="Barbería, salón, spa, clínica, restaurante con mesas. Gestiona citas, horarios y pagos."
          tags={['Barbería', 'Salón', 'Spa', 'Clínica', 'Restaurante']}
          accentColor="var(--accent)"
        />

        {/* Card Productos */}
        <ModoCard
          activo={valor === 'productos'}
          onClick={() => onSeleccionar('productos')}
          icono={
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <ShoppingBag className="w-6 h-6" style={{ color: '#8B5CF6' }} strokeWidth={1.75} />
            </div>
          }
          titulo="Venta de productos"
          descripcion="Tienda online, catálogo, delivery. LEVI vende, responde preguntas y cierra pedidos."
          tags={['Retail', 'E-commerce', 'Delivery', 'Catálogo']}
          accentColor="#8B5CF6"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onAtras}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Volver
        </button>
        <button
          onClick={onSiguiente}
          disabled={!valor}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 transition-all"
          style={{ background: 'var(--accent)', color: '#080c10' }}
        >
          Continuar <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

function ModoCard({
  activo, onClick, icono, titulo, descripcion, tags, accentColor,
}: {
  activo: boolean
  onClick: () => void
  icono: React.ReactNode
  titulo: string
  descripcion: string
  tags: string[]
  accentColor: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left p-5 rounded-2xl flex gap-4 items-start transition-all"
      style={{
        background: activo ? 'rgba(10,186,181,0.06)' : 'rgba(255,255,255,0.03)',
        border: activo ? `1.5px solid ${accentColor}` : '1.5px solid rgba(255,255,255,0.07)',
        boxShadow: activo ? `0 0 24px rgba(10,186,181,0.12)` : 'none',
      }}
    >
      {icono}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {titulo}
          </span>
          <div
            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            style={{
              borderColor: activo ? accentColor : 'rgba(255,255,255,0.2)',
              background: activo ? accentColor : 'transparent',
            }}
          >
            {activo && <Check className="w-2.5 h-2.5 text-[#080c10]" strokeWidth={3} />}
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          {descripcion}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-tertiary)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

// ─────────────────────────────────────────────
//  PASO 2 — Detalles del negocio
// ─────────────────────────────────────────────

function PasoDetalles({
  form, onChange, onSiguiente, onAtras, cargando, puedeAvanzar, esUltimo,
}: {
  form: FormState
  onChange: (campo: keyof FormState, valor: string) => void
  onSiguiente: () => void
  onAtras: () => void
  cargando: boolean
  puedeAvanzar: boolean
  esUltimo: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
          Paso 2 de 3
        </p>
        <h2 className="font-display font-bold text-2xl tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          Cuéntanos de tu negocio
        </h2>
        <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          Puedes cambiar esto después desde Configuración.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Nombre del negocio *
          </label>
          <input
            type="text"
            placeholder="Barbería Clásica, Salón Valentina, etc."
            value={form.nombreNegocio}
            onChange={(e) => onChange('nombreNegocio', e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            WhatsApp del negocio
          </label>
          <input
            type="tel"
            placeholder="+56912345678"
            value={form.telefono}
            onChange={(e) => onChange('telefono', e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Vertical */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Rubro
          </label>
          <div className="grid grid-cols-4 gap-2">
            {VERTICALES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onChange('vertical', value)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all"
                style={{
                  background: form.vertical === value ? 'rgba(10,186,181,0.1)' : 'rgba(255,255,255,0.03)',
                  border: form.vertical === value ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.07)',
                  color: form.vertical === value ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                <span className="text-[10px] leading-tight font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onAtras}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Volver
        </button>
        <button
          onClick={onSiguiente}
          disabled={!puedeAvanzar || cargando}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 transition-all"
          style={{ background: 'var(--accent)', color: '#080c10' }}
        >
          {cargando ? 'Guardando...' : esUltimo ? 'Crear mi negocio' : 'Continuar'}
          {!cargando && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PASO 3 — Configurar recursos (solo Reservas)
// ─────────────────────────────────────────────

function PasoRecursos({
  recursos, onAgregar, onEliminar, onActualizar, onSiguiente, onAtras, cargando,
}: {
  recursos: RecursoForm[]
  onAgregar: () => void
  onEliminar: (idx: number) => void
  onActualizar: (idx: number, campo: keyof RecursoForm, valor: string) => void
  onSiguiente: () => void
  onAtras: () => void
  cargando: boolean
}) {
  const tieneAlguno = recursos.some((r) => r.nombre.trim())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
          Paso 3 de 3
        </p>
        <h2 className="font-display font-bold text-2xl tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          ¿Cuáles son tus espacios?
        </h2>
        <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          Agrega tus sillas, mesas o profesionales. Puedes añadir más después.
        </p>
      </div>

      {/* Lista de recursos */}
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence>
          {recursos.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              className="flex gap-3 items-start"
            >
              {/* Selector de tipo */}
              <div className="flex flex-col gap-1 shrink-0">
                <div className="grid grid-cols-3 gap-1">
                  {TIPOS_RECURSO.map(({ value, label, icon: TIcon }) => (
                    <button
                      key={value}
                      onClick={() => onActualizar(idx, 'tipo', value)}
                      title={label}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: r.tipo === value ? 'rgba(10,186,181,0.15)' : 'rgba(255,255,255,0.04)',
                        border: r.tipo === value ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.07)',
                        color: r.tipo === value ? 'var(--accent)' : 'var(--text-tertiary)',
                      }}
                    >
                      <TIcon className="w-3.5 h-3.5" strokeWidth={r.tipo === value ? 2 : 1.75} />
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {TIPOS_RECURSO.find((t) => t.value === r.tipo)?.label}
                </span>
              </div>

              {/* Input nombre */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder='Ej: "Silla 1", "Pedro", "Mesa VIP"'
                  value={r.nombre}
                  onChange={(e) => onActualizar(idx, 'nombre', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Eliminar */}
              <button
                onClick={() => onEliminar(idx)}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 mt-0.5"
                style={{ color: 'rgba(239,68,68,0.6)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Botón agregar */}
        <button
          onClick={onAgregar}
          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all"
          style={{
            border: '1.5px dashed rgba(10,186,181,0.3)',
            color: 'var(--accent)',
            background: 'rgba(10,186,181,0.03)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(10,186,181,0.07)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(10,186,181,0.03)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Agregar espacio
        </button>
      </div>

      {recursos.length === 0 && (
        <p className="text-xs text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
          Puedes saltarte este paso y agregar espacios después.
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onAtras}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Volver
        </button>
        <button
          onClick={onSiguiente}
          disabled={cargando}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#080c10' }}
        >
          {cargando ? 'Creando...' : 'Crear mi negocio'}
          {!cargando && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PASO FINAL — ¡Listo!
// ─────────────────────────────────────────────

function PasoListo({ modo, onIr }: { modo: ModoPrincipal; onIr: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      {/* Icono animado */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(10,186,181,0.2), rgba(10,186,181,0.08))',
          border: '1.5px solid rgba(10,186,181,0.4)',
          boxShadow: '0 0 64px rgba(10,186,181,0.25)',
        }}
      >
        <Check className="w-10 h-10" style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <h2 className="font-display font-bold text-3xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
          ¡Tu WAAXPSTORE está listo!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {modo === 'reservas'
            ? 'Ya puedes gestionar tus reservas, ver el panel en vivo y conectar WhatsApp para que LEVI agendé automáticamente.'
            : 'Ya puedes agregar productos, conectar WhatsApp y dejar que LEVI venda por ti las 24 horas.'}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onIr}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm"
        style={{ background: 'var(--accent)', color: '#080c10' }}
      >
        Ir a mi panel
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
