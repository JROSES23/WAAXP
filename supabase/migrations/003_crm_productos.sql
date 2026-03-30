-- ──────────────────────────────────────────────────────────────────────────────
-- WAAXP — Migración 003: CRM Clientes + Mejoras Productos
-- Ejecutar en Supabase SQL Editor (idempotente — usa IF NOT EXISTS / DO)
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Clientes: notas internas ──────────────────────────────────────────────
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes text;

-- ── 2. Productos: FAQ del producto (contexto extra para el bot) ──────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS faq text;

-- ── 3. Productos: contador de consultas recibidas ────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS consult_count integer NOT NULL DEFAULT 0;

-- Índice para ordenar rápido por más consultados
CREATE INDEX IF NOT EXISTS idx_products_consult_count
  ON products (consult_count DESC);

-- ── 4. RLS: asegurarse de que notes y faq respetan el owner ─────────────────
-- (las políticas existentes en clients/products ya cubren todas las columnas,
--  no se necesita cambio adicional en RLS)

-- ── Verificación ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  ASSERT (SELECT column_name FROM information_schema.columns
          WHERE table_name='clients' AND column_name='notes') = 'notes',
    'clients.notes no existe';
  ASSERT (SELECT column_name FROM information_schema.columns
          WHERE table_name='products' AND column_name='faq') = 'faq',
    'products.faq no existe';
  ASSERT (SELECT column_name FROM information_schema.columns
          WHERE table_name='products' AND column_name='consult_count') = 'consult_count',
    'products.consult_count no existe';
  RAISE NOTICE 'Migración 003 verificada correctamente.';
END $$;
