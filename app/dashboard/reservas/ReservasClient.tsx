'use client'

/**
 * ReservasClient.tsx — Panel de Reservas con 3 vistas.
 * Vista Lista: agrupado por recurso, cronológico.
 * Vista Grid: cards lado a lado, una por recurso, con el horario del día.
 * Vista Calor: bloques de tamaño proporcional a las reservas del mes.
 */

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  List,
  LayoutGrid,
  Flame,
  ChevronDown,
  ChevronRight,
  Clock,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Timer,
  Banknote,
  CreditCard,
  Smartphone,
  Ban,
  Plus,
  Maximize2,
  Scissors,
  UtensilsCrossed,
  UserCheck,
  Sparkles,
  DoorOpen,
  Layers,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Wallet,
} from 'lucide-react'
import type { RecursoReserva, Reserva, EstadoReserva, MetodoPago, EstadoPago, AuthContext, TipoRecurso } from '@/app/dashboard/types'
import { actualizarEstadoReserva, registrarPagoReserva } from './actions'
import Link from 'next/link'

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_ICON: Record<TipoRecurso, React.ElementType> = {
  silla:        Scissors,
  mesa:         UtensilsCrossed,
  profesional:  UserCheck,
  cabina:       Sparkles,
  sala:         DoorOpen,
  custom:       Layers,
}

