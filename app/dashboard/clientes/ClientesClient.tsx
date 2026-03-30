'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useModalStore } from '@/lib/modal-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp,
  DollarSign, ExternalLink, FileText, Flame, MessageCircle,
  MessageSquare, Pencil, Save, Search, Snowflake, Tag,
  Thermometer, Users, X,
} from 'lucide-react'
import type { Conversacion } from '@/app/dashboard/types'

/* ─── TYPES ──────────────────────────────────────────────────── */

interface Cliente {
  id: string
  business_id: string
  phone_number: string
  name: string | null
  total_spent: number
  last_interaction: string | null
  lead_status: 'frio' | 'tibio' | 'caliente' | null
  ai_tags: string[] | null
  status: string | null
  notes?: string | null
  created_at: string
}

type FiltroLead    = 'todos' | 'frio' | 'tibio' | 'caliente'
type FiltroSegmento = 'todos' | 'compradores' | 'sin_nombre' | 'inactivos' | 'leads_frios'
type SortKey       = 'name' | 'phone_number' | 'total_spent' | 'last_interaction' | 'lead_status'
type SortDir       = 'asc' | 'desc' | null

interface ClientesClientProps {
  clientes:   Cliente[]
  businessId: string
  isDemo?:    boolean
}

/* ─── CONSTANTS ──────────────────────────────────────────────── */

function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })
}
function formatFecha(f: string | null) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

