'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import type { Sale } from '@/app/dashboard/types'
import { Download, FileDown, DollarSign, Bot, TrendingUp, Clock, Filter } from 'lucide-react'

interface ReportesClientProps {
  ventas:       Sale[]
  plan:         string
  businessName: string
}

function formatCLP(n: number) { return '$' + n.toLocaleString('es-CL') }

const SOURCE_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ai:     { label: 'IA',     color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  human:  { label: 'Humano', color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
  manual: { label: 'Manual', color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
}
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completada', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  pending:   { label: 'Pendiente',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
}

export default function ReportesClient({ ventas, plan, businessName }: ReportesClientProps) {
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    fechaFin:    new Date().toISOString().split('T')[0],
    canal:       'Todos',
  })

  const filtradas = ventas.filter((v) => {
    const fecha  = new Date(v.created_at)
    const desde  = new Date(filtros.fechaInicio)
    const hasta  = new Date(filtros.fechaFin + 'T23:59:59')
    const okFecha = fecha >= desde && fecha <= hasta
    const okCanal = filtros.canal === 'Todos' ||
      (filtros.canal === 'IA' && v.source === 'ai') ||
      (filtros.canal === 'Humano' && v.source === 'human') ||
      (filtros.canal === 'Manual' && v.source === 'manual')
    return okFecha && okCanal
  })

  const total   = filtradas.reduce((s, v) => s + Number(v.amount), 0)
  const ventasIA = filtradas.filter((v) => v.source === 'ai')
  const totalIA  = ventasIA.reduce((s, v) => s + Number(v.amount), 0)
  const pctIA    = filtradas.length > 0 ? Math.round((ventasIA.length / filtradas.length) * 100) : 0
  const maxPDF   = plan === 'starter' ? 2 : plan === 'pro' ? 10 : 999

  const exportarExcel = async () => {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Ventas')
    ws.columns = [
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Monto', key: 'monto', width: 14 },
      { header: 'Canal', key: 'canal', width: 12 },
      { header: 'Estado', key: 'estado', width: 14 },
    ]
    filtradas.forEach((v) => ws.addRow({
      fecha:   new Date(v.created_at).toLocaleDateString('es-CL'),
      cliente: v.client_name ?? v.client_phone ?? '-',
      monto:   Number(v.amount),
      canal:   v.source === 'ai' ? 'IA' : v.source === 'human' ? 'Humano' : 'Manual',
      estado:  v.status,
    }))
    const buf  = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `reporte_${new Date().toISOString().split('T')[0]}.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16); doc.setTextColor(10, 186, 181)
    doc.text(`Reporte de Ventas — ${businessName}`, 14, 20)
    doc.setFontSize(9); doc.setTextColor(100)
    doc.text(`Período: ${filtros.fechaInicio} a ${filtros.fechaFin}`, 14, 28)
    doc.setFontSize(10); doc.setTextColor(30)
    doc.text(`Total: ${formatCLP(total)}   IA: ${formatCLP(totalIA)} (${pctIA}%)   Transacciones: ${filtradas.length}`, 14, 38)
    autoTable(doc, {
      startY: 48,
      head: [['Fecha', 'Cliente', 'Monto', 'Canal', 'Estado']],
      body: filtradas.map((v) => [
        new Date(v.created_at).toLocaleDateString('es-CL'),
        v.client_name ?? v.client_phone ?? '-',
        formatCLP(Number(v.amount)),
        v.source === 'ai' ? 'IA' : v.source === 'human' ? 'Humano' : 'Manual',
        v.status,
      ]),
      headStyles: { fillColor: [10, 186, 181], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
    })
    doc.save(`reporte_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const KPIS = [
    { icon: DollarSign, label: 'Ventas totales',   value: formatCLP(total),    sub: `${filtradas.length} transacciones` },
    { icon: Bot,        label: 'Recuperadas IA',   value: formatCLP(totalIA),  sub: `${pctIA}% del total`               },
    { icon: TrendingUp, label: 'Transacciones',    value: String(filtradas.length), sub: 'en el período'               },
    { icon: Clock,      label: 'Reportes PDF',     value: String(maxPDF),      sub: `máx. plan ${plan}`                 },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Reportes</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Analiza el rendimiento de ventas y automatización</p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filtros</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Desde', key: 'fechaInicio', type: 'date' },
            { label: 'Hasta', key: 'fechaFin',    type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type={type} value={filtros[key as 'fechaInicio' | 'fechaFin']}
                onChange={(e) => setFiltros({ ...filtros, [key]: e.target.value })}
                className="input-glass" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Canal</label>
            <select value={filtros.canal} onChange={(e) => setFiltros({ ...filtros, canal: e.target.value })}
              className="input-glass cursor-pointer">
              <option>Todos</option><option>IA</option><option>Humano</option><option>Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 flex items-start gap-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-dim)' }}>
              <k.icon className="w-4.5 h-4.5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{k.label}</p>
              <p className="font-display font-bold text-lg tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>{k.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{k.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Export */}
      <div className="flex gap-3">
        <button onClick={exportarExcel} className="btn-accent px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2">
          <Download className="w-4 h-4" strokeWidth={2} /> Excel
        </button>
        <button onClick={exportarPDF}
          className="px-4 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}>
          <FileDown className="w-4 h-4" strokeWidth={1.75} /> PDF
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Historial de ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['Fecha', 'Cliente', 'Monto', 'Canal', 'Estado'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No hay ventas en el período seleccionado
                </td></tr>
              ) : filtradas.map((v) => {
                const src = SOURCE_CFG[v.source ?? 'manual'] ?? SOURCE_CFG.manual
                const sts = STATUS_CFG[v.status ?? 'pending'] ?? STATUS_CFG.pending
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(v.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {v.client_name ?? v.client_phone ?? '-'}
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--accent)' }}>
                      {formatCLP(Number(v.amount))}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: src.bg, color: src.color }}>{src.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: sts.bg, color: sts.color }}>{sts.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
