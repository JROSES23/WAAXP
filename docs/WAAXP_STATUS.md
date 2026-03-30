# WAAXP — Estado del Proyecto
> Documento vivo. Se actualiza al completar cada ítem.
> Última actualización: 2026-03-29

---

## Resumen Ejecutivo

| Módulo | Estado | Prioridad |
|--------|--------|-----------|
| Auth & sesión | ✅ Listo | — |
| Onboarding wizard | ✅ Listo | — |
| Dashboard / KPIs | ✅ Listo | — |
| Inbox (conversaciones) | ✅ Listo | — |
| Clientes (CRM básico) | ✅ Listo | — |
| Productos & categorías | ✅ Listo | — |
| Reservas — panel 3 vistas | ✅ Listo | — |
| Panel en vivo (fullscreen) | ✅ Listo | — |
| WAAXPTEAM branding | ✅ Listo | — |
| Feature flags | ✅ Listo | — |
| Reportes | 🟡 Parcial | Alta |
| Configuración IA | 🟡 Parcial | Alta |
| WhatsApp QR / conexión | 🟡 Parcial | Alta |
| Billing / Stripe | 🟡 Parcial | Media |
| Equipo / RBAC | 🟡 Parcial | Media |
| Notificaciones realtime | ❌ Pendiente | Alta |
| Página pública de reservas | ❌ Pendiente | Media |
| Bot LEVI integrado | ❌ Pendiente | Alta |
| PWA / offline | ❌ Pendiente | Baja |

---

## FASE 1 — Base funcional ✅ COMPLETA

### Infraestructura
- [x] Next.js 15 App Router + TypeScript
- [x] Supabase SSR (`@supabase/ssr ^0.8.0`)
- [x] Auth flow: login → dashboard → onboarding (si no tiene negocio)
- [x] Fix auth race condition: `getUser()` → `getSession()` en server components
- [x] Middleware con guard comments (solo llama `getUser()` una vez)
- [x] `getAuthContext()` con `React.cache()` para deduplicación
- [x] `export const dynamic = 'force-dynamic'` en todas las páginas del dashboard
- [x] Variables CSS de diseño (`--bg-base`, `--accent`, `--text-primary`, etc.)
- [x] DM Sans + Bricolage Grotesque + DM Mono (Google Fonts)
- [x] Dark/light mode con `next-themes`
- [x] 6 colores de acento (teal, violet, coral, amber, emerald, rose)

### Tipos y datos
- [x] `app/dashboard/types.ts` — todos los tipos del sistema
- [x] `app/dashboard/lib/data.ts` — queries Supabase
- [x] `app/dashboard/lib/demo-data.ts` — datos demo para sin negocio
- [x] `lib/feature-flags.ts` — sistema de flags por negocio

### UI base
- [x] `DashboardBottomNav` — dock flotante con glassmorphism, tooltips, popover usuario
- [x] `FloatingAssistant` — botón flotante para asistente IA
- [x] Providers (tema, acento, modal store)

---

## FASE 2 — Core del negocio ✅ COMPLETA

### Onboarding
- [x] Wizard 5 pasos con Framer Motion (`AnimatePresence` + directional slides)
- [x] Paso 0: Bienvenida WAAXPSTORE
- [x] Paso 1: Selección de modo (Reservas / Productos)
- [x] Paso 2: Detalles del negocio (nombre, teléfono, vertical)
- [x] Paso 3 (Reservas): Configurador de recursos (nombre, tipo con iconos, delete)
- [x] Paso 4: Done → redirect a `/dashboard`
- [x] Crea: `businesses` + `user_roles` + `resources` en Supabase

### Dashboard principal
- [x] KPIs: ventas totales, recuperadas IA, % automático, pendientes humanos
- [x] Gráfico ventas 7 días (recharts)
- [x] Gráfico conversaciones 7 días
- [x] Conversaciones chats IA vs humano
- [x] Demo data automático cuando no hay negocio

