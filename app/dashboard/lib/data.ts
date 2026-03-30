import { createClient } from '@/lib/supabase/server'
import type {
  Categoria,
  Cita,
  Conversacion,
  Mensaje,
  Negocio,
  Pedido,
  PlantillaRespuesta,
  Producto,
  Reserva,
  RecursoReserva,
  Sale,
  Staff,
  TipoProducto,
  EstadoReserva,
  MetodoPago,
} from '@/app/dashboard/types'

// ─── Business ───

export async function obtenerNegocioActual(idUsuario: string): Promise<Negocio> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('supabase_user_id', idUsuario)
    .single()

  if (error) throw error
  return datos as Negocio
}

// ─── Products ───

export async function obtenerProductosPorNegocio(
  idNegocio: string,
  filtros?: { tipo?: TipoProducto }
): Promise<Producto[]> {
  const supabase = await createClient()
  let consulta = supabase
    .from('products')
    .select('*, categories(nombre)')
    .eq('business_id', idNegocio)

  if (filtros?.tipo) {
    consulta = consulta.eq('tipo', filtros.tipo)
  }

  const { data: datos, error } = await consulta.order('created_at', { ascending: false })
  if (error) throw error
  return (datos ?? []) as Producto[]
}

// ─── Staff ───

export async function obtenerStaffPorNegocio(idNegocio: string): Promise<Staff[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('staff')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (datos ?? []) as Staff[]
}

// ─── Conversations ───

export async function obtenerConversacionesPorNegocio(
  idNegocio: string
): Promise<Conversacion[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('business_id', idNegocio)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return (datos ?? []) as Conversacion[]
}

// ─── Messages ───

export async function obtenerMensajesPorConversacion(
  idConversacion: string
): Promise<Mensaje[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', idConversacion)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return (datos ?? []) as Mensaje[]
}

// ─── Appointments ───

export async function obtenerCitasPorNegocio(idNegocio: string): Promise<Cita[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('business_id', idNegocio)
    .order('fecha_hora', { ascending: false })

  if (error) throw error
  return (datos ?? []) as Cita[]
}

// ─── Orders ───

export async function obtenerPedidosPorNegocio(idNegocio: string): Promise<Pedido[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('orders')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (datos ?? []) as Pedido[]
}

// ─── Categories ───

export async function obtenerCategoriasPorNegocio(idNegocio: string): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (datos ?? []) as Categoria[]
}

// ─── Templates ───

export async function obtenerPlantillasRespuesta(
  idNegocio: string
): Promise<PlantillaRespuesta[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('response_templates')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (datos ?? []) as PlantillaRespuesta[]
}

// ─── Sales (KPIs) ───

export async function obtenerVentasPorNegocio(
  idNegocio: string,
  dias: number = 30
): Promise<Sale[]> {
  const supabase = await createClient()
  const desde = new Date()
  desde.setDate(desde.getDate() - dias)

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('business_id', idNegocio)
    .gte('created_at', desde.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Sale[]
}

export async function obtenerKPIs(idNegocio: string) {
  const supabase = await createClient()
  const ahora = new Date()
  const hace30Dias = new Date(ahora)
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  // Parallel queries
  const [ventasRes, conversacionesRes, mensajesRes] = await Promise.all([
    supabase
      .from('sales')
      .select('amount, source, created_at')
      .eq('business_id', idNegocio)
      .eq('status', 'completed')
      .gte('created_at', hace30Dias.toISOString()),
    supabase
      .from('conversations')
      .select('id, status, created_at')
      .eq('business_id', idNegocio)
      .gte('created_at', hace30Dias.toISOString()),
    supabase
      .from('messages')
      .select('role, timestamp')
      .eq('business_id', idNegocio)
      .gte('timestamp', hace30Dias.toISOString()),
  ])

  const ventas = ventasRes.data ?? []
  const conversaciones = conversacionesRes.data ?? []
  const mensajes = mensajesRes.data ?? []

  const ventasTotales = ventas.reduce((sum, v) => sum + Number(v.amount), 0)
  const ventasIA = ventas
    .filter((v) => v.source === 'ai')
    .reduce((sum, v) => sum + Number(v.amount), 0)

  const totalConversaciones = conversaciones.length
  const mensajesBot = mensajes.filter((m) => m.role === 'assistant').length
  const mensajesTotal = mensajes.length
  const pctAutomatico =
    mensajesTotal > 0 ? Math.round((mensajesBot / mensajesTotal) * 100) : 0

  const pendientesHumanos = conversaciones.filter(
    (c) => c.status === 'pending_approval'
  ).length

  // Ventas últimos 7 días agrupadas por día
  const hace7Dias = new Date(ahora)
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  const ventasRecientes = ventas.filter(
    (v) => new Date(v.created_at) >= hace7Dias
  )

  const ventasPorDia: { fecha: string; monto: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(ahora)
    dia.setDate(dia.getDate() - i)
    const fechaStr = dia.toISOString().split('T')[0]
    const montoDelDia = ventasRecientes
      .filter((v) => v.created_at.startsWith(fechaStr))
      .reduce((sum, v) => sum + Number(v.amount), 0)
    ventasPorDia.push({
      fecha: dia.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
      monto: montoDelDia,
    })
  }

  // Conversaciones por día (últimos 7 días)
  const convPorDia: { fecha: string; cantidad: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(ahora)
    dia.setDate(dia.getDate() - i)
    const fechaStr = dia.toISOString().split('T')[0]
    const cantDelDia = conversaciones.filter((c) =>
      c.created_at.startsWith(fechaStr)
    ).length
    convPorDia.push({
      fecha: dia.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
      cantidad: cantDelDia,
    })
  }

  return {
    ventasTotales,
    ventasRecuperadasIA: ventasIA,
    pctAutomatico,
    pendientesHumanos,
    totalConversaciones,
    ventasPorDia,
    convPorDia,
    chatsIA: mensajesBot,
    chatsHumano: mensajesTotal - mensajesBot,
  }
}

// ─── Recursos de Reserva ───

export async function obtenerRecursosPorNegocio(
  idNegocio: string
): Promise<RecursoReserva[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('business_id', idNegocio)
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return (data ?? []) as RecursoReserva[]
}

export async function crearRecurso(
  recurso: Omit<RecursoReserva, 'id' | 'created_at' | 'reservas_count'>
): Promise<RecursoReserva> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .insert(recurso)
    .select()
    .single()

  if (error) throw error
  return data as RecursoReserva
}

