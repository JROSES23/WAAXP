'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Categoria, Negocio, Producto, TipoProducto } from '@/app/dashboard/types'
import { Briefcase, Calendar, ImagePlus, Package, Pencil, Plus, Trash2, X, AlertTriangle } from 'lucide-react'

interface ProductosClientProps {
  negocio:             Negocio
  productosIniciales:  Producto[]
  categoriasIniciales: Categoria[]
}

type FiltroTipo = 'todos' | TipoProducto

type FormularioProducto = {
  id?:                   string
  nombre:                string
  descripcion:           string
  tipo:                  TipoProducto
  precio:                number
  moneda:                string
  categoria_id:          string | null
  imagenes:              string[]
  stock:                 number | null
  stock_alert_threshold: number | null
  duracion_minutos:      number | null
  capacidad:             number | null
  activo:                boolean
}

const MONEDAS   = ['CLP', 'USD', 'MXN', 'ARS', 'COP', 'PEN', 'BRL', 'UYU']
const cardStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }
const modalOverlay = { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }

const TIPO_CFG: Record<TipoProducto, { label: string; color: string; bg: string; border: string; icon: typeof Package }> = {
  producto: { label: 'Producto', color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)', icon: Package  },
  servicio: { label: 'Servicio', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)', icon: Briefcase },
  reserva:  { label: 'Reserva',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)', icon: Calendar  },
}

