'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Conversacion, Mensaje, Negocio, Producto, Staff } from '@/app/dashboard/types'
import { Badge } from '@/components/ui/Badge'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  Check,
  ClipboardList,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShoppingCart,
  User,
  X,
} from 'lucide-react'

interface InboxProps {
  negocio: Negocio
  conversaciones: Conversacion[]
  productos: Producto[]
  equipo: Staff[]
}

interface ItemPedidoTemporal {
  idProducto: string
  nombre: string
  cantidad: number
  precioUnitario: number
}

export default function Inbox({ negocio, conversaciones, productos, equipo }: InboxProps) {
  const [conversacionSeleccionadaId, setConversacionSeleccionadaId] = useState<string | null>(
    conversaciones[0]?.id ?? null
  )
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [mensajeManual, setMensajeManual] = useState('')
  const [sugerencia, setSugerencia] = useState<string | null>(null)
  const [cargandoSugerencia, setCargandoSugerencia] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [servicioSeleccionado, setServicioSeleccionado] = useState('')
  const [staffSeleccionado, setStaffSeleccionado] = useState('')
  const [fechaCita, setFechaCita] = useState('')
  const [horaCita, setHoraCita] = useState('')

  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidadProducto, setCantidadProducto] = useState(1)
  const [itemsPedido, setItemsPedido] = useState<ItemPedidoTemporal[]>([])
  const [mostrarAgendar, setMostrarAgendar] = useState(true)
  const [mostrarPedido, setMostrarPedido] = useState(true)

  const conversacionSeleccionada = conversaciones.find(
    (conversacion) => conversacion.id === conversacionSeleccionadaId
  )
  const metadataTexto = conversacionSeleccionada?.metadata
    ? JSON.stringify(conversacionSeleccionada.metadata)
    : 'Sin etiquetas'

  const modosServiciosActivos = negocio.modos_activos?.some(
    (modo) => modo === 'servicios' || modo === 'reservas'
  )
  const modosProductosActivos = negocio.modos_activos?.includes('productos')

  const serviciosDisponibles = productos.filter(
    (producto) => producto.tipo === 'servicio' || producto.tipo === 'reserva'
  )
  const productosDisponibles = productos.filter(
    (producto) => producto.tipo === 'producto'
  )

  const totalPedido = itemsPedido.reduce(
    (sum, itemPedido) => sum + itemPedido.cantidad * itemPedido.precioUnitario,
    0
  )

  const cargarMensajes = async (id: string) => {
    setCargandoMensajes(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/conversaciones/${id}/mensajes`)
      const datos = await respuesta.json()
      if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudieron cargar los mensajes')
      }
      setMensajes(datos.mensajes ?? [])
    } catch (errorCarga) {
      setError('No se pudieron cargar los mensajes de la conversación.')
    } finally {
      setCargandoMensajes(false)
    }
  }

  const cargarSugerencia = async (id: string) => {
    setCargandoSugerencia(true)
    try {
      const respuesta = await fetch(`/api/conversaciones/${id}/sugerencia`)
      const datos = await respuesta.json()
      if (respuesta.ok) {
        setSugerencia(datos.sugerencia)
      }
    } catch {
      setSugerencia(null)
    } finally {
      setCargandoSugerencia(false)
    }
  }

  useEffect(() => {
    if (conversacionSeleccionadaId) {
      cargarMensajes(conversacionSeleccionadaId)
      cargarSugerencia(conversacionSeleccionadaId)
    }
  }, [conversacionSeleccionadaId])

  const enviarMensaje = async (contenido: string) => {
    if (!conversacionSeleccionadaId || !contenido.trim()) {
      return
    }
    await fetch(`/api/conversaciones/${conversacionSeleccionadaId}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido, rol: 'assistant' }),
    })
    setMensajeManual('')
    await cargarMensajes(conversacionSeleccionadaId)
  }

  const confirmarCita = async () => {
    if (!conversacionSeleccionadaId || !servicioSeleccionado || !fechaCita || !horaCita) {
      setError('Completa servicio, fecha y hora para agendar.')
      return
    }
    const fechaHora = `${fechaCita}T${horaCita}:00`
    await fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idConversacion: conversacionSeleccionadaId,
        idServicio: servicioSeleccionado,
        idStaff: staffSeleccionado || null,
        fechaHora,
      }),
    })
    setFechaCita('')
    setHoraCita('')
    setServicioSeleccionado('')
    setStaffSeleccionado('')
    await cargarMensajes(conversacionSeleccionadaId)
  }

  const agregarItemPedido = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) {
      return
    }
    const producto = productosDisponibles.find(
      (producto) => producto.id === productoSeleccionado
    )
    if (!producto) {
      return
    }
    setItemsPedido((estadoPrevio) => [
      ...estadoPrevio,
      {
        idProducto: producto.id,
        nombre: producto.nombre,
        cantidad: cantidadProducto,
        precioUnitario: producto.precio,
      },
    ])
    setProductoSeleccionado('')
    setCantidadProducto(1)
  }

  const removerItemPedido = (index: number) => {
    setItemsPedido((estadoPrevio) => estadoPrevio.filter((_, idx) => idx !== index))
  }

  const crearPedido = async () => {
    if (!conversacionSeleccionadaId || itemsPedido.length === 0) {
      return
    }
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idConversacion: conversacionSeleccionadaId,
        itemsPedido: itemsPedido.map((itemPedido) => ({
          idProducto: itemPedido.idProducto,
          cantidad: itemPedido.cantidad,
        })),
        moneda: 'CLP',
      }),
    })
    setItemsPedido([])
    await cargarMensajes(conversacionSeleccionadaId)
  }

  const estadoBadge = (estado: Conversacion['status']) => {
    switch (estado) {
      case 'pending_approval':
        return <Badge variant="warning">Pendiente aprobación</Badge>
      case 'archived':
        return <Badge variant="neutral">Archivado</Badge>
      default:
        return <Badge variant="success">Activo</Badge>
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Bandeja de entrada</h1>
        <p className="text-sm text-slate-600">Conversaciones con clientes en tiempo real</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[320px] border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Buscar conversación"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversaciones.map((conversacion) => (
              <button
                key={conversacion.id}
                onClick={() => setConversacionSeleccionadaId(conversacion.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${
                  conversacionSeleccionadaId === conversacion.id ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    {conversacion.client_name || conversacion.phone_number}
                  </p>
                  {estadoBadge(conversacion.status)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Última actividad: {conversacion.last_message_at || 'Sin mensajes'}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {conversacionSeleccionada?.client_name || 'Selecciona una conversación'}
              </p>
              <p className="text-xs text-slate-500">
                {conversacionSeleccionada?.phone_number || ''}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MessageSquare className="w-4 h-4" />
              {mensajes.length} mensajes
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {cargandoMensajes ? (
              <p className="text-sm text-slate-500">Cargando mensajes...</p>
            ) : mensajes.length === 0 ? (
              <p className="text-sm text-slate-500">No hay mensajes aún.</p>
            ) : (
              <div className="space-y-3">
                {mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                        mensaje.role === 'assistant'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-slate-800'
                      }`}
                    >
                      {mensaje.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <textarea
                value={mensajeManual}
                onChange={(event) => setMensajeManual(event.target.value)}
                placeholder="Escribe una respuesta"
                className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={2}
              />
              <button
                onClick={() => enviarMensaje(mensajeManual)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>
          </div>
        </section>

        <aside className="w-[360px] border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Detalle del cliente</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                {conversacionSeleccionada?.client_name || 'Sin nombre'}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                {conversacionSeleccionada?.phone_number || 'Sin teléfono'}
              </div>
              <div className="text-xs text-slate-500">
                Etiquetas: {metadataTexto}
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Respuesta sugerida</h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {cargandoSugerencia
                ? 'Buscando plantillas...'
                : sugerencia || 'La IA sugerirá una respuesta aquí (próximamente).'}
            </div>
            <button
              onClick={() => sugerencia && enviarMensaje(sugerencia)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <Check className="h-3 w-3" />
              Aprobar y enviar
            </button>
          </div>

          {modosServiciosActivos && (
            <div className="p-4 border-b border-slate-200">
              <button
                onClick={() => setMostrarAgendar((estado) => !estado)}
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-900"
              >
                Agendar cita
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                    mostrarAgendar ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {mostrarAgendar && (
                  <motion.div
                    key="agendar"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      <select
                        value={servicioSeleccionado}
                        onChange={(event) => setServicioSeleccionado(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona un servicio</option>
                        {serviciosDisponibles.map((servicio) => (
                          <option key={servicio.id} value={servicio.id}>
                            {servicio.nombre}
                          </option>
                        ))}
                      </select>
                      <select
                        value={staffSeleccionado}
                        onChange={(event) => setStaffSeleccionado(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Cualquiera</option>
                        {equipo.map((persona) => (
                          <option key={persona.id} value={persona.id}>
                            {persona.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={fechaCita}
                          onChange={(event) => setFechaCita(event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <input
                          type="time"
                          value={horaCita}
                          onChange={(event) => setHoraCita(event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <button
                        onClick={confirmarCita}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-950"
                      >
                        <Calendar className="h-4 w-4" />
                        Confirmar cita
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {modosProductosActivos && (
            <div className="p-4 border-b border-slate-200">
              <button
                onClick={() => setMostrarPedido((estado) => !estado)}
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-900"
              >
                Crear pedido
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                    mostrarPedido ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {mostrarPedido && (
                  <motion.div
                    key="pedido"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      <select
                        value={productoSeleccionado}
                        onChange={(event) => setProductoSeleccionado(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona un producto</option>
                        {productosDisponibles.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={cantidadProducto}
                          onChange={(event) => setCantidadProducto(Number(event.target.value))}
                          className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <button
                          onClick={agregarItemPedido}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-300 hover:bg-slate-50"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Agregar item
                        </button>
                      </div>
                      {itemsPedido.length > 0 && (
                        <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600 space-y-2">
                          {itemsPedido.map((itemPedido, index) => (
                            <div key={`${itemPedido.idProducto}-${index}`} className="flex justify-between">
                              <span>
                                {itemPedido.nombre} x{itemPedido.cantidad}
                              </span>
                              <div className="flex items-center gap-2">
                                <span>
                                  {(itemPedido.cantidad * itemPedido.precioUnitario).toLocaleString()} CLP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removerItemPedido(index)}
                                  className="rounded-full p-0.5 text-red-500 hover:bg-red-50"
                                  aria-label={`Eliminar ${itemPedido.nombre}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between font-semibold text-slate-900">
                            <span>Total</span>
                            <span>{totalPedido.toLocaleString()} CLP</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={crearPedido}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f9d58] px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
                      >
                        <ClipboardList className="h-4 w-4" />
                        Crear pedido
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {error && (
            <div className="p-4 text-xs text-red-600">{error}</div>
          )}
        </aside>
      </div>
    </div>
  )
}
