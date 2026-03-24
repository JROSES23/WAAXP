'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Negocio, PlantillaRespuesta, Staff, VerticalNegocio } from '@/app/dashboard/types'
import { Save, Trash2, Bot, MessageCircle, Clock, Percent, Plus, X } from 'lucide-react'

interface ConfiguracionClientProps {
  negocio:             Negocio
  equipoInicial:       Staff[]
  plantillasIniciales: PlantillaRespuesta[]
}

const VERTICALES: { value: VerticalNegocio; label: string }[] = [
  { value: 'retail',      label: 'Retail'       },
  { value: 'salon',       label: 'Salón'         },
  { value: 'restaurant',  label: 'Restaurante'   },
  { value: 'tienda',      label: 'Tienda'        },
  { value: 'delivery',    label: 'Delivery'      },
  { value: 'eventos',     label: 'Eventos'       },
  { value: 'services',    label: 'Servicios'     },
  { value: 'other',       label: 'Otro'          },
]

const cardStyle    = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }
const modalOverlay = { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }

export default function ConfiguracionClient({ negocio, equipoInicial, plantillasIniciales }: ConfiguracionClientProps) {
  const supabase = useMemo(() => createClient(), [])

  const [datosNegocio,     setDatosNegocio]     = useState<Negocio>(negocio)
  const [equipo,           setEquipo]           = useState<Staff[]>(equipoInicial)
  const [plantillas,       setPlantillas]       = useState<PlantillaRespuesta[]>(plantillasIniciales)
  const [nombreEquipo,     setNombreEquipo]     = useState('')
  const [rolEquipo,        setRolEquipo]        = useState('')
  const [guardando,        setGuardando]        = useState(false)
  const [guardandoIA,      setGuardandoIA]      = useState(false)

  const [plantillaEditando,    setPlantillaEditando]    = useState<PlantillaRespuesta | null>(null)
  const [mensajePlantilla,     setMensajePlantilla]     = useState('')
  const [keywordsPlantilla,    setKeywordsPlantilla]    = useState('')
  const [descuentoPlantilla,   setDescuentoPlantilla]   = useState(0)
  const [seguimientoAuto,      setSeguimientoAuto]      = useState(false)
  const [diasSeguimiento,      setDiasSeguimiento]      = useState('3')
  const [descripcionEmpresa,   setDescripcionEmpresa]   = useState('')
  const [modalVertical,        setModalVertical]        = useState(false)
  const [nombreVerticalNueva,  setNombreVerticalNueva]  = useState('')
  const [verticalesCustom,     setVerticalesCustom]     = useState<{ value: VerticalNegocio; label: string }[]>([])

  const [aiPrompt,       setAiPrompt]       = useState(negocio.ai_prompt ?? '')
  const [aiTone,         setAiTone]         = useState(negocio.ai_tone ?? 'friendly')
  const [aiFollowupDays, setAiFollowupDays] = useState(negocio.ai_followup_days ?? 3)
  const [aiDiscountPct,  setAiDiscountPct]  = useState(negocio.ai_discount_pct ?? 0)

  const modosServiciosActivos = datosNegocio.modos_activos?.some((m) => m === 'servicios' || m === 'reservas')

  const actualizarNegocio = async () => {
    setGuardando(true)
    const { error } = await supabase.from('businesses').update({
      nombre: datosNegocio.nombre,
      vertical_principal: datosNegocio.vertical_principal,
      modos_activos: datosNegocio.modos_activos,
      whatsapp_phone: datosNegocio.whatsapp_phone,
      whatsapp_token: datosNegocio.whatsapp_token,
    }).eq('id', datosNegocio.id)
    error ? toast.error('Error al guardar') : toast.success('Negocio actualizado')
    setGuardando(false)
  }

  const guardarConfigIA = async () => {
    setGuardandoIA(true)
    const { error } = await supabase.from('businesses').update({
      ai_prompt: aiPrompt || null, ai_tone: aiTone,
      ai_followup_days: aiFollowupDays, ai_discount_pct: aiDiscountPct,
    }).eq('id', datosNegocio.id)
    error ? toast.error('Error al guardar configuración IA') : toast.success('Configuración IA guardada')
    setGuardandoIA(false)
  }

  const agregarEquipo = async () => {
    if (!nombreEquipo.trim()) return
    const { data, error } = await supabase.from('staff').insert({
      business_id: datosNegocio.id, nombre: nombreEquipo.trim(), rol: rolEquipo.trim() || null, activo: true,
    }).select('*').single()
    if (!error && data) { setEquipo((p) => [data as Staff, ...p]); setNombreEquipo(''); setRolEquipo('') }
  }

  const eliminarEquipo = async (id: string) => {
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (!error) setEquipo((p) => p.filter((s) => s.id !== id))
  }

  const guardarPlantilla = async () => {
    if (!plantillaEditando) return
    const palabras = keywordsPlantilla.split(',').map((k) => k.trim()).filter(Boolean)

    if (plantillaEditando.id) {
      const { data, error } = await supabase.from('response_templates')
        .update({ mensaje_template: mensajePlantilla, trigger_keywords: palabras })
        .eq('id', plantillaEditando.id).select('*').single()
      if (!error && data) setPlantillas((p) => p.map((t) => t.id === data.id ? data as PlantillaRespuesta : t))
    } else {
      const { data, error } = await supabase.from('response_templates').insert({
        business_id: datosNegocio.id, category: plantillaEditando.category ?? 'general',
        mensaje_template: mensajePlantilla, trigger_keywords: palabras, usage_count: 0,
      }).select('*').single()
      if (!error && data) setPlantillas((p) => [data as PlantillaRespuesta, ...p])
    }

    setPlantillaEditando(null); setMensajePlantilla(''); setKeywordsPlantilla('')
    setDescuentoPlantilla(0); setSeguimientoAuto(false); setDiasSeguimiento('3'); setDescripcionEmpresa('')
  }

  const TONES = [
    { value: 'friendly',     label: 'Amigable'    },
    { value: 'professional', label: 'Profesional' },
    { value: 'casual',       label: 'Casual'      },
    { value: 'formal',       label: 'Formal'      },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Configuración</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Administra tu negocio y equipo</p>
      </div>

      {/* Datos del negocio */}
      <div className="p-6 space-y-5" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Datos del negocio</h2>
          <button onClick={actualizarNegocio} disabled={guardando}
            className="btn-accent px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" strokeWidth={1.75} />
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre del negocio</label>
            <input value={datosNegocio.nombre}
              onChange={(e) => setDatosNegocio((p) => ({ ...p, nombre: e.target.value }))}
              className="input-glass" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Vertical principal</label>
            <div className="flex gap-2">
              <select value={datosNegocio.vertical_principal}
                onChange={(e) => setDatosNegocio((p) => ({ ...p, vertical_principal: e.target.value as VerticalNegocio }))}
                className="input-glass flex-1 cursor-pointer">
                {[...VERTICALES, ...verticalesCustom].map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              <button onClick={() => setModalVertical(true)}
                className="px-3 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                + Nueva vertical
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Modos activos</label>
            <div className="flex flex-wrap gap-3">
              {['productos', 'servicios', 'reservas'].map((modo) => {
                const active = datosNegocio.modos_activos?.includes(modo)
                return (
                  <label key={modo} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: active ? 'var(--accent-dim)' : 'var(--bg-surface)',
                      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                    }}>
                    <input type="checkbox" checked={!!active} className="sr-only"
                      onChange={(e) => setDatosNegocio((p) => {
                        const actuales = p.modos_activos ?? []
                        return { ...p, modos_activos: e.target.checked ? [...actuales, modo] : actuales.filter((m) => m !== modo) }
                      })} />
                    <span className="text-xs font-medium capitalize" style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {modo === 'productos' ? 'Productos' : modo === 'servicios' ? 'Servicios' : 'Reservas'}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>WhatsApp teléfono</label>
            <input value={datosNegocio.whatsapp_phone ?? ''}
              onChange={(e) => setDatosNegocio((p) => ({ ...p, whatsapp_phone: e.target.value }))}
              placeholder="+56912345678" className="input-glass" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>WhatsApp token</label>
            <input type="password" value={datosNegocio.whatsapp_token ?? ''}
              onChange={(e) => setDatosNegocio((p) => ({ ...p, whatsapp_token: e.target.value }))}
              placeholder="••••••••••••" className="input-glass" />
          </div>
        </div>
      </div>

      {/* Equipo (si servicios activos) */}
      {modosServiciosActivos && (
        <div className="p-6 space-y-4" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Equipo de trabajo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={nombreEquipo} onChange={(e) => setNombreEquipo(e.target.value)}
              placeholder="Nombre del miembro" className="input-glass" />
            <input value={rolEquipo} onChange={(e) => setRolEquipo(e.target.value)}
              placeholder="Rol (ej. Barbero, Estilista)" className="input-glass" />
            <button onClick={agregarEquipo}
              className="btn-accent py-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={2} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {equipo.length === 0
              ? <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Aún no tienes equipo registrado.</p>
              : equipo.map((persona) => (
                <div key={persona.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{persona.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{persona.rol || 'Sin rol'}</p>
                  </div>
                  <button onClick={() => eliminarEquipo(persona.id)}
                    className="p-1.5 rounded-lg transition-colors" style={{ color: '#EF4444' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Configuración IA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="p-6 space-y-6" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
              <Bot className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Configuración del Bot IA</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Personaliza cómo responde tu asistente virtual</p>
            </div>
          </div>
          <button onClick={guardarConfigIA} disabled={guardandoIA}
            className="btn-accent px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" strokeWidth={1.75} />
            {guardandoIA ? 'Guardando…' : 'Guardar IA'}
          </button>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-xs font-medium flex items-center gap-2 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} /> Prompt del sistema
          </label>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4}
            placeholder="Eres un asistente de ventas amigable para una tienda de ropa. Responde en español chileno..."
            className="input-glass resize-none" />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Instrucciones que definen la personalidad y contexto del bot</p>
        </div>

        {/* Tono */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Tono de respuesta</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map((tone) => (
              <button key={tone.value} onClick={() => setAiTone(tone.value)}
                className="py-2.5 rounded-xl text-sm font-medium text-center transition-all"
                style={aiTone === tone.value
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '2px solid var(--accent)' }
                  : { border: '1px solid var(--border-default)', color: 'var(--text-secondary)', background: 'transparent' }}>
                {tone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3.5 h-3.5" strokeWidth={1.75} /> Seguimiento automático
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={14} value={aiFollowupDays}
                onChange={(e) => setAiFollowupDays(Number(e.target.value))}
                className="flex-1" style={{ accentColor: 'var(--accent)' }} />
              <span className="text-sm font-semibold w-16 text-right" style={{ color: 'var(--text-primary)' }}>
                {aiFollowupDays === 0 ? 'Apagado' : `${aiFollowupDays} días`}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Días antes de enviar seguimiento automático</p>
          </div>
          <div>
            <label className="text-xs font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Percent className="w-3.5 h-3.5" strokeWidth={1.75} /> Descuento máximo IA
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={50} step={5} value={aiDiscountPct}
                onChange={(e) => setAiDiscountPct(Number(e.target.value))}
                className="flex-1" style={{ accentColor: 'var(--accent)' }} />
              <span className="text-sm font-semibold w-12 text-right" style={{ color: 'var(--text-primary)' }}>
                {aiDiscountPct}%
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Descuento máximo que el bot puede ofrecer</p>
          </div>
        </div>
      </motion.div>

      {/* Plantillas */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Plantillas de IA</h2>
          <button
            onClick={() => {
              setPlantillaEditando({ id: '', business_id: datosNegocio.id, trigger_keywords: [], mensaje_template: '', usage_count: 0, created_at: new Date().toISOString() })
              setMensajePlantilla(''); setKeywordsPlantilla(''); setDescuentoPlantilla(0); setSeguimientoAuto(false); setDiasSeguimiento('3'); setDescripcionEmpresa('')
            }}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Crear plantilla
          </button>
        </div>
        {plantillas.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>No hay plantillas creadas.</p>
        ) : (
          <div className="space-y-2">
            {plantillas.map((t) => (
              <div key={t.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>{t.category || 'General'}</p>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  Keywords: {(t.trigger_keywords || []).join(', ') || 'Sin keywords'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t.mensaje_template}</p>
                <button onClick={() => { setPlantillaEditando(t); setMensajePlantilla(t.mensaje_template); setKeywordsPlantilla((t.trigger_keywords || []).join(', ')) }}
                  className="mt-2 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal plantilla */}
      {plantillaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg p-6 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                {plantillaEditando.id ? 'Editar plantilla' : 'Nueva plantilla'}
              </h3>
              <button onClick={() => setPlantillaEditando(null)} className="p-2 rounded-xl"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Template mensaje</label>
              <textarea value={mensajePlantilla} onChange={(e) => setMensajePlantilla(e.target.value)}
                rows={4} placeholder="¡Hola! Veo que estás interesado en..." className="input-glass resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Trigger keywords (separadas por coma)</label>
              <input value={keywordsPlantilla} onChange={(e) => setKeywordsPlantilla(e.target.value)}
                placeholder="precio, descuento, oferta" className="input-glass" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Descuento sugerido: {descuentoPlantilla}%</label>
              <input type="range" min={0} max={50} value={descuentoPlantilla}
                onChange={(e) => setDescuentoPlantilla(Number(e.target.value))}
                className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSeguimientoAuto(!seguimientoAuto)}>
                <div className="w-8 h-5 rounded-full transition-colors relative"
                  style={{ background: seguimientoAuto ? 'var(--accent)' : 'var(--border-default)' }}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform"
                    style={{ left: seguimientoAuto ? '14px' : '2px' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Seguimiento automático</span>
              </div>
              {seguimientoAuto && (
                <select value={diasSeguimiento} onChange={(e) => setDiasSeguimiento(e.target.value)}
                  className="input-glass ml-auto cursor-pointer" style={{ width: 'auto' }}>
                  <option value="3">3 días</option><option value="5">5 días</option><option value="7">7 días</option>
                </select>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPlantillaEditando(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                Cancelar
              </button>
              <button onClick={guardarPlantilla}
                className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl">
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal vertical */}
      {modalVertical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
            <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Nueva vertical</h3>
            <input value={nombreVerticalNueva} onChange={(e) => setNombreVerticalNueva(e.target.value)}
              placeholder="Nombre de la vertical" className="input-glass" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalVertical(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                Cancelar
              </button>
              <button onClick={() => {
                const nombre = nombreVerticalNueva.trim()
                if (!nombre) return
                const nueva = { value: nombre.toLowerCase().replace(/\s+/g, '-') as VerticalNegocio, label: nombre }
                setVerticalesCustom((p) => [nueva, ...p])
                setDatosNegocio((p) => ({ ...p, vertical_principal: nueva.value }))
                setNombreVerticalNueva(''); setModalVertical(false)
              }} className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl">
                Agregar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
