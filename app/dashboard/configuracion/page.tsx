import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import ConfiguracionClient from './ConfiguracionClient'
import { obtenerPlantillasRespuesta, obtenerStaffPorNegocio } from '@/app/dashboard/lib/data'
import { DEMO_NEGOCIO, DEMO_PLANTILLAS, DEMO_STAFF } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return (
      <ConfiguracionClient
        negocio={DEMO_NEGOCIO}
        equipoInicial={DEMO_STAFF}
        plantillasIniciales={DEMO_PLANTILLAS}
      />
    )
  }

  const [equipo, plantillas] = await Promise.all([
    obtenerStaffPorNegocio(auth.businessId),
    obtenerPlantillasRespuesta(auth.businessId),
  ])

  return (
    <ConfiguracionClient
      negocio={auth.business!}
      equipoInicial={equipo}
      plantillasIniciales={plantillas}
    />
  )
}
