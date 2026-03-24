"use client"

import { motion } from "framer-motion"
import {
  DollarSign,
  Bot,
  Zap,
  Clock,
  MessageSquare,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface DashboardClientProps {
  kpis: {
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
  plan:          string
  usoPorcentaje: number
  isDemo?:       boolean
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function formatCLP(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString("es-CL")}`
}

function formatCLPFull(value: number): string {
  return `$${value.toLocaleString("es-CL")}`
}

/* ─────────────────────────────────────────────
   CHART TOOLTIP
───────────────────────────────────────────── */

function ChartTooltip({ active, payload, label, formatter }: {
  active?:    boolean
  payload?:   Array<{ value: number }>
  label?:     string
  formatter:  (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 shadow-xl"
      style={{
        background: 'var(--bg-elevated)',
        border:     '1px solid var(--border-default)',
        boxShadow:  'var(--shadow-glass)',
      }}
    >
      <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        {formatter(payload[0].value)}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────── */

interface KPICardProps {
  icon:      React.ReactNode
  label:     string
  value:     string | number
  sub?:      string
  accent?:   boolean
  iconColor: string
  iconBg:    string
  large?:    boolean
}

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

function KPICard({ icon, label, value, sub, iconColor, iconBg, large, accent }: KPICardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={[
        "relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden",
        "transition-all duration-200 hover:-translate-y-0.5",
        large ? "md:col-span-2" : "",
      ].join(" ")}
      style={
        accent
          ? {
              background: 'var(--accent)',
              boxShadow:  'var(--accent-glow)',
            }
          : {
              background: 'var(--bg-elevated)',
              border:     '1px solid var(--border-subtle)',
              boxShadow:  'var(--shadow-card)',
            }
      }
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ background: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>

      {/* Values */}
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: accent ? 'rgba(8,12,16,0.6)' : 'var(--text-secondary)' }}
        >
          {label}
        </p>
        <p
          className={`font-display font-extrabold tracking-[-0.04em] ${large ? "text-4xl" : "text-2xl"}`}
          style={{ color: accent ? '#080c10' : 'var(--text-primary)' }}
        >
          {value}
        </p>
        {sub && (
          <p
            className="text-xs mt-1"
            style={{ color: accent ? 'rgba(8,12,16,0.5)' : 'var(--text-secondary)' }}
          >
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

const DONUT_COLORS = ["var(--accent)", "#27272A"]

export default function DashboardClient({ kpis, plan, usoPorcentaje, isDemo }: DashboardClientProps) {
  const donutData = [
    { name: "IA",     value: kpis.chatsIA      },
    { name: "Humano", value: kpis.chatsHumano  },
  ]

  const ventasData =
    kpis.ventasPorDia.length > 0
      ? kpis.ventasPorDia
      : Array.from({ length: 7 }, (_, i) => ({ fecha: `D${i + 1}`, monto: 0 }))

  const convData =
    kpis.convPorDia.length > 0
      ? kpis.convPorDia
      : Array.from({ length: 7 }, (_, i) => ({ fecha: `D${i + 1}`, cantidad: 0 }))

  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.08 } },
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Demo banner ── */}
      {isDemo && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(10,186,181,0.08)',
            border: '1px solid rgba(10,186,181,0.25)',
            color: 'var(--accent)',
          }}
        >
          <span className="font-semibold">Modo demo</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Estás viendo datos de ejemplo. Configura tu negocio para ver datos reales.
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-display font-bold text-2xl tracking-[-0.03em]"
            style={{ color: 'var(--text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Resumen de ventas y automatización &middot;{" "}
            <span className="font-semibold capitalize" style={{ color: 'var(--accent)' }}>
              Plan {plan}
            </span>
          </p>
        </div>

        {/* Usage pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
          style={{
            background: 'var(--bg-elevated)',
            border:     '1px solid var(--border-subtle)',
          }}
        >
          <div
            className="w-24 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--border-default)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:           `${Math.min(usoPorcentaje, 100)}%`,
                backgroundColor: usoPorcentaje > 85 ? "#EF4444" : "var(--accent)",
              }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {usoPorcentaje}%
          </span>
        </div>
      </div>

      {/* ── KPI Bento Grid ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <KPICard
          icon={<DollarSign className="w-5 h-5" strokeWidth={1.75} />}
          label="Ventas totales"
          value={kpis.ventasTotales > 0 ? formatCLP(kpis.ventasTotales) : "$0"}
          sub={kpis.ventasTotales > 0 ? formatCLPFull(kpis.ventasTotales) : "Sin ventas aún"}
          iconColor="var(--accent)"
          iconBg="var(--accent-dim)"
          large
        />
        <KPICard
          icon={<Bot className="w-5 h-5" strokeWidth={1.75} />}
          label="Recuperadas por IA"
          value={kpis.ventasRecuperadasIA > 0 ? formatCLP(kpis.ventasRecuperadasIA) : "$0"}
          iconColor="#10B981"
          iconBg="rgba(16,185,129,0.12)"
        />
        <KPICard
          icon={<Zap className="w-5 h-5" strokeWidth={1.75} />}
          label="Automatización"
          value={`${kpis.pctAutomatico}%`}
          sub="chats manejados por IA"
          iconColor="#F59E0B"
          iconBg="rgba(245,158,11,0.12)"
          accent={kpis.pctAutomatico > 80}
        />
        <KPICard
          icon={<Clock className="w-5 h-5" strokeWidth={1.75} />}
          label="Pendientes"
          value={kpis.pendientesHumanos}
          sub={kpis.pendientesHumanos === 0 ? "Todo al día" : "requieren atención"}
          iconColor={kpis.pendientesHumanos > 0 ? "#EF4444" : "#10B981"}
          iconBg={kpis.pendientesHumanos > 0 ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)"}
        />
        <KPICard
          icon={<MessageSquare className="w-5 h-5" strokeWidth={1.75} />}
          label="Conversaciones"
          value={kpis.totalConversaciones}
          sub="total del mes"
          iconColor="#3B82F6"
          iconBg="rgba(59,130,246,0.12)"
        />
        <KPICard
          icon={<BarChart3 className="w-5 h-5" strokeWidth={1.75} />}
          label="Uso del plan"
          value={`${usoPorcentaje}%`}
          sub={usoPorcentaje > 85 ? "Considera upgrade" : "Dentro del límite"}
          iconColor="#8B5CF6"
          iconBg="rgba(139,92,246,0.12)"
        />
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Area chart: ventas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl p-5 lg:col-span-2"
          style={{
            background: 'var(--bg-elevated)',
            border:     '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Ventas últimos 7 días
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Ingresos diarios en CLP
              </p>
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ventasData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0ABAB5" stopOpacity={0.3}  />
                  <stop offset="100%" stopColor="#0ABAB5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload as Array<{ value: number }> | undefined}
                    label={props.label as string}
                    formatter={formatCLPFull}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="#0ABAB5"
                strokeWidth={2}
                fill="url(#gradVentas)"
                dot={false}
                activeDot={{ r: 4, fill: "#0ABAB5", strokeWidth: 0 }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut: chats IA vs Humano */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl p-5 flex flex-col"
          style={{
            background: 'var(--bg-elevated)',
            border:     '1px solid var(--border-subtle)',
          }}
        >
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Chats IA vs Humano
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Distribución del mes
          </p>

          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={700}
                  animationEasing="ease-out"
                  strokeWidth={0}
                >
                  {donutData.map((_, idx) => (
                    <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {donutData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {entry.name}
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bar chart: conversaciones diarias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.46, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl p-5"
        style={{
          background: 'var(--bg-elevated)',
          border:     '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Conversaciones diarias
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Últimos 7 días
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={convData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  active={props.active}
                  payload={props.payload as Array<{ value: number }> | undefined}
                  label={props.label as string}
                  formatter={(v) => `${v} conversaciones`}
                />
              )}
            />
            <Bar
              dataKey="cantidad"
              fill="var(--accent)"
              radius={[6, 6, 0, 0]}
              animationDuration={700}
              animationEasing="ease-out"
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  )
}