export default function ProductosClient({ negocio, productosIniciales, categoriasIniciales }: ProductosClientProps) {
  const supabase = useMemo(() => createClient(), [])

  const [productos,          setProductos]          = useState<Producto[]>(productosIniciales)
  const [categorias,         setCategorias]         = useState<Categoria[]>(categoriasIniciales)
  const [filtroTipo,         setFiltroTipo]         = useState<FiltroTipo>('todos')
  const [filtroCategoria,    setFiltroCategoria]    = useState<string>('todas')
  const [modalProducto,      setModalProducto]      = useState(false)
  const [modalCategoria,     setModalCategoria]     = useState(false)
  const [nombreCategoriaNueva, setNombreCategoriaNueva] = useState('')
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([])
  const [cargando,           setCargando]           = useState(false)
  const [errorFormulario,    setErrorFormulario]    = useState<string | null>(null)

  const formularioInicial: FormularioProducto = {
    nombre: '', descripcion: '', tipo: 'producto', precio: 0, moneda: 'CLP',
    categoria_id: null, imagenes: [], stock: 0, stock_alert_threshold: 0,
    duracion_minutos: null, capacidad: null, activo: true,
  }

  const [formulario, setFormulario] = useState<FormularioProducto>(formularioInicial)

  const categoriasPorId = useMemo(() =>
    categorias.reduce<Record<string, Categoria>>((acc, c) => { acc[c.id] = c; return acc }, {}),
  [categorias])

  const productosFiltrados = productos.filter((p) =>
    (filtroTipo === 'todos' || p.tipo === filtroTipo) &&
    (filtroCategoria === 'todas' || p.categoria_id === filtroCategoria)
  )

  const totalActivos        = productos.filter((p) => p.activo).length
  const productosStockBajo  = productos.filter((p) =>
    p.tipo === 'producto' && typeof p.stock === 'number' && typeof p.stock_alert_threshold === 'number' && p.stock <= p.stock_alert_threshold
  ).length
  const productosSinFoto = productos.filter((p) => !p.imagenes || p.imagenes.length === 0).length

  const abrirModalNuevo = () => { setFormulario({ ...formularioInicial }); setArchivosSeleccionados([]); setErrorFormulario(null); setModalProducto(true) }
  const abrirModalEditar = (p: Producto) => {
    setFormulario({
      id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? '', tipo: p.tipo, precio: p.precio,
      moneda: p.moneda, categoria_id: p.categoria_id ?? null, imagenes: p.imagenes ?? [],
      stock: p.stock ?? null, stock_alert_threshold: p.stock_alert_threshold ?? null,
      duracion_minutos: p.duracion_minutos ?? null, capacidad: p.capacidad ?? null, activo: p.activo,
    })
    setArchivosSeleccionados([]); setErrorFormulario(null); setModalProducto(true)
  }

  const validar = () => {
    if (!formulario.nombre.trim()) return 'El nombre es obligatorio.'
    if (formulario.precio <= 0)   return 'El precio debe ser mayor a 0.'
    if (formulario.tipo === 'producto' && (formulario.stock === null || formulario.stock_alert_threshold === null))
      return 'Stock y alerta de stock son obligatorios para productos.'
    if (formulario.tipo !== 'producto' && !formulario.duracion_minutos)
      return 'La duración es obligatoria para servicios o reservas.'
    return null
  }

  const manejarCategoria = (valor: string) => {
    if (valor === 'nueva') { setModalCategoria(true); return }
    setFormulario((e) => ({ ...e, categoria_id: valor || null }))
  }

  const crearCategoria = async () => {
    if (!nombreCategoriaNueva.trim()) return
    setCargando(true)
    const tipoAplicacion = formulario.tipo === 'producto' ? 'producto' : 'servicio'
    const { data, error } = await supabase.from('categories').insert({
      business_id: negocio.id, nombre: nombreCategoriaNueva.trim(), tipo_aplicacion: tipoAplicacion,
    }).select('*').single()
    if (!error && data) {
      setCategorias((p) => [data as Categoria, ...p])
      setFormulario((e) => ({ ...e, categoria_id: (data as Categoria).id }))
      setNombreCategoriaNueva(''); setModalCategoria(false)
    }
    setCargando(false)
  }

  const eliminarCategoria = async (id: string) => {
    setCargando(true)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategorias((p) => p.filter((c) => c.id !== id))
      setProductos((p) => p.map((prod) => prod.categoria_id === id ? { ...prod, categoria_id: undefined } : prod))
    }
    setCargando(false)
  }

  const subirImagenes = async (productoId: string) => {
    const urls: string[] = []
    for (const archivo of archivosSeleccionados.slice(0, 2)) {
      const ruta = `${negocio.id}/${productoId}/${archivo.name}`
      const { error } = await supabase.storage.from('productos').upload(ruta, archivo, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('productos').getPublicUrl(ruta)
      if (data?.publicUrl) urls.push(data.publicUrl)
    }
    return urls
  }

  const guardarProducto = async () => {
    const err = validar()
    if (err) { setErrorFormulario(err); return }
    setCargando(true); setErrorFormulario(null)

    const datosBase = {
      business_id: negocio.id, nombre: formulario.nombre.trim(), descripcion: formulario.descripcion.trim() || null,
      tipo: formulario.tipo, precio: formulario.precio, moneda: formulario.moneda,
      categoria_id: formulario.categoria_id, imagenes: formulario.imagenes,
      stock: formulario.tipo === 'producto' ? formulario.stock : null,
      stock_alert_threshold: formulario.tipo === 'producto' ? formulario.stock_alert_threshold : null,
      duracion_minutos: formulario.tipo === 'producto' ? null : formulario.duracion_minutos,
      capacidad: formulario.tipo === 'producto' ? null : formulario.capacidad,
      activo: formulario.activo,
    }

    try {
      if (formulario.id) {
        const { data } = await supabase.from('products').update(datosBase).eq('id', formulario.id).select('*, categories(nombre)').single()
        let imgs = formulario.imagenes
        if (archivosSeleccionados.length > 0) {
          imgs = (await subirImagenes(formulario.id)).slice(0, 2)
          await supabase.from('products').update({ imagenes: imgs }).eq('id', formulario.id)
        }
        setProductos((p) => p.map((prod) => prod.id === formulario.id ? { ...(data as Producto), imagenes: imgs } : prod))
      } else {
        const { data } = await supabase.from('products').insert({ ...datosBase, imagenes: [] }).select('*, categories(nombre)').single()
        if (!data) throw new Error('No data')
        let imgs: string[] = []
        if (archivosSeleccionados.length > 0) {
          imgs = (await subirImagenes((data as Producto).id)).slice(0, 2)
          await supabase.from('products').update({ imagenes: imgs }).eq('id', (data as Producto).id)
        }
        setProductos((p) => [{ ...(data as Producto), imagenes: imgs }, ...p])
      }
      setModalProducto(false); setFormulario({ ...formularioInicial }); setArchivosSeleccionados([])
      toast.success(formulario.id ? 'Producto actualizado' : 'Producto creado')
    } catch {
      setErrorFormulario('No se pudo guardar el producto. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const eliminarProducto = async (id: string) => {
    setCargando(true)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) setProductos((p) => p.filter((prod) => prod.id !== id))
    setCargando(false)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Productos</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Administra tu catálogo y mantén el stock bajo control</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Activos',   value: totalActivos,       color: 'var(--accent)', bg: 'var(--accent-dim)'          },
          { label: 'Stock bajo',value: productosStockBajo,  color: '#F59E0B',       bg: 'rgba(245,158,11,0.1)'       },
          { label: 'Sin foto',  value: productosSinFoto,    color: 'var(--text-secondary)', bg: 'var(--bg-surface)'  },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 text-center" style={cardStyle}>
            <p className="font-display font-extrabold text-2xl tracking-[-0.03em]" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filtros + acción */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="input-glass cursor-pointer">
            <option value="todos">Todos los tipos</option>
            <option value="producto">Productos</option>
            <option value="servicio">Servicios</option>
            <option value="reserva">Reservas</option>
          </select>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
            className="input-glass cursor-pointer">
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <button onClick={abrirModalNuevo}
          className="btn-accent px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nuevo producto
        </button>
      </div>

      {/* Categorías */}
      <div className="p-4 rounded-2xl" style={cardStyle}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Categorías</p>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{categorias.length} registradas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias.length === 0
            ? <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Aún no hay categorías.</span>
            : categorias.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                {c.nombre}
                <button type="button" onClick={() => eliminarCategoria(c.id)}
                  className="w-3.5 h-3.5 rounded-full transition-opacity hover:opacity-70">
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </span>
            ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['Foto', 'Nombre', 'Tipo', 'Precio', 'Stock', 'Categoría', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No hay productos para los filtros seleccionados.
                  </td>
                </tr>
              ) : productosFiltrados.map((producto) => {
                const stockBajo = producto.tipo === 'producto' &&
                  typeof producto.stock === 'number' && typeof producto.stock_alert_threshold === 'number' &&
                  producto.stock <= producto.stock_alert_threshold
                const tipoCfg = TIPO_CFG[producto.tipo]
                const TipoIcon = tipoCfg.icon
                return (
                  <tr key={producto.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-5 py-3.5">
                      {producto.imagenes?.[0] ? (
                        <img src={producto.imagenes[0]} alt={producto.nombre} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'var(--bg-surface)' }}>
                          <ImagePlus className="h-4 w-4 opacity-30" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.5} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{producto.nombre}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{producto.descripcion || 'Sin descripción'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: tipoCfg.bg, color: tipoCfg.color, border: `1px solid ${tipoCfg.border}` }}>
                        <TipoIcon className="w-3 h-3" strokeWidth={2} />
                        {tipoCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--accent)' }}>
                      ${producto.precio.toLocaleString()} {producto.moneda}
                    </td>
                    <td className="px-5 py-3.5">
                      {producto.tipo === 'producto' ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: stockBajo ? '#F59E0B' : 'var(--text-primary)' }}>
                            {producto.stock ?? 0}
                          </span>
                          {stockBajo && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                              <AlertTriangle className="w-3 h-3" /> Bajo
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {producto.categoria_id && categoriasPorId[producto.categoria_id]
                        ? categoriasPorId[producto.categoria_id].nombre
                        : 'Sin categoría'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => abrirModalEditar(producto)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
                          style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}>
                          <Pencil className="h-3 w-3" strokeWidth={1.75} /> Editar
                        </button>
                        <button onClick={() => eliminarProducto(producto.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
                          style={{ border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}>
                          <Trash2 className="h-3 w-3" strokeWidth={1.75} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal producto */}
      <AnimatePresence>
        {modalProducto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl my-auto p-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {formulario.id ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                <button onClick={() => setModalProducto(false)} className="p-2 rounded-xl"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              {errorFormulario && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} />
                  <p className="text-sm" style={{ color: '#EF4444' }}>{errorFormulario}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre</label>
                  <input value={formulario.nombre} onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
                    placeholder="Polera básica algodón" className="input-glass" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Descripción</label>
                  <textarea value={formulario.descripcion} onChange={(e) => setFormulario((f) => ({ ...f, descripcion: e.target.value }))}
                    rows={3} placeholder="Descripción del producto..." className="input-glass resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tipo de ítem</label>
                  <select value={formulario.tipo} className="input-glass cursor-pointer"
                    onChange={(e) => setFormulario((f) => {
                      const tipo = e.target.value as TipoProducto
                      return { ...f, tipo, stock: tipo === 'producto' ? f.stock ?? 0 : null, stock_alert_threshold: tipo === 'producto' ? f.stock_alert_threshold ?? 0 : null, duracion_minutos: tipo === 'producto' ? null : f.duracion_minutos ?? 30, capacidad: tipo === 'reserva' ? f.capacidad ?? 1 : null }
                    })}>
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                    <option value="reserva">Reserva</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Categoría</label>
                  <select value={formulario.categoria_id ?? ''} onChange={(e) => manejarCategoria(e.target.value)} className="input-glass cursor-pointer">
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    <option value="nueva">+ Agregar nueva categoría</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Precio</label>
                  <input type="number" value={formulario.precio} onChange={(e) => setFormulario((f) => ({ ...f, precio: Number(e.target.value) }))}
                    className="input-glass" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Moneda</label>
                  <select value={formulario.moneda} onChange={(e) => setFormulario((f) => ({ ...f, moneda: e.target.value }))} className="input-glass cursor-pointer">
                    {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {formulario.tipo === 'producto' ? (
                  <>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stock</label>
                      <input type="number" value={formulario.stock ?? 0} onChange={(e) => setFormulario((f) => ({ ...f, stock: Number(e.target.value) }))} className="input-glass" />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Alerta de stock bajo</label>
                      <input type="number" value={formulario.stock_alert_threshold ?? 0} onChange={(e) => setFormulario((f) => ({ ...f, stock_alert_threshold: Number(e.target.value) }))} className="input-glass" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Duración (min)</label>
                      <input type="number" value={formulario.duracion_minutos ?? 0} onChange={(e) => setFormulario((f) => ({ ...f, duracion_minutos: Number(e.target.value) }))} className="input-glass" />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Capacidad</label>
                      <input type="number" value={formulario.capacidad ?? 0} onChange={(e) => setFormulario((f) => ({ ...f, capacidad: Number(e.target.value) }))} className="input-glass" />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Imágenes (máx. 2)</label>
                  <input type="file" multiple accept="image/*" className="input-glass"
                    onChange={(e) => setArchivosSeleccionados(Array.from(e.target.files ?? []).slice(0, 2))} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setModalProducto(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  Cancelar
                </button>
                <button onClick={guardarProducto} disabled={cargando}
                  className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">
                  {cargando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal categoría */}
      <AnimatePresence>
        {modalCategoria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 space-y-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
              <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Nueva categoría</h3>
              <input value={nombreCategoriaNueva} onChange={(e) => setNombreCategoriaNueva(e.target.value)}
                placeholder="Nombre de categoría" className="input-glass" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setModalCategoria(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  Cancelar
                </button>
                <button onClick={crearCategoria} disabled={cargando}
                  className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
