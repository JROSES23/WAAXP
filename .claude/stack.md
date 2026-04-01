# WAAXP — Technical Stack & Decisions

## Core

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router) | `app/` directory, Server Components by default |
| Auth | **Supabase Auth** via `@supabase/ssr ^0.8.0` | No middleware — see Auth section |
| Database | **Supabase Postgres** | Row-level security enabled |
| Styling | **Tailwind CSS v4** + CSS custom properties | Dark theme only |
| Animation | **Framer Motion** | Client components only |
| Icons | **Lucide React** | |
| Language | **TypeScript** strict | `ignoreBuildErrors: true` in next.config.ts |

---

## Auth architecture (NO middleware)

**Rule:** There is NO `middleware.ts`. Do not create one.

Auth protection is done in **Server Component layouts and pages** via:

```typescript
import { requireAuth } from '@/lib/supabase/auth-guard'
await requireAuth() // redirects to /login if no session
```

`getAuthContext()` in `src/lib/auth.ts` uses `getUser()` (network call) — safe because there's no middleware competing for the refresh token.

**Why no middleware?** Vercel Edge Runtime + `@supabase/ssr` caused recurring `MIDDLEWARE_INVOCATION_FAILED` crashes. Eliminated permanently by moving auth to Server Components.

### Auth flow
1. User hits protected route → `requireAuth()` calls `supabase.auth.getUser()`
2. No session → redirect to `/login?redirect={pathname}`
3. Login succeeds → `router.push(redirect)` + `router.refresh()`
4. `getAuthContext()` (React.cache'd) fetches role, permissions, business, profile

### Key files
- `src/lib/supabase/auth-guard.ts` — `requireAuth()`, `requireSuperAdmin()`
- `src/lib/supabase/server.ts` — server-side Supabase client
- `src/lib/supabase/client.ts` — browser-side Supabase client
- `src/lib/auth.ts` — `getAuthContext()`, `hasPermission()`, `isOwnerOrAdmin()`
- `app/auth/callback/route.ts` — OAuth callback handler

---

## Supabase schema (key tables)

| Table | Purpose |
|---|---|
| `user_roles` | `user_id`, `business_id`, `role` (owner / agent) |
| `user_permissions` | `user_role_id`, `section`, `can_view` |
| `user_profiles` | `user_id`, `display_name`, `avatar_url` |
| `businesses` | `id`, `name`, `modos_activos`, `plan`, etc. |
| `conversations` | WhatsApp conversations linked to business |
| `recursos` | Bookable resources (canchas, mesas, salas) |
| `reservas` | Bookings linked to recursos |

### `modos_activos` (business feature flags)
JSON array of strings. Example: `["whatsapp", "reservas", "catalogo"]`

Check before showing feature: `auth.business?.modos_activos?.includes('reservas')`

---

## Roles & permissions

| Role | Access |
|---|---|
| `owner` | Full access to all sections |
| `agent` | Only sections listed in `user_permissions` (always includes `inbox`) |
| `null` (new user) | Full access (treated as owner until business set up) |
| superadmin | Everything, across all businesses |

Superadmin is set via `user.app_metadata.is_superadmin = true` (Supabase Auth Admin API).

---

## Server Actions

Located in `app/dashboard/[feature]/actions.ts`. Always call `revalidatePath` after mutations.

```typescript
'use server'
import { revalidatePath } from 'next/cache'
// ... mutation ...
revalidatePath('/dashboard/reservas')
```

---

## External packages (Node.js only)

These must stay in `serverExternalPackages` in `next.config.ts`:
- `@whiskeysockets/baileys` — WhatsApp Web protocol
- `pino`, `pino-pretty` — logging
- `qrcode-terminal`, `node-cache`, `jimp`, `sharp`

Never import these in Client Components or Edge-compatible code.

---

## Environment variables

| Variable | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Both client and server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both client and server |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (admin operations) |
| `OPENAI_API_KEY` | AI assistant routes |

---

## Known architectural constraints

- **No light mode** — app is dark-theme only, all colors via CSS tokens
- **No middleware** — see Auth section
- **`force-dynamic`** — all protected pages/layouts export `dynamic = 'force-dynamic'` to prevent static caching of auth-sensitive content
- **Framer Motion ease tuples** — must cast as `[number, number, number, number]` not `number[]` to satisfy TypeScript
- **PromiseLike** — Supabase query builders return `PromiseLike`, use `.then(ok, err)` not `.catch()`
