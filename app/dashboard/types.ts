export type TipoProducto = 'producto' | 'servicio' | 'reserva'
export type VerticalNegocio = 'retail' | 'salon' | 'restaurant' | 'services' | 'other'

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
