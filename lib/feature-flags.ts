/**
 * feature-flags.ts
 * Sistema de feature flags por negocio.
 * Los flags se almacenan en la tabla `feature_flags` de Supabase.
 * Si la tabla no existe aún, todas las funciones retornan el valor por defecto.
 *
 * TABLA REQUERIDA:
 *   CREATE TABLE feature_flags (
 *     id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
 *     feature_key TEXT NOT NULL,
 *     enabled     BOOLEAN DEFAULT FALSE,
 *     created_at  TIMESTAMPTZ DEFAULT NOW(),
 *     updated_at  TIMESTAMPTZ DEFAULT NOW(),
 *     UNIQUE(business_id, feature_key)
 *   );
 */

import { createClient } from '@/lib/supabase/server'

// ─── Definición de flags disponibles ───

export type FeatureKey =
  | 'live_panel_v2'       // Segunda versión del panel en vivo
  | 'staff_goals'         // Sistema de metas y recompensas para staff
  | 'multi_location'      // Soporte para múltiples sucursales
  | 'reservas_publicas'   // Página pública de reservas para clientes

/** Valor por defecto cuando el flag no existe en BD */
const DEFAULTS: Record<FeatureKey, boolean> = {
  live_panel_v2:     false,
  staff_goals:       false,
  multi_location:    false,
  reservas_publicas: false,
}

// ─── Funciones públicas ───

/**
 * Lee si un feature está habilitado para una tienda específica.
 * Retorna el valor por defecto si hay error o el flag no existe.
 */
export async function isFeatureEnabled(
  businessId: string,
  featureKey: FeatureKey
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('business_id', businessId)
      .eq('feature_key', featureKey)
      .maybeSingle()

    if (error) {
      // Si la tabla no existe aún, retornar default silenciosamente
      return DEFAULTS[featureKey]
    }

    return data?.enabled ?? DEFAULTS[featureKey]
  } catch {
    return DEFAULTS[featureKey]
  }
}

/**
 * Lee múltiples flags en una sola query.
 * Retorna un objeto con el estado de cada flag.
 */
export async function getFeatureFlags(
  businessId: string,
  keys: FeatureKey[]
): Promise<Record<FeatureKey, boolean>> {
  // Inicializar con defaults
  const resultado = { ...DEFAULTS }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('feature_key, enabled')
      .eq('business_id', businessId)
      .in('feature_key', keys)

    if (error) return resultado

    for (const row of data ?? []) {
      const key = row.feature_key as FeatureKey
      if (key in resultado) {
        resultado[key] = row.enabled
      }
    }
  } catch {
    // Retornar defaults si hay error
  }

  return resultado
}

/**
 * Activa o desactiva un feature (solo owner).
 * Hace upsert para crear o actualizar el flag.
 */
export async function toggleFeature(
  businessId: string,
  featureKey: FeatureKey,
  enabled: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('feature_flags')
      .upsert(
        {
          business_id:  businessId,
          feature_key:  featureKey,
          enabled,
          updated_at:   new Date().toISOString(),
        },
        { onConflict: 'business_id,feature_key' }
      )

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

/**
 * Inicializa todos los flags para un negocio nuevo con sus valores por defecto.
 * Se llama durante el onboarding al crear el negocio.
 */
export async function inicializarFeatureFlags(
  businessId: string
): Promise<void> {
  try {
    const supabase = await createClient()
    const rows = (Object.entries(DEFAULTS) as [FeatureKey, boolean][]).map(
      ([feature_key, enabled]) => ({
        business_id: businessId,
        feature_key,
        enabled,
      })
    )

    await supabase
      .from('feature_flags')
      .upsert(rows, { onConflict: 'business_id,feature_key', ignoreDuplicates: true })
  } catch {
    // No crítico — los defaults se usan si la tabla no existe
  }
}
