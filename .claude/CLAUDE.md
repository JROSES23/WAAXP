# WAAXP — Sistema de Contexto para Claude Code
> **LEER ESTO PRIMERO. SIEMPRE. ANTES DE ESCRIBIR UNA SOLA LÍNEA DE CÓDIGO.**
> Este archivo es la fuente de verdad del proyecto. Si algo aquí contradice una instrucción del chat, pregunta antes de asumir.

---

## 0. PROTOCOLO DE INICIO OBLIGATORIO

Cada vez que inicies una sesión o recibas una tarea:

1. **Lee este archivo completo**
2. **Lee `.claude/brand.md`** — restricciones visuales no negociables
3. **Lee `.claude/stack.md`** — decisiones técnicas del proyecto
4. **Lee `.claude/tasks/CURRENT.md`** si existe — estado actual de trabajo
5. **Solo entonces empieza a escribir código**

Si no hay `CURRENT.md`, pide al usuario que te diga en qué están trabajando.

---

## 1. QUÉ ES WAAXP

**WAAXP** es una plataforma SaaS de automatización de atención al cliente vía WhatsApp, orientada a PYMEs chilenas.

- Permite a negocios conectar su WhatsApp Business y automatizar respuestas con IA
- El bot responde consultas, agenda citas, gestiona pedidos y deriva a humanos cuando es necesario
- El dashboard permite a los dueños ver conversaciones, métricas, clientes y configurar el bot
- Monetización vía suscripción mensual (Stripe)

**Nombre oficial y definitivo:** WAAXP (no Operly, no Hilevi, no vendia-dashboard — esos son nombres anteriores del mismo proyecto)

---

## 2. MENTALIDAD DE ESCALABILIDAD

**Este proyecto está pensado para escalar. Siempre escribe código como si:**
- Hubiera 10,000 usuarios activos mañana
- Otro developer (no tú) tuviera que leer y mantener el código en 3 meses
- Fuera a salir en producción en 48 horas

Esto significa:
- **Cero hacks temporales** — si no se puede hacer bien ahora, documenta el TODO claramente
- **Cero `any` en TypeScript** — tipado estricto siempre
- **Cero hardcoding** — variables de entorno, constantes en archivos dedicados
- **Manejo de errores explícito** — nunca swallow silencioso de errores
- **Componentes desacoplados** — lógica separada de presentación
- **Server Components por defecto** — Client Components solo cuando hay interactividad real

---

## 3. STACK TÉCNICO

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | Next.js 15 App Router | RSC por defecto, Client solo cuando necesario |
| Lenguaje | TypeScript 5 strict | Sin `any`, sin `@ts-ignore` sin justificación |
| Estilos | Tailwind CSS 3 + shadcn/ui | Override visual siempre — nunca shadcn default |
| Animaciones | Framer Motion 12 | Easing curves personalizados, no ease-in-out |
| Auth | Supabase Auth + `@supabase/ssr` | Sin middleware — ver sección 6 |
| DB | Supabase (PostgreSQL) | RLS habilitado en todas las tablas |
| Pagos | Stripe | Checkout + webhooks |
| IA | Google Gemini API | Bot de respuestas automáticas |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) | Corre en proceso Node separado (`npm run bot`) |
| Deploy | Vercel | Solo Next.js — el bot NO se deploya en Vercel |
| Íconos | Lucide React | `strokeWidth={1.5}` siempre, sin emojis |
| Fuentes | Bricolage Grotesque + DM Sans | Solo estas dos, nunca Inter ni system-ui |

---

## 4. BRAND — RESTRICCIONES NO NEGOCIABLES

> Detalle completo en `.claude/brand.md`. Resumen ejecutivo:

- **Acento:** `#0ABAB5` (turquesa) — el único color de acento
- **Fondos:** `#08090f` o `#080c14` — negro frío, nunca negro puro
- **Tipografía:** Bricolage Grotesque (display/headlines) + DM Sans (UI/body)
- **Íconos:** Lucide con `strokeWidth={1.5}` únicamente
- **Emojis:** PROHIBIDOS en toda la UI — cero excepciones
- **Copy:** Español chileno, placeholders con nombres/datos chilenos reales
- **Gradientes:** Solo si hay justificación de diseño — nunca purple-to-pink genérico

---

## 5. ARQUITECTURA DE AUTH (SIN MIDDLEWARE)

**El middleware fue eliminado.** Causa `MIDDLEWARE_INVOCATION_FAILED` en Vercel con Edge Runtime por conflicto con dependencias Node-only (`@whiskeysockets/baileys`).

### La solución correcta: auth-guard en Server Components

```
src/lib/supabase/
├── server.ts          ← createServerClient (cookies)
├── client.ts          ← createBrowserClient
└── auth-guard.ts      ← requireAuth() y requireSuperAdmin()
```

**`requireAuth()`** — llamar al inicio de cada layout/page protegida:
```typescript
// Redirige a /login?redirect=/ruta-actual si no hay sesión
const user = await requireAuth()
```

