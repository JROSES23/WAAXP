import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerNegocioActual } from '@/app/dashboard/lib/data'

export async function GET(
  _solicitud: Request,
  { params: parametros }: { params: { id: string } }
) {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const { data: conversacion, error: errorConversacion } = await supabase
    .from('conversations')
    .select('id, business_id')
    .eq('id', parametros.id)
    .single()

  if (errorConversacion || !conversacion || conversacion.business_id !== negocio.id) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  const { data: datosMensajes, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', parametros.id)
    .order('timestamp', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 })
  }

  return NextResponse.json({ mensajes: datosMensajes ?? [] })
}

export async function POST(
  solicitud: Request,
  { params: parametros }: { params: { id: string } }
) {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const cuerpo = await solicitud.json()
  const { contenido, rol } = cuerpo as { contenido?: string; rol?: 'user' | 'assistant' | 'system' }

  if (!contenido || !rol) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const { data: conversacion, error: errorConversacion } = await supabase
    .from('conversations')
    .select('id, business_id')
    .eq('id', parametros.id)
    .single()

  if (errorConversacion || !conversacion || conversacion.business_id !== negocio.id) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: parametros.id,
    business_id: negocio.id,
    role: rol,
    content: contenido,
    timestamp: new Date().toISOString(),
    status: 'sent',
  })

  if (error) {
    return NextResponse.json({ error: 'No se pudo guardar el mensaje' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
