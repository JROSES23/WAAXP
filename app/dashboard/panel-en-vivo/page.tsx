/**
 * page.tsx — Panel en Vivo (Server Component)
 * Vista fullscreen para atención en persona: barbería, salón, restaurante.
 * Muestra quién llega, estado por recurso, y acciones rápidas.
 */

import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import {
  obtenerRecursosPorNegocio,
  obtenerReservasPorNegocio,
} from '@/app/dashboard/lib/data'
import { DEMO_RECURSOS, DEMO_RESERVAS } from '@/app/dashboard/lib/demo-data'
import PanelEnVivoClient from './PanelEnVivoClient'

export const dynamic = 'force-dynamic'

export default async function PanelEnVivoPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  const hoy = new Date().toISOString().split('T')[0]

  let recursos    = DEMO_RECURSOS
  let reservasHoy = DEMO_RESERVAS

  if (auth.businessId) {
    try {
      const [rawRecursos, rawReservas] = await Promise.all([
        obtenerRecursosPorNegocio(auth.businessId),
        obtenerReservasPorNegocio(auth.businessId, {
          desde: `${hoy}T00:00:00.000Z`,
          hasta: `${hoy}T23:59:59.999Z`,
        }),
      ])
      recursos    = rawRecursos
      reservasHoy = rawReservas
    } catch (e) {
      console.error('[PanelEnVivo] Error cargando datos:', e)
    }
  }

  return (
    <PanelEnVivoClient
      recursos={recursos}
      reservasHoy={reservasHoy}
      auth={auth}
      fechaHoy={hoy}
    />
  )
}
