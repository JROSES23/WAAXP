'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { Download, FileDown, DollarSign, Bot, Clock, TrendingUp, Filter } from 'lucide-react'

interface Venta {
  id: number
  fecha: string
  cliente: string
  producto: string
  monto: number
  moneda: string
  canal: 'IA' | 'Humano'
  tiempoRespuesta: number
  convertido: boolean
}

export default function ReportesPage() {
  const [ventas] = useState<Venta[]>([
    { id: 1, fecha: '2026-01-05', cliente: 'Juan Pérez', producto: 'Plan Premium', monto: 80, moneda: 'USD', canal: 'IA', tiempoRespuesta: 5, convertido: true },
    { id: 2, fecha: '2026-01-04', cliente: 'María López', producto: 'Plan Basic', monto: 45, moneda: 'USD', canal: 'Humano', tiempoRespuesta: 45, convertido: true },
    { id: 3, fecha: '2026-01-03', cliente: 'Carlos Díaz', producto: 'Consultoría Fiscal', monto: 150, moneda: 'USD', canal: 'IA', tiempoRespuesta: 8, convertido: true },
    { id: 4, fecha: '2026-01-02', cliente: 'Ana Rodríguez', producto: 'Plan Premium', monto: 80, moneda: 'USD', canal: 'IA', tiempoRespuesta: 12, convertido: false },
    { id: 5, fecha: '2026-01-01', cliente: 'Pedro Sánchez', producto: 'Plan Basic', monto: 45, moneda: 'USD', canal: 'Humano', tiempoRespuesta: 30, convertido: true },
    { id: 6, fecha: '2025-12-30', cliente: 'Luis García', producto: 'Plan Premium', monto: 80, moneda: 'USD', canal: 'IA', tiempoRespuesta: 6, convertido: true },
    { id: 7, fecha: '2025-12-28', cliente: 'Sofia Martínez', producto: 'Consultoría Fiscal', monto: 150, moneda: 'USD', canal: 'Humano', tiempoRespuesta: 60, convertido: true },
  ])

  const [filtros, setFiltros] = useState({
    fechaInicio: '2025-12-01',
    fechaFin: '2026-01-05',
    canal: 'Todos',
    cliente: 'Todos'
  })

  const ventasFiltradas = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha)
    const fechaInicio = new Date(filtros.fechaInicio)
    const fechaFin = new Date(filtros.fechaFin)
    
    const cumpleFecha = fechaVenta >= fechaInicio && fechaVenta <= fechaFin
    const cumpleCanal = filtros.canal === 'Todos' || v.canal === filtros.canal
    const cumpleCliente = filtros.cliente === 'Todos' || v.cliente === filtros.cliente
    
    return cumpleFecha && cumpleCanal && cumpleCliente
  })

  const ventasTotales = ventasFiltradas.reduce((sum, v) => sum + v.monto, 0)
  const ventasIA = ventasFiltradas.filter(v => v.canal === 'IA')
  const ventasRecuperadasIA = ventasIA.reduce((sum, v) => sum + v.monto, 0)
  const tiempoPromedioRespuesta = ventasFiltradas.length > 0 
    ? Math.round(ventasFiltradas.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasFiltradas.length)
    : 0
  const tasaConversion = ventasFiltradas.length > 0 
    ? Math.round((ventasFiltradas.filter(v => v.convertido).length / ventasFiltradas.length) * 100)
    : 0
  const porcentajeIA = ventasFiltradas.length > 0
    ? Math.round((ventasIA.length / ventasFiltradas.length) * 100)
    : 0

  const clientesUnicos = ['Todos', ...Array.from(new Set(ventas.map(v => v.cliente)))]

  const exportarCSV = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Ventas')

    const data = ventasFiltradas.map(v => ({
      fecha: v.fecha,
      cliente: v.cliente,
      producto: v.producto,
      monto: v.monto,
      moneda: v.moneda,
      canal: v.canal,
      tiempoRespuesta: v.tiempoRespuesta,
      convertido: v.convertido ? 'Sí' : 'No'
    }))

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Monto', key: 'monto', width: 12 },
      { header: 'Moneda', key: 'moneda', width: 10 },
      { header: 'Canal', key: 'canal', width: 15 },
      { header: 'Tiempo Respuesta (min)', key: 'tiempoRespuesta', width: 20 },
      { header: 'Convertido', key: 'convertido', width: 12 }
    ]

    worksheet.addRows(data)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.setTextColor(15, 118, 110)
    doc.text('Reporte de Ventas', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(107, 127, 122)
    doc.text(`Período: ${filtros.fechaInicio} a ${filtros.fechaFin}`, 14, 28)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 34)
    
    let yPos = 42
    
    doc.setFontSize(12)
    doc.setTextColor(26, 26, 26)
    doc.text('Resumen de Rendimiento', 14, yPos)
    yPos += 8
    
    doc.setFillColor(230, 244, 239)
    doc.rect(14, yPos, 182, 30, 'F')
    
    doc.setFontSize(9)
    doc.setTextColor(26, 26, 26)
    doc.text(`Ventas Totales: $${ventasTotales}`, 20, yPos + 6)
    doc.text(`Transacciones: ${ventasFiltradas.length}`, 20, yPos + 12)
    doc.text(`Tasa Conversión: ${tasaConversion}%`, 20, yPos + 18)
    doc.text(`Tiempo Promedio: ${tiempoPromedioRespuesta} min`, 20, yPos + 24)
    
    doc.text(`Generado por IA: $${ventasRecuperadasIA} (${porcentajeIA}%)`, 110, yPos + 6)
    doc.text(`Generado Humano: $${ventasTotales - ventasRecuperadasIA}`, 110, yPos + 12)
    doc.text(`Convertidos: ${ventasFiltradas.filter(v => v.convertido).length}`, 110, yPos + 18)
    doc.text(`Perdidos: ${ventasFiltradas.filter(v => !v.convertido).length}`, 110, yPos + 24)
    
    yPos += 40
    
    doc.setFontSize(11)
    doc.setTextColor(26, 26, 26)
    doc.text('Análisis por Canal', 14, yPos)
    yPos += 7
    
    const ventasHumano = ventasFiltradas.filter(v => v.canal === 'Humano')
    const ventasHumanoMonto = ventasHumano.reduce((sum, v) => sum + v.monto, 0)
    const tiempoIA = ventasIA.length > 0 ? Math.round(ventasIA.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasIA.length) : 0
    const tiempoHumano = ventasHumano.length > 0 ? Math.round(ventasHumano.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasHumano.length) : 0
    
    doc.setFillColor(15, 118, 110)
    doc.rect(14, yPos, 182, 6, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text('Canal', 20, yPos + 4)
    doc.text('Monto Total', 60, yPos + 4)
    doc.text('Cantidad', 110, yPos + 4)
    doc.text('Tiempo Promedio', 150, yPos + 4)
    
    yPos += 8
    
    doc.setTextColor(26, 26, 26)
    doc.text('Automatización (IA)', 20, yPos)
    doc.text(`$${ventasRecuperadasIA}`, 60, yPos)
    doc.text(ventasIA.length.toString(), 110, yPos)
    doc.text(`${tiempoIA} min`, 150, yPos)
    
    yPos += 7
    
    doc.text('Humano', 20, yPos)
    doc.text(`$${ventasHumanoMonto}`, 60, yPos)
    doc.text(ventasHumano.length.toString(), 110, yPos)
    doc.text(`${tiempoHumano} min`, 150, yPos)
    
    yPos += 12
    
    doc.setFontSize(11)
    doc.setTextColor(26, 26, 26)
    doc.text('Detalle de Transacciones', 14, yPos)
    yPos += 5
    
    autoTable(doc, {
      head: [['Fecha', 'Cliente', 'Producto', 'Monto', 'Canal', 'Estado']],
      body: ventasFiltradas.map(v => [
        v.fecha,
        v.cliente,
        v.producto,
        `$${v.monto} ${v.moneda}`,
        v.canal,
        v.convertido ? 'Convertido' : 'Perdido'
      ]),
      startY: yPos,
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 26
      },
      alternateRowStyles: {
        fillColor: [245, 251, 251]
      },
      margin: { left: 14, right: 14 }
    })
    
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50
    yPos = finalY + 10
    
    doc.setFontSize(8)
    doc.setTextColor(107, 127, 122)
    doc.text('Reporte generado automáticamente por Operly', 14, yPos)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')} - Filtros: Período ${filtros.fechaInicio} a ${filtros.fechaFin}`, 14, yPos + 5)
    
    doc.save(`reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reportes</h1>
        <p className="text-sm text-slate-600">
          Analiza el rendimiento de tus ventas y automatización
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-900">Filtros</h3>
          </div>
          <button 
            onClick={() => setFiltros({ fechaInicio: '2025-12-01', fechaFin: '2026-01-05', canal: 'Todos', cliente: 'Todos' })}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg font-semibold transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha inicio</label>
            <input 
              type="date" 
              value={filtros.fechaInicio} 
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha fin</label>
            <input 
              type="date" 
              value={filtros.fechaFin} 
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Canal</label>
            <select 
              value={filtros.canal} 
              onChange={(e) => setFiltros({ ...filtros, canal: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="IA">IA</option>
              <option value="Humano">Humano</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente</label>
            <select 
              value={filtros.cliente} 
              onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
            >
              {clientesUnicos.map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Ventas totales" 
          value={`$${ventasTotales}`}
          subtitle={`${ventasFiltradas.length} transacciones`}
          Icon={DollarSign}
          color="bg-teal-50 text-teal-600"
        />
        <MetricCard 
          title="Recuperadas IA" 
          value={`$${ventasRecuperadasIA}`}
          subtitle={`${porcentajeIA}% del total`}
          Icon={Bot}
          color="bg-purple-50 text-purple-600"
        />
        <MetricCard 
          title="Tiempo respuesta" 
          value={`${tiempoPromedioRespuesta} min`}
          subtitle="Promedio general"
          Icon={Clock}
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard 
          title="Tasa conversión" 
          value={`${tasaConversion}%`}
          subtitle={`${ventasFiltradas.filter(v => v.convertido).length} convertidas`}
          Icon={TrendingUp}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Botones de exportación */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button 
          onClick={exportarCSV}
          className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
        <button 
          onClick={exportarPDF}
          className="px-5 py-3 bg-white hover:bg-slate-50 text-teal-600 border-2 border-teal-600 text-sm rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Comparativa de canales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ComparisonCard 
          title="Ventas por canal"
          data={[
            { label: 'IA', value: ventasIA.length, total: ventasFiltradas.length, color: 'bg-teal-600' },
            { label: 'Humano', value: ventasFiltradas.filter(v => v.canal === 'Humano').length, total: ventasFiltradas.length, color: 'bg-slate-400' }
          ]}
        />
        <ComparisonCard 
          title="Tiempo promedio respuesta"
          data={[
            { label: 'IA', value: ventasIA.length > 0 ? Math.round(ventasIA.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasIA.length) : 0, unit: 'min', color: 'bg-teal-600' },
            { label: 'Humano', value: ventasFiltradas.filter(v => v.canal === 'Humano').length > 0 ? Math.round(ventasFiltradas.filter(v => v.canal === 'Humano').reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasFiltradas.filter(v => v.canal === 'Humano').length) : 0, unit: 'min', color: 'bg-slate-400' }
          ]}
        />
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Historial de ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Canal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tiempo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No hay ventas que coincidan con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => (
                  <tr 
                    key={venta.id} 
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(venta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{venta.cliente}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{venta.producto}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-teal-600">
                      ${venta.monto} {venta.moneda}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        venta.canal === 'IA' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {venta.canal}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{venta.tiempoRespuesta} min</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        venta.convertido ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {venta.convertido ? 'Convertido' : 'Perdido'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function ComparisonCard({ title, data }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-6">{title}</h3>
      <div className="space-y-6">
        {data.map((item: any, index: number) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {item.unit ? `${item.value} ${item.unit}` : `${item.value} (${Math.round((item.value / item.total) * 100)}%)`}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ 
                  width: item.unit 
                    ? `${Math.min((item.value / 60) * 100, 100)}%` 
                    : `${(item.value / item.total) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
