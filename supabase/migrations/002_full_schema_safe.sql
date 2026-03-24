-- ============================================================
-- OPERLY: Migration 002 - Schema completo IDEMPOTENTE
-- Copia y pega este archivo en Supabase SQL Editor.
-- Si una tabla/columna ya existe, se ignora y continúa.
-- NO rompe nada existente.
-- ============================================================

-- ============================================================
-- 1. TABLAS BASE (las que el resto referencia)
-- ============================================================

-- ─── businesses ───
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL DEFAULT '',
  vertical_principal text NOT NULL DEFAULT 'other',
  modos_activos text[] NOT NULL DEFAULT '{}',
  whatsapp_phone text,
  whatsapp_token text,
  plan text NOT NULL DEFAULT 'starter',
  usage_limit integer NOT NULL DEFAULT 100,
  current_usage integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Columnas extra en businesses (safe: solo agrega si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='stripe_customer_id') THEN
    ALTER TABLE businesses ADD COLUMN stripe_customer_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='stripe_subscription_id') THEN
    ALTER TABLE businesses ADD COLUMN stripe_subscription_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='plan_expires_at') THEN
    ALTER TABLE businesses ADD COLUMN plan_expires_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='ai_prompt') THEN
    ALTER TABLE businesses ADD COLUMN ai_prompt text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='ai_tone') THEN
    ALTER TABLE businesses ADD COLUMN ai_tone text DEFAULT 'friendly';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='ai_followup_days') THEN
    ALTER TABLE businesses ADD COLUMN ai_followup_days integer DEFAULT 3;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='ai_discount_pct') THEN
    ALTER TABLE businesses ADD COLUMN ai_discount_pct numeric(5,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='whatsapp_status') THEN
    ALTER TABLE businesses ADD COLUMN whatsapp_status text DEFAULT 'disconnected';
  END IF;
END $$;

-- ─── categories ───
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  tipo_aplicacion text NOT NULL DEFAULT 'todos' CHECK (tipo_aplicacion IN ('producto', 'servicio', 'todos')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── products ───
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'producto' CHECK (tipo IN ('producto', 'servicio', 'reserva')),
  nombre text NOT NULL,
  descripcion text,
  precio numeric(12,2) NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'CLP',
  categoria_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  imagenes text[] NOT NULL DEFAULT '{}',
  stock integer,
  stock_alert_threshold integer,
  duracion_minutos integer,
  capacidad integer,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── staff ───
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  rol text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── conversations ───
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  client_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'archived')),
  last_message_at timestamptz DEFAULT now(),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── messages ───
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  raw_payload jsonb
);

-- ─── orders ───
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  cliente_nombre text,
  cliente_phone text,
  total numeric(12,2) NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'CLP',
  estado text NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'pendiente', 'confirmado', 'cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── order_items ───
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario numeric(12,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0
);

-- ─── appointments ───
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cliente_nombre text,
  cliente_phone text,
  servicio_id uuid REFERENCES products(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  fecha_hora timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'no_asiste')),
  notas text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── response_templates ───
CREATE TABLE IF NOT EXISTS response_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category text DEFAULT 'general',
  trigger_keywords text[] NOT NULL DEFAULT '{}',
  mensaje_template text NOT NULL DEFAULT '',
  intent text,
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── clients (CRM) ───
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone_number text,
  name text,
  email text,
  lead_status text NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  total_purchases numeric(12,2) NOT NULL DEFAULT 0,
  last_contact_at timestamptz,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABLAS RBAC + FEATURES
-- ============================================================

-- ─── user_roles ───
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'agent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- ─── user_permissions ───
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN (
    'dashboard', 'inbox', 'clientes', 'productos',
    'reportes', 'equipo', 'configuracion_ia',
    'whatsapp_qr', 'billing'
  )),
  can_view boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_role_id, section)
);

-- ─── team_invitations ───
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'agent')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── user_profiles ───
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text,
  avatar_url text,
  theme_mode text NOT NULL DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
  theme_color text NOT NULL DEFAULT '#0F766E',
  locale text NOT NULL DEFAULT 'es-CL',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── sales ───
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  client_phone text,
  client_name text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CLP',
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai', 'human')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── support_tickets ───
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ai_suggested_response text,
  admin_response text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── admin_chat_history ───
CREATE TABLE IF NOT EXISTS admin_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── plan_config ───
CREATE TABLE IF NOT EXISTS plan_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  price_clp integer NOT NULL DEFAULT 0,
  conversation_limit integer NOT NULL DEFAULT 100,
  pdf_reports_limit integer NOT NULL DEFAULT 2,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed planes por defecto (ignora si ya existen)
