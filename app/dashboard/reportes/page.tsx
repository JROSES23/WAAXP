'use client'

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

interface Venta {
  id: number;
  fecha: string;
  cliente: string;
  producto: string;
  monto: number;
  moneda: string;
  canal: 'IA' | 'Humano';
  tiempoRespuesta: number;
  convertido: boolean;
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
  ]);

  const [filtros, setFiltros] = useState({
    fechaInicio: '2025-12-01',
    fechaFin: '2026-01-05',
    canal: 'Todos',
    cliente: 'Todos'
  });

  const ventasFiltradas = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha);
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);
    
    const cumpleFecha = fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    const cumpleCanal = filtros.canal === 'Todos' || v.canal === filtros.canal;
    const cumpleCliente = filtros.cliente === 'Todos' || v.cliente === filtros.cliente;
    
    return cumpleFecha && cumpleCanal && cumpleCliente;
  });

  const ventasTotales = ventasFiltradas.reduce((sum, v) => sum + v.monto, 0);
  const ventasIA = ventasFiltradas.filter(v => v.canal === 'IA');
  const ventasRecuperadasIA = ventasIA.reduce((sum, v) => sum + v.monto, 0);
  const tiempoPromedioRespuesta = ventasFiltradas.length > 0 
    ? Math.round(ventasFiltradas.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasFiltradas.length)
    : 0;
  const tasaConversion = ventasFiltradas.length > 0 
    ? Math.round((ventasFiltradas.filter(v => v.convertido).length / ventasFiltradas.length) * 100)
    : 0;
  const porcentajeIA = ventasFiltradas.length > 0
    ? Math.round((ventasIA.length / ventasFiltradas.length) * 100)
    : 0;

  const clientesUnicos = ['Todos', ...Array.from(new Set(ventas.map(v => v.cliente)))];

  const exportarCSV = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ventas');

  // Prepara los datos (usa los campos correctos de tus ventas)
  const data = ventasFiltradas.map(v => ({
    fecha: v.fecha,
    cliente: v.cliente,
    producto: v.producto,
    monto: v.monto,
    moneda: v.moneda,
    canal: v.canal,
    tiempoRespuesta: v.tiempoRespuesta,
    convertido: v.convertido ? 'Sí' : 'No'
  }));

  // Define las columnas con anchos (ajustadas a tus datos reales)
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Cliente', key: 'cliente', width: 25 },
    { header: 'Producto', key: 'producto', width: 30 },
    { header: 'Monto', key: 'monto', width: 12 },
    { header: 'Moneda', key: 'moneda', width: 10 },
    { header: 'Canal', key: 'canal', width: 15 },
    { header: 'Tiempo Respuesta (min)', key: 'tiempoRespuesta', width: 20 },
    { header: 'Convertido', key: 'convertido', width: 12 }
  ];

  // Agrega los datos
  worksheet.addRows(data);

  // Genera y descarga el archivo
    // Agrega los datos
  worksheet.addRows(data);

    // Agrega los datos
  worksheet.addRows(data);

  // Genera y descarga el archivo
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  });
};

  
  // REEMPLAZA ESTA FUNCIÓN con la nueva versión
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Colores
    const colorPrimario = '#0f766e';
    const colorSecundario = '#E6F4EF';
    
    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110);
    doc.text('Reporte de Ventas', 14, 20);
    
    // Período
    doc.setFontSize(10);
    doc.setTextColor(107, 127, 122);
    doc.text(`Período: ${filtros.fechaInicio} a ${filtros.fechaFin}`, 14, 28);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 34);
    
    let yPos = 42;
    
    // SECCIÓN 1: Métricas principales
    doc.setFontSize(12);
    doc.setTextColor(26, 26, 26);
    doc.text('Resumen de Rendimiento', 14, yPos);
    yPos += 8;
    
    // Cuadro de métricas
    doc.setFillColor(230, 244, 239); // Fondo teal claro
    doc.rect(14, yPos, 182, 30, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 26);
    doc.text(`Ventas Totales: $${ventasTotales}`, 20, yPos + 6);
    doc.text(`Transacciones: ${ventasFiltradas.length}`, 20, yPos + 12);
    doc.text(`Tasa Conversión: ${tasaConversion}%`, 20, yPos + 18);
    doc.text(`Tiempo Promedio: ${tiempoPromedioRespuesta} min`, 20, yPos + 24);
    
    doc.text(`Generado por IA: $${ventasRecuperadasIA} (${porcentajeIA}%)`, 110, yPos + 6);
    doc.text(`Generado Humano: $${ventasTotales - ventasRecuperadasIA}`, 110, yPos + 12);
    doc.text(`Convertidos: ${ventasFiltradas.filter(v => v.convertido).length}`, 110, yPos + 18);
    doc.text(`Perdidos: ${ventasFiltradas.filter(v => !v.convertido).length}`, 110, yPos + 24);
    
    yPos += 40;
    
    // SECCIÓN 2: Análisis por Canal
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text('Análisis por Canal', 14, yPos);
    yPos += 7;
    
    const ventasHumano = ventasFiltradas.filter(v => v.canal === 'Humano');
    const ventasHumanoMonto = ventasHumano.reduce((sum, v) => sum + v.monto, 0);
    const tiempoIA = ventasIA.length > 0 ? Math.round(ventasIA.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasIA.length) : 0;
    const tiempoHumano = ventasHumano.length > 0 ? Math.round(ventasHumano.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasHumano.length) : 0;
    
    doc.setFillColor(15, 118, 110); // Fondo teal
    doc.rect(14, yPos, 182, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Canal', 20, yPos + 4);
    doc.text('Monto Total', 60, yPos + 4);
    doc.text('Cantidad', 110, yPos + 4);
    doc.text('Tiempo Promedio', 150, yPos + 4);
    
    yPos += 8;
    
    doc.setTextColor(26, 26, 26);
    doc.text('Automatización (IA)', 20, yPos);
    doc.text(`$${ventasRecuperadasIA}`, 60, yPos);
    doc.text(ventasIA.length.toString(), 110, yPos);
    doc.text(`${tiempoIA} min`, 150, yPos);
    
    yPos += 7;
    
    doc.text('Humano', 20, yPos);
    doc.text(`$${ventasHumanoMonto}`, 60, yPos);
    doc.text(ventasHumano.length.toString(), 110, yPos);
    doc.text(`${tiempoHumano} min`, 150, yPos);
    
    yPos += 12;
    
    // SECCIÓN 3: Tabla de ventas detallada
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text('Detalle de Transacciones', 14, yPos);
    yPos += 5;
    
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
    });
    
    // Footer con información adicional
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
    yPos = finalY + 10;
    
    doc.setFontSize(8);
    doc.setTextColor(107, 127, 122);
    doc.text('Reporte generado automáticamente por el sistema Vendia', 14, yPos);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')} - Filtros: Período ${filtros.fechaInicio} a ${filtros.fechaFin}`, 14, yPos + 5);
    
    doc.save(`reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  

  return (
    <div>
      {/* ... resto del código igual ... */}
      
      {/* Filtros */}
      <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2efec', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Filtros</h3>
          <button 
            onClick={() => setFiltros({ fechaInicio: '2025-12-01', fechaFin: '2026-01-05', canal: 'Todos', cliente: 'Todos' })}
            style={{ padding: '6px 12px', background: '#f3f4f6', color: '#6b7280', fontSize: 12, borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            Limpiar filtros
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5f7f7a', marginBottom: 6 }}>Fecha inicio</label>
            <input 
              type="date" 
              value={filtros.fechaInicio} 
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2efec', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5f7f7a', marginBottom: 6 }}>Fecha fin</label>
            <input 
              type="date" 
              value={filtros.fechaFin} 
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2efec', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5f7f7a', marginBottom: 6 }}>Canal</label>
            <select 
              value={filtros.canal} 
              onChange={(e) => setFiltros({ ...filtros, canal: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2efec', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#ffffff', cursor: 'pointer' }}
            >
              <option value="Todos">Todos</option>
              <option value="IA">IA</option>
              <option value="Humano">Humano</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5f7f7a', marginBottom: 6 }}>Cliente</label>
            <select 
              value={filtros.cliente} 
              onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2efec', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#ffffff', cursor: 'pointer' }}
            >
              {clientesUnicos.map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <MetricCard 
          title="Ventas totales" 
          value={`$${ventasTotales}`}
          subtitle={`${ventasFiltradas.length} transacciones`}
          icon="dollar"
          color="#0f766e"
        />
        <MetricCard 
          title="Recuperadas IA" 
          value={`$${ventasRecuperadasIA}`}
          subtitle={`${porcentajeIA}% del total`}
          icon="robot"
          color="#0f766e"
        />
        <MetricCard 
          title="Tiempo respuesta" 
          value={`${tiempoPromedioRespuesta} min`}
          subtitle="Promedio general"
          icon="clock"
          color="#0f766e"
        />
        <MetricCard 
          title="Tasa conversión" 
          value={`${tasaConversion}%`}
          subtitle={`${ventasFiltradas.filter(v => v.convertido).length} convertidas`}
          icon="chart"
          color="#0f766e"
        />
      </div>

      {/* Botones de exportación */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={exportarCSV}
          style={{ padding: '10px 16px', background: '#0f766e', color: '#ffffff', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar CSV
        </button>
        <button 
          onClick={exportarPDF}
          style={{ padding: '10px 16px', background: '#E6F4EF', color: '#0f766e', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Comparativa de canales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <ComparisonCard 
          title="Ventas por canal"
          data={[
            { label: 'IA', value: ventasIA.length, total: ventasFiltradas.length },
            { label: 'Humano', value: ventasFiltradas.filter(v => v.canal === 'Humano').length, total: ventasFiltradas.length }
          ]}
        />
        <ComparisonCard 
          title="Tiempo promedio respuesta"
          data={[
            { label: 'IA', value: ventasIA.length > 0 ? Math.round(ventasIA.reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasIA.length) : 0, unit: 'min' },
            { label: 'Humano', value: ventasFiltradas.filter(v => v.canal === 'Humano').length > 0 ? Math.round(ventasFiltradas.filter(v => v.canal === 'Humano').reduce((sum, v) => sum + v.tiempoRespuesta, 0) / ventasFiltradas.filter(v => v.canal === 'Humano').length) : 0, unit: 'min' }
          ]}
        />
      </div>

      {/* Tabla de ventas */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2efec', overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2efec' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Historial de ventas</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2efec', background: '#F9FCFB' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FECHA</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CLIENTE</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRODUCTO</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MONTO</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CANAL</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIEMPO</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5f7f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((venta) => (
              <tr 
                key={venta.id} 
                style={{ borderBottom: '1px solid #e2efec' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FCFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#6b7f7a' }}>
                  {new Date(venta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </td>
                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{venta.cliente}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#6b7f7a' }}>{venta.producto}</td>
                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#0f766e' }}>
                  ${venta.monto} {venta.moneda}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 999, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    background: venta.canal === 'IA' ? '#E6F4EF' : '#F3F4F6',
                    color: venta.canal === 'IA' ? '#0f766e' : '#6b7280'
                  }}>
                    {venta.canal}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#6b7f7a' }}>{venta.tiempoRespuesta} min</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 999, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    background: venta.convertido ? '#E6F4EF' : '#FEE2E2',
                    color: venta.convertido ? '#0f766e' : '#991B1B'
                  }}>
                    {venta.convertido ? 'Convertido' : 'Perdido'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ventasFiltradas.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            No hay ventas que coincidan con los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}

// Componentes auxiliares (MetricCard y ComparisonCard permanecen igual)
function MetricCard({ title, value, subtitle, icon, color }: any) {
  const iconMap: any = {
    dollar: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    robot: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
      </svg>
    ),
    clock: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    chart: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  };

  return (
    <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2efec' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, background: '#E6F4EF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {iconMap[icon]}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: '#6b7f7a', margin: 0, marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0, marginBottom: 2 }}>{value}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ title, data }: any) {
  return (
    <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2efec' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, margin: 0 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item: any, index: number) => (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6b7f7a' }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                {item.unit ? `${item.value} ${item.unit}` : `${item.value} (${Math.round((item.value / item.total) * 100)}%)`}
              </span>
            </div>
            {item.total && (
              <div style={{ width: '100%', height: 6, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${(item.value / item.total) * 100}%`, 
                    height: '100%', 
                    background: index === 0 ? '#0f766e' : '#6b7280',
                    borderRadius: 999 
                  }}
                />
              </div>
            )}
            {item.unit && (
              <div style={{ width: '100%', height: 6, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
                <div 
                  style={{ 
                    width: `${Math.min((item.value / 60) * 100, 100)}%`, 
                    height: '100%', 
                    background: index === 0 ? '#0f766e' : '#6b7280',
                    borderRadius: 999 
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
