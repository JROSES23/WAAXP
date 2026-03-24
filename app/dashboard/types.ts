export type TipoProducto = 'producto' | 'servicio' | 'reserva'
export type VerticalNegocio =
  | 'retail'
  | 'salon'
  | 'restaurant'
  | 'services'
  | 'other'
  | 'tienda'
  | 'delivery'
  | 'eventos'
  | 'restaurante'
  | (string & {})

export interface Negocio {
  id: string
  supabase_user_id: string
  nombre: string
  vertical_principal: VerticalNegocio
  modos_activos: string[]
  whatsapp_phone?: string
  whatsapp_token?: string
  plan: string
  usage_limit: number
  current_usage: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan_expires_at?: string
  ai_prompt?: string
  ai_tone?: string
  ai_followup_days?: number
  ai_discount_pct?: number
  whatsapp_status?: string
  created_at: string
}

export interface Categoria {
  id: string
  business_id: string
  nombre: string
  tipo_aplicacion: 'producto' | 'servicio' | 'todos'
  created_at: string
}

export interface Producto {
  id: string
  business_id: string
  tipo: TipoProducto
  nombre: string
  descripcion?: string
  precio: number
  moneda: string
  categoria_id?: string
  imagenes: string[]
  stock?: number
  stock_alert_threshold?: number
  duracion_minutos?: number
  capacidad?: number
  activo: boolean
  created_at: string
  updated_at: string
  categories?: { nombre: string }
}

export interface Staff {
  id: string
  business_id: string
  nombre: string
  rol?: string
  activo: boolean
  created_at: string
}

export interface Cita {
  id: string
  business_id: string
  cliente_nombre?: string
  cliente_phone?: string
  servicio_id?: string
  staff_id?: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'no_asiste'
  notas?: string
  created_by?: string
  created_at: string
}

export interface Conversacion {
  id: string
  business_id: string
  phone_number: string
  client_name?: string
  status: 'active' | 'pending_approval' | 'archived'
  last_message_at: string
  metadata?: unknown
  created_at: string
}

export interface Mensaje {
  id: string
  conversation_id: string
  business_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  raw_payload?: unknown
}

export interface PlantillaRespuesta {
  id: string
  business_id: string
  category?: string
  trigger_keywords: string[]
  mensaje_template: string
  intent?: string
  usage_count: number
  last_used_at?: string
  created_at: string
}

export interface Pedido {
  id: string
  business_id: string
  conversation_id?: string
  cliente_nombre?: string
  cliente_phone?: string
  total: number
  moneda: string
  estado: 'borrador' | 'pendiente' | 'confirmado' | 'cancelado'
  created_at: string
}

export interface ItemPedido {
  id: string
  order_id: string
  product_id?: string
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

// ============================================================
// RBAC Types
// ============================================================

export type UserRole = 'owner' | 'agent'

export type SectionPermission =
  | 'dashboard'
  | 'inbox'
  | 'clientes'
  | 'productos'
  | 'reportes'
  | 'equipo'
  | 'configuracion_ia'
  | 'whatsapp_qr'
  | 'billing'

export interface UserRoleRecord {
  id: string
  user_id: string
  business_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UserPermission {
  id: string
  user_role_id: string
  section: SectionPermission
  can_view: boolean
  can_edit: boolean
  created_at: string
}

export interface TeamInvitation {
  id: string
  business_id: string
  email: string
  role: UserRole
  invited_by: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  token: string
  expires_at: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  theme_mode: 'light' | 'dark'
  theme_color: string
  locale: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  business_id: string
  conversation_id: string | null
  client_phone: string | null
  client_name: string | null
  amount: number
  currency: string
  source: 'manual' | 'ai' | 'human'
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
}

export interface SupportTicket {
  id: string
  business_id: string | null
  user_id: string | null
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  ai_suggested_response: string | null
  admin_response: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface PlanConfig {
  id: string
  plan_name: string
  display_name: string
  price_clp: number
  conversation_limit: number
  pdf_reports_limit: number
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// Computed auth context passed through the app
export interface AuthContext {
  userId: string
  email: string
  isSuperAdmin: boolean
  businessId: string | null
  role: UserRole | null
  permissions: SectionPermission[]
  profile: UserProfile | null
  business: Negocio | null
}
