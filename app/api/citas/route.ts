import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerNegocioActual } from '@/app/dashboard/lib/data'

export async function POST(solicitud: Request) {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const cuerpo = await solicitud.json()
  const { idConversacion, idServicio, idStaff, fechaHora } = cuerpo as {
    idConversacion?: string
    idServicio?: string
    idStaff?: string | null
    fechaHora?: string
  }

  if (!idConversacion || !idServicio || !fechaHora) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const { data: conversacion, error: errorConversacion } = await supabase
    .from('conversations')
    .select('id, business_id, client_name, phone_number')
    .eq('id', idConversacion)
    .single()

  if (errorConversacion || !conversacion || conversacion.business_id !== negocio.id) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  const { data: servicio, error: errorServicio } = await supabase
    .from('products')
    .select('id')
    .eq('id', idServicio)
    .eq('business_id', negocio.id)
    .eq('tipo', 'servicio')
    .single()

  if (errorServicio || !servicio) {
    return NextResponse.json(
      { error: 'Servicio no encontrado o no pertenece a tu negocio' },
      { status: 403 }
    )
  }

  if (idStaff) {
    const { data: staff, error: errorStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('id', idStaff)
      .eq('business_id', negocio.id)
      .single()

    if (errorStaff || !staff) {
      return NextResponse.json(
        { error: 'Staff no encontrado o no pertenece a tu negocio' },
        { status: 403 }
      )
    }
  }

  const { error: errorCita } = await supabase.from('appointments').insert({
    business_id: negocio.id,
    cliente_nombre: conversacion.client_name,
    cliente_phone: conversacion.phone_number,
    servicio_id: idServicio,
    staff_id: idStaff ?? null,
    fecha_hora: fechaHora,
    estado: 'confirmada',
  })

  if (errorCita) {
    return NextResponse.json({ error: 'No se pudo crear la cita' }, { status: 500 })
  }

  let nombreProfesional = 'nuestro equipo'
  if (idStaff) {
    const { data: persona } = await supabase
      .from('staff')
      .select('nombre')
      .eq('id', idStaff)
      .single()
    if (persona?.nombre) {
      nombreProfesional = persona.nombre
    }
  }
  const fechaLegible = new Date(fechaHora).toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const mensajeConfirmacion = `Listo, te agendé para ${fechaLegible} con ${nombreProfesional}.`

  await supabase.from('messages').insert({
    conversation_id: idConversacion,
    business_id: negocio.id,
    role: 'assistant',
    content: mensajeConfirmacion,
    timestamp: new Date().toISOString(),
    status: 'sent',
  })

  return NextResponse.json({ ok: true })
}
