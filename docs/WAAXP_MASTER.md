# WAAXP — Documentación Maestra

> **Leer al inicio de cada conversación de desarrollo.**
> Actualizar cuando se agreguen tablas, rutas, dependencias o cambios arquitecturales.

---

## ¿Qué es WAAXP?

SaaS de agente IA para WhatsApp Business. Los negocios conectan su WhatsApp, configuran **LEVI** (bot IA) y automatizan ventas, soporte y reservas.

- **Repo:** https://github.com/JROSES23/WAAXP.git
- **Deploy:** https://waaxp.vercel.app (Vercel)
- **Marca staff:** WAAXP**TEAM** (agentes ven esta variante en la UI)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router |
| Auth + DB | Supabase (SSR via `@supabase/ssr ^0.8.0`) |
| Estilos | Tailwind CSS v3 |
| Animaciones | Framer Motion v12 |
| Gráficos | Recharts v3 |
| Tipografía | Bricolage Grotesque (display) · DM Sans (UI) · DM Mono (mono) |
| Toasts | Sonner |
| Componentes headless | Radix UI (Popover, Tooltip, Dialog, etc.) |
| Iconos | Lucide React |
| Pagos | Stripe |
| Runtime deploy | Vercel (Edge Middleware + Serverless Functions) |

---

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=          # o GEMINI_API_KEY — para FloatingAssistant
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Estructura de Directorios

```
vendia-dashboard/
├── app/
│   ├── layout.tsx                   # Root layout — Providers (next-themes + AccentContext + ModalStoreProvider)
│   ├── page.tsx                     # Landing page
│   ├── globals.css                  # Variables CSS, tokens de color
│   ├── login/page.tsx
│   ├── auth/callback/route.ts       # OAuth callback — exchangeCodeForSession
│   ├── onboarding/
│   │   ├── page.tsx                 # Server: verifica auth, redirige si ya tiene negocio
│   │   └── OnboardingClient.tsx     # Wizard primeros pasos: modo principal + recursos
│   ├── blog/
│   └── dashboard/
│       ├── layout.tsx               # Shell: DashboardBottomNav + FloatingAssistant + banner demo
│       ├── page.tsx                 # Dashboard principal (KPIs + gráficos Recharts)
│       ├── inbox/                   # Conversaciones WhatsApp con LEVI
│       ├── clientes/                # CRM básico
│       ├── productos/               # Catálogo de productos/servicios
│       ├── reportes/                # Analytics y ventas
│       ├── reservas/                # Panel de reservas (3 vistas: lista/grid/calor)
│       ├── panel-en-vivo/           # Panel fullscreen para atención en persona
│       ├── configuracion/           # Config LEVI (tono, prompt, plantillas)
│       ├── whatsapp/                # QR para conectar WhatsApp
│       ├── equipo/                  # Team management
│       ├── billing/                 # Plan y facturación
│       ├── soporte/                 # Tickets de soporte
│       ├── perfil/                  # Perfil de usuario
│       ├── types.ts                 # Todos los tipos del dashboard
│       └── lib/
│           ├── data.ts              # Queries Supabase (Server Components)
│           └── demo-data.ts         # Datos demo para modo sin negocio
├── components/
│   ├── providers/theme-provider.tsx # Providers: next-themes + AccentContext + ModalStoreProvider
│   ├── DashboardBottomNav.tsx       # Nav flotante bottom (mobile-first, glassmorphism)
│   ├── assistant/FloatingAssistant.tsx
│   ├── Logo.tsx
│   └── ui/                          # Badge, Button, Card
├── src/
│   ├── components/Sidebar.tsx       # Sidebar colapsable (64px → 240px hover)
│   ├── lib/
│   │   ├── auth.ts                  # getAuthContext() — usa getSession() (NO getUser() aquí)
│   │   ├── feature-flags.ts         # Sistema de feature flags por negocio
│   │   └── supabase/
│   │       ├── server.ts            # createClient() para Server Components
│   │       ├── client.ts            # createBrowserClient() singleton
│   │       └── middleware.ts        # legacy
│   └── types/index.ts
├── lib/
│   ├── feature-flags.ts             # Feature flags (ver /src/lib/feature-flags.ts)
│   └── modal-store.tsx              # Context global para estado de modales
├── middleware.ts                    # Edge middleware — refresh token + guards de ruta
├── docs/
│   ├── WAAXP_MASTER.md             # Este archivo
│   └── WAAXP_ROADMAP.md            # Roadmap y estado de features
└── next.config.ts
```

---

## Auth Flow

```
1. Usuario ingresa email en /login → Supabase envía magic link
2. /auth/callback?code=... → exchangeCodeForSession → Set-Cookie → redirect /dashboard
3. middleware.ts corre en CADA request (Edge Runtime):
   - Llama supabase.auth.getUser() ← ÚNICA llamada de red al servidor Supabase Auth
   - Si token expirado: rota el refresh token, escribe cookies nuevas en response
   - Si !user: redirect /login para rutas protegidas
4. Server Components llaman getAuthContext():
   - Usa getSession() (lectura local del JWT) — NO getUser()
   - Si !session: redirect /login
   - Si !businessId: modo DEMO (demo-data.ts)
```

> **REGLA CRÍTICA:** `getUser()` solo en `middleware.ts`. Los Server Components usan `getSession()`.
> Mezclar ambos en el mismo ciclo de request causa `refresh_token_already_used` → redirect falso a /login.

---

## Patrón Demo Data (Obligatorio en todas las pages del dashboard)

