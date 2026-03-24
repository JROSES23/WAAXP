'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Flame, Thermometer, Snowflake, DollarSign } from 'lucide-react'

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
  created_at: string
}

type FiltroLead = 'todos' | 'frio' | 'tibio' | 'caliente'
interface ClientesClientProps { clientes: Cliente[]; businessId: string }

function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })
}
function formatFecha(f: string | null) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

const LEAD_CFG = {
  caliente: { label: 'Caliente', icon: Flame,      color: '#EF4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)'   },
  tibio:    { label: 'Tibio',    icon: Thermometer, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)'  },
  frio:     { label: 'Frío',     icon: Snowflake,   color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)'  },
  default:  { label: 'Sin estado',icon: null,       color: 'var(--text-tertiary)', bg: 'var(--bg-elevated)', border: 'var(--border-subtle)' },
}

const rowFade = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.3 } }),
}

export default function ClientesClient({ clientes }: ClientesClientProps) {
  const [busqueda,   setBusqueda]   = useState('')
  const [filtroLead, setFiltroLead] = useState<FiltroLead>('todos')

  const filtrados = useMemo(() => clientes.filter((c) => {
    const q = busqueda.toLowerCase()
    return (
      ((c.name?.toLowerCase() ?? '').includes(q) || c.phone_number.includes(q)) &&
      (filtroLead === 'todos' || c.lead_status === filtroLead)
    )
  }), [clientes, busqueda, filtroLead])

  const calientes = clientes.filter((c) => c.lead_status === 'caliente').length
  const ingresos  = clientes.reduce((s, c) => s + (c.total_spent ?? 0), 0)

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Clientes</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Gestiona tu base de clientes y visualiza su comportamiento</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Users,      label: 'Total clientes',  value: clientes.length,     color: 'var(--accent)', bg: 'var(--accent-dim)' },
          { icon: Flame,      label: 'Leads calientes', value: calientes,            color: '#EF4444',       bg: 'rgba(239,68,68,0.1)' },
          { icon: DollarSign, label: 'Ingresos totales',value: formatCLP(ingresos),  color: '#10B981',       bg: 'rgba(16,185,129,0.1)' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
              <p className="font-display font-bold text-xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
          <input type="text" placeholder="Buscar por nombre o teléfono..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} className="input-glass pl-9" />
        </div>
        <select value={filtroLead} onChange={(e) => setFiltroLead(e.target.value as FiltroLead)}
          className="input-glass sm:w-[200px] cursor-pointer">
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
                {['Nombre', 'Teléfono', 'Total gastado', 'Última interacción', 'Estado lead', 'Tags IA'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sin resultados</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {clientes.length === 0 ? 'Aún no tienes clientes registrados' : 'Intenta con otros filtros'}
                  </p>
                </td></tr>
              ) : filtrados.map((c, i) => {
                const cfg = LEAD_CFG[c.lead_status ?? 'default'] ?? LEAD_CFG.default
                return (
                  <motion.tr key={c.id} custom={i} initial="hidden" animate="visible" variants={rowFade}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                          {(c.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name ?? 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{c.phone_number}</td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCLP(c.total_spent ?? 0)}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{formatFecha(c.last_interaction)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon && <cfg.icon className="w-3 h-3" />}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(c.ai_tags?.length ?? 0) > 0
                          ? c.ai_tags!.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{tag}</span>
                            ))
                          : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Mostrando <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filtrados.length}</span> de{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{clientes.length}</span> clientes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
