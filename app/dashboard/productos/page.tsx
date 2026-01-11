'use client'

import { useState } from 'react';

export default function ProductosPage() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Plan Premium', precio: 80, moneda: 'USD', stock: 999, descripcion: 'Asesoría ilimitada + declaración mensual', categoria: 'Servicios' },
    { id: 2, nombre: 'Plan Basic', precio: 45, moneda: 'USD', stock: 999, descripcion: 'Consultas básicas sin declaración', categoria: 'Servicios' },
    { id: 3, nombre: 'Consultoría Fiscal', precio: 150, moneda: 'USD', stock: 20, descripcion: 'Asesoría personalizada por hora', categoria: 'Consultoría' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', precio: '', moneda: 'USD', stock: '', descripcion: '', categoria: 'Servicios' });

  const handleAddOrEditProduct = () => {
    if (formData.nombre && formData.precio && formData.stock) {
      if (editingId !== null) {
        // Modo edición
        setProductos(productos.map(p => 
          p.id === editingId 
            ? { ...p, nombre: formData.nombre, precio: parseFloat(formData.precio), moneda: formData.moneda, stock: parseInt(formData.stock), descripcion: formData.descripcion, categoria: formData.categoria }
            : p
        ));
      } else {
        // Modo creación
        setProductos([...productos, { 
          id: productos.length + 1, 
          nombre: formData.nombre, 
          precio: parseFloat(formData.precio), 
          moneda: formData.moneda, 
          stock: parseInt(formData.stock), 
          descripcion: formData.descripcion, 
          categoria: formData.categoria 
        }]);
      }
      setFormData({ nombre: '', precio: '', moneda: 'USD', stock: '', descripcion: '', categoria: 'Servicios' });
      setEditingId(null);
      setShowModal(false);
    }
  };

  const handleEditProduct = (producto: any) => {
    setEditingId(producto.id);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      moneda: producto.moneda,
      stock: producto.stock.toString(),
      descripcion: producto.descripcion,
      categoria: producto.categoria
    });
    setShowModal(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nombre: '', precio: '', moneda: 'USD', stock: '', descripcion: '', categoria: 'Servicios' });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Gestiona tu catálogo de productos y servicios</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard title="Total de productos" value={productos.length.toString()} />
        <StatCard title="Stock total" value={productos.reduce((sum, p) => sum + p.stock, 0).toString()} />
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 12, border: "1px solid #e2efec" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, background: "#E6F4EF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#6b7f7a", margin: 0, marginBottom: 4 }}>Agregar producto</p>
              <button onClick={() => setShowModal(true)} style={{ padding: '8px 14px', background: '#0f766e', color: '#ffffff', fontSize: 12, borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer' }}>Nuevo</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2efec", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2efec", background: "#F9FCFB" }}>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5f7f7a", textTransform: "uppercase", letterSpacing: "0.5px" }}>PRODUCTO</th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5f7f7a", textTransform: "uppercase", letterSpacing: "0.5px" }}>PRECIO</th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5f7f7a", textTransform: "uppercase", letterSpacing: "0.5px" }}>STOCK</th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5f7f7a", textTransform: "uppercase", letterSpacing: "0.5px" }}>CATEGORÍA</th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5f7f7a", textTransform: "uppercase", letterSpacing: "0.5px" }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} style={{ borderBottom: "1px solid #e2efec" }} onMouseEnter={(e) => e.currentTarget.style.background = "#F9FCFB"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", margin: 0, marginBottom: 2 }}>{producto.nombre}</p>
                  <p style={{ fontSize: 12, color: "#6b7f7a", margin: 0 }}>{producto.descripcion}</p>
                </td>
                <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "#0f766e" }}>${producto.precio} {producto.moneda}</td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: producto.stock > 50 ? "#E6F4EF" : producto.stock > 0 ? "#FEF3C7" : "#FEE2E2", color: producto.stock > 50 ? "#0f766e" : producto.stock > 0 ? "#92400e" : "#991B1B" }}>{producto.stock}</span>
                </td>
                <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7f7a" }}>{producto.categoria}</td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEditProduct(producto)} style={{ padding: '6px 10px', background: '#E6F4EF', color: '#0f766e', fontSize: 12, borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteProduct(producto.id)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#991b1b', fontSize: 12, borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, maxWidth: 500, width: '90%', border: '1px solid #e2efec' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 20, margin: 0 }}>
              {editingId !== null ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <Input label="Nombre" placeholder="Ej: Plan Premium" value={formData.nombre} onChange={(value) => setFormData({ ...formData, nombre: value })} />
              <Input label="Descripción" placeholder="Breve descripción" value={formData.descripcion} onChange={(value) => setFormData({ ...formData, descripcion: value })} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Precio" type="number" placeholder="80" value={formData.precio} onChange={(value) => setFormData({ ...formData, precio: value })} />
                <Select label="Moneda" options={['USD', 'CLP']} value={formData.moneda} onChange={(value) => setFormData({ ...formData, moneda: value })} />
              </div>

              <Input label="Stock" type="number" placeholder="100" value={formData.stock} onChange={(value) => setFormData({ ...formData, stock: value })} />
              <Select label="Categoría" options={['Servicios', 'Consultoría', 'Producto']} value={formData.categoria} onChange={(value) => setFormData({ ...formData, categoria: value })} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAddOrEditProduct} style={{ flex: 1, padding: '10px', background: '#0f766e', color: '#ffffff', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                {editingId !== null ? 'Guardar Cambios' : 'Agregar'}
              </button>
              <button onClick={handleCloseModal} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#6b7280', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: "#ffffff", padding: 20, borderRadius: 12, border: "1px solid #e2efec" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 48, height: 48, background: "#E6F4EF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
        </div>
        <div>
          <p style={{ fontSize: 12, color: "#6b7f7a", margin: 0, marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5f7f7a', marginBottom: 6 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2efec', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5f7f7a', marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2efec', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#ffffff', cursor: 'pointer' }}>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