INSERT INTO plan_config (plan_name, display_name, price_clp, conversation_limit, pdf_reports_limit, features) VALUES
  ('starter', 'Starter', 0, 100, 2, '["inbox_basico", "1_usuario"]'::jsonb),
  ('pro', 'Pro', 19990, 1500, 10, '["inbox_avanzado", "5_usuarios", "reportes", "crm"]'::jsonb),
  ('enterprise', 'Enterprise', 49000, 999999, 999, '["todo_incluido", "usuarios_ilimitados", "soporte_prioritario", "api_access"]'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- ============================================================
-- 3. INDEXES (IF NOT EXISTS = safe)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_staff_business ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_business ON messages(business_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages("timestamp");
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_fecha ON appointments(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_templates_business ON response_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_business ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_business_id ON user_roles(business_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role_id ON user_permissions(user_role_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_business ON support_tickets(business_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================
-- 4. FUNCIONES HELPER (CREATE OR REPLACE = safe)
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT business_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'is_superadmin' = 'true' FROM auth.users WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION has_role(p_business_id uuid, p_role text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND business_id = p_business_id
      AND role = p_role
  );
$$;

CREATE OR REPLACE FUNCTION has_permission(p_business_id uuid, p_section text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN user_permissions up ON up.user_role_id = ur.id
    WHERE ur.user_id = auth.uid()
      AND ur.business_id = p_business_id
      AND up.section = p_section
      AND up.can_view = true
  ) OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND business_id = p_business_id
      AND role = 'owner'
  ) OR is_superadmin();
$$;

-- ============================================================
-- 5. RLS POLICIES (DROP IF EXISTS + CREATE = safe)
-- ============================================================

-- ─── businesses ───
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "businesses_select" ON businesses;
CREATE POLICY "businesses_select" ON businesses FOR SELECT USING (
  is_superadmin() OR
  supabase_user_id = auth.uid() OR
  id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "businesses_update" ON businesses;
CREATE POLICY "businesses_update" ON businesses FOR UPDATE USING (
  is_superadmin() OR has_role(id, 'owner') OR supabase_user_id = auth.uid()
);
DROP POLICY IF EXISTS "businesses_insert" ON businesses;
CREATE POLICY "businesses_insert" ON businesses FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- ─── products ───
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "products_manage" ON products;
CREATE POLICY "products_manage" ON products FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── categories ───
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_select" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "categories_manage" ON categories;
CREATE POLICY "categories_manage" ON categories FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── staff ───
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_select" ON staff;
CREATE POLICY "staff_select" ON staff FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "staff_manage" ON staff;
CREATE POLICY "staff_manage" ON staff FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── conversations ───
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_select" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "conversations_manage" ON conversations;
CREATE POLICY "conversations_manage" ON conversations FOR ALL USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── messages ───
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "messages_manage" ON messages;
CREATE POLICY "messages_manage" ON messages FOR ALL USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── orders ───
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "orders_manage" ON orders;
CREATE POLICY "orders_manage" ON orders FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── order_items ───
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  is_superadmin() OR order_id IN (
    SELECT id FROM orders WHERE business_id IN (
      SELECT business_id FROM user_roles WHERE user_id = auth.uid()
    ) OR business_id IN (
      SELECT id FROM businesses WHERE supabase_user_id = auth.uid()
    )
  )
);
DROP POLICY IF EXISTS "order_items_manage" ON order_items;
CREATE POLICY "order_items_manage" ON order_items FOR ALL USING (
  is_superadmin() OR order_id IN (
    SELECT id FROM orders WHERE business_id IN (
      SELECT id FROM businesses WHERE supabase_user_id = auth.uid()
    )
  )
);

-- ─── appointments ───
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "appointments_manage" ON appointments;
CREATE POLICY "appointments_manage" ON appointments FOR ALL USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── response_templates ───
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_select" ON response_templates;
CREATE POLICY "templates_select" ON response_templates FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "templates_manage" ON response_templates;
CREATE POLICY "templates_manage" ON response_templates FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── clients ───
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_select" ON clients;
CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "clients_manage" ON clients;
CREATE POLICY "clients_manage" ON clients FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── sales ───
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_select" ON sales;
CREATE POLICY "sales_select" ON sales FOR SELECT USING (
  is_superadmin() OR business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);
DROP POLICY IF EXISTS "sales_manage" ON sales;
CREATE POLICY "sales_manage" ON sales FOR ALL USING (
  is_superadmin() OR has_role(business_id, 'owner')
  OR business_id IN (SELECT id FROM businesses WHERE supabase_user_id = auth.uid())
);

-- ─── user_roles ───
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (
  is_superadmin() OR user_id = auth.uid() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid() AND role = 'owner')
);
DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT WITH CHECK (
  is_superadmin() OR has_role(business_id, 'owner')
);
DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;
CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE USING (
  is_superadmin() OR has_role(business_id, 'owner')
);

-- ─── user_permissions ───
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_permissions_select" ON user_permissions;
CREATE POLICY "user_permissions_select" ON user_permissions FOR SELECT USING (
  is_superadmin() OR
  user_role_id IN (SELECT id FROM user_roles WHERE user_id = auth.uid()) OR
  user_role_id IN (
    SELECT ur2.id FROM user_roles ur1
    JOIN user_roles ur2 ON ur1.business_id = ur2.business_id
    WHERE ur1.user_id = auth.uid() AND ur1.role = 'owner'
  )
);
DROP POLICY IF EXISTS "user_permissions_manage" ON user_permissions;
CREATE POLICY "user_permissions_manage" ON user_permissions FOR ALL USING (
  is_superadmin() OR
  user_role_id IN (
    SELECT ur2.id FROM user_roles ur1
    JOIN user_roles ur2 ON ur1.business_id = ur2.business_id
    WHERE ur1.user_id = auth.uid() AND ur1.role = 'owner'
  )
);

-- ─── team_invitations ───
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "team_invitations_select" ON team_invitations;
CREATE POLICY "team_invitations_select" ON team_invitations FOR SELECT USING (
  is_superadmin() OR has_role(business_id, 'owner') OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "team_invitations_insert" ON team_invitations;
CREATE POLICY "team_invitations_insert" ON team_invitations FOR INSERT WITH CHECK (
  is_superadmin() OR has_role(business_id, 'owner')
);
DROP POLICY IF EXISTS "team_invitations_update" ON team_invitations;
CREATE POLICY "team_invitations_update" ON team_invitations FOR UPDATE USING (
  is_superadmin() OR has_role(business_id, 'owner') OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- ─── user_profiles ───
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (
  is_superadmin() OR user_id = auth.uid()
);
DROP POLICY IF EXISTS "user_profiles_manage" ON user_profiles;
CREATE POLICY "user_profiles_manage" ON user_profiles FOR ALL USING (
  user_id = auth.uid()
);

-- ─── support_tickets ───
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_tickets_select" ON support_tickets;
CREATE POLICY "support_tickets_select" ON support_tickets FOR SELECT USING (
  is_superadmin() OR user_id = auth.uid()
);
DROP POLICY IF EXISTS "support_tickets_insert" ON support_tickets;
CREATE POLICY "support_tickets_insert" ON support_tickets FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
DROP POLICY IF EXISTS "support_tickets_admin" ON support_tickets;
CREATE POLICY "support_tickets_admin" ON support_tickets FOR UPDATE USING (
  is_superadmin() OR user_id = auth.uid()
);

-- ─── admin_chat_history ───
ALTER TABLE admin_chat_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_chat_select" ON admin_chat_history;
CREATE POLICY "admin_chat_select" ON admin_chat_history FOR SELECT USING (is_superadmin());
DROP POLICY IF EXISTS "admin_chat_insert" ON admin_chat_history;
CREATE POLICY "admin_chat_insert" ON admin_chat_history FOR INSERT WITH CHECK (is_superadmin());

-- ─── plan_config ───
ALTER TABLE plan_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plan_config_select" ON plan_config;
CREATE POLICY "plan_config_select" ON plan_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "plan_config_manage" ON plan_config;
CREATE POLICY "plan_config_manage" ON plan_config FOR ALL USING (is_superadmin());

-- ============================================================
-- 6. TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_updated_at ON user_roles;
CREATE TRIGGER user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS plan_config_updated_at ON plan_config;
CREATE TRIGGER plan_config_updated_at BEFORE UPDATE ON plan_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. REALTIME (habilitar para inbox en vivo)
-- ============================================================
-- Habilitar publicación de cambios para las tablas del inbox
DO $$
BEGIN
  -- Solo agrega si la tabla no está ya en la publicación
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'businesses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
  END IF;
END $$;

-- ============================================================
-- 8. STORAGE BUCKET para imágenes de productos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DO $$
BEGIN
  -- Lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'productos_public_read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "productos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'productos');
  END IF;

  -- Upload solo autenticados
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'productos_auth_upload' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "productos_auth_upload" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'productos' AND auth.uid() IS NOT NULL
    );
  END IF;

  -- Delete solo autenticados
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'productos_auth_delete' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "productos_auth_delete" ON storage.objects FOR DELETE USING (
      bucket_id = 'productos' AND auth.uid() IS NOT NULL
    );
  END IF;
END $$;

-- ============================================================
-- LISTO! Ahora configura tu usuario:
--
-- 1. Hacerte superadmin:
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"is_superadmin": true}'::jsonb
-- WHERE email = 'TU_EMAIL@ejemplo.com';
--
-- 2. Crear tu negocio (si no existe):
-- INSERT INTO businesses (supabase_user_id, nombre, plan)
-- SELECT id, 'Mi Negocio', 'pro'
-- FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com';
--
-- 3. Crear tu rol de owner:
-- INSERT INTO user_roles (user_id, business_id, role)
-- SELECT u.id, b.id, 'owner'
-- FROM auth.users u
-- JOIN businesses b ON b.supabase_user_id = u.id
-- WHERE u.email = 'TU_EMAIL@ejemplo.com';
-- ============================================================
