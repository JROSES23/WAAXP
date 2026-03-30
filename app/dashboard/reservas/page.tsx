/**
 * page.tsx — Panel de Reservas (Server Component)
 * Obtiene recursos del negocio + reservas de hoy + conteos para la vista calor.
 * Usa demo data cuando el usuario no tiene negocio configurado.
 */

import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import {
  obtenerRecursosPorNegocio,
  obtenerReservasPorNegocio,
  obtenerConteoReservasPorRecurso,
} from '@/app/dashboard/lib/data'
import { DEMO_RECURSOS, DEMO_RESERVAS } from '@/app/dashboard/lib/demo-data'
import ReservasClient from './ReservasClient'

export const dynamic = 'force-dynamic'

export default async function ReservasPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  const hoy = new Date().toISOString().split('T')[0]

  // Rango para la vista calor (últimos 30 días)
  const hace30 = new Date()
  hace30.setDate(hace30.getDate() - 30)
  const desde30 = hace30.toISOString()
  const hasta30 = new Date().toISOString()

  let recursos = DEMO_RECURSOS
  let reservasHoy = DEMO_RESERVAS

  if (auth.businessId) {
    try {
      const [rawRecursos, rawReservas, conteos] = await Promise.all([
        obtenerRecursosPorNegocio(auth.businessId),
        obtenerReservasPorNegocio(auth.businessId, {
          desde: `${hoy}T00:00:00.000Z`,
          hasta: `${hoy}T23:59:59.999Z`,
        }),
        obtenerConteoReservasPorRecurso(auth.businessId, desde30, hasta30),
      ])

      // Fusionar conteos mensales en los recursos (para la vista calor)
      const mapaConteos = Object.fromEntries(conteos.map((c) => [c.recurso_id, c.count]))
      recursos = rawRecursos.map((r) => ({
        ...r,
        reservas_count: mapaConteos[r.id] ?? 0,
      }))

      reservasHoy = rawReservas
    } catch (e) {
      console.error('[ReservasPage] Error cargando datos:', e)
      // Caer de vuelta a demo data en caso de error
    }
  }

  return (
    <ReservasClient
      recursos={recursos}
      reservasHoy={reservasHoy}
      auth={auth}
      fechaHoy={hoy}
    />
  )
}