### Inbox
- [x] Lista de conversaciones con estado y última actividad
- [x] Vista de mensajes por conversación
- [x] Badge de pendientes en nav

### Reservas — NUEVO
- [x] `app/dashboard/reservas/` — Server Component + Client
- [x] Vista Lista — agrupada por recurso, colapsable, con modal de acciones
- [x] Vista Grid — cards lado a lado, ícono por tipo de recurso
- [x] Vista Calor — bloques proporcionales al volumen mensual
- [x] Navegación por fecha (← hoy →)
- [x] Modal de acciones: cambiar estado (5 opciones) + registrar pago (4 métodos)
- [x] "Ya pagó por WhatsApp" (anticipo del bot)
- [x] Server actions: `actualizarEstadoReserva`, `registrarPagoReserva`, `crearWalkIn`
- [x] Optimistic updates locales en el cliente

### Panel en Vivo — NUEVO
- [x] `app/dashboard/panel-en-vivo/` — Server Component + Client
- [x] Reloj en tiempo real (actualiza cada segundo)
- [x] KPIs: en curso / próximas 1h / total hoy
- [x] Chips de próximas llegadas (siguiente hora)
- [x] Grid de tarjetas por recurso con "Ahora" + "Próxima" + lista del día
- [x] Toggle fullscreen nativo del navegador
- [x] Modal de acción rápida: estado (grid 5 botones) + registro pago (4 métodos)

### Branding WAAXPTEAM — NUEVO
- [x] Top bar para `role === 'agent'`: WAAXP (normal) + TEAM (teal itálico)
- [x] User popover: WAAXPTEAM en tipografía dual
- [x] Link "Reservas" en nav (condicional según `modos_activos`)

---

## FASE 3 — Comunicaciones 🟡 EN PROGRESO

### WhatsApp
- [x] Página QR de conexión (`/dashboard/whatsapp`)
- [x] Estado de conexión y reconexión
- [ ] **Reconexión automática cuando se desconecta**
- [ ] **Webhook listener para mensajes entrantes**
- [ ] **Sincronización de estado con la instancia del bot**

### Bot LEVI
- [ ] **Integración visible en el dashboard del estado del bot**
- [ ] **Logs de conversaciones IA en tiempo real**
- [ ] **Configuración de prompt desde UI** (campo `ai_prompt` ya existe)
- [ ] **Test de respuesta del bot desde el dashboard**

### Configuración IA
- [x] Editor de prompt (`ai_prompt`)
- [x] Selector de tono (`ai_tone`)
- [x] Configuración de seguimiento (`ai_followup_days`, `ai_discount_pct`)
- [ ] **Preview de cómo responderá el bot con esa configuración**
- [ ] **Plantillas de respuesta editables desde UI**

---

## FASE 4 — Monetización 🟡 PARCIAL

### Billing / Stripe
- [x] Página de facturación con plan actual
- [x] `stripe_customer_id`, `stripe_subscription_id` en `Negocio`
- [ ] **Flujo de upgrade de plan funcional**
- [ ] **Webhook de Stripe para actualizar `plan_expires_at`**
- [ ] **Portal de cliente Stripe (gestión tarjeta/cancelación)**
- [ ] **Tabla `plan_configs` con precios y límites por plan**

### Pasarela de pago para anticipos (reservas)
- [ ] **Selección de pasarela en onboarding (Mercado Pago / Stripe / Khipu)**
- [ ] **Configuración de credenciales por negocio**
- [ ] **El bot cobra el anticipo y registra `monto_anticipo` + `estado_pago: 'anticipo'`**

---

## FASE 5 — Escalabilidad ❌ PENDIENTE

### Notificaciones en tiempo real
- [ ] **Supabase Realtime en Inbox** — actualización sin refresh cuando llega mensaje
- [ ] **Supabase Realtime en Panel en Vivo** — actualización de estado de reservas
- [ ] **Notificaciones push (PWA) cuando hay pendientes humanos**
- [ ] **Badge de pendientes actualizado en tiempo real**

