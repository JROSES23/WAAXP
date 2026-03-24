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
  Sale,
  Staff,
  TipoProducto,
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
