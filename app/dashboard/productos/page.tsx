'use client'

import { useState } from 'react'

type ProductType = 'producto' | 'servicio' | 'reserva'

interface Product {
  id: number
  nombre: string
  precio: number
  moneda: string
  stock: number
  descripcion: string
  categoria: string
  tipo: ProductType
  // Campos específicos para reservas
  duracion_minutos?: number
  capacidad?: number
  requiere_aprobacion?: boolean
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Product[]>([
    { id: 1, nombre: 'Plan Premium', precio: 80, moneda: 'USD', stock: 999, descripcion: 'Asesoría ilimitada + declaración mensual', categoria: 'Consultoría', tipo: 'servicio' },
    { id: 2, nombre: 'Plan Basic', precio: 45, moneda: 'USD', stock: 999, descripcion: 'Consultas básicas sin declaración', categoria: 'Asesoría Contable', tipo: 'servicio' },
    { id: 3, nombre: 'Consultoría Fiscal', precio: 150, moneda: 'USD', stock: 20, descripcion: 'Asesoría personalizada por hora', categoria: 'Consultoría', tipo: 'servicio' }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({ 
    nombre: '', 
    precio: 0, 
    moneda: 'USD', 
    stock: 0, 
    descripcion: '', 
    categoria: 'Consultoría',
    tipo: 'servicio',
    duracion_minutos: 60,
    capacidad: 4,
    requiere_aprobacion: false
  })

  const getCategoriesByType = (tipo: ProductType): Array<{value: string, label: string}> => {
    switch(tipo) {
      case 'producto':
        return [
          { value: 'Ferretería', label: 'Ferretería' },
          { value: 'Electrónica', label: 'Electrónica' },
          { value: 'Ropa', label: 'Ropa y Textiles' },
          { value: 'Alimentos', label: 'Alimentos y Bebidas' },
          { value: 'Hogar', label: 'Hogar y Decoración' },
          { value: 'Deportes', label: 'Deportes y Fitness' },
          { value: 'Librería', label: 'Librería y Papelería' },
          { value: 'Juguetes', label: 'Juguetes y Niños' },
          { value: 'Automotriz', label: 'Automotriz' },
          { value: 'Farmacia', label: 'Farmacia y Salud' },
          { value: 'Mascotas', label: 'Mascotas' },
          { value: 'Otros', label: 'Otros' }
        ]
      case 'servicio':
        return [
          { value: 'Consultoría', label: 'Consultoría Profesional' },
          { value: 'Asesoría Legal', label: 'Asesoría Legal' },
          { value: 'Asesoría Contable', label: 'Asesoría Contable' },
          { value: 'Marketing', label: 'Marketing y Publicidad' },
          { value: 'Desarrollo Web', label: 'Desarrollo Web' },
          { value: 'Diseño Gráfico', label: 'Diseño Gráfico' },
          { value: 'Capacitación', label: 'Capacitación y Formación' },
          { value: 'Mantenimiento', label: 'Mantenimiento' },
          { value: 'Belleza', label: 'Belleza y Spa' },
          { value: 'Salud', label: 'Salud y Bienestar' },
          { value: 'Limpieza', label: 'Limpieza y Aseo' },
          { value: 'Reparaciones', label: 'Reparaciones' },
          { value: 'Otros', label: 'Otros Servicios' }
        ]
      case 'reserva':
        return [
          { value: 'Restaurante', label: 'Restaurante' },
          { value: 'Bar', label: 'Bar / Cafetería' },
          { value: 'Hotel', label: 'Hotel / Hospedaje' },
          { value: 'Salón de Eventos', label: 'Salón de Eventos' },
          { value: 'Spa', label: 'Spa / Centro Wellness' },
          { value: 'Peluquería', label: 'Peluquería / Barbería' },
          { value: 'Centro Médico', label: 'Centro Médico' },
          { value: 'Gimnasio', label: 'Gimnasio / Estudio' },
          { value: 'Tours', label: 'Tours y Excursiones' },
          { value: 'Cancha Deportiva', label: 'Cancha Deportiva' },
          { value: 'Sala de Reuniones', label: 'Sala de Reuniones' },
          { value: 'Otros', label: 'Otros' }
        ]
      default:
        return [{ value: 'General', label: 'General' }]
    }
  }

  const handleAddOrEditProduct = () => {
    if (formData.nombre && formData.precio && formData.stock) {
      if (editingId !== null) {
        // Modo edición
        setProductos(productos.map(p => 
          p.id === editingId 
            ? { ...p, ...formData } as Product
            : p
        ))
      } else {
        // Modo creación
        setProductos([...productos, { 
          id: productos.length + 1, 
          ...formData
        } as Product])
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({ 
      nombre: '', 
      precio: 0, 
      moneda: 'USD', 
      stock: 0, 
      descripcion: '', 
      categoria: 'Consultoría',
      tipo: 'servicio',
      duracion_minutos: 60,
      capacidad: 4,
      requiere_aprobacion: false
    })
    setEditingId(null)
    setShowModal(false)
  }

  const handleEditProduct = (producto: Product) => {
    setEditingId(producto.id)
    setFormData(producto)
    setShowModal(true)
  }

  const handleDeleteProduct = (id: number) => {
    setProductos(productos.filter(p => p.id !== id))
  }

  const getTipoIcon = (tipo: ProductType) => {
    switch(tipo) {
      case 'reserva':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        )
      case 'servicio':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        )
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        )
    }
  }

  const getTipoBadgeColor = (tipo: ProductType) => {
    switch(tipo) {
      case 'producto':
        return 'bg-blue-100 text-blue-700'
      case 'servicio':
        return 'bg-purple-100 text-purple-700'
      case 'reserva':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Productos y Servicios</h1>
        <p className="text-sm text-slate-600">Gestiona tu catálogo de productos, servicios y reservas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total de productos" value={productos.length.toString()} />
        <StatCard title="Stock total" value={productos.reduce((sum, p) => sum + p.stock, 0).toString()} />
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Agregar producto</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg font-semibold transition-colors"
              >
                Nuevo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">PRODUCTO</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">PRECIO</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">STOCK</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CATEGORÍA</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                      {getTipoIcon(producto.tipo)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900">{producto.nombre}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTipoBadgeColor(producto.tipo)}`}>
                          {producto.tipo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{producto.descripcion}</p>
                      {producto.tipo === 'reserva' && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                          {producto.duracion_minutos && (
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {producto.duracion_minutos}min
                            </span>
                          )}
                          {producto.capacidad && (
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                              </svg>
                              {producto.capacidad} personas
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-teal-600">
                  ${producto.precio} {producto.moneda}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    producto.stock > 50 
                      ? 'bg-green-100 text-green-700' 
                      : producto.stock > 0 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {producto.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{producto.categoria}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditProduct(producto)} 
                      className="px-3 py-2 bg-teal-50 text-teal-600 text-xs rounded-lg font-semibold hover:bg-teal-100 transition-colors flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(producto.id)} 
                      className="px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingId !== null ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            
            <div className="space-y-4">
              {/* Tipo de producto */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['producto', 'servicio', 'reserva'] as ProductType[]).map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => {
                        const categories = getCategoriesByType(tipo)
                        setFormData({ 
                          ...formData, 
                          tipo,
                          categoria: categories[0].value
                        })
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                        formData.tipo === tipo
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Input 
                label="Nombre" 
                placeholder="Ej: Tornillo" 
                value={formData.nombre || ''} 
                onChange={(value: string) => setFormData({ ...formData, nombre: value })} 
              />
              
              <Input 
                label="Descripción" 
                placeholder="Breve descripción" 
                value={formData.descripcion || ''} 
                onChange={(value: string) => setFormData({ ...formData, descripcion: value })} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Precio" 
                  type="number" 
                  placeholder="80" 
                  value={formData.precio?.toString() || ''} 
                  onChange={(value: string) => setFormData({ ...formData, precio: parseFloat(value) || 0 })} 
                />
                <Select 
                  label="Moneda" 
                  options={[
                    { value: 'USD', label: '🇺🇸 USD - Dólar' },
                    { value: 'CLP', label: '🇨🇱 CLP - Peso Chileno' },
                    { value: 'MXN', label: '🇲🇽 MXN - Peso Mexicano' },
                    { value: 'ARS', label: '🇦🇷 ARS - Peso Argentino' },
                    { value: 'COP', label: '🇨🇴 COP - Peso Colombiano' },
                    { value: 'PEN', label: '🇵🇪 PEN - Sol Peruano' },
                    { value: 'BRL', label: '🇧🇷 BRL - Real Brasileño' },
                    { value: 'UYU', label: '🇺🇾 UYU - Peso Uruguayo' }
                  ]}
                  value={formData.moneda || 'USD'} 
                  onChange={(value: string) => setFormData({ ...formData, moneda: value })} 
                />
              </div>

              <Input 
                label="Stock / Disponibilidad" 
                type="number" 
                placeholder="100" 
                value={formData.stock?.toString() || ''} 
                onChange={(value: string) => setFormData({ ...formData, stock: parseInt(value) || 0 })} 
              />

              <Select 
                label="Categoría" 
                options={getCategoriesByType(formData.tipo || 'servicio')}
                value={formData.categoria || ''} 
                onChange={(value: string) => setFormData({ ...formData, categoria: value })} 
              />

              {/* Campos específicos para reservas */}
              {formData.tipo === 'reserva' && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Configuración de Reserva</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Duración (minutos)" 
                      type="number" 
                      placeholder="60" 
                      value={formData.duracion_minutos?.toString() || ''} 
                      onChange={(value: string) => setFormData({ ...formData, duracion_minutos: parseInt(value) || 60 })} 
                    />
                    <Input 
                      label="Capacidad (personas)" 
                      type="number" 
                      placeholder="4" 
                      value={formData.capacidad?.toString() || ''} 
                      onChange={(value: string) => setFormData({ ...formData, capacidad: parseInt(value) || 4 })} 
                    />
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiere_aprobacion || false}
                        onChange={(e) => setFormData({ ...formData, requiere_aprobacion: e.target.checked })}
                        className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Requiere aprobación manual
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleAddOrEditProduct} 
                className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg font-semibold transition-colors"
              >
                {editingId !== null ? 'Guardar Cambios' : 'Agregar'}
              </button>
              <button 
                onClick={resetForm} 
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Input({ label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  )
}

function Select({ label, options, value, onChange }: { 
  label: string
  options: Array<{value: string, label: string} | string>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
      >
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return <option key={optValue} value={optValue}>{optLabel}</option>
        })}
      </select>
    </div>
  )
}
