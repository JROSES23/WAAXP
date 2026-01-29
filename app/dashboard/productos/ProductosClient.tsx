'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Categoria, Negocio, Producto, TipoProducto } from '@/app/dashboard/types'
import {
  Briefcase,
  Calendar,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

interface ProductosClientProps {
  negocio: Negocio
  productosIniciales: Producto[]
  categoriasIniciales: Categoria[]
}

type FiltroTipo = 'todos' | TipoProducto

type FormularioProducto = {
  id?: string
  nombre: string
  descripcion: string
  tipo: TipoProducto
  precio: number
  moneda: string
  categoria_id: string | null
  imagenes: string[]
  stock: number | null
  stock_alert_threshold: number | null
  duracion_minutos: number | null
  capacidad: number | null
  activo: boolean
}

const MONEDAS = ['CLP', 'USD', 'MXN', 'ARS', 'COP', 'PEN', 'BRL', 'UYU']

export default function ProductosClient({
  negocio,
  productosIniciales,
  categoriasIniciales,
}: ProductosClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const [productos, setProductos] = useState<Producto[]>(productosIniciales)
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales)
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false)
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [nombreCategoriaNueva, setNombreCategoriaNueva] = useState('')
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null)

  const formularioInicial: FormularioProducto = {
    nombre: '',
    descripcion: '',
    tipo: 'producto',
    precio: 0,
    moneda: 'CLP',
    categoria_id: null,
    imagenes: [],
    stock: 0,
    stock_alert_threshold: 0,
    duracion_minutos: null,
    capacidad: null,
    activo: true,
  }

  const [formulario, setFormulario] = useState<FormularioProducto>(formularioInicial)

  const categoriasPorId = useMemo(() => {
    return categorias.reduce<Record<string, Categoria>>((acc, categoria) => {
      acc[categoria.id] = categoria
      return acc
    }, {})
  }, [categorias])

  const productosFiltrados = productos.filter((producto) => {
    const coincideTipo = filtroTipo === 'todos' || producto.tipo === filtroTipo
    const coincideCategoria =
      filtroCategoria === 'todas' || producto.categoria_id === filtroCategoria
    return coincideTipo && coincideCategoria
  })

  const totalActivos = productos.filter((producto) => producto.activo).length
  const productosStockBajo = productos.filter(
    (producto) =>
      producto.tipo === 'producto' &&
      typeof producto.stock === 'number' &&
      typeof producto.stock_alert_threshold === 'number' &&
      producto.stock <= producto.stock_alert_threshold
  ).length
  const productosSinFoto = productos.filter(
    (producto) => !producto.imagenes || producto.imagenes.length === 0
  ).length

  const abrirModalNuevoProducto = () => {
    setFormulario({ ...formularioInicial })
    setArchivosSeleccionados([])
    setErrorFormulario(null)
    setModalProductoAbierto(true)
  }

  const abrirModalEditar = (producto: Producto) => {
    setFormulario({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      tipo: producto.tipo,
      precio: producto.precio,
      moneda: producto.moneda,
      categoria_id: producto.categoria_id ?? null,
      imagenes: producto.imagenes ?? [],
      stock: producto.stock ?? null,
      stock_alert_threshold: producto.stock_alert_threshold ?? null,
      duracion_minutos: producto.duracion_minutos ?? null,
      capacidad: producto.capacidad ?? null,
      activo: producto.activo,
    })
    setArchivosSeleccionados([])
    setErrorFormulario(null)
    setModalProductoAbierto(true)
  }

  const cerrarModalProducto = () => {
    setModalProductoAbierto(false)
    setErrorFormulario(null)
  }

  const validarFormulario = () => {
    if (!formulario.nombre.trim()) {
      return 'El nombre es obligatorio.'
    }
    if (formulario.precio <= 0) {
      return 'El precio debe ser mayor a 0.'
    }
    if (formulario.tipo === 'producto') {
      if (formulario.stock === null || formulario.stock_alert_threshold === null) {
        return 'Stock y alerta de stock son obligatorios para productos.'
      }
    }
    if (formulario.tipo !== 'producto' && !formulario.duracion_minutos) {
      return 'La duración es obligatoria para servicios o reservas.'
    }
    return null
  }

  const manejarSeleccionCategoria = (valor: string) => {
    if (valor === 'nueva') {
      setModalCategoriaAbierto(true)
      return
    }
    setFormulario((estado) => ({ ...estado, categoria_id: valor || null }))
  }

  const crearCategoria = async () => {
    if (!nombreCategoriaNueva.trim()) {
      return
    }
    setCargando(true)
    const tipoAplicacion =
      formulario.tipo === 'producto' ? 'producto' : formulario.tipo === 'servicio' ? 'servicio' : 'servicio'
    const { data: datosCategoria, error } = await supabase
      .from('categories')
      .insert({
        business_id: negocio.id,
        nombre: nombreCategoriaNueva.trim(),
        tipo_aplicacion: tipoAplicacion,
      })
      .select('*')
      .single()

    if (!error && datosCategoria) {
      setCategorias((estadoPrevio) => [datosCategoria as Categoria, ...estadoPrevio])
      setFormulario((estado) => ({ ...estado, categoria_id: (datosCategoria as Categoria).id }))
      setNombreCategoriaNueva('')
      setModalCategoriaAbierto(false)
    }
    setCargando(false)
  }

  const eliminarCategoria = async (categoriaId: string) => {
    setCargando(true)
    const { error } = await supabase.from('categories').delete().eq('id', categoriaId)
    if (!error) {
      setCategorias((estadoPrevio) =>
        estadoPrevio.filter((categoria) => categoria.id !== categoriaId)
      )
      setProductos((estadoPrevio) =>
        estadoPrevio.map((producto) =>
          producto.categoria_id === categoriaId ? { ...producto, categoria_id: undefined } : producto
        )
      )
    }
    setCargando(false)
  }

  const subirImagenes = async (productoId: string) => {
    const nuevasUrls: string[] = []
    const archivos = archivosSeleccionados.slice(0, 2)

    for (const archivo of archivos) {
      const rutaArchivo = `${negocio.id}/${productoId}/${archivo.name}`
      const { error } = await supabase.storage
        .from('productos')
        .upload(rutaArchivo, archivo, { upsert: true })

      if (error) {
        throw error
      }

      const { data: datosUrl } = supabase.storage.from('productos').getPublicUrl(rutaArchivo)
      if (datosUrl?.publicUrl) {
        nuevasUrls.push(datosUrl.publicUrl)
      }
    }

    return nuevasUrls
  }

  const guardarProducto = async () => {
    const error = validarFormulario()
    if (error) {
      setErrorFormulario(error)
      return
    }

    setCargando(true)
    setErrorFormulario(null)

    const datosBase = {
      business_id: negocio.id,
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      tipo: formulario.tipo,
      precio: formulario.precio,
      moneda: formulario.moneda,
      categoria_id: formulario.categoria_id,
      imagenes: formulario.imagenes,
      stock: formulario.tipo === 'producto' ? formulario.stock : null,
      stock_alert_threshold:
        formulario.tipo === 'producto' ? formulario.stock_alert_threshold : null,
      duracion_minutos: formulario.tipo === 'producto' ? null : formulario.duracion_minutos,
      capacidad: formulario.tipo === 'producto' ? null : formulario.capacidad,
      activo: formulario.activo,
    }

    try {
      if (formulario.id) {
        const { data: datosActualizados, error: errorActualizacion } = await supabase
          .from('products')
          .update(datosBase)
          .eq('id', formulario.id)
          .select('*, categories(nombre)')
          .single()

        if (errorActualizacion) {
          throw errorActualizacion
        }

        let imagenesActualizadas = formulario.imagenes
        if (archivosSeleccionados.length > 0) {
          const nuevasUrls = await subirImagenes(formulario.id)
          imagenesActualizadas = [...nuevasUrls].slice(0, 2)
          await supabase
            .from('products')
            .update({ imagenes: imagenesActualizadas })
            .eq('id', formulario.id)
        }

        setProductos((estadoPrevio) =>
          estadoPrevio.map((producto) =>
            producto.id === formulario.id
              ? ({ ...datosActualizados, imagenes: imagenesActualizadas } as Producto)
              : producto
          )
        )
      } else {
        const { data: datosCreacion, error: errorCreacion } = await supabase
          .from('products')
          .insert({ ...datosBase, imagenes: [] })
          .select('*, categories(nombre)')
          .single()

        if (errorCreacion || !datosCreacion) {
          throw errorCreacion
        }

        let imagenesActualizadas: string[] = []
        if (archivosSeleccionados.length > 0) {
          const nuevasUrls = await subirImagenes((datosCreacion as Producto).id)
          imagenesActualizadas = [...nuevasUrls].slice(0, 2)
          await supabase
            .from('products')
            .update({ imagenes: imagenesActualizadas })
            .eq('id', (datosCreacion as Producto).id)
        }

        setProductos((estadoPrevio) => [
          { ...(datosCreacion as Producto), imagenes: imagenesActualizadas },
          ...estadoPrevio,
        ])
      }

      setModalProductoAbierto(false)
      setFormulario({ ...formularioInicial })
      setArchivosSeleccionados([])
    } catch (errorGuardado) {
      setErrorFormulario('No se pudo guardar el producto. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const eliminarProducto = async (productoId: string) => {
    setCargando(true)
    const { error } = await supabase.from('products').delete().eq('id', productoId)
    if (!error) {
      setProductos((estadoPrevio) =>
        estadoPrevio.filter((producto) => producto.id !== productoId)
      )
    }
    setCargando(false)
  }

  const obtenerColorTipo = (tipo: TipoProducto) => {
    switch (tipo) {
      case 'producto':
        return 'bg-emerald-100 text-emerald-700'
      case 'servicio':
        return 'bg-blue-100 text-blue-700'
      case 'reserva':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const obtenerTextoTipo = (tipo: TipoProducto) => {
    if (tipo === 'producto') {
      return 'Producto'
    }
    if (tipo === 'servicio') {
      return 'Servicio'
    }
    return 'Reserva'
  }

  const obtenerIconoTipo = (tipo: TipoProducto) => {
    if (tipo === 'servicio') {
      return <Briefcase className="h-4 w-4" />
    }
    if (tipo === 'reserva') {
      return <Calendar className="h-4 w-4" />
    }
    return <Package className="h-4 w-4" />
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Productos, servicios y reservas</h1>
        <p className="text-sm text-slate-600">
          Administra tu catálogo y mantén el stock bajo control
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-xs text-slate-500">Productos activos</p>
          <p className="text-2xl font-bold text-slate-900">{totalActivos}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-xs text-slate-500">Stock bajo</p>
          <p className="text-2xl font-bold text-amber-600">{productosStockBajo}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-xs text-slate-500">Sin foto</p>
          <p className="text-2xl font-bold text-slate-900">{productosSinFoto}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filtroTipo}
            onChange={(event) => setFiltroTipo(event.target.value as FiltroTipo)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="todos">Todos los tipos</option>
            <option value="producto">Productos</option>
            <option value="servicio">Servicios</option>
            <option value="reserva">Reservas</option>
          </select>
          <select
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={abrirModalNuevoProducto}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e] hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Categorías activas</h3>
          <span className="text-xs text-slate-500">{categorias.length} registradas</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categorias.length === 0 ? (
            <span className="text-xs text-slate-400">Aún no hay categorías.</span>
          ) : (
            categorias.map((categoria) => (
              <span
                key={categoria.id}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {categoria.nombre}
                <button
                  type="button"
                  onClick={() => eliminarCategoria(categoria.id)}
                  className="rounded-full p-0.5 text-red-500 hover:bg-red-50"
                  aria-label={`Eliminar categoría ${categoria.nombre}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 text-left">Foto</th>
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-left">Precio</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No hay productos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => {
                  const stockBajo =
                    producto.tipo === 'producto' &&
                    typeof producto.stock === 'number' &&
                    typeof producto.stock_alert_threshold === 'number' &&
                    producto.stock <= producto.stock_alert_threshold

                  return (
                    <tr
                      key={producto.id}
                      className={
                        stockBajo
                          ? 'bg-amber-50/60 border-b border-amber-100'
                          : 'border-b border-slate-100'
                      }
                    >
                      <td className="px-6 py-4">
                        {producto.imagenes?.[0] ? (
                          <img
                            src={producto.imagenes[0]}
                            alt={producto.nombre}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImagePlus className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{producto.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {producto.descripcion || 'Sin descripción'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${obtenerColorTipo(
                            producto.tipo
                          )}`}
                        >
                          {obtenerIconoTipo(producto.tipo)}
                          {obtenerTextoTipo(producto.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ${producto.precio.toLocaleString()} {producto.moneda}
                      </td>
                      <td className="px-6 py-4">
                        {producto.tipo === 'producto' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">
                              {producto.stock ?? 0}
                            </span>
                            {stockBajo && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Stock bajo
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No aplica</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {producto.categoria_id && categoriasPorId[producto.categoria_id]
                          ? categoriasPorId[producto.categoria_id].nombre
                          : 'Sin categoría'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirModalEditar(producto)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
                          >
                            <Pencil className="h-3 w-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 transition-all duration-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalProductoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {formulario.id ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            {errorFormulario && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {errorFormulario}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    id="nombre-producto"
                    value={formulario.nombre}
                    onChange={(event) =>
                      setFormulario((estado) => ({ ...estado, nombre: event.target.value }))
                    }
                    placeholder=" "
                    className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                  />
                  <label
                    htmlFor="nombre-producto"
                    className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                  >
                    Nombre
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="relative">
                  <textarea
                    id="descripcion-producto"
                    value={formulario.descripcion}
                    onChange={(event) =>
                      setFormulario((estado) => ({ ...estado, descripcion: event.target.value }))
                    }
                    placeholder=" "
                    className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                    rows={3}
                  />
                  <label
                    htmlFor="descripcion-producto"
                    className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                  >
                    Descripción
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Tipo de ítem</label>
                <select
                  value={formulario.tipo}
                  onChange={(event) =>
                    setFormulario((estado) => {
                      const tipoSeleccionado = event.target.value as TipoProducto
                      return {
                        ...estado,
                        tipo: tipoSeleccionado,
                        stock: tipoSeleccionado === 'producto' ? estado.stock ?? 0 : null,
                        stock_alert_threshold:
                          tipoSeleccionado === 'producto' ? estado.stock_alert_threshold ?? 0 : null,
                        duracion_minutos:
                          tipoSeleccionado === 'producto' ? null : estado.duracion_minutos ?? 30,
                        capacidad: tipoSeleccionado === 'reserva' ? estado.capacidad ?? 1 : null,
                      }
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="producto">Producto</option>
                  <option value="servicio">Servicio</option>
                  <option value="reserva">Reserva</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Categoría</label>
                <select
                  value={formulario.categoria_id ?? ''}
                  onChange={(event) => manejarSeleccionCategoria(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                  <option value="nueva">+ Agregar nueva categoría</option>
                </select>
              </div>
              <div>
                <div className="relative">
                  <input
                    id="precio-producto"
                    type="number"
                    value={formulario.precio}
                    onChange={(event) =>
                      setFormulario((estado) => ({
                        ...estado,
                        precio: Number(event.target.value),
                      }))
                    }
                    placeholder=" "
                    className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                  />
                  <label
                    htmlFor="precio-producto"
                    className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                  >
                    Precio
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Moneda</label>
                <select
                  value={formulario.moneda}
                  onChange={(event) =>
                    setFormulario((estado) => ({
                      ...estado,
                      moneda: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {MONEDAS.map((moneda) => (
                    <option key={moneda} value={moneda}>
                      {moneda}
                    </option>
                  ))}
                </select>
              </div>
              {formulario.tipo === 'producto' ? (
                <>
                  <div>
                    <div className="relative">
                      <input
                        id="stock-producto"
                        type="number"
                        value={formulario.stock ?? 0}
                        onChange={(event) =>
                          setFormulario((estado) => ({
                            ...estado,
                            stock: Number(event.target.value),
                          }))
                        }
                        placeholder=" "
                        className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                      />
                      <label
                        htmlFor="stock-producto"
                        className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                      >
                        Stock
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        id="alerta-stock-producto"
                        type="number"
                        value={formulario.stock_alert_threshold ?? 0}
                        onChange={(event) =>
                          setFormulario((estado) => ({
                            ...estado,
                            stock_alert_threshold: Number(event.target.value),
                          }))
                        }
                        placeholder=" "
                        className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                      />
                      <label
                        htmlFor="alerta-stock-producto"
                        className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                      >
                        Alerta de stock bajo
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="relative">
                      <input
                        id="duracion-servicio"
                        type="number"
                        value={formulario.duracion_minutos ?? 0}
                        onChange={(event) =>
                          setFormulario((estado) => ({
                            ...estado,
                            duracion_minutos: Number(event.target.value),
                          }))
                        }
                        placeholder=" "
                        className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                      />
                      <label
                        htmlFor="duracion-servicio"
                        className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                      >
                        Duración (min)
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        id="capacidad-servicio"
                        type="number"
                        value={formulario.capacidad ?? 0}
                        onChange={(event) =>
                          setFormulario((estado) => ({
                            ...estado,
                            capacidad: Number(event.target.value),
                          }))
                        }
                        placeholder=" "
                        className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                      />
                      <label
                        htmlFor="capacidad-servicio"
                        className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                      >
                        Capacidad
                      </label>
                    </div>
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Imágenes</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => {
                    const archivos = Array.from(event.target.files ?? []).slice(0, 2)
                    setArchivosSeleccionados(archivos)
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">Máximo 2 imágenes.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={cerrarModalProducto}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarProducto}
                disabled={cargando}
                className="rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e] disabled:opacity-50"
              >
                {cargando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalCategoriaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Nueva categoría
            </h3>
            <div className="relative">
              <input
                id="categoria-nueva"
                value={nombreCategoriaNueva}
                onChange={(event) => setNombreCategoriaNueva(event.target.value)}
                placeholder=" "
                className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
              />
              <label
                htmlFor="categoria-nueva"
                className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
              >
                Nombre de categoría
              </label>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalCategoriaAbierto(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={crearCategoria}
                className="rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