export async function actualizarRecurso(
  id: string,
  campos: Partial<Pick<RecursoReserva, 'nombre' | 'tipo' | 'icono' | 'color' | 'activo' | 'orden'>>
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('resources')
    .update(campos)
    .eq('id', id)

  if (error) throw error
}

// ─── Reservas ───

export async function obtenerReservasPorNegocio(
  idNegocio: string,
  filtros?: {
    recursoId?: string
    estado?: EstadoReserva
    desde?: string   // ISO date
    hasta?: string   // ISO date
  }
): Promise<Reserva[]> {
  const supabase = await createClient()
  let consulta = supabase
    .from('reservas')
    .select('*, recurso:resources(*)')
    .eq('business_id', idNegocio)

  if (filtros?.recursoId) consulta = consulta.eq('recurso_id', filtros.recursoId)
  if (filtros?.estado)    consulta = consulta.eq('estado', filtros.estado)
  if (filtros?.desde)     consulta = consulta.gte('inicio', filtros.desde)
  if (filtros?.hasta)     consulta = consulta.lte('inicio', filtros.hasta)

  const { data, error } = await consulta.order('inicio', { ascending: true })
  if (error) throw error
  return (data ?? []) as Reserva[]
}

export async function obtenerReservasDelDia(
  idNegocio: string,
  fecha?: string // ISO date, por defecto hoy
): Promise<Reserva[]> {
  const dia = fecha ?? new Date().toISOString().split('T')[0]
  const desde = `${dia}T00:00:00.000Z`
  const hasta  = `${dia}T23:59:59.999Z`

  return obtenerReservasPorNegocio(idNegocio, { desde, hasta })
}

export async function actualizarReserva(
  id: string,
  campos: Partial<Pick<
    Reserva,
    'estado' | 'metodo_pago' | 'estado_pago' | 'monto' | 'monto_anticipo' | 'notas'
  >>
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reservas')
    .update(campos)
    .eq('id', id)

  if (error) throw error
}

export async function crearReserva(
  reserva: Omit<Reserva, 'id' | 'created_at' | 'recurso'>
): Promise<Reserva> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservas')
    .insert(reserva)
    .select('*, recurso:resources(*)')
    .single()

  if (error) throw error
  return data as Reserva
}

/** Conteo de reservas por recurso (para vista calor) */
export async function obtenerConteoReservasPorRecurso(
  idNegocio: string,
  desde: string,
  hasta: string
): Promise<{ recurso_id: string; count: number }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservas')
    .select('recurso_id')
    .eq('business_id', idNegocio)
    .gte('inicio', desde)
    .lte('inicio', hasta)
    .not('estado', 'eq', 'cancelada')

  if (error) throw error

  // Agrupar por recurso_id en memoria
  const conteos: Record<string, number> = {}
  for (const row of data ?? []) {
    if (row.recurso_id) {
      conteos[row.recurso_id] = (conteos[row.recurso_id] ?? 0) + 1
    }
  }

  return Object.entries(conteos).map(([recurso_id, count]) => ({ recurso_id, count }))
}

// ─── Support Tickets ───

export async function obtenerTicketsPorNegocio(idNegocio: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as import('@/app/dashboard/types').SupportTicket[]
}

// ─── Clients (CRM) ───

export async function obtenerClientesPorNegocio(idNegocio: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
