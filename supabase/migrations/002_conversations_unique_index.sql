-- ============================================================
-- MIGRACIÓN 002: Índice único en conversations(business_id, phone_number)
--
-- Necesario para que el upsert del bot LEVI funcione correctamente.
-- Sin este índice, `onConflict: 'business_id,phone_number'` lanza error.
--
-- La columna correcta es phone_number (no client_phone).
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS conversations_business_phone_idx
  ON conversations(business_id, phone_number);
