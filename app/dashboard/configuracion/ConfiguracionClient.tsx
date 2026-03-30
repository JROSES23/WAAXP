'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useModalStore } from '@/lib/modal-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Negocio, PlantillaRespuesta, Staff, VerticalNegocio } from '@/app/dashboard/types'
import {
  AlertCircle, Bot, Check, ChevronDown, Clock, Eye,
  MessageCircle, Percent, Plus, Save, Send, Sparkles,
  Tag, Trash2, X, Zap,
} from 'lucide-react'

/* ─── TYPES ──────────────────────────────────────────────────── */

interface ConfiguracionClientProps {
  negocio:             Negocio
  equipoInicial:       Staff[]
  plantillasIniciales: PlantillaRespuesta[]
}

interface TestMessage {
  role: 'user' | 'bot'
  text: string
}

interface DiscountLog {
  id: string
  conversation_id: string
  discount_pct: number
  approved: boolean
  created_at: string
}

/* ─── CONSTANTS ──────────────────────────────────────────────── */

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

const TONES = [
  { value: 'friendly',     label: 'Amigable',    hint: 'Cálido y cercano' },
  { value: 'professional', label: 'Profesional', hint: 'Claro y eficiente' },
  { value: 'casual',       label: 'Casual',      hint: 'Relajado e informal' },
  { value: 'formal',       label: 'Formal',      hint: 'Respetuoso y cuidadoso' },
]

const TONE_MAP: Record<string, string> = {
  friendly:     'amigable y cercano',
  professional: 'profesional y claro',
  casual:       'casual y relajado',
  formal:       'formal y respetuoso',
}

const cardStyle = {
  background:   'var(--bg-elevated)',
  border:       '1px solid var(--border-subtle)',
  borderRadius: '16px',
}

const modalOverlay = { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }

/* ─── HELPERS ────────────────────────────────────────────────── */

function generatePrompt(params: {
  nombre:   string
  desc:     string
  tono:     string
  nunca:    string
  horario:  string
}): string {
  const tonoLabel = TONE_MAP[params.tono] ?? params.tono
  const parts: string[] = [
    `Eres el asistente virtual de ${params.nombre}.`,
    `Responde siempre en español, con un tono ${tonoLabel}.`,
  ]
  if (params.desc.trim())    parts.push(`Sobre el negocio: ${params.desc.trim()}.`)
  if (params.horario.trim()) parts.push(`Horario de atención: ${params.horario.trim()}.`)
  if (params.nunca.trim())   parts.push(`NUNCA debes: ${params.nunca.trim()}.`)
  parts.push('Si no sabes algo, indica que lo consultarás con el equipo. No inventes información.')
  return parts.join(' ')
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\[[^\]]+\]/g) ?? []
  return [...new Set(matches)]
}

