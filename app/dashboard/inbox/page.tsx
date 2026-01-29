import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InboxClient from './InboxClient'
import {
  obtenerConversacionesPorNegocio,
  obtenerNegocioActual,
  obtenerProductosPorNegocio,
  obtenerStaffPorNegocio,
} from '@/app/dashboard/lib/data'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    redirect('/login')
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const [conversaciones, productos, equipo] = await Promise.all([
    obtenerConversacionesPorNegocio(negocio.id),
    obtenerProductosPorNegocio(negocio.id),
    obtenerStaffPorNegocio(negocio.id),
  ])

  return (
    <InboxClient
      negocio={negocio}
      conversaciones={conversaciones}
      productos={productos}
      equipo={equipo}
    />
  )
}
