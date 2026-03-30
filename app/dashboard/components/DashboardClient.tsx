"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign, Bot, Zap, Clock, MessageSquare, BarChart3,
  TrendingUp, GripVertical, Settings2, RotateCcw, Check, X,
  ChevronDown, Plus, Pencil, ArrowUpRight, Table2, Inbox,
  Sparkles, Activity, ChevronLeft,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts"
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, rectSortingStrategy, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"

/* ─── TYPES ─────────────────────────────────────────────────────── */

type WidgetId =
  | "kpi_ventas" | "kpi_recuperadas" | "kpi_automatizacion"
  | "kpi_pendientes" | "kpi_conversaciones" | "kpi_uso"
  | "chart_area" | "chart_donut" | "chart_bar"
  | "report_operativo" | "comm_inbox"

type WidgetSize     = "sm" | "md" | "lg"
type WidgetCategory = "metricas" | "graficos" | "reportes" | "comunicaciones"
type AreaMetric     = "ventas" | "conversaciones" | "iaEstimado"
type DonutMetric    = "iaHumano" | "usoPlan" | "pendientesAtendidos"
type BarMetric      = "conversaciones" | "ventas" | "iaEstimado"

interface WidgetMeta {
  id: WidgetId; name: string; desc: string
  category: WidgetCategory; size: WidgetSize
}

interface DashboardConfig {
  activeWidgets: WidgetId[]
  areaMetric:    AreaMetric
  donutMetric:   DonutMetric
  barMetric:     BarMetric
}

interface KPIs {
  ventasTotales:       number
  ventasRecuperadasIA: number
  pctAutomatico:       number
  pendientesHumanos:   number
  totalConversaciones: number
  ventasPorDia:        { fecha: string; monto: number }[]
  convPorDia:          { fecha: string; cantidad: number }[]
  chatsIA:             number
  chatsHumano:         number
}

interface DashboardClientProps {
  kpis:          KPIs
  plan:          string
  usoPorcentaje: number
  businessName?: string
  userId?:       string
  isDemo?:       boolean
}

interface WidgetProps {
  kpis: KPIs; usoPct: number
  config: DashboardConfig; update: (p: Partial<DashboardConfig>) => void
  editMode: boolean
}

/* ─── CONSTANTS ─────────────────────────────────────────────────── */

const DEFAULT_CONFIG: DashboardConfig = {
  activeWidgets: [
    "kpi_ventas","kpi_recuperadas","kpi_automatizacion","kpi_pendientes",
    "kpi_conversaciones","kpi_uso","chart_donut",
    "chart_area","chart_bar",
  ],
  areaMetric:  "ventas",
  donutMetric: "iaHumano",
  barMetric:   "conversaciones",
}

const WIDGET_META: Record<WidgetId, WidgetMeta> = {
  kpi_ventas:         { id:"kpi_ventas",         name:"Ventas totales",       desc:"Ingresos acumulados del mes",        category:"metricas",       size:"sm" },
  kpi_recuperadas:    { id:"kpi_recuperadas",    name:"Recuperadas por IA",   desc:"Ventas cerradas por el bot",         category:"metricas",       size:"sm" },
  kpi_automatizacion: { id:"kpi_automatizacion", name:"% Automatización",     desc:"Chats manejados por IA",             category:"metricas",       size:"sm" },
  kpi_pendientes:     { id:"kpi_pendientes",     name:"Pendientes",           desc:"Requieren atención humana",          category:"metricas",       size:"sm" },
  kpi_conversaciones: { id:"kpi_conversaciones", name:"Conversaciones",       desc:"Total del mes",                      category:"metricas",       size:"sm" },
  kpi_uso:            { id:"kpi_uso",            name:"Uso del plan",         desc:"Mensajes vs límite del plan",        category:"metricas",       size:"sm" },
  chart_area:         { id:"chart_area",         name:"Tendencia (Área)",     desc:"3 métricas seleccionables",          category:"graficos",       size:"lg" },
  chart_donut:        { id:"chart_donut",        name:"Distribución (Donut)", desc:"3 distribuciones disponibles",       category:"graficos",       size:"md" },
  chart_bar:          { id:"chart_bar",          name:"Diario (Barras)",      desc:"3 métricas seleccionables",          category:"graficos",       size:"lg" },
  report_operativo:   { id:"report_operativo",   name:"Resumen Operativo",    desc:"KPIs con semáforo de estado",        category:"reportes",       size:"lg" },
  comm_inbox:         { id:"comm_inbox",         name:"Actividad reciente",   desc:"Vista rápida de conversaciones",     category:"comunicaciones", size:"md" },
}

