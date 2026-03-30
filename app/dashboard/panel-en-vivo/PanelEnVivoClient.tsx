'use client'

/**
 * PanelEnVivoClient.tsx — Panel de atención en persona, fullscreen.
 * Muestra el estado de cada recurso en tiempo real durante la jornada.
 * Diseñado para una tablet o monitor en el local.
 */

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
  Ban,
  Banknote,
  Wallet,
  CreditCard,
  Smartphone,
  Scissors,
  UtensilsCrossed,
  UserCheck,
  Sparkles,
  DoorOpen,
  Layers,
  Plus,
  RefreshCw,
  CalendarClock,
  User,
} from 'lucide-react'
import type {
  RecursoReserva,
  Reserva,
  EstadoReserva,
  MetodoPago,
  EstadoPago,
  AuthContext,
  TipoRecurso,
} from '@/app/dashboard/types'
import { actualizarEstadoReserva, registrarPagoReserva } from '@/app/dashboard/reservas/actions'
import Link from 'next/link'

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_ICON: Record<TipoRecurso, React.ElementType> = {
  silla:       Scissors,
  mesa:        UtensilsCrossed,
  profesional: UserCheck,
  cabina:      Sparkles,
  sala:        DoorOpen,
  custom:      Layers,
}

const ESTADO_CFG: Record<EstadoReserva, { label: string; color: string; bg: string; dot: string }> = {
  programada: { label: 'Programada', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', dot: '#94A3B8' },
  confirmada: { label: 'Confirmada', color: '#34D399',  bg: 'rgba(52,211,153,0.12)',  dot: '#34D399' },
  en_curso:   { label: 'En curso',   color: '#0ABAB5',  bg: 'rgba(10,186,181,0.15)',  dot: '#0ABAB5' },
  completada: { label: 'Completada', color: '#475569',  bg: 'rgba(71,85,105,0.10)',   dot: '#475569' },
  cancelada:  { label: 'Cancelada',  color: '#EF4444',  bg: 'rgba(239,68,68,0.10)',   dot: '#EF4444' },
  no_asiste:  { label: 'No asistió', color: '#F59E0B',  bg: 'rgba(245,158,11,0.12)',  dot: '#F59E0B' },
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function horaActual() {
  return new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

function fechaLarga(iso: string) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

/** Retorna reservas que empiezan en los próximos N minutos */
function proximasEnMinutos(reservas: Reserva[], minutos: number): Reserva[] {
  const ahora = Date.now()
  const tope  = ahora + minutos * 60 * 1000
  return reservas
    .filter((r) => {
      const inicio = new Date(r.inicio).getTime()
      return inicio >= ahora && inicio <= tope && r.estado !== 'cancelada' && r.estado !== 'no_asiste'
    })
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PanelEnVivoClientProps {
  recursos:    RecursoReserva[]
  reservasHoy: Reserva[]
  auth:        AuthContext
  fechaHoy:    string
}

// ─── Modal de acción rápida ────────────────────────────────────────────────────

interface AccionRapidaProps {
  reserva:  Reserva
  onClose:  () => void
  onUpdate: (id: string, cambios: Partial<Reserva>) => void
}

function AccionRapida({ reserva, onClose, onUpdate }: AccionRapidaProps) {
  const [isPending, startTransition] = useTransition()
  const cfg = ESTADO_CFG[reserva.estado]

  const acciones: { estado: EstadoReserva; label: string; icon: React.ElementType; color: string }[] = [
    { estado: 'confirmada', label: 'Llegó', icon: CheckCircle2, color: '#34D399' },
    { estado: 'en_curso',   label: 'En curso', icon: Timer,    color: '#0ABAB5' },
    { estado: 'completada', label: 'Listo',  icon: CheckCircle2, color: '#64748B' },
    { estado: 'no_asiste',  label: 'No vino', icon: AlertCircle, color: '#F59E0B' },
    { estado: 'cancelada',  label: 'Cancelar', icon: Ban,       color: '#EF4444' },
  ]

  const metodos: { key: MetodoPago; label: string; icon: React.ElementType }[] = [
    { key: 'efectivo',      label: 'Efectivo',    icon: Banknote   },
    { key: 'transferencia', label: 'Transfer.',   icon: Wallet     },
    { key: 'tarjeta',       label: 'Tarjeta',     icon: CreditCard },
    { key: 'pagado_wsp',    label: 'Ya pagó WSP', icon: Smartphone },
  ]

  const handleEstado = (estado: EstadoReserva) => {
    startTransition(async () => {
      const res = await actualizarEstadoReserva(reserva.id, estado)
      if (res.ok) { onUpdate(reserva.id, { estado }); onClose() }
    })
  }

  const handlePago = (metodo: MetodoPago) => {
    const ep: EstadoPago = metodo === 'pagado_wsp' ? 'anticipo' : 'pagado'
    startTransition(async () => {
      const res = await registrarPagoReserva(reserva.id, metodo, ep)
      if (res.ok) { onUpdate(reserva.id, { metodo_pago: metodo, estado_pago: ep }); onClose() }
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        initial={{ scale: 0.90, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            background: `linear-gradient(135deg, ${cfg.dot}0D 0%, transparent 60%)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                {reserva.cliente_nombre}
              </p>
              {reserva.servicio && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {reserva.servicio}
                </p>
              )}
              <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {formatHora(reserva.inicio)} → {formatHora(reserva.fin)}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Acciones estado */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-tertiary)' }}>
            Estado
          </p>
          <div className="grid grid-cols-5 gap-2">
            {acciones.map(({ estado, label, icon: Icon, color }) => (
              <button
                key={estado}
                onClick={() => handleEstado(estado)}
                disabled={isPending || reserva.estado === estado}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-center transition-all"
                style={{
                  color: reserva.estado === estado ? color : 'var(--text-secondary)',
                  background: reserva.estado === estado ? `${color}18` : 'var(--bg-glass)',
                  border: `1px solid ${reserva.estado === estado ? `${color}40` : 'var(--border-subtle)'}`,
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <Icon style={{ width: 20, height: 20, color }} strokeWidth={1.75} />
                <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Registrar pago */}
        <div className="px-6 pb-6 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-tertiary)' }}>
            Registrar pago
          </p>
          <div className="grid grid-cols-2 gap-2">
            {metodos.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handlePago(key)}
                disabled={isPending}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                style={{
                  color: reserva.metodo_pago === key ? 'var(--accent)' : 'var(--text-primary)',
                  background: reserva.metodo_pago === key ? 'rgba(10,186,181,0.10)' : 'var(--bg-glass)',
                  border: `1px solid ${reserva.metodo_pago === key ? 'rgba(10,186,181,0.35)' : 'var(--border-subtle)'}`,
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} strokeWidth={1.5} />
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Tarjeta de recurso ────────────────────────────────────────────────────────

function TarjetaRecurso({
  recurso,
  reservas,
  onSelect,
}: {
  recurso:  RecursoReserva
  reservas: Reserva[]
  onSelect: (r: Reserva) => void
}) {
  const Icon    = TIPO_ICON[recurso.tipo] ?? Layers
  const accent  = recurso.color ?? '#0ABAB5'
  const sortedRes = [...reservas].sort((a, b) => a.inicio.localeCompare(b.inicio))
  const enCurso = sortedRes.find((r) => r.estado === 'en_curso')
  const proxima = sortedRes.find(
    (r) => r.estado === 'programada' || r.estado === 'confirmada'
  )

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        minHeight: 260,
      }}
    >
      {/* Header tarjeta */}
      <div
        className="px-4 py-3 flex items-center gap-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: `linear-gradient(135deg, ${accent}10 0%, transparent 60%)`,
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}18` }}
        >
          <Icon style={{ width: 18, height: 18, color: accent }} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate text-sm" style={{ color: 'var(--text-primary)' }}>
            {recurso.nombre}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {sortedRes.length} reserva{sortedRes.length !== 1 ? 's' : ''} hoy
          </p>
        </div>
        {enCurso && (
          <span
            className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: 'rgba(10,186,181,0.15)', color: '#0ABAB5' }}
          >
            En curso
          </span>
        )}
      </div>

      {/* Resumen en curso / próxima */}
      {(enCurso || proxima) && (
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {enCurso && (
            <div className="mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1"
                style={{ color: '#0ABAB5' }}>
                Ahora
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {enCurso.cliente_nombre}
              </p>
              {enCurso.servicio && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {enCurso.servicio}
                </p>
              )}
              <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                hasta {formatHora(enCurso.fin)}
              </p>
            </div>
          )}
          {proxima && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1"
                style={{ color: 'var(--text-tertiary)' }}>
                Próxima
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {proxima.cliente_nombre}
                <span className="ml-2 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {formatHora(proxima.inicio)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista del día */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {sortedRes.length === 0 ? (
          <div className="h-full flex items-center justify-center py-6">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin reservas hoy</p>
          </div>
        ) : (
          sortedRes.map((r) => {
            const cfg = ESTADO_CFG[r.estado]
            const estaCompletadaOCancelada =
              r.estado === 'completada' || r.estado === 'cancelada' || r.estado === 'no_asiste'
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: 'var(--bg-glass)',
                  border: `1px solid ${r.estado === 'en_curso' ? `${cfg.color}40` : 'var(--border-subtle)'}`,
                  opacity: estaCompletadaOCancelada ? 0.5 : 1,
                }}
              >
                {/* Dot estado */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cfg.dot }}
                />
                {/* Hora */}
                <span className="text-[11px] font-mono shrink-0 w-10"
                  style={{ color: 'var(--text-tertiary)' }}>
                  {formatHora(r.inicio)}
                </span>
                {/* Nombre */}
                <span className="flex-1 text-xs font-semibold truncate"
                  style={{ color: 'var(--text-primary)' }}>
                  {r.cliente_nombre}
                  {r.es_walk_in && (
                    <span className="ml-1 text-[9px] font-bold px-1 py-px rounded uppercase"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                      WI
                    </span>
                  )}
                </span>
                {/* Estado badge */}
                <span className="text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded-full"
                  style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.label}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function PanelEnVivoClient({
  recursos,
  reservasHoy,
  auth,
  fechaHoy,
}: PanelEnVivoClientProps) {
  const [reservas, setReservas]         = useState<Reserva[]>(reservasHoy)
  const [seleccionada, setSeleccionada] = useState<Reserva | null>(null)
  const [isFullscreen, setFullscreen]   = useState(false)
  const [hora, setHora]                 = useState(horaActual())

  // Reloj en vivo
  useEffect(() => {
    const interval = setInterval(() => setHora(horaActual()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdate = (id: string, cambios: Partial<Reserva>) => {
    setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, ...cambios } : r)))
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
    setFullscreen(!isFullscreen)
  }

  // Próximas llegadas (siguiente hora)
  const proximas = proximasEnMinutos(reservas, 60)

  // Reservas activas (en_curso)
  const enCursoTotal = reservas.filter((r) => r.estado === 'en_curso').length

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center justify-between gap-4 px-5 py-4"
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Volver */}
        <Link
          href="/dashboard/reservas"
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
          Reservas
        </Link>

        {/* Centro: nombre del negocio + fecha */}
        <div className="flex-1 text-center">
          <p className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
            Panel en Vivo
          </p>
          <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {fechaLarga(fechaHoy)}
          </p>
        </div>

        {/* Reloj + fullscreen */}
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-sm font-bold tabular-nums"
            style={{ color: 'var(--accent)', letterSpacing: '0.04em' }}
          >
            {hora}
          </span>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {isFullscreen
              ? <Minimize2 style={{ width: 15, height: 15 }} strokeWidth={2} />
              : <Maximize2 style={{ width: 15, height: 15 }} strokeWidth={2} />
            }
          </button>
        </div>
      </div>

      {/* ── Barra de KPIs rápidos ── */}
      <div
        className="shrink-0 flex items-center gap-0 px-4 py-3 overflow-x-auto scrollbar-none"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* En curso */}
        <div className="flex items-center gap-2 px-4 py-2 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#0ABAB5' }} />
          <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {enCursoTotal}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>en curso</span>
        </div>
        <div className="w-px h-6 mx-1 shrink-0" style={{ background: 'var(--border-subtle)' }} />
        {/* Próximas 60 min */}
        <div className="flex items-center gap-2 px-4 py-2 shrink-0">
          <CalendarClock style={{ width: 14, height: 14, color: '#F59E0B' }} strokeWidth={1.75} />
          <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {proximas.length}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>en 1h</span>
        </div>
        <div className="w-px h-6 mx-1 shrink-0" style={{ background: 'var(--border-subtle)' }} />
        {/* Total hoy */}
        <div className="flex items-center gap-2 px-4 py-2 shrink-0">
          <User style={{ width: 14, height: 14, color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
          <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {reservas.length}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>total hoy</span>
        </div>

        {/* Próximas llegadas — solo si hay */}
        {proximas.length > 0 && (
          <>
            <div className="w-px h-6 mx-1 shrink-0" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex items-center gap-2 px-4 py-2 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wide shrink-0"
                style={{ color: 'var(--text-tertiary)' }}>
                Próximas:
              </span>
              <div className="flex items-center gap-1.5">
                {proximas.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSeleccionada(r)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.10)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      color: '#F59E0B',
                    }}
                  >
                    <Clock style={{ width: 11, height: 11 }} strokeWidth={2} />
                    {formatHora(r.inicio)} {r.cliente_nombre.split(' ')[0]}
                  </button>
                ))}
                {proximas.length > 4 && (
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    +{proximas.length - 4}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Grid de recursos ── */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="grid gap-4 h-full"
          style={{
            gridTemplateColumns: `repeat(${Math.min(recursos.length, 4)}, minmax(240px, 1fr))`,
          }}
        >
          {recursos.map((recurso) => {
            const resDeRecurso = reservas.filter((r) => r.recurso_id === recurso.id)
            return (
              <TarjetaRecurso
                key={recurso.id}
                recurso={recurso}
                reservas={resDeRecurso}
                onSelect={setSeleccionada}
              />
            )
          })}

          {recursos.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <CalendarClock style={{ width: 48, height: 48, color: 'var(--text-tertiary)', marginBottom: 16 }} strokeWidth={1} />
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Sin recursos configurados
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Configura tus recursos en el onboarding para usar el panel en vivo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal acción rápida ── */}
      <AnimatePresence>
        {seleccionada && (
          <AccionRapida
            key="modal"
            reserva={seleccionada}
            onClose={() => setSeleccionada(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