function highlightVariables(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return parts.map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span
        key={i}
        style={{
          background:   'var(--accent-dim)',
          color:        'var(--accent)',
          border:       '1px solid var(--accent-border)',
          borderRadius: '4px',
          padding:      '0 4px',
          fontWeight:   600,
        }}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

/* ─── COMPONENT ──────────────────────────────────────────────── */

export default function ConfiguracionClient({
  negocio,
  equipoInicial,
  plantillasIniciales,
}: ConfiguracionClientProps) {
  const supabase = useMemo(() => createClient(), [])

  /* ── business state ── */
  const [datosNegocio,    setDatosNegocio]    = useState<Negocio>(negocio)
  const [equipo,          setEquipo]          = useState<Staff[]>(equipoInicial)
  const [plantillas,      setPlantillas]      = useState<PlantillaRespuesta[]>(plantillasIniciales)
  const [guardando,       setGuardando]       = useState(false)
  const [guardandoIA,     setGuardandoIA]     = useState(false)

  /* ── team ── */
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [rolEquipo,    setRolEquipo]    = useState('')

  /* ── AI guided form ── */
  const [aiTone,        setAiTone]        = useState(negocio.ai_tone ?? 'friendly')
  const [aiFollowupDays,setAiFollowupDays]= useState(negocio.ai_followup_days ?? 3)
  const [aiDiscountPct, setAiDiscountPct] = useState(negocio.ai_discount_pct ?? 0)
  const [aiDesc,        setAiDesc]        = useState('')
  const [aiNever,       setAiNever]       = useState('')
  const [aiHours,       setAiHours]       = useState('')
  const [advancedMode,  setAdvancedMode]  = useState(false)
  const [aiPromptRaw,   setAiPromptRaw]   = useState(negocio.ai_prompt ?? '')
  const [showPreview,   setShowPreview]   = useState(false)

  /* ── bot test chat ── */
  const [testMessages,  setTestMessages]  = useState<TestMessage[]>([])
  const [testInput,     setTestInput]     = useState('')
  const [testLoading,   setTestLoading]   = useState(false)
  const [testOpen,      setTestOpen]      = useState(false)
  const testEndRef = useRef<HTMLDivElement>(null)

  /* ── discount log ── */
  const [discountLogs,   setDiscountLogs]   = useState<DiscountLog[]>([])
  const [discountLoading,setDiscountLoading]= useState(false)

  /* ── template modal ── */
  const [plantillaEditando,  setPlantillaEditando]  = useState<PlantillaRespuesta | null>(null)
  const [mensajePlantilla,   setMensajePlantilla]   = useState('')
  const [keywordsPlantilla,  setKeywordsPlantilla]  = useState('')
  const [descuentoPlantilla, setDescuentoPlantilla] = useState(0)
  const [seguimientoAuto,    setSeguimientoAuto]    = useState(false)
  const [diasSeguimiento,    setDiasSeguimiento]    = useState('3')

  /* ── custom vertical modal ── */
  const [modalVertical,       setModalVertical]       = useState(false)
  const [nombreVerticalNueva, setNombreVerticalNueva] = useState('')
  const [verticalesCustom,    setVerticalesCustom]    = useState<{ value: VerticalNegocio; label: string }[]>([])

  // Notifica al store global cuando algún modal de configuración está abierto
  const { openModal, closeModal } = useModalStore()
  const anyConfigModalOpen = modalVertical || plantillaEditando !== null || testOpen
  useEffect(() => {
    if (anyConfigModalOpen) {
      openModal()
      return () => closeModal()
    }
  }, [anyConfigModalOpen, openModal, closeModal])

  const modosServiciosActivos = datosNegocio.modos_activos?.some(
    (m) => m === 'servicios' || m === 'reservas'
  )

  /* ── derived ── */
  const currentPrompt = advancedMode
    ? aiPromptRaw
    : generatePrompt({ nombre: datosNegocio.nombre, desc: aiDesc, tono: aiTone, nunca: aiNever, horario: aiHours })

  const templateVariables = extractVariables(mensajePlantilla)

  /* ── effects ── */
  useEffect(() => {
    if (testEndRef.current) {
      testEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [testMessages])

  useEffect(() => {
    if (!testOpen) return
    setDiscountLoading(true)
    supabase
      .from('discount_logs')
      .select('*')
      .eq('business_id', datosNegocio.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(
        ({ data }) => { setDiscountLogs((data as DiscountLog[]) ?? []); setDiscountLoading(false) },
        () => setDiscountLoading(false)
      )
  }, [testOpen, datosNegocio.id, supabase])

  /* ── actions ── */

  const actualizarNegocio = async () => {
    setGuardando(true)
    const { error } = await supabase.from('businesses').update({
      nombre:             datosNegocio.nombre,
      vertical_principal: datosNegocio.vertical_principal,
      modos_activos:      datosNegocio.modos_activos,
      whatsapp_phone:     datosNegocio.whatsapp_phone,
      whatsapp_token:     datosNegocio.whatsapp_token,
    }).eq('id', datosNegocio.id)
    error ? toast.error('Error al guardar') : toast.success('Negocio actualizado')
    setGuardando(false)
  }

  const guardarConfigIA = async () => {
    setGuardandoIA(true)
    const { error } = await supabase.from('businesses').update({
      ai_prompt:        currentPrompt || null,
      ai_tone:          aiTone,
      ai_followup_days: aiFollowupDays,
      ai_discount_pct:  aiDiscountPct,
    }).eq('id', datosNegocio.id)
    error
      ? toast.error('Error al guardar configuración IA')
      : toast.success('Configuración IA guardada')
    setGuardandoIA(false)
  }

  const agregarEquipo = async () => {
    if (!nombreEquipo.trim()) return
    const { data, error } = await supabase.from('staff').insert({
      business_id: datosNegocio.id,
      nombre:      nombreEquipo.trim(),
      rol:         rolEquipo.trim() || null,
      activo:      true,
    }).select('*').single()
    if (!error && data) {
      setEquipo((p) => [data as Staff, ...p])
      setNombreEquipo('')
      setRolEquipo('')
    }
  }

  const eliminarEquipo = async (id: string) => {
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (!error) setEquipo((p) => p.filter((s) => s.id !== id))
  }

  const guardarPlantilla = async () => {
    if (!plantillaEditando) return
    const palabras = keywordsPlantilla.split(',').map((k) => k.trim()).filter(Boolean)

    if (plantillaEditando.id) {
      const { data, error } = await supabase
        .from('response_templates')
        .update({ mensaje_template: mensajePlantilla, trigger_keywords: palabras })
        .eq('id', plantillaEditando.id)
        .select('*')
        .single()
      if (!error && data)
        setPlantillas((p) => p.map((t) => (t.id === data.id ? (data as PlantillaRespuesta) : t)))
    } else {
      const { data, error } = await supabase
        .from('response_templates')
        .insert({
          business_id:      datosNegocio.id,
          category:         plantillaEditando.category ?? 'general',
          mensaje_template: mensajePlantilla,
          trigger_keywords: palabras,
          usage_count:      0,
        })
        .select('*')
        .single()
      if (!error && data)
        setPlantillas((p) => [data as PlantillaRespuesta, ...p])
    }

    setPlantillaEditando(null)
    setMensajePlantilla('')
    setKeywordsPlantilla('')
    setDescuentoPlantilla(0)
    setSeguimientoAuto(false)
    setDiasSeguimiento('3')
  }

  const sendTestMessage = async () => {
    if (!testInput.trim() || testLoading) return
    const userMsg = testInput.trim()
    setTestInput('')
    setTestMessages((p) => [...p, { role: 'user', text: userMsg }])
    setTestLoading(true)

    try {
      const res = await fetch('/api/bot/test', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: userMsg, prompt: currentPrompt, tone: aiTone }),
      })
      const data = await res.json()
      setTestMessages((p) => [...p, { role: 'bot', text: data.reply ?? 'Sin respuesta.' }])
    } catch {
      setTestMessages((p) => [...p, { role: 'bot', text: 'Error al conectar con el bot.' }])
    } finally {
      setTestLoading(false)
    }
  }

  /* ─── RENDER ─────────────────────────────────────────────── */

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
          Configuración
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Administra tu negocio, equipo y comportamiento del bot IA
        </p>
      </div>

      {/* ── Datos del negocio ── */}
      <div className="p-6 space-y-5" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Datos del negocio</h2>
          <button
            onClick={actualizarNegocio}
            disabled={guardando}
            className="btn-accent px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={1.75} />
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Nombre del negocio
            </label>
            <input
              value={datosNegocio.nombre}
              onChange={(e) => setDatosNegocio((p) => ({ ...p, nombre: e.target.value }))}
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Vertical principal
            </label>
            <div className="flex gap-2">
              <select
                value={datosNegocio.vertical_principal}
                onChange={(e) =>
                  setDatosNegocio((p) => ({ ...p, vertical_principal: e.target.value as VerticalNegocio }))
                }
                className="input-glass flex-1 cursor-pointer"
              >
                {[...VERTICALES, ...verticalesCustom].map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              <button
                onClick={() => setModalVertical(true)}
                className="px-3 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                + Nueva
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Modos activos
            </label>
            <div className="flex flex-wrap gap-3">
              {['productos', 'servicios', 'reservas'].map((modo) => {
                const active = datosNegocio.modos_activos?.includes(modo)
                return (
                  <label
                    key={modo}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: active ? 'var(--accent-dim)' : 'var(--bg-surface)',
                      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!active}
                      className="sr-only"
                      onChange={(e) =>
                        setDatosNegocio((p) => {
                          const actuales = p.modos_activos ?? []
                          return {
                            ...p,
                            modos_activos: e.target.checked
                              ? [...actuales, modo]
                              : actuales.filter((m) => m !== modo),
                          }
                        })
                      }
                    />
                    <span
                      className="text-xs font-medium capitalize"
                      style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}
                    >
                      {modo === 'productos' ? 'Productos' : modo === 'servicios' ? 'Servicios' : 'Reservas'}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              WhatsApp teléfono
            </label>
            <input
              value={datosNegocio.whatsapp_phone ?? ''}
              onChange={(e) => setDatosNegocio((p) => ({ ...p, whatsapp_phone: e.target.value }))}
              placeholder="+56912345678"
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              WhatsApp token
            </label>
            <input
              type="password"
              value={datosNegocio.whatsapp_token ?? ''}
              onChange={(e) => setDatosNegocio((p) => ({ ...p, whatsapp_token: e.target.value }))}
              placeholder="••••••••••••"
              className="input-glass"
            />
          </div>
        </div>
      </div>

      {/* ── Equipo ── */}
      {modosServiciosActivos && (
        <div className="p-6 space-y-4" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Equipo de trabajo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              placeholder="Nombre del miembro"
              className="input-glass"
            />
            <input
              value={rolEquipo}
              onChange={(e) => setRolEquipo(e.target.value)}
              placeholder="Rol (ej. Barbero, Estilista)"
              className="input-glass"
            />
            <button
              onClick={agregarEquipo}
              className="btn-accent py-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {equipo.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Aún no tienes equipo registrado.</p>
            ) : (
              equipo.map((persona) => (
                <div
                  key={persona.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{persona.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{persona.rol || 'Sin rol'}</p>
                  </div>
                  <button
                    onClick={() => eliminarEquipo(persona.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Configuración IA ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 space-y-6"
        style={cardStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-dim)' }}
            >
              <Bot className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Configuración del Bot IA</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Personaliza cómo responde tu asistente virtual
              </p>
            </div>
          </div>
          <button
            onClick={guardarConfigIA}
            disabled={guardandoIA}
            className="btn-accent px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={1.75} />
            {guardandoIA ? 'Guardando…' : 'Guardar IA'}
          </button>
        </div>

        {/* Guided form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Personalidad del bot
            </p>
            <button
              onClick={() => setAdvancedMode((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: advancedMode ? 'var(--accent-dim)' : 'var(--bg-surface)',
                color:      advancedMode ? 'var(--accent)' : 'var(--text-tertiary)',
                border:     `1px solid ${advancedMode ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              }}
            >
              <Zap className="w-3 h-3" strokeWidth={2} />
              {advancedMode ? 'Modo guiado' : 'Modo avanzado'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {advancedMode ? (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-xs font-medium flex items-center gap-2 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} /> Prompt personalizado
                </label>
                <textarea
                  value={aiPromptRaw}
                  onChange={(e) => setAiPromptRaw(e.target.value)}
                  rows={5}
                  placeholder="Eres un asistente de ventas amigable para una tienda de ropa. Responde en español chileno..."
                  className="input-glass resize-none"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Instrucciones completas para el bot. Ten cuidado: un prompt mal escrito puede romper el comportamiento.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="guided"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Describe tu negocio en 1–2 frases
                    </label>
                    <textarea
                      value={aiDesc}
                      onChange={(e) => setAiDesc(e.target.value)}
                      rows={2}
                      placeholder="Ej: Somos una tienda de ropa femenina con envíos a todo Chile. Vendemos marcas nacionales e importadas."
                      className="input-glass resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Horario de atención
                    </label>
                    <input
                      value={aiHours}
                      onChange={(e) => setAiHours(e.target.value)}
                      placeholder="Ej: Lun–Vie 9am–7pm, Sáb 10am–2pm"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-medium flex items-center gap-1.5 mb-1.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <AlertCircle className="w-3 h-3" style={{ color: '#EF4444' }} strokeWidth={2} />
                      Qué NO debe decir nunca el bot
                    </label>
                    <input
                      value={aiNever}
                      onChange={(e) => setAiNever(e.target.value)}
                      placeholder="Ej: prometer descuentos, mencionar a la competencia, revelar precios de costo"
                      className="input-glass"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tono */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
            Tono de atención
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setAiTone(tone.value)}
                className="py-2.5 px-3 rounded-xl text-left transition-all"
                style={
                  aiTone === tone.value
                    ? { background: 'var(--accent-dim)', border: '2px solid var(--accent)' }
                    : { border: '1px solid var(--border-default)', background: 'transparent' }
                }
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: aiTone === tone.value ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {tone.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{tone.hint}</p>
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
              <input
                type="range"
                min={0}
                max={14}
                value={aiFollowupDays}
                onChange={(e) => setAiFollowupDays(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-sm font-semibold w-16 text-right" style={{ color: 'var(--text-primary)' }}>
                {aiFollowupDays === 0 ? 'Apagado' : `${aiFollowupDays} días`}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Percent className="w-3.5 h-3.5" strokeWidth={1.75} /> Descuento máximo IA
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={aiDiscountPct}
                onChange={(e) => setAiDiscountPct(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-sm font-semibold w-12 text-right" style={{ color: 'var(--text-primary)' }}>
                {aiDiscountPct}%
              </span>
            </div>
            {aiDiscountPct > 0 && (
              <p className="text-[10px] mt-1" style={{ color: '#F59E0B' }}>
                El bot puede ofrecer hasta {aiDiscountPct}% de descuento. Cada descuento queda registrado en el log.
              </p>
            )}
          </div>
        </div>

        {/* Prompt preview */}
        <div>
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
            {showPreview ? 'Ocultar' : 'Ver'} prompt generado
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showPreview ? 'rotate-180' : ''}`}
              strokeWidth={1.75}
            />
          </button>
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-3 p-4 rounded-xl text-xs leading-relaxed font-mono"
                  style={{
                    background: 'var(--bg-surface)',
                    border:     '1px solid var(--border-subtle)',
                    color:      'var(--text-secondary)',
                  }}
                >
                  {currentPrompt || <span style={{ color: 'var(--text-tertiary)' }}>Completa los campos para ver el prompt generado.</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Test del bot ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setTestOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 transition-colors"
          style={{ background: 'var(--bg-elevated)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-dim)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Test del bot</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Prueba cómo responde el bot con tu configuración actual
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${testOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
            strokeWidth={1.75}
          />
        </button>

        <AnimatePresence>
          {testOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)' }}>
                {/* Chat messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {testMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Bot className="w-8 h-8 opacity-20" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.5} />
                      <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                        Escribe un mensaje para ver cómo respondería tu bot IA.<br />
                        Prueba preguntas reales que harían tus clientes.
                      </p>
                    </div>
                  ) : (
                    testMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'bot' && (
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                            style={{ background: 'var(--accent-dim)' }}
                          >
                            <Bot className="w-3 h-3" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                          </div>
                        )}
                        <div
                          className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                          style={
                            msg.role === 'user'
                              ? { background: 'var(--accent)', color: '#080c10' }
                              : {
                                  background: 'var(--bg-elevated)',
                                  color:      'var(--text-primary)',
                                  border:     '1px solid var(--border-subtle)',
                                }
                          }
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  {testLoading && (
                    <div className="flex justify-start">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                        style={{ background: 'var(--accent-dim)' }}
                      >
                        <Bot className="w-3 h-3" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                      </div>
                      <div
                        className="px-3.5 py-2.5 rounded-2xl text-sm"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
                      >
                        Pensando…
                      </div>
                    </div>
                  )}
                  <div ref={testEndRef} />
                </div>

                {/* Input */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendTestMessage() }}
                    placeholder="Escribe como si fueras un cliente…"
                    className="flex-1 rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: 'var(--bg-elevated)',
                      border:     '1px solid var(--border-default)',
                      color:      'var(--text-primary)',
                      outline:    'none',
                    }}
                  />
                  <button
                    onClick={sendTestMessage}
                    disabled={testLoading || !testInput.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: 'var(--accent)', color: '#080c10' }}
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} /> Enviar
                  </button>
                  {testMessages.length > 0 && (
                    <button
                      onClick={() => setTestMessages([])}
                      className="p-2 rounded-xl transition-colors"
                      style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </div>

              {/* Discount log */}
              {aiDiscountPct > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Percent className="w-4 h-4" style={{ color: '#F59E0B' }} strokeWidth={1.75} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Log de descuentos aplicados
                      </p>
                    </div>
                    {discountLoading ? (
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Cargando…</p>
                    ) : discountLogs.length === 0 ? (
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                      >
                        <Check className="w-4 h-4" style={{ color: '#10B981' }} strokeWidth={2} />
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Sin descuentos aplicados aún. Cada descuento que ofrezca el bot aparecerá aquí automáticamente.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {discountLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                          >
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {new Date(log.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            <span
                              className="font-bold px-2 py-0.5 rounded-lg"
                              style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                            >
                              -{log.discount_pct}%
                            </span>
                            <span
                              className="font-medium px-2 py-0.5 rounded-lg"
                              style={
                                log.approved
                                  ? { background: 'rgba(16,185,129,0.1)', color: '#10B981' }
                                  : { background: 'rgba(239,68,68,0.1)', color: '#EF4444' }
                              }
                            >
                              {log.approved ? 'Aprobado' : 'Pendiente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Plantillas ── */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Plantillas de IA</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Usa <code className="text-[11px] px-1 rounded" style={{ background: 'var(--bg-surface)' }}>[variable]</code> para insertar datos dinámicos del cliente o catálogo
            </p>
          </div>
          <button
            onClick={() => {
              setPlantillaEditando({
                id: '', business_id: datosNegocio.id,
                trigger_keywords: [], mensaje_template: '',
                usage_count: 0, created_at: new Date().toISOString(),
              })
              setMensajePlantilla('')
              setKeywordsPlantilla('')
              setDescuentoPlantilla(0)
              setSeguimientoAuto(false)
              setDiasSeguimiento('3')
            }}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Crear plantilla
          </button>
        </div>

        {plantillas.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>No hay plantillas creadas.</p>
        ) : (
          <div className="space-y-2">
            {plantillas.map((t) => {
              const vars = extractVariables(t.mensaje_template)
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--accent)' }}>
                        {t.category || 'General'}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {highlightVariables(t.mensaje_template)}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {(t.trigger_keywords || []).map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}
                          >
                            {kw}
                          </span>
                        ))}
                        {vars.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                            {vars.length} variable{vars.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPlantillaEditando(t)
                        setMensajePlantilla(t.mensaje_template)
                        setKeywordsPlantilla((t.trigger_keywords || []).join(', '))
                      }}
                      className="text-xs font-medium shrink-0"
                      style={{ color: 'var(--accent)' }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal plantilla ── */}
      <AnimatePresence>
        {plantillaEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 space-y-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  {plantillaEditando.id ? 'Editar plantilla' : 'Nueva plantilla'}
                </h3>
                <button
                  onClick={() => setPlantillaEditando(null)}
                  className="p-2 rounded-xl"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Mensaje template
                </label>
                <textarea
                  value={mensajePlantilla}
                  onChange={(e) => setMensajePlantilla(e.target.value)}
                  rows={4}
                  placeholder="¡Hola [nombre]! Tu pedido de [producto] está listo para retirar."
                  className="input-glass resize-none"
                />
                {/* Variable chips */}
                {templateVariables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Variables detectadas:</span>
                    {templateVariables.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Usa <strong>[nombre]</strong>, <strong>[producto]</strong>, <strong>[precio]</strong>, <strong>[fecha]</strong> para insertar datos del cliente o catálogo automáticamente.
                </p>
              </div>

              {/* Preview */}
              {mensajePlantilla.trim() && (
                <div
                  className="p-3 rounded-xl text-sm leading-relaxed"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    Preview
                  </p>
                  {highlightVariables(mensajePlantilla)}
                </div>
              )}

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Trigger keywords (separadas por coma)
                </label>
                <input
                  value={keywordsPlantilla}
                  onChange={(e) => setKeywordsPlantilla(e.target.value)}
                  placeholder="precio, descuento, oferta"
                  className="input-glass"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Descuento sugerido: {descuentoPlantilla}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={descuentoPlantilla}
                  onChange={(e) => setDescuentoPlantilla(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setSeguimientoAuto(!seguimientoAuto)}
                >
                  <div
                    className="w-8 h-5 rounded-full transition-colors relative"
                    style={{ background: seguimientoAuto ? 'var(--accent)' : 'var(--border-default)' }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform"
                      style={{ left: seguimientoAuto ? '14px' : '2px' }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Seguimiento automático</span>
                </div>
                {seguimientoAuto && (
                  <select
                    value={diasSeguimiento}
                    onChange={(e) => setDiasSeguimiento(e.target.value)}
                    className="input-glass ml-auto cursor-pointer"
                    style={{ width: 'auto' }}
                  >
                    <option value="3">3 días</option>
                    <option value="5">5 días</option>
                    <option value="7">7 días</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPlantillaEditando(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  Cancelar
                </button>
                <button onClick={guardarPlantilla} className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl">
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal vertical ── */}
      <AnimatePresence>
        {modalVertical && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 space-y-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}
            >
              <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Nueva vertical
              </h3>
              <input
                value={nombreVerticalNueva}
                onChange={(e) => setNombreVerticalNueva(e.target.value)}
                placeholder="Nombre de la vertical"
                className="input-glass"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalVertical(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const nombre = nombreVerticalNueva.trim()
                    if (!nombre) return
                    const nueva = {
                      value: nombre.toLowerCase().replace(/\s+/g, '-') as VerticalNegocio,
                      label: nombre,
                    }
                    setVerticalesCustom((p) => [nueva, ...p])
                    setDatosNegocio((p) => ({ ...p, vertical_principal: nueva.value }))
                    setNombreVerticalNueva('')
                    setModalVertical(false)
                  }}
                  className="btn-accent px-5 py-2.5 text-sm font-semibold rounded-xl"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
