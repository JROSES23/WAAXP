'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LifeBuoy, Plus, Clock, CheckCircle2,
  AlertCircle, MessageSquare, Send, X,
} from 'lucide-react'
import type { SupportTicket } from '@/app/dashboard/types'

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low:    { label: 'Baja',    color: 'var(--text-secondary)', bg: 'var(--bg-elevated)',          border: 'var(--border-subtle)'          },
  normal: { label: 'Normal',  color: '#3B82F6',               bg: 'rgba(59,130,246,0.1)',         border: 'rgba(59,130,246,0.25)'         },
  high:   { label: 'Alta',    color: '#F59E0B',               bg: 'rgba(245,158,11,0.1)',         border: 'rgba(245,158,11,0.25)'         },
  urgent: { label: 'Urgente', color: '#EF4444',               bg: 'rgba(239,68,68,0.1)',          border: 'rgba(239,68,68,0.25)'          },
}

const STATUS_CFG: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  open:        { icon: AlertCircle,  label: 'Abierto',     color: '#3B82F6' },
  in_progress: { icon: Clock,        label: 'En progreso', color: '#F59E0B' },
  resolved:    { icon: CheckCircle2, label: 'Resuelto',    color: '#10B981' },
  closed:      { icon: CheckCircle2, label: 'Cerrado',     color: 'var(--text-tertiary)' },
}

interface SoporteClientProps {
  tickets:    SupportTicket[]
  businessId: string
  userId:     string
}

const cardStyle    = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }
const modalOverlay = { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }

export default function SoporteClient({ tickets: initialTickets, businessId, userId }: SoporteClientProps) {
  const supabase = createClient()
  const [tickets,         setTickets]         = useState(initialTickets)
  const [showForm,        setShowForm]        = useState(false)
  const [selectedTicket,  setSelectedTicket]  = useState<SupportTicket | null>(null)
  const [subject,         setSubject]         = useState('')
  const [message,         setMessage]         = useState('')
  const [priority,        setPriority]        = useState<SupportTicket['priority']>('normal')
  const [sending,         setSending]         = useState(false)
  const [filter,          setFilter]          = useState<'all' | 'open' | 'resolved'>('all')

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'open')     return t.status === 'open' || t.status === 'in_progress'
    if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed'
    return true
  })

  const createTicket = async () => {
    if (!subject.trim() || !message.trim()) { toast.error('Completa todos los campos'); return }
    setSending(true)
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ business_id: businessId, user_id: userId, subject: subject.trim(), message: message.trim(), priority, status: 'open' })
      .select('*').single()

    if (!error && data) {
      setTickets((prev) => [data as SupportTicket, ...prev])
      setShowForm(false); setSubject(''); setMessage(''); setPriority('normal')
      toast.success('Ticket creado exitosamente')
    } else {
      toast.error('Error al crear ticket')
    }
    setSending(false)
  }

  const openCount     = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Soporte</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Envía tickets de soporte y revisa respuestas</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-accent px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nuevo ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: tickets.length, color: 'var(--accent)'  },
          { label: 'Abiertos', value: openCount,       color: '#F59E0B'        },
          { label: 'Resueltos',value: resolvedCount,   color: '#10B981'        },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 text-center" style={cardStyle}>
            <p className="font-display font-extrabold text-2xl tracking-[-0.03em]" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={filter === f
              ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1.5px solid var(--accent)' }
              : { border: '1px solid var(--border-default)', color: 'var(--text-secondary)', background: 'transparent' }}>
            {f === 'all' ? 'Todos' : f === 'open' ? 'Abiertos' : 'Resueltos'}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={cardStyle}>
            <LifeBuoy className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all' ? 'No tienes tickets de soporte' : 'No hay tickets en esta categoría'}
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket, i) => {
            const sc  = STATUS_CFG[ticket.status] ?? STATUS_CFG.open
            const pc  = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.normal
            const SI  = sc.icon
            return (
              <motion.button key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full text-left rounded-2xl p-5 transition-all"
                style={cardStyle}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SI className="w-4 h-4 shrink-0" style={{ color: sc.color }} strokeWidth={1.75} />
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ticket.subject}</p>
                    </div>
                    <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{ticket.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
                        {pc.label}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(ticket.created_at).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>
                  {ticket.admin_response && (
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                  )}
                </div>
              </motion.button>
            )
          })
        )}
      </div>

      {/* Modal nuevo ticket */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 space-y-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Nuevo ticket de soporte</h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Asunto</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe brevemente el problema" className="input-glass" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mensaje</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detalla el problema o consulta..." rows={4} className="input-glass resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Prioridad</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as SupportTicket['priority'])}
                  className="input-glass cursor-pointer">
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  Cancelar
                </button>
                <button onClick={createTicket} disabled={sending}
                  className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                  {sending ? 'Enviando…' : 'Enviar ticket'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>{selectedTicket.subject}</h3>
                <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              {(() => {
                const sc = STATUS_CFG[selectedTicket.status] ?? STATUS_CFG.open
                const pc = PRIORITY_CFG[selectedTicket.priority] ?? PRIORITY_CFG.normal
                const SI = sc.icon
                return (
                  <div className="flex items-center gap-2 flex-wrap">
                    <SI className="w-4 h-4" style={{ color: sc.color }} strokeWidth={1.75} />
                    <span className="text-xs font-medium" style={{ color: sc.color }}>{sc.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
                      {pc.label}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(selectedTicket.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })()}

              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Tu mensaje</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{selectedTicket.message}</p>
              </div>

              {selectedTicket.admin_response && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--accent)' }}>Respuesta del equipo</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{selectedTicket.admin_response}</p>
                </div>
              )}

              {selectedTicket.ai_suggested_response && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8B5CF6' }}>Sugerencia IA</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{selectedTicket.ai_suggested_response}</p>
                </div>
              )}

              {selectedTicket.resolved_at && (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Resuelto el: {new Date(selectedTicket.resolved_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
