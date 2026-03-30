"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare,
  Send, X, ChevronRight, ExternalLink, BookOpen, Zap, Users, CreditCard,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import type { SupportTicket } from "@/app/dashboard/types"

/* ─── CONFIG ─────────────────────────────────────────────────────── */

const PRIORITY = {
  low:    { label:"Baja",    color:"var(--text-secondary)", bg:"var(--bg-elevated)",         border:"var(--border-subtle)"         },
  normal: { label:"Normal",  color:"#3B82F6",               bg:"rgba(59,130,246,0.1)",        border:"rgba(59,130,246,0.25)"        },
  high:   { label:"Alta",    color:"#F59E0B",               bg:"rgba(245,158,11,0.1)",        border:"rgba(245,158,11,0.25)"        },
  urgent: { label:"Urgente", color:"#EF4444",               bg:"rgba(239,68,68,0.1)",         border:"rgba(239,68,68,0.25)"         },
} as const

const STATUS = {
  open:        { icon:AlertCircle,  label:"Abierto",     color:"#3B82F6" },
  in_progress: { icon:Clock,        label:"En progreso", color:"#F59E0B" },
  resolved:    { icon:CheckCircle2, label:"Resuelto",    color:"#10B981" },
  closed:      { icon:CheckCircle2, label:"Cerrado",     color:"var(--text-tertiary)" },
} as const

const RECURSOS = [
  { icon:Zap,       label:"Conectar WhatsApp",   desc:"Vincula tu número y activa el bot",    href:"/dashboard/whatsapp"    },
  { icon:BarChart3, label:"Ver reportes",         desc:"Analiza el rendimiento de tu negocio", href:"/dashboard/reportes"    },
  { icon:Users,     label:"Invitar a tu equipo",  desc:"Agrega agentes y colaboradores",       href:"/dashboard/equipo"      },
  { icon:CreditCard,label:"Cambiar de plan",      desc:"Amplía mensajes y funciones",          href:"/dashboard/billing"     },
]

const FAQ = [
  { q:"¿Cuánto tiempo tarda en activarse el bot?",    a:"Después de conectar WhatsApp y configurar tu catálogo, el bot se activa en menos de 5 minutos." },
  { q:"¿Puedo personalizar las respuestas del bot?",  a:"Sí. Ve a Configuración IA para editar las instrucciones, tono y respuestas predeterminadas." },
  { q:"¿Qué pasa si supero el límite de mensajes?",   a:"El bot dejará de responder automáticamente. Puedes upgradear tu plan en cualquier momento desde Facturación." },
  { q:"¿Cómo exporto mis datos?",                      a:"Desde Reportes puedes descargar los datos de conversaciones y ventas en formato CSV." },
]

type FilterKey = "all" | "open" | "resolved"

interface Props {
  tickets:    SupportTicket[]
  businessId: string
  userId:     string
}

/* ─── COMPONENT ──────────────────────────────────────────────────── */

