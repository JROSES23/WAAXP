/**
 * demo-data.ts
 * Datos falsos para mostrar el dashboard sin negocio configurado.
 * Se usan cuando auth.businessId es null.
 */

import type {
  Negocio, Producto, Categoria, Staff, Conversacion,
  Sale, PlantillaRespuesta, SupportTicket,
} from '@/app/dashboard/types'

export const DEMO_BUSINESS_ID = 'demo-waaxp'

export const DEMO_NEGOCIO: Negocio = {
  id: DEMO_BUSINESS_ID,
  supabase_user_id: 'demo',
  nombre: 'Tienda Demo WAAXP',
  vertical_principal: 'retail',
  modos_activos: ['ventas', 'productos', 'soporte'],
  whatsapp_phone: '+56912345678',
  plan: 'Pro',
  usage_limit: 1500,
  current_usage: 870,
  ai_tone: 'friendly',
  ai_prompt: 'Eres LEVI, el asistente de ventas de nuestra tienda. Ayuda a los clientes a encontrar los productos que necesitan.',
  ai_followup_days: 3,
  ai_discount_pct: 10,
  created_at: '2025-01-15T10:00:00Z',
}

// ─── KPIs Dashboard ───

export const DEMO_KPIS = {
  ventasTotales: 4_280_500,
  ventasRecuperadasIA: 1_640_000,
  pctAutomatico: 78,
  pendientesHumanos: 3,
  totalConversaciones: 247,
  ventasPorDia: [
    { fecha: 'Lun', monto: 520_000 },
    { fecha: 'Mar', monto: 840_000 },
    { fecha: 'Mié', monto: 390_000 },
    { fecha: 'Jue', monto: 710_000 },
    { fecha: 'Vie', monto: 980_000 },
    { fecha: 'Sáb', monto: 1_240_000 },
    { fecha: 'Dom', monto: 600_500 },
  ],
  convPorDia: [
    { fecha: 'Lun', cantidad: 28 },
    { fecha: 'Mar', cantidad: 41 },
    { fecha: 'Mié', cantidad: 19 },
    { fecha: 'Jue', cantidad: 35 },
    { fecha: 'Vie', cantidad: 52 },
    { fecha: 'Sáb', cantidad: 48 },
    { fecha: 'Dom', cantidad: 24 },
  ],
  chatsIA: 193,
  chatsHumano: 54,
}

// ─── Clientes ───

