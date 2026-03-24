'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Shield, Trash2, Users, Clock, Check } from 'lucide-react'
import type { SectionPermission } from '@/app/dashboard/types'

interface UserRole {
  id: string
  user_id: string
  business_id: string
  role: string
  user_permissions: UserPermissionRow[]
}

interface UserPermissionRow {
  id: string
  user_role_id: string
  section: string
  can_view: boolean
  can_edit: boolean
}

interface Profile {
  user_id: string
  display_name: string | null
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
}

const SECTIONS: { key: SectionPermission; label: string }[] = [
  { key: 'dashboard',       label: 'Dashboard'   },
  { key: 'inbox',           label: 'Inbox'       },
  { key: 'clientes',        label: 'Clientes'    },
  { key: 'productos',       label: 'Productos'   },
  { key: 'reportes',        label: 'Reportes'    },
  { key: 'configuracion_ia',label: 'Config IA'   },
  { key: 'whatsapp_qr',     label: 'WhatsApp QR' },
]

interface EquipoClientProps {
  businessId:  string
  roles:        UserRole[]
  profiles:    Profile[]
  invitations: Invitation[]
}

const cardStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }

export default function EquipoClient({
  businessId,
  roles: initialRoles,
  profiles,
  invitations: initialInvitations,
}: EquipoClientProps) {
  const [roles,       setRoles]       = useState(initialRoles)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [newEmail,    setNewEmail]    = useState('')
  const [sending,     setSending]     = useState(false)
  const supabase = createClient()

  const getDisplayName = (userId: string) => {
    const p = profiles.find((p) => p.user_id === userId)
    return p?.display_name ?? 'Sin nombre'
  }

  const handleInvite = async () => {
    if (!newEmail.trim()) return
    setSending(true)
    const { data, error } = await supabase.from('team_invitations').insert({
      business_id: businessId,
      email: newEmail.trim(),
      role: 'agent',
      invited_by: (await supabase.auth.getUser()).data.user?.id,
    }).select().single()

    if (error) {
      toast.error('Error al enviar invitación: ' + error.message)
    } else {
      toast.success(`Invitación enviada a ${newEmail}`)
      setInvitations((prev) => [data as Invitation, ...prev])
      setNewEmail('')
    }
    setSending(false)
  }

  const handleCancelInvitation = async (id: string) => {
    await supabase.from('team_invitations').update({ status: 'cancelled' }).eq('id', id)
    setInvitations((prev) => prev.filter((i) => i.id !== id))
    toast.success('Invitación cancelada')
  }

  const handleTogglePermission = async (
    roleId: string,
    section: SectionPermission,
    currentPerms: UserPermissionRow[]
  ) => {
    const existing = currentPerms.find((p) => p.section === section)
    if (existing) {
      await supabase.from('user_permissions').delete().eq('id', existing.id)
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId
            ? { ...r, user_permissions: r.user_permissions.filter((p) => p.id !== existing.id) }
            : r
        )
      )
    } else {
      const { data } = await supabase
        .from('user_permissions')
        .insert({ user_role_id: roleId, section, can_view: true, can_edit: false })
        .select().single()

      if (data) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id === roleId
              ? { ...r, user_permissions: [...r.user_permissions, data as UserPermissionRow] }
              : r
          )
        )
      }
    }
    toast.success('Permisos actualizados')
  }

  const handleRemoveMember = async (roleId: string) => {
    await supabase.from('user_roles').delete().eq('id', roleId)
    setRoles((prev) => prev.filter((r) => r.id !== roleId))
    toast.success('Miembro eliminado')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Equipo</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Invita miembros y gestiona permisos por sección</p>
      </div>

      {/* Invitar */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <UserPlus className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          Invitar nuevo miembro
        </h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="input-glass flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <button
            onClick={handleInvite}
            disabled={sending || !newEmail.trim()}
            className="btn-accent px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" strokeWidth={1.75} />
            {sending ? 'Enviando...' : 'Invitar'}
          </button>
        </div>
      </div>

      {/* Invitaciones pendientes */}
      {invitations.length > 0 && (
        <div className="p-6 space-y-3" style={cardStyle}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-4 h-4" style={{ color: '#F59E0B' }} strokeWidth={1.75} />
            Invitaciones pendientes
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{inv.email}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Enviada {new Date(inv.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <button onClick={() => handleCancelInvitation(inv.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Miembros */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          Miembros del equipo ({roles.length})
        </h2>

        {roles.length === 0 ? (
          <div className="py-10 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aún no hay miembros. Invita al primer agente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((member, i) => (
              <motion.div key={member.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-2xl p-5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--accent-dim)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                        {getDisplayName(member.user_id).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {getDisplayName(member.user_id)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Shield className="w-3 h-3" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                        <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{member.role}</p>
                      </div>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <button onClick={() => handleRemoveMember(member.id)}
                      className="p-2 rounded-xl transition-colors"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  )}
                </div>

                {member.role === 'agent' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SECTIONS.map((sec) => {
                      const hasPermission = member.user_permissions.some(
                        (p) => p.section === sec.key && p.can_view
                      )
                      return (
                        <label key={sec.key}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                          style={{
                            background: hasPermission ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                            border: `1px solid ${hasPermission ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                          }}>
                          <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              background: hasPermission ? 'var(--accent)' : 'var(--bg-surface)',
                              border: `1.5px solid ${hasPermission ? 'var(--accent)' : 'var(--border-default)'}`,
                            }}>
                            {hasPermission && <Check className="w-2.5 h-2.5" style={{ color: '#080c10' }} strokeWidth={3} />}
                          </div>
                          <input type="checkbox" checked={hasPermission} className="sr-only"
                            onChange={() => handleTogglePermission(member.id, sec.key, member.user_permissions)} />
                          <span className="text-xs font-medium" style={{ color: hasPermission ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {sec.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {member.role === 'owner' && (
                  <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                    Los propietarios tienen acceso completo a todas las secciones
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
