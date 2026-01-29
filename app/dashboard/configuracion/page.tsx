import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConfiguracionClient from './ConfiguracionClient'
import {
  obtenerNegocioActual,
  obtenerPlantillasRespuesta,
  obtenerStaffPorNegocio,
} from '@/app/dashboard/lib/data'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    redirect('/login')
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const [equipo, plantillas] = await Promise.all([
    obtenerStaffPorNegocio(negocio.id),
    obtenerPlantillasRespuesta(negocio.id),
  ])

  return (
    <ConfiguracionClient
      negocio={negocio}
      equipoInicial={equipo}
      plantillasIniciales={plantillas}
    />
  )
}
