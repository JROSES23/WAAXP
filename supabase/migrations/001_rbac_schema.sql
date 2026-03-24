-- ============================================================
-- OPERLY: Migration 001 - RBAC Schema + RLS Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. EXTEND auth.users metadata (is_superadmin flag)
-- ============================================================
-- NOTE: is_superadmin is stored in auth.users.raw_app_meta_data
-- Set it manually for your account:
--   UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"is_superadmin": true}'::jsonb
--   WHERE email = 'TU_EMAIL_AQUI';

-- ============================================================
-- 2. ROLES & PERMISSIONS TABLE
-- ============================================================

-- User roles within a business (tenant)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'agent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Granular section permissions for agents
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

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'agent')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, email, status) -- Only one pending invite per email per business
);

-- ============================================================
-- 3. USER PROFILES TABLE (theme preferences, display name)
-- ============================================================
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

-- ============================================================
-- 4. ENSURE businesses TABLE HAS NEEDED COLUMNS
-- ============================================================
-- Add columns if they don't exist (safe to re-run)
DO $$
BEGIN
  -- Stripe columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE businesses ADD COLUMN stripe_customer_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE businesses ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'plan_expires_at') THEN
    ALTER TABLE businesses ADD COLUMN plan_expires_at timestamptz;
  END IF;

  -- AI config columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'ai_prompt') THEN
    ALTER TABLE businesses ADD COLUMN ai_prompt text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'ai_tone') THEN
    ALTER TABLE businesses ADD COLUMN ai_tone text DEFAULT 'amigable' CHECK (ai_tone IN ('formal', 'amigable', 'profesional'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'ai_followup_days') THEN
    ALTER TABLE businesses ADD COLUMN ai_followup_days integer DEFAULT 3;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'ai_discount_pct') THEN
    ALTER TABLE businesses ADD COLUMN ai_discount_pct numeric(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'whatsapp_status') THEN
    ALTER TABLE businesses ADD COLUMN whatsapp_status text DEFAULT 'disconnected' CHECK (whatsapp_status IN ('connected', 'reconnecting', 'disconnected'));
  END IF;
END $$;

-- ============================================================
-- 5. SALES TABLE (for dashboard KPIs)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id),
  client_phone text,
  client_name text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CLP',
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai', 'human')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. SUPPORT TICKETS TABLE (for God Mode)
-- ============================================================
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

-- ============================================================
-- 7. ADMIN CHAT HISTORY (DevOps chatbot)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. PLAN CONFIGURATION TABLE (editable from God Mode)
-- ============================================================
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