**Rutas protegidas** (requieren `requireAuth()`):
- `app/dashboard/layout.tsx`
- `app/onboarding/page.tsx`  
- `app/admin/layout.tsx` (también `requireSuperAdmin()`)

**Rutas públicas** (sin protección):
- `/` — landing
- `/login` — pero redirige a `/dashboard` si ya autenticado
- `/register`
- `/blog` y `/blog/[slug]`
- `/auth/callback`
- `/api/*` — protección propia en cada route handler

---

## 6. ESTRUCTURA DE ARCHIVOS

```
waaxp/
├── .claude/
│   ├── CLAUDE.md          ← ESTE ARCHIVO
│   ├── brand.md           ← sistema visual completo
│   ├── stack.md           ← decisiones técnicas detalladas
│   └── tasks/
│       ├── CURRENT.md     ← tarea activa (actualizar al terminar)
│       ├── 001-done.md
│       └── 002-done.md
├── app/                   ← Next.js App Router
│   ├── (public)/          ← rutas sin auth
│   ├── dashboard/         ← rutas protegidas
│   ├── admin/             ← superadmin only
│   └── api/               ← route handlers
├── components/
│   ├── ui/                ← shadcn/ui base
│   └── [feature]/         ← componentes por feature
├── src/lib/
│   ├── supabase/          ← clientes y auth-guard
│   ├── stripe/            ← helpers de pagos
│   └── gemini/            ← cliente de IA
├── bot/                   ← proceso Node separado (Baileys)
│   └── index.js           ← NO importar desde Next.js nunca
├── next.config.ts
└── middleware.ts          ← NO EXISTE — eliminado intencionalmente
```

---

## 7. REGLAS DE CÓDIGO

### TypeScript
- Strict mode siempre activado
- Tipos explícitos en parámetros de función y retornos
- `interface` para objetos de dominio, `type` para uniones/utilidades
- Sin `any` — si no sabes el tipo, usa `unknown` y narrowing

### Componentes
- Server Component por defecto
- `'use client'` solo si: hooks de estado, eventos del browser, librerías client-only
- Props tipadas con interface dedicada
- Un componente = una responsabilidad

### Naming
- Componentes: PascalCase
- Funciones/hooks: camelCase
- Archivos de componentes: kebab-case
- Constantes globales: SCREAMING_SNAKE_CASE
- Tipos/interfaces: PascalCase con sufijo descriptivo (`UserProfile`, `DashboardProps`)

### Errores
- Try/catch explícito en todas las llamadas a APIs externas
- Logging descriptivo: `console.error('[módulo] descripción:', error)`
- Nunca swallow silencioso de errores
- User-facing errors en español chileno

### Supabase
- RLS activo en todas las tablas de datos de usuario
- Nunca usar `supabase.auth.getSession()` en Server Components — usar `getUser()`
- Service role key solo en route handlers server-side, nunca en client

---

## 8. FLUJO DE TRABAJO CON TAREAS

Cuando recibas una tarea nueva:

1. **Crea `.claude/tasks/CURRENT.md`** con:
   - Descripción de la tarea
   - Archivos que vas a modificar
   - Plan de implementación (pasos numerados)
   - Criterios de éxito

2. **Implementa paso a paso** — un commit lógico por paso si es posible

3. **Al terminar:**
   - Renombra `CURRENT.md` a `NNN-done.md` (siguiente número)
   - Resume qué se hizo y qué quedó pendiente

---

## 9. COMANDOS ÚTILES

```bash
npm run dev          # Next.js en localhost:3000
npm run bot          # Bot de WhatsApp (proceso separado)
npm run dev:all      # Ambos en paralelo (concurrently)
npm run build        # Build de producción — verificar antes de push
git add . && git commit -m "tipo: descripción" && git push origin main
```

### Convención de commits
```
feat: nueva funcionalidad
fix: corrección de bug
refactor: reestructuración sin cambio de comportamiento
style: cambios visuales/CSS
docs: documentación
chore: configuración, dependencias
```

---

## 10. LO QUE NUNCA DEBES HACER

- **Nunca** crear o modificar `middleware.ts` — está eliminado intencionalmente
- **Nunca** importar desde `bot/` en código de Next.js
- **Nunca** usar `@supabase/auth-ui-react` — UI de auth es custom
- **Nunca** hardcodear URLs, keys o credenciales
- **Nunca** usar `getSession()` en Server Components
- **Nunca** hacer `npm install` sin confirmar con el usuario si agrega dependencias pesadas
- **Nunca** usar emojis en la UI
- **Nunca** usar fuentes distintas a Bricolage Grotesque y DM Sans
- **Nunca** dejar `console.log` de debug en producción
- **Nunca** ignorar errores de TypeScript con `@ts-ignore` sin comentario explicativo

---

*Última actualización: Marzo 2026 — Sistema multi-agente activo*