const CATEGORIES: { id: WidgetCategory; label: string; icon: React.ElementType }[] = [
  { id:"metricas",       label:"Métricas KPI",  icon:TrendingUp },
  { id:"graficos",       label:"Gráficos",       icon:BarChart3  },
  { id:"reportes",       label:"Reportes",       icon:Table2     },
  { id:"comunicaciones", label:"Comunicaciones", icon:Inbox      },
]

const AREA_OPTIONS    = [
  { value:"ventas"         as AreaMetric,  label:"Ventas",         desc:"Ingresos diarios CLP"      },
  { value:"conversaciones" as AreaMetric,  label:"Conversaciones", desc:"Total de chats por día"    },
  { value:"iaEstimado"     as AreaMetric,  label:"Chats IA",       desc:"Estimado diario de IA"     },
]
const DONUT_OPTIONS   = [
  { value:"iaHumano"            as DonutMetric, label:"IA vs Humano",         desc:"Distribución del mes"       },
  { value:"usoPlan"             as DonutMetric, label:"Uso del plan",          desc:"Usado vs disponible"        },
  { value:"pendientesAtendidos" as DonutMetric, label:"Pendientes/Atendidos",  desc:"Estado de conversaciones"   },
]
const BAR_OPTIONS     = [
  { value:"conversaciones" as BarMetric, label:"Conversaciones", desc:"Chats por día"         },
  { value:"ventas"         as BarMetric, label:"Ventas",         desc:"Ingresos diarios CLP"  },
  { value:"iaEstimado"     as BarMetric, label:"Chats IA",       desc:"Estimado de chats IA"  },
]

/* ─── CONFIG HOOK ────────────────────────────────────────────────── */

function useDashboardConfig(userId?: string) {
  const key = `waaxp-dash-${userId ?? "default"}`
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DashboardConfig>
        const allIds = Object.keys(WIDGET_META) as WidgetId[]
        const merged = (parsed.activeWidgets ?? DEFAULT_CONFIG.activeWidgets).filter(id => allIds.includes(id as WidgetId)) as WidgetId[]
        setConfig({ ...DEFAULT_CONFIG, ...parsed, activeWidgets: merged })
      }
    } catch { /**/ }
    setLoaded(true)
  }, [key])

  const update = useCallback((patch: Partial<DashboardConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])

  const reset = useCallback(() => { localStorage.removeItem(key); setConfig(DEFAULT_CONFIG) }, [key])
  return { config, update, reset, loaded }
}

/* ─── HELPERS ────────────────────────────────────────────────────── */

const fmtCLP = (v: number) => v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v/1_000).toFixed(0)}K` : `$${v.toLocaleString("es-CL")}`
const fmtFull = (v: number) => `$${v.toLocaleString("es-CL")}`

/* ─── SPARKLINE ──────────────────────────────────────────────────── */

function Spark({ data, color = "var(--accent)" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null
  const w = 60, h = 22, mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-mn)/r)*h*0.75-h*0.1}`).join(" ")
  return <svg width={w} height={h} style={{ overflow:"visible", opacity:0.55 }}><polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} /></svg>
}

/* ─── CHART TOOLTIP ──────────────────────────────────────────────── */

