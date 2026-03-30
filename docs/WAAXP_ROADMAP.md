# WAAXP — Roadmap

> Actualizar cada vez que se completa o agrega un item.
> Última actualización: 2026-03-29

---

## ✅ Completado

### Core Auth
- [x] Magic link login con Supabase
- [x] `/auth/callback` — exchangeCodeForSession
- [x] Middleware Edge con refresh token y guards de ruta
- [x] `getAuthContext()` con `getSession()` (fix race condition)
- [x] RBAC: roles `owner` / `agent`, permisos por sección

### Dashboard Base
- [x] Layout con DashboardBottomNav (glassmorphism, floating)
- [x] Sidebar colapsable (64px → 240px, hover spring)
- [x] KPIs con Recharts (ventas, conversaciones, automatización)
- [x] Demo data fallback para usuarios sin negocio
- [x] Dark/light toggle

### Módulos
- [x] Inbox — conversaciones WhatsApp con LEVI
- [x] Clientes — CRM básico
- [x] Productos — catálogo con categorías
- [x] Reportes — analytics y ventas
- [x] Configuración IA — tono, prompt, plantillas
- [x] WhatsApp QR — conectar WhatsApp Business
- [x] Equipo — gestión de staff y permisos
- [x] Billing — planes y facturación
- [x] Soporte — tickets internos
- [x] Perfil — datos del usuario

### Infraestructura
- [x] `React.cache()` en `getAuthContext()` — deduplicación
- [x] Feature flags system (`/lib/feature-flags.ts`)
- [x] Onboarding wizard — Primeros Pasos con modo Reservas / Productos
- [x] Panel de Reservas — 3 vistas (Lista / Grid / Calor)
- [x] Panel en Vivo — fullscreen para atención en persona
- [x] Branding WAAXPTEAM para agentes

---

## 🚧 En Progreso

*(nada actualmente)*

---

## 📋 Próximo Sprint

### Reservas v1
- [ ] Página pública de reservas para clientes (`/r/[slug]`) — `feature_flag: reservas_publicas`
- [ ] Notificaciones WhatsApp al cliente cuando se confirma/cancela
- [ ] Recordatorio automático 24h antes via LEVI
- [ ] Integración pago anticipado via pasarela (Stripe / Transbank)

### Panel en Vivo v2 — `feature_flag: live_panel_v2`
- [ ] Realtime updates con Supabase Realtime
- [ ] Modo oscuro extremo para tablet (brillo reducido)
- [ ] Estadísticas del día al cerrar (resumen diario)

### Staff Goals — `feature_flag: staff_goals`
- [ ] Sistema de metas mensuales por profesional
- [ ] Leaderboard semanal
- [ ] Recompensas y reconocimientos

---

## 🗂 Backlog

### Multi-Location — `feature_flag: multi_location`
- [ ] Soporte para múltiples sucursales bajo una cuenta
- [ ] Panel unificado de todas las sedes
- [ ] Transferencia de clientes entre sedes

### Landing Page Rediseño
- [ ] Glassmorphism / liquid glass (inspiración Pinterest)
- [ ] Secciones con backdrop-blur glass cards

### Mejoras LEVI
- [ ] Soporte multiidioma (español / inglés)
- [ ] Modo proactivo: LEVI inicia conversación en fechas clave
- [ ] Memoria de cliente: LEVI recuerda preferencias entre sesiones

### Integraciones
- [ ] Google Calendar sync para reservas
- [ ] Mercado Pago como pasarela adicional
- [ ] Exportación de reportes a Excel/PDF

### Admin (Superadmin)
- [ ] God Mode — vista de todos los negocios
- [ ] DevOps Bot — chat IA para operaciones
- [ ] Métricas globales de la plataforma

---

## 🐛 Bugs Conocidos / Historial de Fixes

| Fecha | Bug | Fix |
|-------|-----|-----|
| 2026-03 | Redirect loop a /login en cada navegación | `getAuthContext()` usa `getSession()` en vez de `getUser()` |
| 2026-03 | "Operly" → renombrado a "WAAXP" | Búsqueda global y reemplazo |
| 2026-02 | `ChunkLoadError` en producción | `.next` cache cleared + middleware reescrito |
| 2026-02 | `MIDDLEWARE_INVOCATION_FAILED` en Vercel | try/catch en middleware + `export default` en next.config.ts |
| 2026-01 | `refresh_token_already_used` en race condition | Singleton browser client + fallback a getSession |

---

## Decisiones de Arquitectura

| Decisión | Razonamiento |
|----------|-------------|
| `getSession()` en Server Components, `getUser()` solo en middleware | Evita race condition con refresh token |
| `React.cache()` en `getAuthContext()` | Deduplicar llamadas entre layout y page en mismo render |
| `force-dynamic` en todas las pages del dashboard | Datos siempre frescos, auth siempre verificado |
| `createBrowserClient` singleton en client.ts | Evita múltiples instancias compitiendo por refresh token |
| Tabla `reservas` separada de `appointments` | Appointments es legacy; reservas tiene campos de pago y recursos |
| Feature flags en Supabase | Activación por negocio sin redeploy |