-- Seed default plans
INSERT INTO plan_config (plan_name, display_name, price_clp, conversation_limit, pdf_reports_limit, features) VALUES
  ('starter', 'Starter', 0, 100, 2, '["inbox_basico", "1_usuario"]'::jsonb),
  ('pro', 'Pro', 19990, 1500, 10, '["inbox_avanzado", "5_usuarios", "reportes", "crm"]'::jsonb),
  ('enterprise', 'Enterprise', 49000, 999999, 999, '["todo_incluido", "usuarios_ilimitados", "soporte_prioritario", "api_access"]'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- ============================================================
-- 9. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_business_id ON user_roles(business_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role_id ON user_permissions(user_role_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================
-- 10. HELPER FUNCTIONS
-- ============================================================

-- Get the current user's business_id
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT business_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Check if current user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'is_superadmin' = 'true' FROM auth.users WHERE id = auth.uid()),
    false
  );
$$;

-- Check if current user has a specific role in a business
CREATE OR REPLACE FUNCTION has_role(p_business_id uuid, p_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND business_id = p_business_id
      AND role = p_role
  );
$$;

-- Check if current user has permission for a section
CREATE OR REPLACE FUNCTION has_permission(p_business_id uuid, p_section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN user_permissions up ON up.user_role_id = ur.id
    WHERE ur.user_id = auth.uid()
      AND ur.business_id = p_business_id
      AND up.section = p_section
      AND up.can_view = true
  ) OR EXISTS (
    -- Owners always have all permissions
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND business_id = p_business_id
      AND role = 'owner'
  ) OR is_superadmin();
$$;

-- ============================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ---------- businesses ----------
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "businesses_select" ON businesses;
CREATE POLICY "businesses_select" ON businesses FOR SELECT USING (
  is_superadmin() OR
  id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "businesses_update" ON businesses;
CREATE POLICY "businesses_update" ON businesses FOR UPDATE USING (
  is_superadmin() OR
  has_role(id, 'owner')
);

-- ---------- user_roles ----------
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (
  is_superadmin() OR
  user_id = auth.uid() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid() AND role = 'owner')
);

DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT WITH CHECK (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;
CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE USING (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

-- ---------- user_permissions ----------
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_permissions_select" ON user_permissions;
CREATE POLICY "user_permissions_select" ON user_permissions FOR SELECT USING (
  is_superadmin() OR
  user_role_id IN (
    SELECT id FROM user_roles WHERE user_id = auth.uid()
  ) OR
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

-- ---------- team_invitations ----------
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_invitations_select" ON team_invitations;
CREATE POLICY "team_invitations_select" ON team_invitations FOR SELECT USING (
  is_superadmin() OR
  has_role(business_id, 'owner') OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "team_invitations_insert" ON team_invitations;
CREATE POLICY "team_invitations_insert" ON team_invitations FOR INSERT WITH CHECK (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

DROP POLICY IF EXISTS "team_invitations_update" ON team_invitations;
CREATE POLICY "team_invitations_update" ON team_invitations FOR UPDATE USING (
  is_superadmin() OR
  has_role(business_id, 'owner') OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- ---------- products ----------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "products_manage" ON products;
CREATE POLICY "products_manage" ON products FOR ALL USING (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

-- ---------- conversations ----------
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "conversations_manage" ON conversations;
CREATE POLICY "conversations_manage" ON conversations FOR ALL USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

-- ---------- messages ----------
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "messages_manage" ON messages;
CREATE POLICY "messages_manage" ON messages FOR ALL USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

-- ---------- sales ----------
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sales_select" ON sales;
CREATE POLICY "sales_select" ON sales FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "sales_manage" ON sales;
CREATE POLICY "sales_manage" ON sales FOR ALL USING (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

-- ---------- user_profiles ----------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (
  is_superadmin() OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "user_profiles_manage" ON user_profiles;
CREATE POLICY "user_profiles_manage" ON user_profiles FOR ALL USING (
  user_id = auth.uid()
);

-- ---------- support_tickets ----------
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
  is_superadmin()
);

-- ---------- admin_chat_history ----------
ALTER TABLE admin_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_chat_select" ON admin_chat_history;
CREATE POLICY "admin_chat_select" ON admin_chat_history FOR SELECT USING (
  is_superadmin()
);

DROP POLICY IF EXISTS "admin_chat_insert" ON admin_chat_history;
CREATE POLICY "admin_chat_insert" ON admin_chat_history FOR INSERT WITH CHECK (
  is_superadmin()
);

-- ---------- plan_config ----------
ALTER TABLE plan_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plan_config_select" ON plan_config;
CREATE POLICY "plan_config_select" ON plan_config FOR SELECT USING (true); -- Public read

DROP POLICY IF EXISTS "plan_config_manage" ON plan_config;
CREATE POLICY "plan_config_manage" ON plan_config FOR ALL USING (
  is_superadmin()
);

-- ---------- orders ----------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "orders_manage" ON orders;
CREATE POLICY "orders_manage" ON orders FOR ALL USING (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

-- ---------- categories ----------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "categories_manage" ON categories;
CREATE POLICY "categories_manage" ON categories FOR ALL USING (
  is_superadmin() OR
  has_role(business_id, 'owner')
);

-- ---------- appointments ----------
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "appointments_manage" ON appointments;
CREATE POLICY "appointments_manage" ON appointments FOR ALL USING (
  is_superadmin() OR
  business_id IN (SELECT business_id FROM user_roles WHERE user_id = auth.uid())
);

-- ============================================================
-- 12. AUTO-CREATE PROFILE + ROLE TRIGGER
-- ============================================================

-- When a new user signs up, create their profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- ============================================================
-- 13. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_updated_at ON user_roles;
CREATE TRIGGER user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS plan_config_updated_at ON plan_config;
CREATE TRIGGER plan_config_updated_at
  BEFORE UPDATE ON plan_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONE! Now set your superadmin flag:
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"is_superadmin": true}'::jsonb
-- WHERE email = 'tu-email@ejemplo.com';
--
-- And create your owner role:
-- INSERT INTO user_roles (user_id, business_id, role)
-- SELECT id, 'TU_BUSINESS_ID', 'owner'
-- FROM auth.users WHERE email = 'tu-email@ejemplo.com';
-- ============================================================
