'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { User, Mail, Shield, Building2, Save, Moon, Sun } from 'lucide-react'
import { AccentSelector } from '@/components/providers/theme-provider'
import type { UserProfile, UserRole } from '@/app/dashboard/types'

interface PerfilClientProps {
  userId:       string
  email:        string
  profile:      UserProfile | null
  role:         UserRole | null
  businessName: string | null
}

export default function PerfilClient({ userId, email, profile, role, businessName }: PerfilClientProps) {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarUrl,   setAvatarUrl]   = useState(profile?.avatar_url ?? '')
  const [locale,      setLocale]      = useState(profile?.locale ?? 'es')
  const [saving,      setSaving]      = useState(false)

  const roleLabel = role === 'owner' ? 'Propietario' : role === 'agent' ? 'Agente' : 'Sin rol'

  const handleSave = async () => {
    setSaving(true)
    const profileData = {
      user_id: userId, display_name: displayName || null,
      avatar_url: avatarUrl || null, locale,
      theme_mode: theme === 'dark' ? 'dark' : 'light',
    }
    if (profile?.id) {
      const { error } = await supabase.from('user_profiles').update(profileData).eq('id', profile.id)
      error ? toast.error('Error al guardar perfil') : toast.success('Perfil actualizado')
    } else {
      const { error } = await supabase.from('user_profiles').insert(profileData)
      error ? toast.error('Error al crear perfil') : toast.success('Perfil creado')
    }
    setSaving(false)
  }

  const cardStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }
  const infoStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Mi Perfil</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Administra tu información personal y preferencias</p>
      </div>

      {/* Cuenta */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cuenta</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Mail,      label: 'Email', value: email },
            { icon: Shield,    label: 'Rol',   value: roleLabel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3" style={infoStyle}>
              <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            </div>
          ))}
          {businessName && (
            <div className="flex items-center gap-3 p-3 sm:col-span-2" style={infoStyle}>
              <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Negocio</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{businessName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info personal */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Información personal</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre para mostrar</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre" className="input-glass pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>URL de avatar</label>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..." className="input-glass" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Idioma</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="input-glass cursor-pointer">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apariencia */}
      <div className="p-6 space-y-5" style={cardStyle}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Apariencia</h2>

        {/* Dark/light */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Modo de pantalla</p>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun,  label: 'Claro'  },
              { value: 'dark',  icon: Moon, label: 'Oscuro' },
            ].map(({ value, icon: Icon, label }) => (
              <button key={value} onClick={() => setTheme(value)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={theme === value
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '2px solid var(--accent)' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                <Icon className="w-4 h-4" strokeWidth={1.75} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Color de acento</p>
          <AccentSelector />
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="btn-accent w-full py-3 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
        <Save className="w-4 h-4" strokeWidth={2} />
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}
