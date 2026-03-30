'use server'

/**
 * actions.ts — Acciones de servidor para el módulo de Reservas.
 * Mutaciones: cambiar estado, registrar pago, crear walk-in.
 */

import { revalidatePath } from 'next/cache'
import { actualizarReserva, crearReserva } from '@/app/dashboard/lib/data'
import type { EstadoReserva, MetodoPago, EstadoPago, Reserva } from '@/app/dashboard/types'

/** Cambia el estado operativo de una reserva */
export async function actualizarEstadoReserva(
  id: string,
  estado: EstadoReserva
): Promise<{ ok: boolean; error?: string }> {
  try {
    await actualizarReserva(id, { estado })
    revalidatePath('/dashboard/reservas')
    revalidatePath('/dashboard/panel-en-vivo')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

/** Registra o actualiza el método y estado de pago */
export async function registrarPagoReserva(
  id: string,
  metodo_pago: MetodoPago,
  estado_pago: EstadoPago,
  monto?: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await actualizarReserva(id, {
      metodo_pago,
      estado_pago,
      ...(monto != null ? { monto } : {}),
    })
    revalidatePath('/dashboard/reservas')
    revalidatePath('/dashboard/panel-en-vivo')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

/** Crea una reserva walk-in directamente desde el panel */
export async function crearWalkIn(
  reserva: Omit<Reserva, 'id' | 'created_at' | 'recurso'>
): Promise<{ ok: boolean; data?: Reserva; error?: string }> {
  try {
    const nueva = await crearReserva(reserva)
    revalidatePath('/dashboard/reservas')
    revalidatePath('/dashboard/panel-en-vivo')
    return { ok: true, data: nueva }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