export const DEMO_CLIENTES = [
  { id: 'c1', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345001', client_name: 'Valentina Torres', lead_status: 'caliente', total_spent: 289_990, last_interaction: '2025-06-20T14:30:00Z', tags: ['recurrente', 'vip'], created_at: '2025-03-01T09:00:00Z' },
  { id: 'c2', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345002', client_name: 'Sebastián Mora', lead_status: 'tibio', total_spent: 89_990, last_interaction: '2025-06-18T11:00:00Z', tags: ['interesado'], created_at: '2025-04-10T10:00:00Z' },
  { id: 'c3', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345003', client_name: 'Camila Reyes', lead_status: 'caliente', total_spent: 459_800, last_interaction: '2025-06-21T09:15:00Z', tags: ['vip', 'frecuente'], created_at: '2025-02-15T08:00:00Z' },
  { id: 'c4', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345004', client_name: 'Diego Navarro', lead_status: 'frio', total_spent: 24_990, last_interaction: '2025-05-30T16:00:00Z', tags: [], created_at: '2025-05-01T11:00:00Z' },
  { id: 'c5', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345005', client_name: 'Isidora Vega', lead_status: 'tibio', total_spent: 134_900, last_interaction: '2025-06-19T12:45:00Z', tags: ['interesado'], created_at: '2025-03-20T09:30:00Z' },
  { id: 'c6', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345006', client_name: 'Matías Herrera', lead_status: 'caliente', total_spent: 312_000, last_interaction: '2025-06-21T10:00:00Z', tags: ['vip'], created_at: '2025-01-25T10:00:00Z' },
  { id: 'c7', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345007', client_name: 'Sofía Contreras', lead_status: 'frio', total_spent: 0, last_interaction: '2025-06-10T08:00:00Z', tags: [], created_at: '2025-06-10T08:00:00Z' },
  { id: 'c8', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345008', client_name: 'Javier Romero', lead_status: 'tibio', total_spent: 67_500, last_interaction: '2025-06-17T15:00:00Z', tags: ['descuento'], created_at: '2025-04-05T10:00:00Z' },
]

// ─── Conversaciones (Inbox) ───

export const DEMO_CONVERSACIONES: Conversacion[] = [
  { id: 'conv1', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345001', client_name: 'Valentina Torres', status: 'pending_approval', last_message_at: '2025-06-21T14:30:00Z', created_at: '2025-06-21T10:00:00Z' },
  { id: 'conv2', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345002', client_name: 'Sebastián Mora', status: 'active', last_message_at: '2025-06-21T13:15:00Z', created_at: '2025-06-21T12:00:00Z' },
  { id: 'conv3', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345003', client_name: 'Camila Reyes', status: 'active', last_message_at: '2025-06-21T12:00:00Z', created_at: '2025-06-20T09:00:00Z' },
  { id: 'conv4', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345004', client_name: 'Diego Navarro', status: 'pending_approval', last_message_at: '2025-06-21T09:30:00Z', created_at: '2025-06-21T09:00:00Z' },
  { id: 'conv5', business_id: DEMO_BUSINESS_ID, phone_number: '+56912345005', client_name: 'Isidora Vega', status: 'archived', last_message_at: '2025-06-20T18:00:00Z', created_at: '2025-06-19T14:00:00Z' },
]

// ─── Productos ───

export const DEMO_CATEGORIAS: Categoria[] = [
  { id: 'cat1', business_id: DEMO_BUSINESS_ID, nombre: 'Ropa', tipo_aplicacion: 'producto', created_at: '2025-01-01T00:00:00Z' },
  { id: 'cat2', business_id: DEMO_BUSINESS_ID, nombre: 'Accesorios', tipo_aplicacion: 'producto', created_at: '2025-01-01T00:00:00Z' },
  { id: 'cat3', business_id: DEMO_BUSINESS_ID, nombre: 'Calzado', tipo_aplicacion: 'producto', created_at: '2025-01-01T00:00:00Z' },
]

export const DEMO_PRODUCTOS: Producto[] = [
  { id: 'p1', business_id: DEMO_BUSINESS_ID, tipo: 'producto', nombre: 'Polera Premium Unisex', descripcion: 'Algodón 100%, disponible en 8 colores', precio: 24_990, moneda: 'CLP', categoria_id: 'cat1', imagenes: [], stock: 48, activo: true, created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z', categories: { nombre: 'Ropa' } },
  { id: 'p2', business_id: DEMO_BUSINESS_ID, tipo: 'producto', nombre: 'Jeans Slim Fit', descripcion: 'Corte moderno, tallas 28-38', precio: 49_990, moneda: 'CLP', categoria_id: 'cat1', imagenes: [], stock: 22, activo: true, created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z', categories: { nombre: 'Ropa' } },
  { id: 'p3', business_id: DEMO_BUSINESS_ID, tipo: 'producto', nombre: 'Gorra Snapback', descripcion: 'Logo bordado, ajustable', precio: 14_990, moneda: 'CLP', categoria_id: 'cat2', imagenes: [], stock: 65, activo: true, created_at: '2025-02-05T00:00:00Z', updated_at: '2025-02-05T00:00:00Z', categories: { nombre: 'Accesorios' } },
  { id: 'p4', business_id: DEMO_BUSINESS_ID, tipo: 'producto', nombre: 'Zapatillas Urban Run', descripcion: 'Suela amortiguada, tallas 38-44', precio: 79_990, moneda: 'CLP', categoria_id: 'cat3', imagenes: [], stock: 14, stock_alert_threshold: 5, activo: true, created_at: '2025-02-10T00:00:00Z', updated_at: '2025-02-10T00:00:00Z', categories: { nombre: 'Calzado' } },
  { id: 'p5', business_id: DEMO_BUSINESS_ID, tipo: 'servicio', nombre: 'Asesoría de Imagen', descripcion: 'Sesión 60 min con personal shopper', precio: 39_990, moneda: 'CLP', imagenes: [], duracion_minutos: 60, activo: true, created_at: '2025-03-01T00:00:00Z', updated_at: '2025-03-01T00:00:00Z' },
  { id: 'p6', business_id: DEMO_BUSINESS_ID, tipo: 'producto', nombre: 'Bolso Tote Canvas', descripcion: 'Lona resistente, varios diseños', precio: 19_990, moneda: 'CLP', categoria_id: 'cat2', imagenes: [], stock: 33, activo: true, created_at: '2025-03-05T00:00:00Z', updated_at: '2025-03-05T00:00:00Z', categories: { nombre: 'Accesorios' } },
]

// ─── Staff ───

export const DEMO_STAFF: Staff[] = [
  { id: 's1', business_id: DEMO_BUSINESS_ID, nombre: 'Ana González', rol: 'Agente de ventas', activo: true, created_at: '2025-01-20T00:00:00Z' },
  { id: 's2', business_id: DEMO_BUSINESS_ID, nombre: 'Carlos Muñoz', rol: 'Soporte', activo: true, created_at: '2025-02-01T00:00:00Z' },
  { id: 's3', business_id: DEMO_BUSINESS_ID, nombre: 'María Fuentes', rol: 'Encargada bodega', activo: false, created_at: '2025-03-10T00:00:00Z' },
]

// ─── Ventas (Reportes) ───

function makeDate(daysAgo: number): string {
  const d = new Date('2025-06-21T12:00:00Z')
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

export const DEMO_VENTAS: Sale[] = [
  { id: 'v1',  business_id: DEMO_BUSINESS_ID, conversation_id: 'conv1', client_phone: '+56912345001', client_name: 'Valentina Torres',  amount: 289_990, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(1)  },
  { id: 'v2',  business_id: DEMO_BUSINESS_ID, conversation_id: 'conv2', client_phone: '+56912345002', client_name: 'Sebastián Mora',    amount:  89_990, currency: 'CLP', source: 'human',  status: 'completed', created_at: makeDate(2)  },
  { id: 'v3',  business_id: DEMO_BUSINESS_ID, conversation_id: 'conv3', client_phone: '+56912345003', client_name: 'Camila Reyes',      amount: 459_800, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(2)  },
  { id: 'v4',  business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345006', client_name: 'Matías Herrera',    amount: 312_000, currency: 'CLP', source: 'manual', status: 'completed', created_at: makeDate(4)  },
  { id: 'v5',  business_id: DEMO_BUSINESS_ID, conversation_id: 'conv5', client_phone: '+56912345005', client_name: 'Isidora Vega',     amount: 134_900, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(5)  },
  { id: 'v6',  business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345008', client_name: 'Javier Romero',    amount:  67_500, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(7)  },
  { id: 'v7',  business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345001', client_name: 'Valentina Torres', amount: 149_990, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(9)  },
  { id: 'v8',  business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345003', client_name: 'Camila Reyes',     amount: 199_900, currency: 'CLP', source: 'human',  status: 'completed', created_at: makeDate(12) },
  { id: 'v9',  business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345007', client_name: 'Sofía Contreras',  amount:  24_990, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(15) },
  { id: 'v10', business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345002', client_name: 'Sebastián Mora',   amount:  79_990, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(18) },
  { id: 'v11', business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345004', client_name: 'Diego Navarro',    amount:  24_990, currency: 'CLP', source: 'manual', status: 'completed', created_at: makeDate(22) },
  { id: 'v12', business_id: DEMO_BUSINESS_ID, conversation_id: null,    client_phone: '+56912345006', client_name: 'Matías Herrera',   amount: 249_900, currency: 'CLP', source: 'ai',     status: 'completed', created_at: makeDate(28) },
]

// ─── Plantillas de Respuesta ───

export const DEMO_PLANTILLAS: PlantillaRespuesta[] = [
  { id: 'pt1', business_id: DEMO_BUSINESS_ID, trigger_keywords: ['precio', 'costo', 'cuánto vale'], mensaje_template: 'Hola! Te comparto nuestro catálogo de precios actualizado. ¿Te interesa algo en particular?', category: 'ventas', usage_count: 42, created_at: '2025-02-01T00:00:00Z' },
  { id: 'pt2', business_id: DEMO_BUSINESS_ID, trigger_keywords: ['despacho', 'envío', 'delivery'], mensaje_template: 'Hacemos envíos a todo Chile. Despacho gratis sobre $50.000. Llega en 3-5 días hábiles.', category: 'logística', usage_count: 28, created_at: '2025-02-05T00:00:00Z' },
  { id: 'pt3', business_id: DEMO_BUSINESS_ID, trigger_keywords: ['devolución', 'cambio', 'devolver'], mensaje_template: 'Aceptamos devoluciones hasta 15 días desde la compra. El producto debe estar sin uso y con etiquetas.', category: 'soporte', usage_count: 15, created_at: '2025-02-10T00:00:00Z' },
  { id: 'pt4', business_id: DEMO_BUSINESS_ID, trigger_keywords: ['horario', 'abren', 'atienden'], mensaje_template: 'Atendemos de lunes a viernes de 9:00 a 18:00 hrs. Por WhatsApp respondemos 24/7 con LEVI.', category: 'info', usage_count: 33, created_at: '2025-03-01T00:00:00Z' },
]

// ─── Tickets Soporte ───

export const DEMO_TICKETS: SupportTicket[] = [
  { id: 't1', business_id: DEMO_BUSINESS_ID, user_id: null, subject: 'Cómo conectar mi WhatsApp Business', message: 'Necesito ayuda para conectar mi número de WhatsApp al sistema.', status: 'in_progress', priority: 'high', ai_suggested_response: 'Para conectar tu WhatsApp, ve a Configuración > WhatsApp QR y escanea el código con tu teléfono.', admin_response: null, resolved_at: null, created_at: '2025-06-20T10:00:00Z', updated_at: '2025-06-20T14:00:00Z' },
  { id: 't2', business_id: DEMO_BUSINESS_ID, user_id: null, subject: 'No aparecen mis productos en el bot', message: 'Agregué productos pero LEVI no los menciona en las conversaciones.', status: 'open', priority: 'normal', ai_suggested_response: null, admin_response: null, resolved_at: null, created_at: '2025-06-21T09:00:00Z', updated_at: '2025-06-21T09:00:00Z' },
  { id: 't3', business_id: DEMO_BUSINESS_ID, user_id: null, subject: 'Consulta sobre facturación Pro', message: '¿Puedo pagar con transferencia bancaria en lugar de tarjeta?', status: 'resolved', priority: 'low', ai_suggested_response: null, admin_response: 'Por ahora solo aceptamos tarjetas vía Stripe. Estamos trabajando en más métodos de pago.', resolved_at: '2025-06-19T16:00:00Z', created_at: '2025-06-18T11:00:00Z', updated_at: '2025-06-19T16:00:00Z' },
]