export default function SoporteClient({ tickets: init, businessId, userId }: Props) {
  const supabase = createClient()
  const [tickets,  setTickets]  = useState(init)
  const [showForm, setShowForm] = useState(false)
  const [detail,   setDetail]   = useState<SupportTicket | null>(null)
  const [filter,   setFilter]   = useState<FilterKey>("all")
  const [openFAQ,  setOpenFAQ]  = useState<number | null>(null)

  // form state
  const [subject,  setSubject]  = useState("")
  const [message,  setMessage]  = useState("")
  const [priority, setPriority] = useState<SupportTicket["priority"]>("normal")
  const [sending,  setSending]  = useState(false)

  const filtered = tickets.filter(t => {
    if (filter === "open")     return t.status === "open" || t.status === "in_progress"
    if (filter === "resolved") return t.status === "resolved" || t.status === "closed"
    return true
  })

  const openCount     = tickets.filter(t => t.status==="open"||t.status==="in_progress").length
  const resolvedCount = tickets.filter(t => t.status==="resolved"||t.status==="closed").length

  const createTicket = async () => {
    if (!subject.trim() || !message.trim()) { toast.error("Completa todos los campos"); return }
    setSending(true)
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({ business_id:businessId, user_id:userId, subject:subject.trim(), message:message.trim(), priority, status:"open" })
      .select("*").single()
    if (!error && data) {
      setTickets(p => [data as SupportTicket, ...p])
      setShowForm(false); setSubject(""); setMessage(""); setPriority("normal")
      toast.success("Ticket creado exitosamente")
    } else {
      toast.error("Error al crear ticket")
    }
    setSending(false)
  }

  const CARD = { background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)", borderRadius:"16px" }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color:"var(--text-primary)" }}>Soporte</h1>
          <p className="text-sm mt-0.5" style={{ color:"var(--text-secondary)" }}>Crea tickets y recibe ayuda del equipo WAAXP</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-accent px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nuevo ticket
        </button>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Total",     value:tickets.length, color:"var(--accent)",  bg:"var(--accent-dim)",            border:"var(--accent-border)"            },
          { label:"Abiertos",  value:openCount,       color:"#F59E0B",        bg:"rgba(245,158,11,0.1)",          border:"rgba(245,158,11,0.25)"           },
          { label:"Resueltos", value:resolvedCount,   color:"#10B981",        bg:"rgba(16,185,129,0.1)",          border:"rgba(16,185,129,0.25)"           },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className="rounded-2xl p-5 text-center" style={{ background:s.bg, border:`1px solid ${s.border}` }}>
            <p className="font-display font-extrabold text-3xl tracking-[-0.04em]" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color:"var(--text-secondary)" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all","open","resolved"] as FilterKey[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={filter===f
              ? { background:"var(--accent-dim)", color:"var(--accent)", border:"1.5px solid var(--accent)" }
              : { border:"1px solid var(--border-default)", color:"var(--text-secondary)", background:"transparent" }}>
            {f==="all"?"Todos":f==="open"?"Abiertos":"Resueltos"}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={CARD}>
            <LifeBuoy className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color:"var(--text-secondary)" }} strokeWidth={1.5} />
            <p className="text-sm" style={{ color:"var(--text-secondary)" }}>
              {filter==="all" ? "No tienes tickets de soporte" : "No hay tickets en esta categoría"}
            </p>
          </div>
        ) : filtered.map((ticket, i) => {
          const sc = STATUS[ticket.status as keyof typeof STATUS] ?? STATUS.open
          const pc = PRIORITY[ticket.priority as keyof typeof PRIORITY] ?? PRIORITY.normal
          const SI = sc.icon
          return (
            <motion.button key={ticket.id}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              onClick={() => setDetail(ticket)}
              className="w-full text-left rounded-2xl p-5 transition-all group"
              style={CARD}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="var(--accent-border)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="var(--border-subtle)"}>
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className="mt-0.5 shrink-0">
                  <SI className="w-4 h-4" style={{ color:sc.color }} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold truncate" style={{ color:"var(--text-primary)" }}>{ticket.subject}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {ticket.admin_response && <MessageSquare className="w-3.5 h-3.5" style={{ color:"var(--accent)" }} strokeWidth={1.75} />}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:"var(--text-tertiary)" }} />
                    </div>
                  </div>
                  <p className="text-xs line-clamp-1 mb-2.5" style={{ color:"var(--text-secondary)" }}>{ticket.message}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background:pc.bg, color:pc.color, border:`1px solid ${pc.border}` }}>{pc.label}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:"var(--bg-surface)", color:sc.color }}>{sc.label}</span>
                    <span className="text-[10px]" style={{ color:"var(--text-tertiary)" }}>
                      {new Date(ticket.created_at).toLocaleDateString("es-CL")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Recursos rápidos */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color:"var(--text-tertiary)" }}>Recursos rápidos</h2>
        <div className="grid grid-cols-2 gap-2">
          {RECURSOS.map(r => {
            const Icon = r.icon
            return (
              <Link key={r.href} href={r.href}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all group"
                style={CARD}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="var(--accent-border)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="var(--border-subtle)"}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)" }}>
                  <Icon className="w-4.5 h-4.5" style={{ color:"var(--accent)" }} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold" style={{ color:"var(--text-primary)" }}>{r.label}</p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color:"var(--text-secondary)" }}>{r.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color:"var(--text-secondary)" }} />
              </Link>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color:"var(--text-tertiary)" }}>Preguntas frecuentes</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={CARD}>
              <button onClick={() => setOpenFAQ(openFAQ===i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
                onMouseEnter={e => (e.currentTarget.parentElement as HTMLElement).style.borderColor="var(--accent-border)"}
                onMouseLeave={e => (e.currentTarget.parentElement as HTMLElement).style.borderColor="var(--border-subtle)"}>
                <p className="text-sm font-medium pr-4" style={{ color:"var(--text-primary)" }}>{item.q}</p>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform" style={{ color:"var(--text-tertiary)", transform:openFAQ===i?"rotate(90deg)":"" }} />
              </button>
              <AnimatePresence>
                {openFAQ === i && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
                    className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm" style={{ color:"var(--text-secondary)" }}>{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal: Nuevo ticket ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}>
            <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95 }}
              className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-default)", borderRadius:"20px" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)" }}>
                    <LifeBuoy className="w-4 h-4" style={{ color:"var(--accent)" }} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display font-bold text-base" style={{ color:"var(--text-primary)" }}>Nuevo ticket de soporte</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl transition-colors"
                  style={{ color:"var(--text-tertiary)" }}
                  onMouseEnter={e => (e.currentTarget.style.background="var(--bg-surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background="")}>
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color:"var(--text-secondary)" }}>Asunto</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Describe brevemente el problema" className="input-glass" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color:"var(--text-secondary)" }}>Mensaje</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Detalla el problema o consulta..." rows={4} className="input-glass resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color:"var(--text-secondary)" }}>Prioridad</label>
                <select value={priority} onChange={e => setPriority(e.target.value as SupportTicket["priority"])} className="input-glass cursor-pointer">
                  <option value="low">Baja — consulta general</option>
                  <option value="normal">Normal — problema funcional</option>
                  <option value="high">Alta — afecta operaciones</option>
                  <option value="urgent">Urgente — sistema detenido</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border:"1px solid var(--border-default)", color:"var(--text-secondary)" }}
                  onMouseEnter={e => (e.currentTarget.style.background="var(--bg-surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background="")}>
                  Cancelar
                </button>
                <button onClick={createTicket} disabled={sending}
                  className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                  {sending ? "Enviando…" : "Enviar ticket"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Detalle ticket ── */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}>
            <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto"
              style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-default)", borderRadius:"20px" }}>
              {(() => {
                const sc = STATUS[detail.status as keyof typeof STATUS] ?? STATUS.open
                const pc = PRIORITY[detail.priority as keyof typeof PRIORITY] ?? PRIORITY.normal
                const SI = sc.icon
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between p-5 border-b" style={{ borderColor:"var(--border-subtle)" }}>
                      <div className="flex-1 pr-4">
                        <h3 className="font-display font-bold text-base" style={{ color:"var(--text-primary)" }}>{detail.subject}</h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <SI className="w-3.5 h-3.5 shrink-0" style={{ color:sc.color }} strokeWidth={1.75} />
                          <span className="text-xs font-medium" style={{ color:sc.color }}>{sc.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background:pc.bg, color:pc.color, border:`1px solid ${pc.border}` }}>{pc.label}</span>
                          <span className="text-[10px]" style={{ color:"var(--text-tertiary)" }}>
                            {new Date(detail.created_at).toLocaleDateString("es-CL",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setDetail(null)} className="p-2 rounded-xl transition-colors shrink-0"
                        style={{ color:"var(--text-tertiary)" }}
                        onMouseEnter={e => (e.currentTarget.style.background="var(--bg-surface)")}
                        onMouseLeave={e => (e.currentTarget.style.background="")}>
                        <X className="w-5 h-5" strokeWidth={1.75} />
                      </button>
                    </div>

                    {/* Thread */}
                    <div className="p-5 space-y-4">
                      <div className="p-4 rounded-xl" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:"var(--text-tertiary)" }}>Tu mensaje</p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color:"var(--text-primary)" }}>{detail.message}</p>
                      </div>
                      {detail.ai_suggested_response && (
                        <div className="p-4 rounded-xl" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:"#8B5CF6" }}>Sugerencia IA</p>
                          <p className="text-sm whitespace-pre-wrap" style={{ color:"var(--text-primary)" }}>{detail.ai_suggested_response}</p>
                        </div>
                      )}
                      {detail.admin_response && (
                        <div className="p-4 rounded-xl" style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:"var(--accent)" }}>Respuesta del equipo WAAXP</p>
                          <p className="text-sm whitespace-pre-wrap" style={{ color:"var(--text-primary)" }}>{detail.admin_response}</p>
                        </div>
                      )}
                      {!detail.admin_response && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)" }}>
                          <Clock className="w-4 h-4 shrink-0" style={{ color:"#F59E0B" }} strokeWidth={1.75} />
                          <p className="text-xs" style={{ color:"var(--text-secondary)" }}>Responderemos en menos de 24 horas hábiles</p>
                        </div>
                      )}
                      {detail.resolved_at && (
                        <p className="text-xs" style={{ color:"var(--text-tertiary)" }}>
                          Resuelto el {new Date(detail.resolved_at).toLocaleDateString("es-CL",{day:"numeric",month:"short",year:"numeric"})}
                        </p>
                      )}
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
