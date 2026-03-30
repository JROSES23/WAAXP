'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Conversacion, Mensaje, Negocio, Producto, Staff } from '@/app/dashboard/types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Edit2,
  Flame,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShoppingCart,
  User,
  X,
  Zap,
} from 'lucide-react'

/* ─── TYPES ─────────────────────────────────────────────────── */

type FilterTab = 'all' | 'ai' | 'approval' | 'no_response' | 'archived'

type IntentTag = 'precio' | 'stock' | 'cotizacion' | 'reclamo' | 'compra' | 'info'

interface ItemPedidoTemporal {
  idProducto: string
  nombre: string
  cantidad: number
  precioUnitario: number
}

interface InboxProps {
  negocio: Negocio
  conversaciones: Conversacion[]
  productos: Producto[]
  equipo: Staff[]
  realtimeMessages?: Mensaje[]
  onConsumeMessages?: (conversationId: string) => Mensaje[]
}

/* ─── INTENT META ────────────────────────────────────────────── */

const INTENT_META: Record<IntentTag, { label: string; bg: string; text: string }> = {
  precio:     { label: 'Precio',      bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  stock:      { label: 'Stock',       bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  cotizacion: { label: 'Cotización',  bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  reclamo:    { label: 'Reclamo',     bg: 'rgba(239,68,68,0.15)',  text: '#EF4444' },
  compra:     { label: 'Compra',      bg: 'rgba(10,186,181,0.15)', text: 'var(--accent)' },
  info:       { label: 'Info',        bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
}

/* ─── HELPERS ────────────────────────────────────────────────── */

function getIntent(conv: Conversacion): IntentTag {
  if (conv.metadata && typeof conv.metadata === 'object') {
    const m = conv.metadata as Record<string, unknown>
    if (typeof m.intent === 'string' && m.intent in INTENT_META) return m.intent as IntentTag
  }
  const intents: IntentTag[] = ['precio', 'cotizacion', 'stock', 'compra', 'reclamo', 'info']
  const hash = conv.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return intents[hash % intents.length]
}

function getTemp(conv: Conversacion): 'hot' | 'warm' | 'cold' {
  if (!conv.last_message_at) return 'cold'
  const mins = (Date.now() - new Date(conv.last_message_at).getTime()) / 60000
  if (conv.status === 'pending_approval' && mins > 30) return 'hot'
  if (conv.status === 'active' && mins > 120) return 'warm'
  return 'cold'
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function filterConvs(
  convs: Conversacion[],
  tab: FilterTab,
  search: string
): Conversacion[] {
  let result = convs

  switch (tab) {
    case 'ai':
      result = result.filter((c) => c.status === 'active')
      break
    case 'approval':
      result = result.filter((c) => c.status === 'pending_approval')
      break
    case 'no_response': {
      const threshold = Date.now() - 2 * 60 * 60 * 1000
      result = result.filter(
        (c) => c.status !== 'archived' && new Date(c.last_message_at).getTime() < threshold
      )
      break
    }
    case 'archived':
      result = result.filter((c) => c.status === 'archived')
      break
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (c) =>
        (c.client_name ?? '').toLowerCase().includes(q) ||
        c.phone_number.includes(q)
    )
  }

  return result
}

/* ─── HOVER PREVIEW ──────────────────────────────────────────── */

function HoverPreview({
  msgs,
  top,
  left,
}: {
  msgs: Mensaje[]
  top: number
  left: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 4 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'fixed',
        top,
        left,
        zIndex: 50,
        width: 280,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: '12px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
        pointerEvents: 'none',
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
        Vista previa
      </p>
      <div className="space-y-2">
        {msgs.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin mensajes aún</p>
        ) : (
          msgs.slice(-4).map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-xl px-3 py-1.5 text-[11px] leading-snug"
                style={
                  m.role === 'assistant'
                    ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                    : { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }
                }
              >
                {m.content.length > 80 ? m.content.slice(0, 80) + '…' : m.content}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

/* ─── FILTER TAB CONFIG ──────────────────────────────────────── */

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all',         label: 'Todas'          },
  { id: 'ai',          label: 'IA activa'       },
  { id: 'approval',    label: 'Aprobación'      },
  { id: 'no_response', label: 'Sin resp. +2h'   },
  { id: 'archived',    label: 'Archivadas'      },
]

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */

export default function Inbox({
  negocio,
  conversaciones,
  productos,
  equipo,
  realtimeMessages,
  onConsumeMessages,
}: InboxProps) {

  /* conversation state */
  const [selId, setSelId] = useState<string | null>(conversaciones[0]?.id ?? null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* human control + message input */
  const [controlHumano, setControlHumano] = useState(false)
  const [mensajeManual, setMensajeManual] = useState('')

  /* AI suggestion / approval flow */
  const [sugerencia, setSugerencia] = useState<string | null>(null)
  const [cargandoSugerencia, setCargandoSugerencia] = useState(false)
  const [editingDraft, setEditingDraft] = useState(false)
  const [draftText, setDraftText] = useState('')

  /* filter + search */
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  /* hover preview */
  const [hoverPreview, setHoverPreview] = useState<{ id: string; top: number; left: number } | null>(null)
  const [previewCache, setPreviewCache] = useState<Record<string, Mensaje[]>>({})
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* citas */
  const [servicioSeleccionado, setServicioSeleccionado] = useState('')
  const [staffSeleccionado, setStaffSeleccionado] = useState('')
  const [fechaCita, setFechaCita] = useState('')
  const [horaCita, setHoraCita] = useState('')
  const [mostrarAgendar, setMostrarAgendar] = useState(true)

  /* pedidos */
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidadProducto, setCantidadProducto] = useState(1)
  const [itemsPedido, setItemsPedido] = useState<ItemPedidoTemporal[]>([])
  const [mostrarPedido, setMostrarPedido] = useState(true)

  /* derived */
  const conversacionSeleccionada = conversaciones.find((c) => c.id === selId)
  const filtered = filterConvs(conversaciones, activeFilter, search)

  const modosServiciosActivos = negocio.modos_activos?.some(
    (m) => m === 'servicios' || m === 'reservas'
  )
  const modosProductosActivos = negocio.modos_activos?.includes('productos')
  const serviciosDisponibles = productos.filter((p) => p.tipo === 'servicio' || p.tipo === 'reserva')
  const productosDisponibles = productos.filter((p) => p.tipo === 'producto')
  const totalPedido = itemsPedido.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)

  /* ─── LOAD MESSAGES ───────────────────────────────────────── */

  const cargarMensajes = useCallback(async (id: string) => {
    setCargandoMensajes(true)
    setError(null)
    try {
      const res = await fetch(`/api/conversaciones/${id}/mensajes`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setMensajes(data.mensajes ?? [])
    } catch {
      setError('No se pudieron cargar los mensajes.')
    } finally {
      setCargandoMensajes(false)
    }
  }, [])

  const cargarSugerencia = useCallback(async (id: string) => {
    setCargandoSugerencia(true)
    try {
      const res = await fetch(`/api/conversaciones/${id}/sugerencia`)
      const data = await res.json()
      if (res.ok) {
        setSugerencia(data.sugerencia)
        setDraftText(data.sugerencia ?? '')
      }
    } catch {
      setSugerencia(null)
    } finally {
      setCargandoSugerencia(false)
    }
  }, [])

  useEffect(() => {
    if (selId) {
      cargarMensajes(selId)
      cargarSugerencia(selId)
      setControlHumano(false)
      setEditingDraft(false)
    }
  }, [selId, cargarMensajes, cargarSugerencia])

  /* ─── REALTIME INJECTION ──────────────────────────────────── */

  useEffect(() => {
    if (!realtimeMessages?.length || !selId) return
    const nuevos = realtimeMessages.filter((m) => m.conversation_id === selId)
    if (nuevos.length > 0) {
      setMensajes((prev) => {
        const ids = new Set(prev.map((m) => m.id))
        return [...prev, ...nuevos.filter((m) => !ids.has(m.id))]
      })
      onConsumeMessages?.(selId)
    }
  }, [realtimeMessages, selId, onConsumeMessages])

  /* ─── ACTIONS ─────────────────────────────────────────────── */

  const enviarMensaje = async (contenido: string) => {
    if (!selId || !contenido.trim()) return
    await fetch(`/api/conversaciones/${selId}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido, rol: 'assistant' }),
    })
    setMensajeManual('')
    setEditingDraft(false)
    await cargarMensajes(selId)
  }

  const confirmarCita = async () => {
    if (!selId || !servicioSeleccionado || !fechaCita || !horaCita) {
      setError('Completa servicio, fecha y hora para agendar.')
      return
    }
    await fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idConversacion: selId,
        idServicio: servicioSeleccionado,
        idStaff: staffSeleccionado || null,
        fechaHora: `${fechaCita}T${horaCita}:00`,
      }),
    })
    setFechaCita('')
    setHoraCita('')
    setServicioSeleccionado('')
    setStaffSeleccionado('')
    await cargarMensajes(selId)
  }

  const agregarItemPedido = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) return
    const producto = productosDisponibles.find((p) => p.id === productoSeleccionado)
    if (!producto) return
    setItemsPedido((prev) => [
      ...prev,
      { idProducto: producto.id, nombre: producto.nombre, cantidad: cantidadProducto, precioUnitario: producto.precio },
    ])
    setProductoSeleccionado('')
    setCantidadProducto(1)
  }

  const removerItemPedido = (idx: number) =>
    setItemsPedido((prev) => prev.filter((_, i) => i !== idx))

  const crearPedido = async () => {
    if (!selId || itemsPedido.length === 0) return
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idConversacion: selId,
        itemsPedido: itemsPedido.map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
        moneda: 'CLP',
      }),
    })
    setItemsPedido([])
    await cargarMensajes(selId)
  }

  /* ─── HOVER PREVIEW HANDLERS ──────────────────────────────── */

  const handleMouseEnter = async (
    conv: Conversacion,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    hoverTimerRef.current = setTimeout(async () => {
      if (!previewCache[conv.id]) {
        try {
          const res = await fetch(`/api/conversaciones/${conv.id}/mensajes`)
          const data = await res.json()
          const msgs: Mensaje[] = data.mensajes ?? []
          setPreviewCache((prev) => ({ ...prev, [conv.id]: msgs }))
          setHoverPreview({ id: conv.id, top: rect.top, left: rect.right + 8 })
        } catch {
          setHoverPreview({ id: conv.id, top: rect.top, left: rect.right + 8 })
        }
      } else {
        setHoverPreview({ id: conv.id, top: rect.top, left: rect.right + 8 })
      }
    }, 400)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setHoverPreview(null)
  }

  /* ─── RENDER ──────────────────────────────────────────────── */

  const isPendingApproval = conversacionSeleccionada?.status === 'pending_approval'

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ── Top header ── */}
      <div
        className="px-6 py-4 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div>
          <h1 className="font-display font-bold text-xl tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Bandeja de entrada
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {conversaciones.filter((c) => c.status !== 'archived').length} conversaciones activas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
          >
            {negocio.nombre}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className="w-[300px] flex flex-col shrink-0"
          style={{ borderRight: '1px solid var(--border-subtle)' }}
        >
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: 'var(--text-tertiary)' }}
                strokeWidth={1.75}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div
            className="px-3 pb-2 flex gap-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {TABS.map((tab) => {
              const isActive = activeFilter === tab.id
              const count =
                tab.id === 'approval'
                  ? conversaciones.filter((c) => c.status === 'pending_approval').length
                  : undefined
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200"
                  style={
                    isActive
                      ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                      : { background: 'transparent', color: 'var(--text-tertiary)', border: '1px solid transparent' }
                  }
                >
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span
                      className="rounded-full px-1 text-[9px] font-bold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin conversaciones</p>
              </div>
            ) : (
              filtered.map((conv) => {
                const isActive = selId === conv.id
                const intent = getIntent(conv)
                const intentMeta = INTENT_META[intent]
                const temp = getTemp(conv)
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelId(conv.id)}
                    onMouseEnter={(e) => handleMouseEnter(conv, e)}
                    onMouseLeave={handleMouseLeave}
                    className="w-full text-left px-3 py-3 transition-colors duration-150"
                    style={{
                      background: isActive ? 'var(--bg-surface)' : 'transparent',
                      borderBottom: '1px solid var(--border-subtle)',
                      borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Status dot */}
                      <div className="mt-1 shrink-0 relative">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              conv.status === 'active'
                                ? '#10B981'
                                : conv.status === 'pending_approval'
                                ? '#F59E0B'
                                : 'var(--text-tertiary)',
                          }}
                        />
                        {temp === 'hot' && (
                          <Flame
                            className="absolute -top-2 -right-2 w-3 h-3"
                            style={{ color: '#EF4444' }}
                            strokeWidth={2}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {conv.client_name || conv.phone_number}
                          </p>
                          <span className="text-[10px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            {conv.last_message_at ? timeAgo(conv.last_message_at) : '—'}
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {conv.phone_number}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {/* Intent tag */}
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                            style={{ background: intentMeta.bg, color: intentMeta.text }}
                          >
                            {intentMeta.label}
                          </span>
                          {/* Temperature badge */}
                          {temp === 'hot' && (
                            <span
                              className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                            >
                              <Flame className="w-2.5 h-2.5" strokeWidth={2} /> URG
                            </span>
                          )}
                          {temp === 'warm' && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                            >
                              +2h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Main chat area ── */}
        <section className="flex-1 flex flex-col min-w-0">

          {/* Chat header */}
          <div
            className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {(conversacionSeleccionada?.client_name ?? conversacionSeleccionada?.phone_number ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {conversacionSeleccionada?.client_name || 'Selecciona una conversación'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {conversacionSeleccionada?.phone_number || ''}
                </p>
              </div>
              {conversacionSeleccionada && (() => {
                const intent = getIntent(conversacionSeleccionada)
                const m = INTENT_META[intent]
                return (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg"
                    style={{ background: m.bg, color: m.text }}
                  >
                    {m.label}
                  </span>
                )
              })()}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setControlHumano(!controlHumano)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={
                  controlHumano
                    ? { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }
                    : { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                }
              >
                {controlHumano
                  ? <><User className="w-3 h-3" strokeWidth={2} /> Control humano</>
                  : <><Bot className="w-3 h-3" strokeWidth={2} /> IA activa</>}
              </button>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {mensajes.length} msgs
              </span>
            </div>
          </div>

          {/* ── Approval banner ── */}
          <AnimatePresence>
            {isPendingApproval && sugerencia && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden shrink-0"
              >
                <div
                  className="px-5 py-3 flex items-start gap-3"
                  style={{
                    background: 'rgba(245,158,11,0.06)',
                    borderBottom: '1px solid rgba(245,158,11,0.25)',
                  }}
                >
                  <Zap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F59E0B' }} strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#F59E0B' }}>
                      Respuesta pendiente de aprobación
                    </p>
                    {editingDraft ? (
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="w-full text-sm rounded-xl px-3 py-2 resize-none"
                        rows={3}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {cargandoSugerencia ? 'Cargando respuesta de IA…' : sugerencia}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {editingDraft ? (
                      <>
                        <button
                          onClick={() => { setEditingDraft(false); setDraftText(sugerencia ?? '') }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ color: 'var(--text-tertiary)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => enviarMensaje(draftText)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--accent)', color: '#080c10' }}
                        >
                          <Send className="w-3 h-3" strokeWidth={2} /> Enviar editado
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingDraft(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                        >
                          <Edit2 className="w-3 h-3" strokeWidth={2} /> Editar
                        </button>
                        <button
                          onClick={() => enviarMensaje(sugerencia!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--accent)', color: '#080c10' }}
                        >
                          <Check className="w-3 h-3" strokeWidth={2.5} /> Aprobar y enviar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-3"
            style={{ background: 'var(--bg-base)' }}
          >
            {cargandoMensajes ? (
              <div className="flex items-center justify-center h-24">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Cargando mensajes…</p>
              </div>
            ) : mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <MessageSquare className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin mensajes aún</p>
              </div>
            ) : (
              mensajes.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={
                      msg.role === 'assistant'
                        ? {
                            background: 'var(--accent-dim)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                          }
                        : {
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)',
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {error && (
            <div className="px-5 py-2 text-xs" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.06)', borderTop: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Message input */}
          <div
            className="px-4 py-3 shrink-0"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
          >
            <div className="flex items-end gap-2">
              <textarea
                value={mensajeManual}
                onChange={(e) => setMensajeManual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviarMensaje(mensajeManual)
                  }
                }}
                placeholder="Escribe una respuesta… (Enter para enviar)"
                className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm"
                rows={2}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => enviarMensaje(mensajeManual)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: 'var(--accent)', color: '#080c10' }}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
                Enviar
              </button>
            </div>
          </div>
        </section>

        {/* ── Right panel ── */}
        <aside
          className="w-[320px] shrink-0 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--border-subtle)' }}
        >
          {/* Client info */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Cliente
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                {conversacionSeleccionada?.client_name || 'Sin nombre'}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                {conversacionSeleccionada?.phone_number || '—'}
              </div>
            </div>
          </div>

          {/* Suggested reply (non-pending_approval view) */}
          {!isPendingApproval && (
            <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                Respuesta sugerida por IA
              </p>
              <div
                className="rounded-xl p-3 text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {cargandoSugerencia
                  ? 'Generando sugerencia…'
                  : sugerencia || 'La IA sugerirá una respuesta aquí.'}
              </div>
              {sugerencia && (
                <button
                  onClick={() => enviarMensaje(sugerencia)}
                  className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold w-full justify-center transition-all duration-200"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                >
                  <Check className="w-3 h-3" strokeWidth={2.5} /> Usar sugerencia
                </button>
              )}
            </div>
          )}

          {/* Citas */}
          {modosServiciosActivos && (
            <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setMostrarAgendar((s) => !s)}
                className="flex w-full items-center justify-between text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                  Agendar cita
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${mostrarAgendar ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-tertiary)' }}
                  strokeWidth={1.75}
                />
              </button>
              <AnimatePresence initial={false}>
                {mostrarAgendar && (
                  <motion.div
                    key="agendar"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      {[
                        { value: servicioSeleccionado, onChange: (v: string) => setServicioSeleccionado(v), opts: serviciosDisponibles, placeholder: 'Selecciona un servicio' },
                        { value: staffSeleccionado,    onChange: (v: string) => setStaffSeleccionado(v),    opts: equipo,              placeholder: 'Cualquier agente' },
                      ].map(({ value, onChange, opts, placeholder }, i) => (
                        <select
                          key={i}
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          className="w-full rounded-xl px-3 py-2 text-sm"
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                          }}
                        >
                          <option value="">{placeholder}</option>
                          {opts.map((o) => (
                            <option key={o.id} value={o.id}>{o.nombre}</option>
                          ))}
                        </select>
                      ))}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={fechaCita}
                          onChange={(e) => setFechaCita(e.target.value)}
                          className="rounded-xl px-3 py-2 text-sm"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                        <input
                          type="time"
                          value={horaCita}
                          onChange={(e) => setHoraCita(e.target.value)}
                          className="rounded-xl px-3 py-2 text-sm"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                      <button
                        onClick={confirmarCita}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                      >
                        <Calendar className="w-4 h-4" strokeWidth={1.75} /> Confirmar cita
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Pedidos */}
          {modosProductosActivos && (
            <div className="p-4">
              <button
                onClick={() => setMostrarPedido((s) => !s)}
                className="flex w-full items-center justify-between text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                  Crear pedido
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${mostrarPedido ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-tertiary)' }}
                  strokeWidth={1.75}
                />
              </button>
              <AnimatePresence initial={false}>
                {mostrarPedido && (
                  <motion.div
                    key="pedido"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      <select
                        value={productoSeleccionado}
                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                        className="w-full rounded-xl px-3 py-2 text-sm"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                      >
                        <option value="">Selecciona un producto</option>
                        {productosDisponibles.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={cantidadProducto}
                          onChange={(e) => setCantidadProducto(Number(e.target.value))}
                          className="w-20 rounded-xl px-3 py-2 text-sm"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                        <button
                          onClick={agregarItemPedido}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" strokeWidth={1.75} /> Agregar
                        </button>
                      </div>

                      {itemsPedido.length > 0 && (
                        <div
                          className="rounded-xl p-3 space-y-2 text-xs"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                        >
                          {itemsPedido.map((item, idx) => (
                            <div key={`${item.idProducto}-${idx}`} className="flex justify-between items-center">
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {item.nombre} ×{item.cantidad}
                              </span>
                              <div className="flex items-center gap-2">
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {(item.cantidad * item.precioUnitario).toLocaleString()} CLP
                                </span>
                                <button
                                  onClick={() => removerItemPedido(idx)}
                                  className="rounded-full p-0.5"
                                  style={{ color: '#EF4444' }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between font-semibold pt-1" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                            <span>Total</span>
                            <span>{totalPedido.toLocaleString()} CLP</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={crearPedido}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
                        style={{ background: 'var(--accent)', color: '#080c10' }}
                      >
                        <ClipboardList className="w-4 h-4" strokeWidth={1.75} /> Crear pedido
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </aside>
      </div>

      {/* ── Hover preview portal ── */}
      <AnimatePresence>
        {hoverPreview && (
          <HoverPreview
            msgs={previewCache[hoverPreview.id] ?? []}
            top={hoverPreview.top}
            left={hoverPreview.left}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
