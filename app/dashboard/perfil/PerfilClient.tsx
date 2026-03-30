"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import {
  User, Mail, Shield, Building2, Save, Moon, Sun, Lock,
  Camera, Globe, CheckCircle2, AlertCircle, Eye, EyeOff,
} from "lucide-react"
import { AccentSelector } from "@/components/providers/theme-provider"
import { motion } from "framer-motion"
import type { UserProfile, UserRole } from "@/app/dashboard/types"

/* ─── TYPES ──────────────────────────────────────────────────────── */

interface Props {
  userId:       string
  email:        string
  profile:      UserProfile | null
  role:         UserRole | null
  businessName: string | null
}

/* ─── HELPERS ────────────────────────────────────────────────────── */

function getInitials(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

/* ─── SECTIONS ───────────────────────────────────────────────────── */

const CARD = "rounded-2xl p-6 space-y-5"
const CARD_S = { background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)" }

/* ─── COMPONENT ──────────────────────────────────────────────────── */

export default function PerfilClient({ userId, email, profile, role, businessName }: Props) {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "")
  const [avatarUrl,   setAvatarUrl]   = useState(profile?.avatar_url ?? "")
  const [locale,      setLocale]      = useState(profile?.locale ?? "es")
  const [saving,      setSaving]      = useState(false)
  const [showReset,   setShowReset]   = useState(false)
  const [resetting,   setResetting]   = useState(false)
  const [avatarErr,   setAvatarErr]   = useState(false)

  const roleLabel = role === "owner" ? "Propietario" : role === "agent" ? "Agente" : "Sin rol"
  const initials  = getInitials(displayName || profile?.display_name, email)

  const handleSave = async () => {
    setSaving(true)
    const data = {
      user_id:     userId,
      display_name: displayName || null,
      avatar_url:  avatarUrl || null,
      locale,
      theme_mode:  theme === "dark" ? "dark" : "light",
    }
    if (profile?.id) {
      const { error } = await supabase.from("user_profiles").update(data).eq("id", profile.id)
      error ? toast.error("Error al guardar perfil") : toast.success("Perfil actualizado")
    } else {
      const { error } = await supabase.from("user_profiles").insert(data)
      error ? toast.error("Error al crear perfil") : toast.success("Perfil creado")
    }
    setSaving(false)
  }

  const handlePasswordReset = async () => {
    setResetting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (!error) {
      toast.success("Email de restablecimiento enviado")
      setShowReset(false)
    } else {
      toast.error("Error al enviar email")
    }
    setResetting(false)
  }

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-2xl">

      {/* ── Avatar hero card ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
        className="rounded-2xl p-6" style={CARD_S}>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarUrl && !avatarErr ? (
              <img src={avatarUrl} alt={displayName || email} onError={() => setAvatarErr(true)}
                className="w-16 h-16 rounded-2xl object-cover"
                style={{ border:"2px solid var(--accent-border)" }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl tracking-tight"
                style={{ background:"var(--accent-dim)", border:"2px solid var(--accent-border)", color:"var(--accent)" }}>
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background:"var(--bg-elevated)", border:"1.5px solid var(--border-default)" }}>
              <Camera className="w-3 h-3" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-lg tracking-[-0.02em] truncate" style={{ color:"var(--text-primary)" }}>
              {displayName || email.split("@")[0]}
            </p>
            <p className="text-sm truncate" style={{ color:"var(--text-secondary)" }}>{email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge badge-accent text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background:"var(--accent-dim)", color:"var(--accent)", border:"1px solid var(--accent-border)" }}>
                {roleLabel}
              </span>
              {businessName && (
                <span className="flex items-center gap-1 text-xs" style={{ color:"var(--text-tertiary)" }}>
                  <Building2 className="w-3 h-3" strokeWidth={1.75} />
                  {businessName}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Información personal ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.06, duration:0.3 }}
        className={CARD} style={CARD_S}>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
          <h2 className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>Información personal</h2>
        </div>

        <div className="space-y-3">
          {/* Display name */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color:"var(--text-secondary)" }}>Nombre para mostrar</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
              <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre completo" className="input-glass pl-9" />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color:"var(--text-secondary)" }}>URL de avatar</label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
              <input value={avatarUrl} onChange={e => { setAvatarUrl(e.target.value); setAvatarErr(false) }}
                placeholder="https://i.imgur.com/..." className="input-glass pl-9" />
            </div>
          </div>

          {/* Idioma */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color:"var(--text-secondary)" }}>Idioma</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
              <select value={locale} onChange={e => setLocale(e.target.value)} className="input-glass pl-9 cursor-pointer">
                <option value="es">Español (Chile)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Cuenta (solo lectura) ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.3 }}
        className={CARD} style={CARD_S}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
          <h2 className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>Cuenta</h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { icon:Mail,      label:"Email",   value:email,      copy:true  },
            { icon:Shield,    label:"Rol",     value:roleLabel,  copy:false },
          ].map(({ icon:Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)" }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color:"var(--text-secondary)" }} strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-tertiary)" }}>{label}</p>
                <p className="text-sm font-medium mt-0.5 truncate" style={{ color:"var(--text-primary)" }}>{value}</p>
              </div>
            </div>
          ))}
          {businessName && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl sm:col-span-2" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)" }}>
              <Building2 className="w-4 h-4 shrink-0" style={{ color:"var(--text-secondary)" }} strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-tertiary)" }}>Negocio</p>
                <p className="text-sm font-medium mt-0.5 truncate" style={{ color:"var(--text-primary)" }}>{businessName}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Apariencia ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14, duration:0.3 }}
        className={CARD} style={CARD_S}>
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
          <h2 className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>Apariencia</h2>
        </div>

        {/* Mode toggle */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color:"var(--text-secondary)" }}>Modo de pantalla</p>
          <div className="flex gap-2">
            {[
              { value:"light", icon:Sun,  label:"Claro"  },
              { value:"dark",  icon:Moon, label:"Oscuro" },
            ].map(({ value, icon:Icon, label }) => (
              <button key={value} onClick={() => setTheme(value)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={theme===value
                  ? { background:"var(--accent-dim)", color:"var(--accent)", border:"2px solid var(--accent)" }
                  : { background:"var(--bg-surface)", color:"var(--text-secondary)", border:"1px solid var(--border-default)" }}>
                <Icon className="w-4 h-4" strokeWidth={1.75} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color:"var(--text-secondary)" }}>Color de acento</p>
          <AccentSelector />
        </div>
      </motion.div>

      {/* ── Seguridad ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18, duration:0.3 }}
        className={CARD} style={CARD_S}>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" style={{ color:"var(--text-tertiary)" }} strokeWidth={1.75} />
          <h2 className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>Seguridad</h2>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>Contraseña</p>
            <p className="text-xs mt-0.5" style={{ color:"var(--text-secondary)" }}>Recibirás un email con el enlace de cambio</p>
          </div>
          {!showReset ? (
            <button onClick={() => setShowReset(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)", border:"1px solid var(--border-default)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor="var(--accent-border)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor="var(--border-default)")}>
              <Lock className="w-3.5 h-3.5" strokeWidth={1.75} /> Cambiar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setShowReset(false)} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ color:"var(--text-tertiary)" }}>Cancelar</button>
              <button onClick={handlePasswordReset} disabled={resetting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                style={{ background:"rgba(239,68,68,0.12)", color:"#EF4444", border:"1px solid rgba(239,68,68,0.25)" }}>
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                {resetting ? "Enviando…" : "Confirmar"}
              </button>
            </div>
          )}
        </div>

        {/* Email verification status */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color:"#10B981" }} strokeWidth={1.75} />
          <p className="text-xs" style={{ color:"var(--text-secondary)" }}>Email verificado — <span className="font-medium" style={{ color:"var(--text-primary)" }}>{email}</span></p>
        </div>
      </motion.div>

      {/* ── Save ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22, duration:0.3 }}>
        <button onClick={handleSave} disabled={saving}
          className="btn-accent w-full py-3 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" strokeWidth={2} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </motion.div>

    </div>
  )
}
