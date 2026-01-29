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
  Staff,
  TipoProducto,
} from '@/app/dashboard/types'

export async function obtenerNegocioActual(idUsuario: string): Promise<Negocio> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('supabase_user_id', idUsuario)
    .single()

  if (error) {
    throw error
  }

  return datos as Negocio
}

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

  if (error) {
    throw error
  }

  return (datos ?? []) as Producto[]
}

export async function obtenerStaffPorNegocio(idNegocio: string): Promise<Staff[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('staff')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (datos ?? []) as Staff[]
}

export async function obtenerConversacionesPorNegocio(
  idNegocio: string
): Promise<Conversacion[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('business_id', idNegocio)
    .order('last_message_at', { ascending: false })

  if (error) {
    throw error
  }

  return (datos ?? []) as Conversacion[]
}

export async function obtenerMensajesPorConversacion(
  idConversacion: string
): Promise<Mensaje[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', idConversacion)
    .order('timestamp', { ascending: true })

  if (error) {
    throw error
  }

  return (datos ?? []) as Mensaje[]
}

export async function obtenerCitasPorNegocio(idNegocio: string): Promise<Cita[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('business_id', idNegocio)
    .order('fecha_hora', { ascending: false })

  if (error) {
    throw error
  }

  return (datos ?? []) as Cita[]
}

export async function obtenerPedidosPorNegocio(idNegocio: string): Promise<Pedido[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('orders')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (datos ?? []) as Pedido[]
}

export async function obtenerCategoriasPorNegocio(idNegocio: string): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (datos ?? []) as Categoria[]
}

export async function obtenerPlantillasRespuesta(
  idNegocio: string
): Promise<PlantillaRespuesta[]> {
  const supabase = await createClient()
  const { data: datos, error } = await supabase
    .from('response_templates')
    .select('*')
    .eq('business_id', idNegocio)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (datos ?? []) as PlantillaRespuesta[]
}