const LEAD_CFG = {
  caliente: { label: 'Caliente', icon: Flame,       color: '#EF4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)'  },
  tibio:    { label: 'Tibio',    icon: Thermometer,  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  frio:     { label: 'Frío',     icon: Snowflake,    color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)' },
  default:  { label: 'Sin estado', icon: null,       color: 'var(--text-tertiary)', bg: 'var(--bg-elevated)', border: 'var(--border-subtle)' },
}

const LEAD_ORDER = { caliente: 2, tibio: 1, frio: 0, null: -1 }
const PAGE_SIZE_OPTIONS = [10, 25, 50]

const SEGMENTO_TABS: { id: FiltroSegmento; label: string }[] = [
  { id: 'todos',       label: 'Todos'           },
  { id: 'compradores', label: 'Compradores'     },
  { id: 'leads_frios', label: 'Lead sin compra' },
  { id: 'inactivos',   label: 'Inactivos +30d'  },
  { id: 'sin_nombre',  label: 'Sin nombre'      },
]

/* ─── HELPERS ────────────────────────────────────────────────── */

function getSegmentos(c: Cliente): string[] {
  const tags: string[] = []
  if ((c.total_spent ?? 0) > 0) tags.push('Comprador')
  if (!c.name) tags.push('Sin nombre')
  if (c.lead_status === 'frio' && (c.total_spent ?? 0) === 0) tags.push('Lead frío')
  if (c.last_interaction) {
    const dias = (Date.now() - new Date(c.last_interaction).getTime()) / 86400000
    if (dias > 30) tags.push('Inactivo')
  } else {
    const dias = (Date.now() - new Date(c.created_at).getTime()) / 86400000
    if (dias > 30) tags.push('Inactivo')
  }
  return tags
}

function matchesSegmento(c: Cliente, filtro: FiltroSegmento): boolean {
  if (filtro === 'todos') return true
  const segs = getSegmentos(c)
  if (filtro === 'compradores')  return segs.includes('Comprador')
  if (filtro === 'sin_nombre')   return segs.includes('Sin nombre')
  if (filtro === 'inactivos')    return segs.includes('Inactivo')
  if (filtro === 'leads_frios')  return segs.includes('Lead frío')
  return true
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" strokeWidth={2} />
  if (sortDir === 'asc') return <ChevronUp className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
  return <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
}

/* ─── COMPONENT ──────────────────────────────────────────────── */

export default function ClientesClient({ clientes: clientesIniciales, businessId, isDemo }: ClientesClientProps) {
  const supabase = useMemo(() => createClient(), [])

  /* ── table state ── */
  const [clientes,       setClientes]       = useState<Cliente[]>(clientesIniciales)
  const [busqueda,       setBusqueda]       = useState('')
  const [filtroLead,     setFiltroLead]     = useState<FiltroLead>('todos')
  const [filtroSegmento, setFiltroSegmento] = useState<FiltroSegmento>('todos')
  const [sortKey,        setSortKey]        = useState<SortKey | null>(null)
  const [sortDir,        setSortDir]        = useState<SortDir>(null)
  const [page,           setPage]           = useState(1)
  const [pageSize,       setPageSize]       = useState(10)

  /* ── drawer state ── */
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [editNombre,          setEditNombre]          = useState('')
  const [editLead,            setEditLead]            = useState<Cliente['lead_status']>(null)
  const [editNotes,           setEditNotes]           = useState('')
  const [guardando,           setGuardando]           = useState(false)
  const [convHistory,         setConvHistory]         = useState<Conversacion[]>([])
  const [loadingConvs,        setLoadingConvs]        = useState(false)
  const [historialOpen,       setHistorialOpen]       = useState(false)

  /* ── open drawer ── */
  const abrirDrawer = (c: Cliente) => {
    setClienteSeleccionado(c)
    setEditNombre(c.name ?? '')
    setEditLead(c.lead_status)
    setEditNotes(c.notes ?? '')
    setHistorialOpen(false)
    setConvHistory([])
  }

  const cerrarDrawer = () => setClienteSeleccionado(null)

  /* ── fetch conversation history ── */
  const fetchHistorial = useCallback(async (phoneNumber: string) => {
    setLoadingConvs(true)
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', businessId)
        .eq('phone_number', phoneNumber)
        .order('last_message_at', { ascending: false })
        .limit(10)
      setConvHistory((data ?? []) as Conversacion[])
    } catch {
      setConvHistory([])
    } finally {
      setLoadingConvs(false)
    }
  }, [supabase, businessId])

  useEffect(() => {
    if (historialOpen && clienteSeleccionado) {
      fetchHistorial(clienteSeleccionado.phone_number)
    }
  }, [historialOpen, clienteSeleccionado, fetchHistorial])

  // Notifica al store global cuando el drawer de cliente está abierto
  const { openModal, closeModal } = useModalStore()
  useEffect(() => {
    if (clienteSeleccionado !== null) {
      openModal()
      return () => closeModal()
    }
  }, [clienteSeleccionado, openModal, closeModal])

  /* ── save client edits ── */
  const guardarCliente = async () => {
    if (!clienteSeleccionado || isDemo) return
    setGuardando(true)
    const updates = {
      name:        editNombre.trim() || null,
      lead_status: editLead,
      notes:       editNotes.trim() || null,
    }
    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clienteSeleccionado.id)

    if (error) {
      toast.error('Error al guardar')
    } else {
      toast.success('Cliente actualizado')
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteSeleccionado.id ? { ...c, ...updates } : c
        )
      )
      setClienteSeleccionado((prev) => prev ? { ...prev, ...updates } : prev)
    }
    setGuardando(false)
  }

  /* ── table filtering + sorting ── */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortKey(null); setSortDir(null) }
    } else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const filtrados = useMemo(() => {
    let rows = clientes.filter((c) => {
      const q = busqueda.toLowerCase()
      return (
        ((c.name?.toLowerCase() ?? '').includes(q) || c.phone_number.includes(q)) &&
        (filtroLead === 'todos' || c.lead_status === filtroLead) &&
        matchesSegmento(c, filtroSegmento)
      )
    })

    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        let va: string | number, vb: string | number
        switch (sortKey) {
          case 'name':             va = a.name?.toLowerCase() ?? '';  vb = b.name?.toLowerCase() ?? '';  break
          case 'phone_number':     va = a.phone_number;               vb = b.phone_number;               break
          case 'total_spent':      va = a.total_spent ?? 0;           vb = b.total_spent ?? 0;           break
          case 'last_interaction': va = a.last_interaction ?? '';     vb = b.last_interaction ?? '';     break
          case 'lead_status':
            va = LEAD_ORDER[(a.lead_status ?? 'null') as keyof typeof LEAD_ORDER] ?? -1
            vb = LEAD_ORDER[(b.lead_status ?? 'null') as keyof typeof LEAD_ORDER] ?? -1
            break
          default: va = ''; vb = ''
        }
        const cmp = va < vb ? -1 : va > vb ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [clientes, busqueda, filtroLead, filtroSegmento, sortKey, sortDir])

  const totalPages  = Math.max(1, Math.ceil(filtrados.length / pageSize))
  const paginados   = filtrados.slice((page - 1) * pageSize, page * pageSize)
  const calientes   = clientes.filter((c) => c.lead_status === 'caliente').length
  const ingresos    = clientes.reduce((s, c) => s + (c.total_spent ?? 0), 0)
  const compradores = clientes.filter((c) => (c.total_spent ?? 0) > 0).length

  const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'name',             label: 'Nombre'             },
    { key: 'phone_number',     label: 'Teléfono'           },
    { key: 'total_spent',      label: 'Total gastado'      },
    { key: 'last_interaction', label: 'Última interacción' },
    { key: 'lead_status',      label: 'Estado lead'        },
  ]

  /* ─── RENDER ─────────────────────────────────────────────── */

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
          Clientes
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Gestiona tu base de clientes — click en cualquier fila para editar
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Users,      label: 'Total clientes',  value: clientes.length,      color: 'var(--accent)', bg: 'var(--accent-dim)' },
          { icon: Flame,      label: 'Leads calientes', value: calientes,             color: '#EF4444',       bg: 'rgba(239,68,68,0.1)' },
          { icon: DollarSign, label: 'Compradores',     value: compradores,           color: '#10B981',       bg: 'rgba(16,185,129,0.1)' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
              <p className="font-display font-bold text-xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                {typeof s.value === 'number' && s.label === 'Ingresos totales' ? formatCLP(s.value) : s.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Segmentation filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {SEGMENTO_TABS.map((tab) => {
          const count = tab.id === 'todos' ? clientes.length
            : clientes.filter((c) => matchesSegmento(c, tab.id)).length
          const isActive = filtroSegmento === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setFiltroSegmento(tab.id); setPage(1) }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                isActive
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }
              }
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-px text-[9px] font-bold"
                style={{
                  background: isActive ? 'rgba(10,186,181,0.2)' : 'var(--bg-surface)',
                  color:      isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search + lead filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
            className="input-glass pl-9"
          />
        </div>
        <select
          value={filtroLead}
          onChange={(e) => { setFiltroLead(e.target.value as FiltroLead); setPage(1) }}
          className="input-glass sm:w-[200px] cursor-pointer"
        >
          <option value="todos">Todos los estados</option>
          <option value="caliente">Caliente</option>
          <option value="tibio">Tibio</option>
          <option value="frio">Frío</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3.5 text-left cursor-pointer select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.06em] transition-colors"
                        style={{ color: sortKey === col.key ? 'var(--accent)' : 'var(--text-tertiary)' }}
                      >
                        {col.label}
                      </span>
                      <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>
                    Segmentos
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sin resultados</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {clientes.length === 0 ? 'Aún no tienes clientes registrados' : 'Intenta con otros filtros'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginados.map((c, i) => {
                  const cfg  = LEAD_CFG[c.lead_status ?? 'default'] ?? LEAD_CFG.default
                  const segs = getSegmentos(c)
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.25 }}
                      onClick={() => abrirDrawer(c)}
                      className="cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                          >
                            {(c.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {c.name ?? <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Sin nombre</span>}
                            </span>
                            {c.notes && (
                              <FileText className="inline w-3 h-3 ml-1.5" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {c.phone_number}
                      </td>
                      <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatCLP(c.total_spent ?? 0)}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                        {formatFecha(c.last_interaction)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.icon && <cfg.icon className="w-3 h-3" />}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {segs.length > 0
                            ? segs.map((seg) => (
                                <span
                                  key={seg}
                                  className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                                  style={{
                                    background: seg === 'Comprador' ? 'rgba(16,185,129,0.1)' : seg === 'Inactivo' ? 'rgba(100,116,139,0.1)' : 'rgba(245,158,11,0.1)',
                                    color:      seg === 'Comprador' ? '#10B981'              : seg === 'Inactivo' ? '#64748B'              : '#F59E0B',
                                  }}
                                >
                                  {seg}
                                </span>
                              ))
                            : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Mostrando{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {filtrados.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtrados.length)}
              </span>{' '}
              de{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filtrados.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="text-xs px-2 py-1 rounded-lg cursor-pointer outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / pág.</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} className="px-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>…</span>
                  : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: page === p ? 'var(--accent)' : 'transparent',
                        color:      page === p ? '#fff' : 'var(--text-secondary)',
                        fontWeight: page === p ? 700 : 400,
                      }}
                      onMouseEnter={(e) => page !== p && (e.currentTarget.style.background = 'var(--bg-surface)')}
                      onMouseLeave={(e) => page !== p && (e.currentTarget.style.background = 'transparent')}
                    >
                      {p}
                    </button>
                  )
              )}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Drawer backdrop ── */}
      <AnimatePresence>
        {clienteSeleccionado && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={cerrarDrawer}
            />

            {/* ── Drawer panel ── */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
              style={{
                width:      'min(420px, 100vw)',
                background: 'var(--bg-elevated)',
                borderLeft: '1px solid var(--border-subtle)',
                boxShadow:  '-8px 0 32px rgba(0,0,0,0.25)',
              }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                  >
                    {(clienteSeleccionado.name ?? clienteSeleccionado.phone_number).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {clienteSeleccionado.name ?? 'Sin nombre'}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {clienteSeleccionado.phone_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarDrawer}
                  className="p-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-2 gap-2 px-5 py-4"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Total gastado</p>
                  <p className="text-lg font-bold mt-1" style={{ color: 'var(--accent)' }}>
                    {formatCLP(clienteSeleccionado.total_spent ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Última interacción</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {formatFecha(clienteSeleccionado.last_interaction)}
                  </p>
                </div>
              </div>

              {/* Edit fields */}
              <div className="px-5 py-4 space-y-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Editar cliente</p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Nombre
                  </label>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="input-glass"
                  />
                </div>

                {/* Lead status */}
                <div>
                  <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Temperatura del lead
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['frio', 'tibio', 'caliente'] as const).map((l) => {
                      const cfg = LEAD_CFG[l]
                      const isActive = editLead === l
                      return (
                        <button
                          key={l}
                          onClick={() => setEditLead(l)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={
                            isActive
                              ? { background: cfg.bg, color: cfg.color, border: `2px solid ${cfg.border}` }
                              : { background: 'var(--bg-surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }
                          }
                        >
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <FileText className="w-3.5 h-3.5" strokeWidth={1.75} /> Nota interna
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Solo visible para tu equipo. Ej: prefiere ser contactado por WhatsApp, interesado en producto X..."
                    rows={3}
                    className="input-glass resize-none"
                  />
                </div>

                {/* AI tags */}
                {(clienteSeleccionado.ai_tags?.length ?? 0) > 0 && (
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: 'var(--text-secondary)' }}>
                      <Tag className="w-3.5 h-3.5" strokeWidth={1.75} /> Tags IA
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {clienteSeleccionado.ai_tags!.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={guardarCliente}
                  disabled={guardando || isDemo}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 btn-accent"
                >
                  <Save className="w-4 h-4" strokeWidth={1.75} />
                  {guardando ? 'Guardando…' : isDemo ? 'Demo (no editable)' : 'Guardar cambios'}
                </button>

                {/* WhatsApp link */}
                <a
                  href={`https://wa.me/${clienteSeleccionado.phone_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'rgba(37,211,102,0.1)',
                    color:      '#25D366',
                    border:     '1px solid rgba(37,211,102,0.3)',
                  }}
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
                  Iniciar conversación en WhatsApp
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" strokeWidth={1.75} />
                </a>

                {/* Conversation history */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  <button
                    onClick={() => setHistorialOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors text-sm"
                    style={{ background: 'var(--bg-surface)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  >
                    <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <MessageCircle className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
                      Historial de conversaciones
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${historialOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-tertiary)' }}
                      strokeWidth={1.75}
                    />
                  </button>

                  <AnimatePresence>
                    {historialOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 space-y-2" style={{ background: 'var(--bg-elevated)' }}>
                          {loadingConvs ? (
                            <p className="text-xs text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
                              Cargando…
                            </p>
                          ) : convHistory.length === 0 ? (
                            <p className="text-xs text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
                              Sin conversaciones registradas
                            </p>
                          ) : (
                            convHistory.map((conv) => {
                              const statusCfg =
                                conv.status === 'active' ? { label: 'Activa', color: '#10B981' }
                                : conv.status === 'pending_approval' ? { label: 'Pend. aprobación', color: '#F59E0B' }
                                : { label: 'Archivada', color: 'var(--text-tertiary)' }
                              return (
                                <div
                                  key={conv.id}
                                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                                  style={{ background: 'var(--bg-surface)' }}
                                >
                                  <div>
                                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                      {formatFecha(conv.last_message_at)}
                                    </p>
                                    <p className="text-[10px] mt-0.5" style={{ color: statusCfg.color }}>
                                      {statusCfg.label}
                                    </p>
                                  </div>
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}
                                  >
                                    #{conv.id.slice(-6)}
                                  </span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