function CT({ active, payload, label, fmt }: { active?:boolean; payload?:Array<{value:number}>; label?:string; fmt:(v:number)=>string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-default)", boxShadow:"var(--shadow-glass)" }}>
      <p className="text-[10px] mb-0.5" style={{ color:"var(--text-tertiary)" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>{fmt(payload[0].value)}</p>
    </div>
  )
}

/* ─── METRIC PICKER ──────────────────────────────────────────────── */

function MetricPicker<T extends string>({ value, options, onChange }: { value:T; options:{value:T;label:string;desc:string}[]; onChange:(v:T)=>void }) {
  const [open, setOpen] = useState(false)
  const cur = options.find(o => o.value === value)!
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
        style={{ background:"var(--accent-dim)", color:"var(--accent)", border:"1px solid var(--accent-border)" }}>
        {cur.label}
        <ChevronDown className="w-3 h-3" style={{ transform:open?"rotate(180deg)":"", transition:"transform 0.15s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-6, scale:0.97 }} transition={{ duration:0.14 }}
              className="absolute right-0 top-full mt-1.5 z-20 w-52 p-1 rounded-xl"
              style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-default)", boxShadow:"var(--shadow-glass)" }}>
              {options.map(o => (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left"
                  style={{ background: o.value===value ? "var(--accent-dim)" : "transparent" }}>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: o.value===value ? "var(--accent)" : "var(--text-primary)" }}>{o.label}</p>
                    <p className="text-[10px]" style={{ color:"var(--text-tertiary)" }}>{o.desc}</p>
                  </div>
                  {o.value===value && <Check className="w-3.5 h-3.5 shrink-0" style={{ color:"var(--accent)" }} strokeWidth={2.5} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── KPI WIDGETS ────────────────────────────────────────────────── */

function W_Ventas({ kpis }: WidgetProps) {
  const spark = kpis.ventasPorDia.slice(-7).map(d => d.monto)
  return (
    <div className="p-5 h-full flex flex-col justify-between min-h-[130px]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)" }}>
          <DollarSign className="w-5 h-5" style={{ color:"var(--accent)" }} strokeWidth={1.75} />
        </div>
        {spark.length >= 2 && <Spark data={spark} />}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:"var(--text-secondary)" }}>Ventas totales</p>
        <p className="font-display font-extrabold text-2xl tracking-[-0.04em]" style={{ color:"var(--text-primary)" }}>{kpis.ventasTotales > 0 ? fmtCLP(kpis.ventasTotales) : "$0"}</p>
        <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{kpis.ventasTotales > 0 ? fmtFull(kpis.ventasTotales) : "Sin ventas aún"}</p>
      </div>
    </div>
  )
}

function W_Recuperadas({ kpis }: WidgetProps) {
  return (
    <div className="p-5 h-full flex flex-col justify-between min-h-[130px]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:"rgba(16,185,129,0.12)" }}>
        <Bot className="w-5 h-5" style={{ color:"#10B981" }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:"var(--text-secondary)" }}>Recuperadas IA</p>
        <p className="font-display font-extrabold text-2xl tracking-[-0.04em]" style={{ color:"var(--text-primary)" }}>{kpis.ventasRecuperadasIA > 0 ? fmtCLP(kpis.ventasRecuperadasIA) : "$0"}</p>
        <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{kpis.ventasRecuperadasIA > 0 ? "recuperadas por el bot" : "Sin recuperaciones"}</p>
      </div>
    </div>
  )
}

function W_Auto({ kpis }: WidgetProps) {
  const hi = kpis.pctAutomatico >= 80
  return (
    <div className="p-5 h-full flex flex-col justify-between min-h-[130px]" style={hi ? { background:"var(--accent)", borderRadius:"inherit" } : {}}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: hi ? "rgba(8,12,16,0.15)" : "rgba(245,158,11,0.12)" }}>
        <Zap className="w-5 h-5" style={{ color: hi ? "#080c10" : "#F59E0B" }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: hi ? "rgba(8,12,16,0.5)" : "var(--text-secondary)" }}>Automatización</p>
        <p className="font-display font-extrabold text-2xl tracking-[-0.04em]" style={{ color: hi ? "#080c10" : "var(--text-primary)" }}>{kpis.pctAutomatico}%</p>
        <p className="text-xs mt-0.5" style={{ color: hi ? "rgba(8,12,16,0.5)" : "var(--text-secondary)" }}>chats manejados por IA</p>
      </div>
    </div>
  )
}

function W_Pendientes({ kpis }: WidgetProps) {
  const has = kpis.pendientesHumanos > 0
  return (
    <div className="p-5 h-full flex flex-col justify-between min-h-[130px]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: has ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)" }}>
        <Clock className="w-5 h-5" style={{ color: has ? "#EF4444" : "#10B981" }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:"var(--text-secondary)" }}>Pendientes</p>
        <p className="font-display font-extrabold text-2xl tracking-[-0.04em]" style={{ color: has ? "#EF4444" : "var(--text-primary)" }}>{kpis.pendientesHumanos}</p>
        <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{kpis.pendientesHumanos === 0 ? "Todo al día" : "requieren atención"}</p>
      </div>
    </div>
  )
}

