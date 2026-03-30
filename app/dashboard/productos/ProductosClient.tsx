'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Categoria, Negocio, Producto, TipoProducto } from '@/app/dashboard/types'
import { useModalStore } from '@/lib/modal-store'
import {
  Briefcase, Calendar, ImagePlus, Package, Pencil, Plus, Trash2, X, AlertTriangle,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search,
  Bot, FileUp, Trophy,
} from 'lucide-react'

interface ProductosClientProps {
  negocio:             Negocio
  productosIniciales:  Producto[]
  categoriasIniciales: Categoria[]
}

type FiltroTipo = 'todos' | TipoProducto
type SortKey = 'nombre' | 'tipo' | 'precio' | 'stock' | 'categoria'
type SortDir = 'asc' | 'desc' | null

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" strokeWidth={2} />
  if (sortDir === 'asc')  return <ChevronUp   className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
  return <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
}

type FormularioProducto = {
  id?:                   string
  nombre:                string
  descripcion:           string
  faq:                   string
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
  const [busqueda,           setBusqueda]           = useState('')
  const [sortKey,            setSortKey]            = useState<SortKey | null>(null)
  const [sortDir,            setSortDir]            = useState<SortDir>(null)
  const [page,               setPage]               = useState(1)
  const [pageSize,           setPageSize]           = useState(10)
  const [modalProducto,      setModalProducto]      = useState(false)
  const [modalCategoria,     setModalCategoria]     = useState(false)
  const [modalBotPreview,    setModalBotPreview]    = useState(false)
  const [botPreviewProducto, setBotPreviewProducto] = useState<Producto | null>(null)
  const [botPreviewReply,    setBotPreviewReply]    = useState('')
  const [botPreviewLoading,  setBotPreviewLoading]  = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [nombreCategoriaNueva, setNombreCategoriaNueva] = useState('')
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([])
  const [cargando,           setCargando]           = useState(false)
  const [errorFormulario,    setErrorFormulario]    = useState<string | null>(null)

  const formularioInicial: FormularioProducto = {
    nombre: '', descripcion: '', faq: '', tipo: 'producto', precio: 0, moneda: 'CLP',
    categoria_id: null, imagenes: [], stock: 0, stock_alert_threshold: 0,
    duracion_minutos: null, capacidad: null, activo: true,
  }

  const [formulario, setFormulario] = useState<FormularioProducto>(formularioInicial)

  // Notifica al store global cuando cualquier overlay está activo
  const { openModal, closeModal } = useModalStore()
  const anyModalOpen = modalProducto || modalCategoria || modalBotPreview
  useEffect(() => {
    if (anyModalOpen) {
      openModal()
      return () => closeModal()
    }
  }, [anyModalOpen, openModal, closeModal])

  const categoriasPorId = useMemo(() =>
    categorias.reduce<Record<string, Categoria>>((acc, c) => { acc[c.id] = c; return acc }, {}),
  [categorias])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc')       setSortDir('desc')
      else { setSortKey(null); setSortDir(null) }
    } else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const productosFiltrados = useMemo(() => {
    let rows = productos.filter((p) => {
      const q = busqueda.toLowerCase()
      return (
        (filtroTipo === 'todos' || p.tipo === filtroTipo) &&
        (filtroCategoria === 'todas' || p.categoria_id === filtroCategoria) &&
        (!q || p.nombre.toLowerCase().includes(q) || (p.descripcion ?? '').toLowerCase().includes(q))
      )
    })
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        let va: string | number, vb: string | number
        switch (sortKey) {
          case 'nombre':    va = a.nombre.toLowerCase();                                       vb = b.nombre.toLowerCase();                                       break
          case 'tipo':      va = a.tipo;                                                       vb = b.tipo;                                                       break
          case 'precio':    va = a.precio;                                                     vb = b.precio;                                                     break
          case 'stock':     va = a.stock ?? -1;                                                vb = b.stock ?? -1;                                                break
          case 'categoria': va = (a.categoria_id && categoriasPorId[a.categoria_id]?.nombre) ?? ''; vb = (b.categoria_id && categoriasPorId[b.categoria_id]?.nombre) ?? ''; break
          default: va = ''; vb = ''
        }
        const cmp = va < vb ? -1 : va > vb ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [productos, filtroTipo, filtroCategoria, busqueda, sortKey, sortDir, categoriasPorId])

  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / pageSize))
  const productosPaginados = productosFiltrados.slice((page - 1) * pageSize, page * pageSize)

  const totalActivos        = productos.filter((p) => p.activo).length
  const productosStockBajo  = productos.filter((p) =>
    p.tipo === 'producto' && typeof p.stock === 'number' && typeof p.stock_alert_threshold === 'number' && p.stock <= p.stock_alert_threshold
  ).length
  const productosSinFoto = productos.filter((p) => !p.imagenes || p.imagenes.length === 0).length

  const abrirModalNuevo = () => { setFormulario({ ...formularioInicial }); setArchivosSeleccionados([]); setErrorFormulario(null); setModalProducto(true) }
  const abrirModalEditar = (p: Producto) => {
    setFormulario({
      id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? '', faq: p.faq ?? '', tipo: p.tipo, precio: p.precio,
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
      faq: formulario.faq.trim() || null,
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

  // Top 3 productos por consultas
  const topConsultadosIds = useMemo(() => {
    return [...productos]
      .filter((p) => (p.consult_count ?? 0) > 0)
      .sort((a, b) => (b.consult_count ?? 0) - (a.consult_count ?? 0))
      .slice(0, 3)
      .map((p) => p.id)
  }, [productos])

  // Bot preview
  const verBotPreview = async (producto: Producto) => {
    setBotPreviewProducto(producto)
    setBotPreviewReply('')
    setBotPreviewLoading(true)
    setModalBotPreview(true)
    try {
      const systemPrompt = `Eres el asistente de ventas de ${negocio.nombre}. Te preguntan por el siguiente producto:\n\nNombre: ${producto.nombre}\nTipo: ${producto.tipo}\nPrecio: $${producto.precio.toLocaleString()} ${producto.moneda}\nDescripción: ${producto.descripcion || 'Sin descripción'}\n${producto.faq ? `FAQ: ${producto.faq}` : ''}`
      const res = await fetch('/api/bot/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `¿Cuánto cuesta ${producto.nombre} y qué incluye?`, prompt: systemPrompt }),
      })
      const json = await res.json()
      setBotPreviewReply(json.reply ?? 'Sin respuesta.')
    } catch {
      setBotPreviewReply('No se pudo conectar con el bot.')
    } finally {
      setBotPreviewLoading(false)
    }
  }

  // CSV import
  const importarCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length < 2) { toast.error('El CSV no tiene datos.'); return }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
    const rows = lines.slice(1)
    const productos_nuevos: object[] = []
    for (const row of rows) {
      const vals = row.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
      const get = (key: string) => vals[headers.indexOf(key)] ?? ''
      const nombre = get('nombre')
      if (!nombre) continue
      productos_nuevos.push({
        business_id: negocio.id,
        nombre,
        descripcion: get('descripcion') || null,
        tipo: (['producto', 'servicio', 'reserva'].includes(get('tipo')) ? get('tipo') : 'producto') as 'producto' | 'servicio' | 'reserva',
        precio: Number(get('precio')) || 0,
        moneda: get('moneda') || 'CLP',
        stock: get('stock') ? Number(get('stock')) : null,
        imagenes: [],
        activo: true,
        faq: get('faq') || null,
      })
    }
    if (productos_nuevos.length === 0) { toast.error('No se encontraron productos válidos.'); return }
    const { data, error } = await supabase.from('products').insert(productos_nuevos).select('*, categories(nombre)')
    if (error) { toast.error('Error al importar: ' + error.message); return }
    setProductos((p) => [...(data as Producto[]), ...p])
    toast.success(`${productos_nuevos.length} producto(s) importados correctamente`)
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
            <input type="text" placeholder="Buscar por nombre o descripción..." value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} className="input-glass pl-9" />
          </div>
          <button onClick={() => csvInputRef.current?.click()}
            className="px-4 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2 shrink-0 transition-colors"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <FileUp className="w-4 h-4" strokeWidth={1.75} /> Importar CSV
          </button>
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importarCSV(f); e.target.value = '' }} />
          <button onClick={abrirModalNuevo}
            className="btn-accent px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" strokeWidth={2} /> Nuevo producto
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value as FiltroTipo); setPage(1) }}
            className="input-glass cursor-pointer">
            <option value="todos">Todos los tipos</option>
            <option value="producto">Productos</option>
            <option value="servicio">Servicios</option>
            <option value="reserva">Reservas</option>
          </select>
          <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setPage(1) }}
            className="input-glass cursor-pointer">
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
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
                <th className="px-5 py-3.5 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Foto</span>
                </th>
                {([
                  { key: 'nombre'    as SortKey, label: 'Nombre'    },
                  { key: 'tipo'      as SortKey, label: 'Tipo'      },
                  { key: 'precio'    as SortKey, label: 'Precio'    },
                  { key: 'stock'     as SortKey, label: 'Stock'     },
                  { key: 'categoria' as SortKey, label: 'Categoría' },
                ]).map((col) => (
                  <th key={col.key} className="px-5 py-3.5 text-left cursor-pointer select-none" onClick={() => handleSort(col.key)}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider transition-colors"
                        style={{ color: sortKey === col.key ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                        {col.label}
                      </span>
                      <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {productosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No hay productos para los filtros seleccionados.
                  </td>
                </tr>
              ) : productosPaginados.map((producto) => {
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{producto.nombre}</p>
                        {topConsultadosIds.includes(producto.id) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <Trophy className="w-2.5 h-2.5" strokeWidth={2.5} />
                            Top {topConsultadosIds.indexOf(producto.id) + 1}
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => verBotPreview(producto)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
                          style={{ border: '1px solid var(--accent-border)', color: 'var(--accent)', background: 'var(--accent-dim)' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                          <Bot className="h-3 w-3" strokeWidth={1.75} /> Bot
                        </button>
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

        {/* Pagination footer */}
        <div className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Mostrando{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {productosFiltrados.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, productosFiltrados.length)}
              </span>{' '}
              de{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{productosFiltrados.length}</span>
            </span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="text-xs px-2 py-1 rounded-lg cursor-pointer outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / pág.</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} className="px-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>…</span>
                  : (
                    <button key={p} onClick={() => setPage(p as number)}
                      className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: page === p ? 'var(--accent)' : 'transparent',
                        color: page === p ? '#fff' : 'var(--text-secondary)',
                        fontWeight: page === p ? 700 : 400,
                      }}
                      onMouseEnter={e => page !== p && (e.currentTarget.style.background = 'var(--bg-surface)')}
                      onMouseLeave={e => page !== p && (e.currentTarget.style.background = 'transparent')}>
                      {p}
                    </button>
                  )
              )}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
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
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>FAQ del producto <span className="font-normal opacity-60">(contexto para el bot)</span></label>
                  <textarea value={formulario.faq} onChange={(e) => setFormulario((f) => ({ ...f, faq: e.target.value }))}
                    rows={3} placeholder="P: ¿Tiene garantía?\nR: Sí, 6 meses por defectos de fábrica." className="input-glass resize-none" />
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

      {/* Modal bot preview */}
      <AnimatePresence>
        {modalBotPreview && botPreviewProducto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={modalOverlay}
            onClick={() => setModalBotPreview(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 space-y-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                    <Bot className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cotización del bot</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{botPreviewProducto.nombre}</p>
                  </div>
                </div>
                <button onClick={() => setModalBotPreview(false)} className="p-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
              <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Pregunta simulada:</span>{' '}
                ¿Cuánto cuesta {botPreviewProducto.nombre} y qué incluye?
              </div>
              <div className="min-h-[80px] p-4 rounded-xl" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                {botPreviewLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0.3s' }} />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{botPreviewReply}</p>
                )}
              </div>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                Esta es una vista previa de cómo el bot respondería sobre este producto.
              </p>
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
