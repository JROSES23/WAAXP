import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerNegocioActual } from '@/app/dashboard/lib/data'

const separarPalabras = (texto: string) =>
  texto
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

export async function GET(
  _solicitud: Request,
  { params: parametros }: { params: Promise<{ id: string }> }
) {
  const { id } = await parametros
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
    .eq('id', id)
    .single()

  if (errorConversacion || !conversacion || conversacion.business_id !== negocio.id) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  const { data: mensajes, error: errorMensajes } = await supabase
    .from('messages')
    .select('content, role')
    .eq('conversation_id', id)
    .order('timestamp', { ascending: false })
    .limit(20)

  if (errorMensajes) {
    return NextResponse.json({ error: 'No se pudieron leer mensajes' }, { status: 500 })
  }

  const ultimoMensajeUsuario = (mensajes ?? []).find(
    (mensaje) => mensaje.role === 'user' && mensaje.content
  )

  if (!ultimoMensajeUsuario) {
    return NextResponse.json({ sugerencia: null })
  }

  const palabras = separarPalabras(ultimoMensajeUsuario.content)
  const { data: plantillas, error: errorPlantillas } = await supabase
    .from('response_templates')
    .select('*')
    .eq('business_id', negocio.id)

  if (errorPlantillas) {
    return NextResponse.json({ error: 'No se pudieron cargar plantillas' }, { status: 500 })
  }

  const plantillaEncontrada = (plantillas ?? []).find((plantilla) => {
    const palabrasClave = plantilla.trigger_keywords ?? []
    return palabrasClave.some((palabraClave: string) =>
      palabras.some((palabra) => palabra.includes(palabraClave.toLowerCase()))
    )
  })

  return NextResponse.json({
    sugerencia: plantillaEncontrada ? plantillaEncontrada.mensaje_template : null,
  })
}