function W_Conv({ kpis }: WidgetProps) {
  const spark = kpis.convPorDia.slice(-7).map(d => d.cantidad)
  return (
    <div className="p-5 h-full flex flex-col justify-between min-h-[130px]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(59,130,246,0.12)" }}>
          <MessageSquare className="w-5 h-5" style={{ color:"#3B82F6" }} strokeWidth={1.75} />
        </div>
        {spark.length >= 2 && <Spark data={spark} color="#3B82F6" />}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:"var(--text-secondary)" }}>Conversaciones</p>
        <p className="font-display font-extrabold text-2xl tracking-[-0.04em]" style={{ color:"var(--text-primary)" }}>{kpis.totalConversaciones}</p>
        <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>total del mes</p>
      </div>
    </div>
  )
}

function W_Uso({ usoPct }: WidgetProps) {
  const hi = usoPct > 85
  return (
    <div className="p-5 h-full flex flex-col justify-between min-h-[130px]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:"rgba(139,92,246,0.12)" }}>
        <BarChart3 className="w-5 h-5" style={{ color:"#8B5CF6" }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:"var(--text-secondary)" }}>Uso del plan</p>
        <p className="font-display font-extrabold text-2xl tracking-[-0.04em]" style={{ color: hi ? "#EF4444" : "var(--text-primary)" }}>{usoPct}%</p>
        <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background:"var(--border-default)" }}>
          <div className="h-full rounded-full" style={{ width:`${Math.min(usoPct,100)}%`, background: hi ? "#EF4444" : "var(--accent)", transition:"width 0.5s" }} />
        </div>
      </div>
    </div>
  )
}

/* ─── CHART WIDGETS ──────────────────────────────────────────────── */