const ESTADO_CONFIG: Record<EstadoReserva, { label: string; color: string; bg: string }> = {
  programada:  { label: 'Programada',  color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
  confirmada:  { label: 'Confirmada',  color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
  en_curso:    { label: 'En curso',    color: '#0ABAB5', bg: 'rgba(10,186,181,0.14)'  },
  completada:  { label: 'Completada',  color: '#64748B', bg: 'rgba(100,116,139,0.10)' },
  cancelada:   { label: 'Cancelada',   color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
  no_asiste:   { label: 'No asistió',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
}

const PAGO_CONFIG: Record<MetodoPago, { label: string; icon: React.ElementType }> = {
  efectivo:     { label: 'Efectivo',     icon: Banknote  },
  transferencia:{ label: 'Transferencia',icon: Wallet    },
  tarjeta:      { label: 'Tarjeta',      icon: CreditCard},
  pagado_wsp:   { label: 'Pagó x WhatsApp', icon: Smartphone },
  pendiente:    { label: 'Pendiente',    icon: Clock     },
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0]
}

// ─── Tipos internos ────────────────────────────────────────────────────────────

type Vista = 'lista' | 'grid' | 'calor'

interface ReservasClientProps {
  recursos:    RecursoReserva[]
  reservasHoy: Reserva[]
  auth:        AuthContext
  fechaHoy:    string
}

// ─── Modal de acciones ─────────────────────────────────────────────────────────

interface AccionModalProps {
  reserva:  Reserva
  onClose:  () => void
  onUpdate: (id: string, campo: 'estado' | 'pago', valor: unknown) => void
}

function AccionModal({ reserva, onClose, onUpdate }: AccionModalProps) {
  const [tab, setTab]               = useState<'estado' | 'pago'>('estado')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(reserva.metodo_pago)
  const [estadoPago, setEstadoPago] = useState<EstadoPago>(reserva.estado_pago)
  const [isPending, startTransition] = useTransition()

  const estadosAccion: { estado: EstadoReserva; label: string; icon: React.ElementType; color: string }[] = [
    { estado: 'confirmada',  label: 'Confirmar llegada', icon: CheckCircle2, color: '#34D399' },
    { estado: 'en_curso',    label: 'Marcar en curso',   icon: Timer,        color: '#0ABAB5' },
    { estado: 'completada',  label: 'Completar',         icon: CheckCircle2, color: '#64748B' },
    { estado: 'no_asiste',   label: 'No asistió',        icon: AlertCircle,  color: '#F59E0B' },
    { estado: 'cancelada',   label: 'Cancelar',          icon: Ban,          color: '#EF4444' },
  ]

  const handleEstado = (estado: EstadoReserva) => {
    startTransition(async () => {
      const res = await actualizarEstadoReserva(reserva.id, estado)
      if (res.ok) { onUpdate(reserva.id, 'estado', estado); onClose() }
    })
  }

  const handlePago = () => {
    startTransition(async () => {
      const res = await registrarPagoReserva(reserva.id, metodoPago, estadoPago)
      if (res.ok) { onUpdate(reserva.id, 'pago', { metodoPago, estadoPago }); onClose() }
    })
  }

  const cfg = ESTADO_CONFIG[reserva.estado]

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          key="modal"
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Cabecera */}
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  {reserva.cliente_nombre}
                </p>
                {reserva.servicio && (
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {reserva.servicio}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ color: cfg.color, background: cfg.bg }}
              >
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1">
                <Clock style={{ width: 12, height: 12 }} strokeWidth={1.75} />
                {formatHora(reserva.inicio)} – {formatHora(reserva.fin)}
              </span>
              {reserva.cliente_phone && (
                <span className="flex items-center gap-1">
                  <Phone style={{ width: 12, height: 12 }} strokeWidth={1.75} />
                  {reserva.cliente_phone}
                </span>
              )}
              {reserva.es_walk_in && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                  Walk-in
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {(['estado', 'pago'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors"
                style={{
                  color: tab === t ? 'var(--accent)' : 'var(--text-tertiary)',
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {t === 'estado' ? 'Estado' : 'Pago'}
              </button>
            ))}
          </div>

          {/* Contenido tab */}
          <div className="p-4">
            {tab === 'estado' ? (
              <div className="grid grid-cols-1 gap-2">
                {estadosAccion.map(({ estado, label, icon: Icon, color }) => (
                  <button
                    key={estado}
                    onClick={() => handleEstado(estado)}
                    disabled={isPending || reserva.estado === estado}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      color: reserva.estado === estado ? color : 'var(--text-primary)',
                      background: reserva.estado === estado ? `${color}1A` : 'var(--bg-glass)',
                      border: `1px solid ${reserva.estado === estado ? `${color}40` : 'var(--border-subtle)'}`,
                      opacity: isPending ? 0.6 : 1,
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, color, flexShrink: 0 }} strokeWidth={1.75} />
                    {label}
                    {reserva.estado === estado && (
                      <span className="ml-auto text-[10px] font-bold opacity-70">actual</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Método de pago */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--text-tertiary)' }}>
                    Método de pago
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(PAGO_CONFIG) as [MetodoPago, { label: string; icon: React.ElementType }][]).map(
                      ([key, { label, icon: Icon }]) => (
                        <button
                          key={key}
                          onClick={() => setMetodoPago(key)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                          style={{
                            color: metodoPago === key ? 'var(--accent)' : 'var(--text-secondary)',
                            background: metodoPago === key ? 'rgba(10,186,181,0.10)' : 'var(--bg-glass)',
                            border: `1px solid ${metodoPago === key ? 'rgba(10,186,181,0.35)' : 'var(--border-subtle)'}`,
                          }}
                        >
                          <Icon style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.75} />
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Estado pago */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--text-tertiary)' }}>
                    Estado de pago
                  </p>
                  <div className="flex gap-2">
                    {(['pendiente', 'anticipo', 'pagado', 'gratis'] as EstadoPago[]).map((ep) => (
                      <button
                        key={ep}
                        onClick={() => setEstadoPago(ep)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                        style={{
                          color: estadoPago === ep ? 'var(--accent)' : 'var(--text-secondary)',
                          background: estadoPago === ep ? 'rgba(10,186,181,0.10)' : 'var(--bg-glass)',
                          border: `1px solid ${estadoPago === ep ? 'rgba(10,186,181,0.35)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        {ep}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePago}
                  disabled={isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all mt-1"
                  style={{
                    background: 'var(--accent)',
                    color: '#080c10',
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {isPending ? 'Guardando…' : 'Guardar pago'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Fila de reserva (usada en Lista) ──────────────────────────────────────────

function ReservaFila({
  reserva,
  onSelect,
}: {
  reserva: Reserva
  onSelect: (r: Reserva) => void
}) {
  const cfg  = ESTADO_CONFIG[reserva.estado]
  const pago = PAGO_CONFIG[reserva.metodo_pago]
  const PagoIcon = pago.icon

  return (
    <motion.button
      layout
      onClick={() => onSelect(reserva)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group"
      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}
      whileHover={{ scale: 1.005, borderColor: 'rgba(10,186,181,0.20)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Hora */}
      <div className="shrink-0 text-center w-12">
        <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {formatHora(reserva.inicio)}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {formatHora(reserva.fin)}
        </p>
      </div>

      {/* Línea acento */}
      <div className="w-0.5 h-9 rounded-full shrink-0" style={{ background: cfg.color }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {reserva.cliente_nombre}
          {reserva.es_walk_in && (
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
              WI
            </span>
          )}
        </p>
        {reserva.servicio && (
          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
            {reserva.servicio}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
        <PagoIcon style={{ width: 14, height: 14, color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
      </div>

      <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-tertiary)', flexShrink: 0 }}
        strokeWidth={1.75} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  )
}

// ─── Vista Lista ───────────────────────────────────────────────────────────────

function VistaLista({
  recursos, reservas, onSelect,
}: { recursos: RecursoReserva[]; reservas: Reserva[]; onSelect: (r: Reserva) => void }) {
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set(recursos.map((r) => r.id)))

  const toggle = (id: string) =>
    setAbiertos((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="space-y-3">
      {recursos.map((recurso) => {
        const Icon = TIPO_ICON[recurso.tipo] ?? Layers
        const resDeRecurso = reservas
          .filter((r) => r.recurso_id === recurso.id)
          .sort((a, b) => a.inicio.localeCompare(b.inicio))
        const abierto = abiertos.has(recurso.id)

        return (
          <div key={recurso.id} className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
            {/* Cabecera de grupo */}
            <button
              onClick={() => toggle(recurso.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: abierto && resDeRecurso.length > 0 ? '1px solid var(--border-subtle)' : 'none' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${recurso.color ?? 'var(--accent)'}18` }}
              >
                <Icon style={{ width: 16, height: 16, color: recurso.color ?? 'var(--accent)' }} strokeWidth={1.75} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {recurso.nombre}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {resDeRecurso.length} reserva{resDeRecurso.length !== 1 ? 's' : ''} hoy
                </p>
              </div>
              <ChevronDown
                style={{ width: 16, height: 16, color: 'var(--text-tertiary)',
                  transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease' }}
                strokeWidth={1.75}
              />
            </button>

            {/* Reservas del recurso */}
            <AnimatePresence initial={false}>
              {abierto && resDeRecurso.length > 0 && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-2">
                    {resDeRecurso.map((r) => (
                      <ReservaFila key={r.id} reserva={r} onSelect={onSelect} />
                    ))}
                  </div>
                </motion.div>
              )}
              {abierto && resDeRecurso.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-4 text-center"
                >
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin reservas para hoy</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ─── Vista Grid ────────────────────────────────────────────────────────────────

function VistaGrid({
  recursos, reservas, onSelect,
}: { recursos: RecursoReserva[]; reservas: Reserva[]; onSelect: (r: Reserva) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {recursos.map((recurso) => {
        const Icon = TIPO_ICON[recurso.tipo] ?? Layers
        const resDeRecurso = reservas
          .filter((r) => r.recurso_id === recurso.id)
          .sort((a, b) => a.inicio.localeCompare(b.inicio))
        const accentColor = recurso.color ?? 'var(--accent)'

        return (
          <motion.div
            key={recurso.id}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              minHeight: 240,
            }}
            whileHover={{ borderColor: `${accentColor}40` }}
            transition={{ duration: 0.2 }}
          >
            {/* Card header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 shrink-0"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: `linear-gradient(135deg, ${accentColor}0D 0%, transparent 60%)`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accentColor}18` }}
              >
                <Icon style={{ width: 18, height: 18, color: accentColor }} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {recurso.nombre}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {resDeRecurso.length} hoy
                </p>
              </div>
              {/* Indicador ocupación */}
              <div className="shrink-0 text-right">
                <p className="text-xl font-black tabular-nums" style={{ color: accentColor, lineHeight: 1 }}>
                  {resDeRecurso.filter((r) => r.estado === 'en_curso' || r.estado === 'confirmada').length}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-tertiary)' }}>
                  activas
                </p>
              </div>
            </div>

            {/* Lista compacta */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
              {resDeRecurso.length === 0 ? (
                <div className="h-full flex items-center justify-center py-8">
                  <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                    Sin citas hoy
                  </p>
                </div>
              ) : (
                resDeRecurso.map((r) => {
                  const cfg = ESTADO_CONFIG[r.estado]
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelect(r)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="w-1 h-7 rounded-full shrink-0" style={{ background: cfg.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {r.cliente_nombre}
                        </p>
                        <p className="text-[10px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                          {formatHora(r.inicio)}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Vista Calor ───────────────────────────────────────────────────────────────

function VistaCalor({
  recursos, onSelect,
}: { recursos: RecursoReserva[]; onSelect: (r: RecursoReserva) => void }) {
  const maxCount = Math.max(...recursos.map((r) => r.reservas_count ?? 0), 1)

  // Ordenar de mayor a menor reservas
  const sorted = [...recursos].sort((a, b) => (b.reservas_count ?? 0) - (a.reservas_count ?? 0))

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>
        Tamaño proporcional a reservas de los últimos 30 días
      </p>
      <div className="flex flex-wrap gap-3">
        {sorted.map((recurso, i) => {
          const count     = recurso.reservas_count ?? 0
          const ratio     = count / maxCount
          const Icon      = TIPO_ICON[recurso.tipo] ?? Layers
          const accent    = recurso.color ?? 'var(--accent)'
          // Altura: 120px mínimo, hasta 320px máximo
          const altura    = Math.round(120 + ratio * 200)
          // Ancho base relativo: los más altos también son más anchos
          const flexGrow  = Math.max(1, Math.round(ratio * 4))
          // Opacidad del glow según ratio
          const glowAlpha = (0.06 + ratio * 0.20).toFixed(2)

          return (
            <motion.button
              key={recurso.id}
              onClick={() => onSelect(recurso)}
              className="relative flex flex-col justify-between p-4 rounded-2xl overflow-hidden text-left"
              style={{
                flexGrow,
                flexBasis: i === 0 ? '45%' : '140px',
                minWidth: 140,
                height: altura,
                background: 'var(--bg-elevated)',
                border: `1px solid ${accent}28`,
                boxShadow: `0 4px 24px rgba(${accent.startsWith('#') ? hexToRgb(accent) : '10,186,181'},${glowAlpha})`,
              }}
              whileHover={{ scale: 1.02, borderColor: `${accent}60` }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Fondo degradado */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top left, ${accent}10 0%, transparent 65%)`,
                }}
              />

              {/* Icono grande de fondo */}
              <div
                className="absolute bottom-3 right-3 pointer-events-none"
                style={{ opacity: 0.06 }}
              >
                <Icon style={{ width: 64, height: 64, color: accent }} strokeWidth={1} />
              </div>

              {/* Contenido */}
              <div className="relative z-10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${accent}18` }}
                >
                  <Icon style={{ width: 20, height: 20, color: accent }} strokeWidth={1.75} />
                </div>
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {recurso.nombre}
                </p>
                <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-tertiary)' }}>
                  {recurso.tipo}
                </p>
              </div>

              <div className="relative z-10">
                <p
                  className="font-black tabular-nums"
                  style={{
                    color: accent,
                    fontSize: Math.round(24 + ratio * 20),
                    lineHeight: 1,
                  }}
                >
                  {count}
                </p>
                <p className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  reservas / 30 días
                </p>
                {i === 0 && (
                  <span
                    className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    <TrendingUp style={{ width: 10, height: 10 }} strokeWidth={2} />
                    Más activo
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Convierte #RRGGBB a "R,G,B"
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ReservasClient({
  recursos,
  reservasHoy,
  auth,
  fechaHoy,
}: ReservasClientProps) {
  const [vista, setVista]                   = useState<Vista>('grid')
  const [reservaSeleccionada, setSeleccion] = useState<Reserva | null>(null)
  const [reservasState, setReservas]        = useState<Reserva[]>(reservasHoy)
  const [fecha, setFecha]                   = useState(fechaHoy)

  // Optimistic update local tras acción de servidor
  const handleUpdate = (id: string, campo: 'estado' | 'pago', valor: unknown) => {
    setReservas((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (campo === 'estado') return { ...r, estado: valor as EstadoReserva }
        const { metodoPago, estadoPago } = valor as { metodoPago: MetodoPago; estadoPago: EstadoPago }
        return { ...r, metodo_pago: metodoPago, estado_pago: estadoPago }
      })
    )
  }

  const esHoy = fecha === fechaHoy
  const totalActivas = reservasState.filter(
    (r) => r.estado === 'confirmada' || r.estado === 'en_curso'
  ).length
  const totalPendientes = reservasState.filter((r) => r.estado === 'programada').length

  const vistas: { id: Vista; icon: React.ElementType; label: string }[] = [
    { id: 'lista', icon: List,        label: 'Lista' },
    { id: 'grid',  icon: LayoutGrid,  label: 'Grid'  },
    { id: 'calor', icon: Flame,       label: 'Calor' },
  ]

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg-base)' }}>
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-30 px-4 pt-5 pb-3"
        style={{
          background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Fila 1: título + acciones */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Reservas
            </h1>
            <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-tertiary)' }}>
              {formatFecha(fecha + 'T12:00:00Z')}
              {esHoy && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{ background: 'rgba(10,186,181,0.12)', color: 'var(--accent)' }}>
                  Hoy
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Navegación fecha */}
            <button
              onClick={() => setFecha(addDays(fecha, -1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={2} />
            </button>
            {!esHoy && (
              <button
                onClick={() => setFecha(fechaHoy)}
                className="px-3 h-8 text-xs font-semibold rounded-xl transition-all"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'var(--accent)' }}
              >
                Hoy
              </button>
            )}
            <button
              onClick={() => setFecha(addDays(fecha, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <ArrowRight style={{ width: 14, height: 14 }} strokeWidth={2} />
            </button>

            {/* Panel en vivo */}
            <Link
              href="/dashboard/panel-en-vivo"
              className="flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-xl transition-all"
              style={{ background: 'var(--accent)', color: '#080c10' }}
            >
              <Maximize2 style={{ width: 12, height: 12 }} strokeWidth={2.5} />
              Panel
            </Link>
          </div>
        </div>

        {/* Fila 2: métricas rápidas + view toggle */}
        <div className="flex items-center justify-between gap-3">
          {/* Métricas */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0ABAB5' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {totalActivas}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>activas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#94A3B8' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {totalPendientes}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>pendientes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#64748B' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {reservasState.length}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>total</span>
            </div>
          </div>

          {/* Selector de vista */}
          <div
            className="flex items-center p-1 rounded-xl gap-0.5"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}
          >
            {vistas.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setVista(id)}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  color: vista === id ? '#080c10' : 'var(--text-tertiary)',
                }}
              >
                {vista === id && (
                  <motion.div
                    layoutId="vistaActive"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'var(--accent)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon style={{ width: 13, height: 13, position: 'relative', zIndex: 1 }} strokeWidth={vista === id ? 2.5 : 1.75} />
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={vista}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {vista === 'lista' && (
              <VistaLista
                recursos={recursos}
                reservas={reservasState}
                onSelect={setSeleccion}
              />
            )}
            {vista === 'grid' && (
              <VistaGrid
                recursos={recursos}
                reservas={reservasState}
                onSelect={setSeleccion}
              />
            )}
            {vista === 'calor' && (
              <VistaCalor
                recursos={recursos}
                onSelect={(r) => {
                  // En vista calor, click en recurso → cambiar a grid filtrado (por ahora cambia a lista)
                  setVista('lista')
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Estado vacío total */}
        {recursos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays style={{ width: 40, height: 40, color: 'var(--text-tertiary)', marginBottom: 16 }} strokeWidth={1.25} />
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Sin recursos configurados</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Configura tus recursos en el onboarding para activar las reservas.
            </p>
          </div>
        )}
      </div>

      {/* ── Modal acción ── */}
      {reservaSeleccionada && (
        <AccionModal
          reserva={reservaSeleccionada}
          onClose={() => setSeleccion(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
