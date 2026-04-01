# CURRENT TASKS — WAAXP

Last updated: 2026-03-31

---

## Status legend
- ✅ Done
- 🔄 In progress
- ⏳ Pending
- ❌ Blocked

---

## Sprint: Auth overhaul + deploy fix

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Delete `middleware.ts` | ✅ | Permanent fix for MIDDLEWARE_INVOCATION_FAILED |
| 2 | Create `src/lib/supabase/auth-guard.ts` | ✅ | `requireAuth()`, `requireSuperAdmin()` |
| 3 | Update `src/lib/auth.ts` → `getUser()` | ✅ | No middleware race condition anymore |
| 4 | Add `requireAuth()` to `app/dashboard/layout.tsx` | ✅ | |
| 5 | Add `requireAuth()` to `app/onboarding/page.tsx` | ✅ | |
| 6 | Extract `LoginForm.tsx` as client component | ✅ | Suspense boundary for `useSearchParams()` |
| 7 | Rewrite `app/login/page.tsx` as Server Component | ✅ | Redirects to /dashboard if already authed |
| 8 | Verify `serverExternalPackages` in `next.config.ts` | ✅ | Already correct |
| 9 | Create `.claude/` directory (brand, stack, tasks) | ✅ | |
| 10 | `npm run build` — confirm clean | ⏳ | Run and fix any remaining TS errors |
| 11 | Push to GitHub → verify Vercel deploy | ⏳ | |

---

## Backlog — features & polish

| # | Feature | Priority | Notes |
|---|---|---|---|
| B1 | Reservas: SMS/WhatsApp reminder for upcoming bookings | High | Needs WhatsApp integration |
| B2 | Panel en vivo: auto-refresh every 60s without full reload | Medium | `router.refresh()` on interval |
| B3 | Clientes: bulk import via CSV | Medium | |
| B4 | Reportes: export to PDF / CSV | Medium | |
| B5 | Admin panel: superadmin business overview | Low | `app/admin/` scaffold exists but empty |
| B6 | Onboarding: multi-step wizard for recurso setup | Low | Currently only business info |

---

## Known bugs

| Bug | Severity | Status |
|---|---|---|
| `ChunkLoadError` after deploy if browser has stale cache | Low | Handled by hard refresh; consider adding cache-busting headers |
| `x-invoke-path` header may be empty on some Vercel edge pops | Low | Falls back to `/dashboard` — acceptable |

---

## Pending SQL migrations

```sql
-- Run in Supabase SQL editor if reservas tables don't exist yet
-- See app/dashboard/reservas/actions.ts for table shape

-- recursos
CREATE TABLE IF NOT EXISTS recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT DEFAULT 'general',
  capacidad INT DEFAULT 1,
  color TEXT DEFAULT '#0abab5',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  recurso_id UUID REFERENCES recursos(id) ON DELETE CASCADE,
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado TEXT DEFAULT 'confirmada',
  monto NUMERIC(10,2),
  pagado BOOLEAN DEFAULT false,
  metodo_pago TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
```