function W_Area({ kpis, config, update }: WidgetProps) {
  const m = config.areaMetric
  const data = m === "ventas"
    ? (kpis.ventasPorDia.length ? kpis.ventasPorDia.map(d => ({ f:d.fecha, v:d.monto })) : Array.from({length:7},(_,i)=>({f:`D${i+1}`,v:0})))
    : m === "conversaciones"
      ? (kpis.convPorDia.length ? kpis.convPorDia.map(d => ({ f:d.fecha, v:d.cantidad })) : Array.from({length:7},(_,i)=>({f:`D${i+1}`,v:0})))
      : (kpis.convPorDia.length ? kpis.convPorDia.map(d => ({ f:d.fecha, v:Math.round(d.cantidad*(kpis.pctAutomatico/100)) })) : Array.from({length:7},(_,i)=>({f:`D${i+1}`,v:0})))
  const fmt = m === "ventas" ? fmtFull : (v:number) => String(v)
  const opt = AREA_OPTIONS.find(o => o.value === m)!
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{opt.label} últimos 7 días</h3>
          <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{opt.desc}</p>
        </div>
        <MetricPicker value={m} options={AREA_OPTIONS} onChange={v => update({ areaMetric:v })} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top:4, right:4, left:-16, bottom:0 }}>
          <defs>
            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0ABAB5" stopOpacity={0.3}  />
              <stop offset="100%" stopColor="#0ABAB5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="f" tick={{ fontSize:10, fill:"var(--text-secondary)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10, fill:"var(--text-secondary)" }} axisLine={false} tickLine={false} tickFormatter={(v:number)=>v>=1000?`${(v/1000).toFixed(0)}k`:String(v)} />
          <Tooltip content={p => <CT active={p.active} payload={p.payload as Array<{value:number}>} label={p.label as string} fmt={fmt} />} />
          <Area type="monotone" dataKey="v" stroke="#0ABAB5" strokeWidth={2} fill="url(#ga)" dot={false} activeDot={{ r:4, fill:"#0ABAB5", strokeWidth:0 }} animationDuration={600} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function W_Donut({ kpis, usoPct, config, update }: WidgetProps) {
  const m = config.donutMetric
  const { data, colors } = m === "iaHumano"
    ? { data:[{n:"IA",v:kpis.chatsIA},{n:"Humano",v:kpis.chatsHumano}], colors:["var(--accent)","#27272A"] }
    : m === "usoPlan"
      ? { data:[{n:"Usado",v:usoPct},{n:"Disponible",v:Math.max(0,100-usoPct)}], colors:["#8B5CF6","#27272A"] }
      : { data:[{n:"Pendientes",v:kpis.pendientesHumanos},{n:"Atendidos",v:Math.max(0,kpis.totalConversaciones-kpis.pendientesHumanos)}], colors:["#EF4444","var(--accent)"] }
  const opt = DONUT_OPTIONS.find(o => o.value === m)!
  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{opt.label}</h3>
          <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{opt.desc}</p>
        </div>
        <MetricPicker value={m} options={DONUT_OPTIONS} onChange={v => update({ donutMetric:v })} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} dataKey="v" animationDuration={600} strokeWidth={0}>
              {data.map((_,i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-2">
        {data.map((e,i) => (
          <div key={e.n} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background:colors[i % colors.length] }} />
              <span className="text-xs" style={{ color:"var(--text-secondary)" }}>{e.n}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color:"var(--text-primary)" }}>{m==="usoPlan" ? `${e.v}%` : e.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function W_Bar({ kpis, config, update }: WidgetProps) {
  const m = config.barMetric
  const data = m === "ventas"
    ? (kpis.ventasPorDia.length ? kpis.ventasPorDia.map(d=>({f:d.fecha,v:d.monto})) : Array.from({length:7},(_,i)=>({f:`D${i+1}`,v:0})))
    : m === "conversaciones"
      ? (kpis.convPorDia.length ? kpis.convPorDia.map(d=>({f:d.fecha,v:d.cantidad})) : Array.from({length:7},(_,i)=>({f:`D${i+1}`,v:0})))
      : (kpis.convPorDia.length ? kpis.convPorDia.map(d=>({f:d.fecha,v:Math.round(d.cantidad*(kpis.pctAutomatico/100))})) : Array.from({length:7},(_,i)=>({f:`D${i+1}`,v:0})))
  const fmt  = m === "ventas" ? fmtFull : (v:number) => String(v)
  const clr  = m === "iaEstimado" ? "#10B981" : "var(--accent)"
  const opt  = BAR_OPTIONS.find(o => o.value === m)!
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{opt.label} por día</h3>
          <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{opt.desc}</p>
        </div>
        <MetricPicker value={m} options={BAR_OPTIONS} onChange={v => update({ barMetric:v })} />
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top:4, right:4, left:-16, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="f" tick={{ fontSize:10, fill:"var(--text-secondary)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10, fill:"var(--text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={(v:number)=>v>=1000?`${(v/1000).toFixed(0)}k`:String(v)} />
          <Tooltip content={p => <CT active={p.active} payload={p.payload as Array<{value:number}>} label={p.label as string} fmt={fmt} />} />
          <Bar dataKey="v" fill={clr} radius={[6,6,0,0]} animationDuration={600} opacity={0.9} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── REPORT & INBOX WIDGETS ─────────────────────────────────────── */

function W_Operativo({ kpis, usoPct }: WidgetProps) {
  const rows = [
    { l:"Automatización IA",   v:`${kpis.pctAutomatico}%`,                                                                ok: kpis.pctAutomatico >= 70, m:"> 70%" },
    { l:"Pendientes humanos",  v:String(kpis.pendientesHumanos),                                                          ok: kpis.pendientesHumanos === 0, m:"= 0"  },
    { l:"Chats IA del mes",    v:String(kpis.chatsIA),                                                                    ok: true, m:"—"     },
    { l:"Conversaciones",      v:String(kpis.totalConversaciones),                                                        ok: true, m:"—"     },
    { l:"Uso del plan",        v:`${usoPct}%`,                                                                            ok: usoPct < 85, m:"< 85%"  },
    { l:"Ventas recuperadas",  v: kpis.ventasRecuperadasIA > 0 ? fmtCLP(kpis.ventasRecuperadasIA) : "$0",                ok: kpis.ventasRecuperadasIA > 0, m:"> $0" },
  ]
  return (
    <div className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>Resumen operativo</h3>
        <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>
          KPIs con semáforo — {new Date().toLocaleDateString("es-CL",{month:"long",year:"numeric"})}
        </p>
      </div>
      <div className="divide-y" style={{ borderColor:"var(--border-subtle)" }}>
        {rows.map((r,i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.ok ? "#10B981" : "#EF4444" }} />
            <span className="text-xs flex-1" style={{ color:"var(--text-secondary)" }}>{r.l}</span>
            <span className="font-mono text-xs font-semibold" style={{ color:"var(--text-primary)" }}>{r.v}</span>
            <span className="text-[10px] w-10 text-right" style={{ color:"var(--text-tertiary)" }}>{r.m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function W_Inbox({ kpis }: WidgetProps) {
  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>Actividad reciente</h3>
        <Link href="/dashboard/inbox" className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity" style={{ color:"var(--accent)" }}>
          Ver inbox <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3 flex-1">
        {[
          { label:"Total conversaciones", value:kpis.totalConversaciones, color:"var(--text-primary)" },
          { label:"Chats IA",             value:kpis.chatsIA,             color:"var(--accent)"       },
          { label:"Chats humano",         value:kpis.chatsHumano,         color:"#3B82F6"             },
          { label:"Pendientes",           value:kpis.pendientesHumanos,   color:kpis.pendientesHumanos>0?"#EF4444":"#10B981" },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs" style={{ color:"var(--text-secondary)" }}>{item.label}</span>
            <span className="text-sm font-bold" style={{ color:item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
      {kpis.pendientesHumanos > 0 && (
        <Link href="/dashboard/inbox" className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2"
          style={{ background:"rgba(239,68,68,0.1)", color:"#EF4444", border:"1px solid rgba(239,68,68,0.2)" }}>
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          {kpis.pendientesHumanos} pendiente{kpis.pendientesHumanos>1?"s":""} sin atender
        </Link>
      )}
    </div>
  )
}

const RENDERS: Record<WidgetId, React.ComponentType<WidgetProps>> = {
  kpi_ventas:W_Ventas, kpi_recuperadas:W_Recuperadas, kpi_automatizacion:W_Auto,
  kpi_pendientes:W_Pendientes, kpi_conversaciones:W_Conv, kpi_uso:W_Uso,
  chart_area:W_Area, chart_donut:W_Donut, chart_bar:W_Bar,
  report_operativo:W_Operativo, comm_inbox:W_Inbox,
}

/* ─── SORTABLE WIDGET ────────────────────────────────────────────── */

function SortableWidget({ id, editMode, onRemove, wp }: { id:WidgetId; editMode:boolean; onRemove:()=>void; wp:WidgetProps }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const meta = WIDGET_META[id]
  const Comp = RENDERS[id]
  const span = meta.size==="sm" ? "col-span-1" : meta.size==="md" ? "col-span-2" : "col-span-2 lg:col-span-4"
  return (
    <div ref={setNodeRef} className={span} style={{ transform:CSS.Transform.toString(transform), transition, zIndex:isDragging?50:undefined, opacity:isDragging?0.5:1 }}>
      <motion.div layout initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.22 }}
        className="relative h-full rounded-2xl overflow-hidden"
        style={{ background:"var(--bg-elevated)", border: editMode?"1.5px dashed rgba(10,186,181,0.3)":"1px solid var(--border-subtle)", boxShadow:"var(--shadow-card)", cursor:editMode?"grab":"default" }}>
        {editMode && (
          <div className="absolute top-2 right-2 z-10 flex gap-1.5">
            <div {...listeners} {...attributes} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-grab" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-default)" }}>
              <GripVertical className="w-3.5 h-3.5" style={{ color:"var(--text-tertiary)" }} />
            </div>
            <button onClick={onRemove} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }}>
              <X className="w-3.5 h-3.5" style={{ color:"#EF4444" }} strokeWidth={1.75} />
            </button>
          </div>
        )}
        <div className={editMode?"opacity-70 pointer-events-none select-none":""}>
          <Comp {...wp} />
        </div>
      </motion.div>
    </div>
  )
}

/* ─── ADD WIDGET PANEL ───────────────────────────────────────────── */

function AddPanel({ active, onAdd, onClose }: { active:WidgetId[]; onAdd:(id:WidgetId)=>void; onClose:()=>void }) {
  const [cat, setCat] = useState<WidgetCategory|null>(null)
  const allIds = Object.keys(WIDGET_META) as WidgetId[]
  const catWidgets = (c:WidgetCategory) => allIds.filter(id => WIDGET_META[id].category===c && !active.includes(id))
  const available  = allIds.filter(id => !active.includes(id)).length
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)" }}>
      <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:32 }}
        transition={{ duration:0.26, ease:[0.25,0.46,0.45,0.94] }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-default)", boxShadow:"var(--shadow-glass)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor:"var(--border-subtle)" }}>
          <div className="flex items-center gap-2">
            {cat && (
              <button onClick={() => setCat(null)} className="w-7 h-7 rounded-lg flex items-center justify-center mr-1" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)" }}>
                <ChevronLeft className="w-3.5 h-3.5" style={{ color:"var(--text-secondary)" }} />
              </button>
            )}
            <div>
              <h3 className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>
                {cat ? CATEGORIES.find(c=>c.id===cat)!.label : "Agregar widget"}
              </h3>
              <p className="text-xs font-mono" style={{ color:"var(--text-tertiary)" }}>{available} disponible{available!==1?"s":""}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"var(--bg-surface)" }}>
            <X className="w-4 h-4" style={{ color:"var(--text-secondary)" }} strokeWidth={1.75} />
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {!cat ? (
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => {
                const Icon = c.icon
                const n = catWidgets(c.id).length
                return (
                  <button key={c.id} onClick={() => n>0 && setCat(c.id)} disabled={n===0}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)", opacity:n===0?0.4:1, cursor:n===0?"not-allowed":"pointer" }}
                    onMouseEnter={e => { if(n>0)(e.currentTarget as HTMLElement).style.borderColor="var(--accent-border)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border-subtle)" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-4 h-4" style={{ color:"var(--text-secondary)" }} strokeWidth={1.75} />
                      <span className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{c.label}</span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color:"var(--text-tertiary)" }}>{n} disponible{n!==1?"s":""}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {catWidgets(cat).length === 0 ? (
                <div className="py-8 text-center"><p className="text-sm" style={{ color:"var(--text-secondary)" }}>Todos los widgets de esta categoría ya están activos</p></div>
              ) : catWidgets(cat).map(id => {
                const meta = WIDGET_META[id]
                const szLabel = meta.size==="sm"?"1 col":meta.size==="md"?"2 col":"Ancho completo"
                return (
                  <button key={id} onClick={() => { onAdd(id); onClose() }} className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all"
                    style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--accent-border)"; (e.currentTarget as HTMLElement).style.background="var(--accent-dim)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border-subtle)"; (e.currentTarget as HTMLElement).style.background="var(--bg-surface)" }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{meta.name}</p>
                      <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>{meta.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-1 rounded-md" style={{ background:"var(--bg-elevated)", color:"var(--text-tertiary)" }}>{szLabel}</span>
                      <Plus className="w-4 h-4 shrink-0" style={{ color:"var(--accent)" }} strokeWidth={2} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── MAIN ───────────────────────────────────────────────────────── */

export default function DashboardClient({ kpis, plan, usoPorcentaje, businessName, userId, isDemo }: DashboardClientProps) {
  const { config, update, reset, loaded } = useDashboardConfig(userId)
  const [editMode, setEditMode] = useState(false)
  const [showAdd, setShowAdd]   = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint:{ distance:6 } }),
    useSensor(KeyboardSensor, { coordinateGetter:sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const o = config.activeWidgets.indexOf(active.id as WidgetId)
      const n = config.activeWidgets.indexOf(over.id as WidgetId)
      update({ activeWidgets: arrayMove(config.activeWidgets, o, n) })
    }
  }, [config.activeWidgets, update])

  const removeWidget = useCallback((id:WidgetId) => update({ activeWidgets:config.activeWidgets.filter(w=>w!==id) }), [config.activeWidgets, update])
  const addWidget    = useCallback((id:WidgetId) => update({ activeWidgets:[...config.activeWidgets, id] }),            [config.activeWidgets, update])

  if (!loaded) return null

  const wp: WidgetProps = { kpis, usoPct:usoPorcentaje, config, update, editMode }
  const availN = (Object.keys(WIDGET_META) as WidgetId[]).filter(id => !config.activeWidgets.includes(id)).length

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:"rgba(10,186,181,0.08)", border:"1px solid rgba(10,186,181,0.2)", color:"var(--accent)" }}>
          <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span className="text-sm font-semibold">Modo demo</span>
          <span className="text-sm" style={{ color:"var(--text-secondary)" }}>Configura tu negocio para ver datos reales.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap pb-5 border-b" style={{ borderColor:"var(--border-subtle)" }}>
        <div>
          <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color:"var(--text-primary)" }}>{businessName ?? "Dashboard"}</h1>
          <p className="text-xs mt-1 font-mono" style={{ color:"var(--text-tertiary)" }}>
            {config.activeWidgets.length} widget{config.activeWidgets.length!==1?"s":""}
            {editMode ? ` · ${availN} disponibles` : ""}
            {" "}·{" "}<span className="capitalize" style={{ color:"var(--accent)" }}>Plan {plan}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <motion.button initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }}
              onClick={() => { reset(); setShowAdd(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ border:"1px solid var(--border-default)", color:"var(--text-secondary)" }}
              onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-surface)")}
              onMouseLeave={e=>(e.currentTarget.style.background="")}>
              <RotateCcw className="w-3 h-3" /> Resetear
            </motion.button>
          )}
          <button onClick={() => { setEditMode(e=>!e); setShowAdd(false) }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={editMode
              ? { background:"var(--accent)", color:"#080c10", boxShadow:"0 0 16px rgba(10,186,181,0.25)" }
              : { background:"var(--bg-elevated)", color:"var(--text-secondary)", border:"1px solid var(--border-default)" }}>
            {editMode ? <><Check className="w-4 h-4" strokeWidth={2.5}/> Listo</> : <><Pencil className="w-4 h-4" strokeWidth={1.75}/> Editar</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)" }}>
            <Settings2 className="w-4 h-4 shrink-0" style={{ color:"var(--accent)" }} strokeWidth={1.75} />
            <p className="text-xs" style={{ color:"var(--text-secondary)" }}>
              <span className="font-semibold" style={{ color:"var(--accent)" }}>Modo editor</span>
              {" "}— arrastra para reordenar · <X className="w-3 h-3 inline mx-0.5" strokeWidth={2}/> para quitar · los selectores de métrica siempre son visibles
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={config.activeWidgets} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {config.activeWidgets.map(id => (
              <SortableWidget key={id} id={id} editMode={editMode} onRemove={() => removeWidget(id)} wp={wp} />
            ))}
            <AnimatePresence>
              {editMode && (
                <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} className="col-span-1">
                  <button onClick={() => setShowAdd(true)} disabled={availN===0}
                    className="w-full min-h-[130px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                    style={{ border:"2px dashed var(--border-default)", background:"transparent", cursor:availN===0?"not-allowed":"pointer", opacity:availN===0?0.4:1 }}
                    onMouseEnter={e=>{if(availN>0){(e.currentTarget as HTMLElement).style.borderColor="var(--accent)";(e.currentTarget as HTMLElement).style.background="var(--accent-dim)"}}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--border-default)";(e.currentTarget as HTMLElement).style.background="transparent"}}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)" }}>
                      <Plus className="w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={2} />
                    </div>
                    <span className="text-xs" style={{ color:"var(--text-tertiary)" }}>{availN===0?"Todos activos":"Agregar widget"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {config.activeWidgets.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ border:"1px dashed var(--border-default)" }}>
          <Activity className="w-10 h-10 mx-auto mb-4 opacity-20" style={{ color:"var(--text-secondary)" }} strokeWidth={1.5} />
          <p className="text-base font-semibold mb-1" style={{ color:"var(--text-secondary)" }}>Sin widgets activos</p>
          <p className="text-sm mb-4" style={{ color:"var(--text-tertiary)" }}>Activa el editor para armar tu dashboard</p>
          <button onClick={() => setEditMode(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background:"var(--accent)", color:"#080c10" }}>Editar layout</button>
        </div>
      )}

      <AnimatePresence>
        {showAdd && <AddPanel active={config.activeWidgets} onAdd={addWidget} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  )
}