### Equipo / RBAC
- [x] Tipos: `UserRole`, `UserPermission`, `TeamInvitation`
- [x] Página de equipo (`/dashboard/equipo`)
- [ ] **Flujo completo de invitación por email**
- [ ] **Aceptar invitación con token**
- [ ] **Gestión de permisos por sección (toggle en UI)**
- [ ] **Agente solo ve sus propias reservas (filtro por staff_id)**

### Multi-ubicación
- [ ] **Feature flag `multi_location`** (ya definido, falta implementar)
- [ ] **Tabla `locations` y relación con `resources`**
- [ ] **Selector de sucursal en el panel en vivo**

---

## FASE 6 — Extras ❌ PENDIENTE

### Página pública de reservas
- [ ] **Feature flag `reservas_publicas`** (ya definido)
- [ ] **Ruta pública `/book/[businessSlug]`**
- [ ] **Formulario de reserva sin login**
- [ ] **Confirmación por WhatsApp al cliente**

### Reportes avanzados
- [x] Página de reportes básica
- [ ] **Reporte de ocupación por recurso**
- [ ] **Reporte de ingresos por método de pago**
- [ ] **Exportar a PDF / Excel**
- [ ] **Filtros por rango de fechas**

### PWA
- [ ] **`next-pwa` configurado** (dep ya instalada)
- [ ] **`manifest.json` con nombre/iconos**
- [ ] **Service worker para offline básico**
- [ ] **Prompt de instalación en móvil**

### Admin panel (superadmin)
- [x] Ruta `/admin` protegida por `isSuperAdmin`
- [ ] **Vista de todos los negocios y métricas globales**
- [ ] **Gestión de tickets de soporte**
- [ ] **Toggle de feature flags por negocio**

---

## Bugs conocidos / Deuda técnica

| # | Archivo | Descripción | Prioridad |
|---|---------|-------------|-----------|
| 1 | `configuracion/ConfiguracionClient.tsx` | `.catch` en PromiseLike — ✅ corregido 2026-03-29 | — |
| 2 | `whatsapp/WhatsAppClient.tsx` | `.catch` en PromiseLike — ✅ corregido 2026-03-29 | — |
| 3 | `onboarding/OnboardingClient.tsx` | Framer Motion `ease: number[]` — ✅ corregido 2026-03-29 | — |
| 4 | `ChunkLoadError` al inicio | Cache `.next` stale — ✅ resuelto limpiando cache | — |
| 5 | Reservas | Walk-in no tiene modal de creación completo (solo server action) | Media |
| 6 | Panel en vivo | Sin Realtime (necesita reload manual para actualizar) | Alta |
| 7 | RBAC agentes | Agentes ven todas las reservas, no solo las suyas | Media |

---

## SQL pendiente (ejecutar en Supabase)

```sql
-- Tabla de recursos (ya creada en WAAXP_MASTER.md)
-- Tabla de reservas (ya creada en WAAXP_MASTER.md)
-- Tabla de feature_flags (ya creada en WAAXP_MASTER.md)
-- ALTER businesses para modo_principal (ya en WAAXP_MASTER.md)

-- Índices recomendados para performance:
CREATE INDEX IF NOT EXISTS idx_reservas_business_inicio ON reservas(business_id, inicio);
CREATE INDEX IF NOT EXISTS idx_reservas_recurso ON reservas(recurso_id);
CREATE INDEX IF NOT EXISTS idx_resources_business ON resources(business_id, activo);
```

---

## Próximos pasos recomendados (orden de impacto)

1. **Realtime en Panel en Vivo** — máximo impacto en UX operacional
2. **Flujo de invitación de equipo** — necesario para que los agentes puedan ingresar
3. **Webhook Stripe** — necesario para activar/desactivar planes automáticamente
4. **Reconexión automática de WhatsApp** — estabilidad del bot
5. **Página pública de reservas** (`/book/[slug]`) — crecimiento orgánico