```tsx
const auth = await getAuthContext()
if (!auth) redirect('/login')

if (!auth.businessId) {
  return <PageClient datos={DEMO_DATOS} isDemo />
}
// fetch real data...
```

---

## Tablas Supabase

### Existentes

| Tabla | Descripción |
|-------|-------------|
| `businesses` | Negocios. Campos clave: `supabase_user_id`, `nombre`, `vertical_principal`, `modos_activos`, `plan`, `modo_principal` |
| `user_roles` | Roles por negocio: `owner` \| `agent` |
| `user_permissions` | Permisos por sección por rol |
| `user_profiles` | Perfil visual: display_name, avatar |
| `products` | Productos y servicios del catálogo |
| `categories` | Categorías de productos |
| `staff` | Equipo del negocio |
| `conversations` | Conversaciones WhatsApp |
| `messages` | Mensajes individuales |
| `appointments` | Citas (tabla legacy, migrar a `reservas`) |
| `orders` | Pedidos |
| `sales` | Ventas completadas |
| `response_templates` | Plantillas de respuesta LEVI |
| `support_tickets` | Tickets de soporte interno |
| `clients` | CRM — clientes |

### Nuevas (creadas en esta versión)

```sql
-- Recursos de reserva (sillas, mesas, profesionales, etc.)
CREATE TABLE resources (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('silla','mesa','profesional','cabina','sala','custom')),
  icono         TEXT,
  color         TEXT,
  activo        BOOLEAN DEFAULT TRUE,
  orden         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_resources_business ON resources(business_id);

-- Reservas (nueva tabla, reemplaza appointments a futuro)
CREATE TABLE reservas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  recurso_id      UUID REFERENCES resources(id) ON DELETE SET NULL,
  cliente_nombre  TEXT NOT NULL,
  cliente_phone   TEXT,
  servicio        TEXT,
  inicio          TIMESTAMPTZ NOT NULL,
  fin             TIMESTAMPTZ NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'programada'
                  CHECK (estado IN ('programada','confirmada','en_curso','completada','cancelada','no_asiste')),
  metodo_pago     TEXT DEFAULT 'pendiente'
                  CHECK (metodo_pago IN ('efectivo','transferencia','tarjeta','pagado_wsp','pendiente')),
  estado_pago     TEXT DEFAULT 'pendiente'
                  CHECK (estado_pago IN ('pendiente','anticipo','pagado','gratis')),
  monto           INTEGER DEFAULT 0,  -- en centavos CLP
  monto_anticipo  INTEGER DEFAULT 0,
  notas           TEXT,
  es_walk_in      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reservas_business ON reservas(business_id);
CREATE INDEX idx_reservas_recurso ON reservas(recurso_id);
CREATE INDEX idx_reservas_inicio ON reservas(inicio);

-- Feature flags por negocio
CREATE TABLE feature_flags (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  feature_key  TEXT NOT NULL,
  enabled      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, feature_key)
);

-- Agregar campo modo_principal a businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS modo_principal TEXT
  CHECK (modo_principal IN ('reservas','productos','hibrido'));
```

---

## Modos de Negocio

| Modo | `modo_principal` | `modos_activos` incluye | Panel principal |
|------|-----------------|------------------------|-----------------|
| Reservas | `'reservas'` | `'reservas'` | `/dashboard/reservas` |
| Productos | `'productos'` | `'productos', 'ventas'` | `/dashboard` (KPIs) |
| Híbrido | `'hibrido'` | todos | `/dashboard` |

---

## Feature Flags

| Key | Default | Descripción |
|-----|---------|-------------|
| `live_panel_v2` | `false` | Segunda versión del panel en vivo |
| `staff_goals` | `false` | Sistema de metas y recompensas para staff |
| `multi_location` | `false` | Soporte para múltiples sucursales |
| `reservas_publicas` | `false` | Página pública de reservas para clientes |

---

## Diseño y Branding

- **Acento:** `#0ABAB5` teal (`var(--accent)`)
- **Fondo:** dark por default (`class="dark"`)
- **Fuentes:** Bricolage Grotesque · DM Sans · DM Mono
- **Sidebar:** colapsado 64px → 240px al hover (Framer Motion spring)
- **Branding staff (agentes):** `WAAXP`**`TEAM`** — "TEAM" en DM Sans regular, más pequeño, color `var(--accent)`
- **Branding owner:** `WAAXP` solo
- **NO** hay color picker en sidebar — solo toggle dark/light

---

## Convenciones de Código

1. Server Components por defecto — `'use client'` solo para estado local o Realtime
2. Comentarios en **español** en todo código nuevo
3. Nombres de archivos: `kebab-case` — Componentes: `PascalCase`
4. Funciones Supabase siempre con manejo de errores explícito
5. Sin `any` en TypeScript
6. Exports nombrados en utilities — default exports en páginas y componentes
7. `export const dynamic = 'force-dynamic'` en todas las pages del dashboard
8. Demo data fallback obligatorio cuando `!auth.businessId`

---

## Rutas Protegidas

```
/dashboard/**     → requiere auth
/onboarding       → requiere auth, redirige si ya tiene businessId
/admin/**         → requiere is_superadmin
```

---

## Permisos por Sección

| Sección | Permission key |
|---------|---------------|
| Dashboard | `dashboard` |
| Inbox | `inbox` |
| Clientes | `clientes` |
| Productos | `productos` |
| Reportes | `reportes` |
| Equipo | `equipo` |
| Config IA | `configuracion_ia` |
| WhatsApp QR | `whatsapp_qr` |
| Billing | `billing` |
| Reservas | `reservas` (nueva) |
