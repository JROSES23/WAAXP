'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient }         from '@/lib/supabase/client'
import { toast }                from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react'
import type { Negocio } from '@/app/dashboard/types'

/* ─── TYPES ──────────────────────────────────────────────────── */

interface WhatsAppClientProps { negocio: Negocio }
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/* ─── CONSTANTS ──────────────────────────────────────────────── */

const cardStyle = {
  background:   'var(--bg-elevated)',
  border:       '1px solid var(--border-subtle)',
  borderRadius: '16px',
}

const STATUS_CFG = {
  disconnected: { icon: WifiOff,      label: 'Desconectado', color: '#EF4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)'  },
  connecting:   { icon: Clock,        label: 'Conectando…',  color: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)' },
  connected:    { icon: Wifi,         label: 'Conectado',    color: '#10B981', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.2)' },
  error:        { icon: XCircle,      label: 'Error',        color: '#EF4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)'  },
}

/* ─── CONNECTION STEPS ───────────────────────────────────────── */

const STEPS = [
  {
    icon: Phone,
    title: 'Ingresa tu número',
    desc:  'Escribe tu número de WhatsApp Business en formato internacional',
    hint:  'Ej: +56912345678',
  },
  {
    icon: QrCode,
    title: 'Genera el código QR',
    desc:  'Presiona el botón para generar tu código QR único',
    hint:  'El código dura 60 segundos',
  },
  {
    icon: Smartphone,
    title: 'Abre WhatsApp en tu celular',
    desc:  'Ve a los tres puntos (⋮) en la esquina superior derecha',
    hint:  'iOS: Ve a Ajustes desde la pestaña Chats',
  },
  {
    icon: ChevronRight,
    title: 'Toca "Dispositivos vinculados"',
    desc:  'Luego toca "Vincular dispositivo" y apunta la cámara al QR',
    hint:  'No necesitas mantener el celular con señal',
  },
  {
    icon: CheckCircle2,
    title: 'Espera la confirmación',
    desc:  'WAAXP detecta la conexión automáticamente en segundos',
    hint:  'El bot comienza a responder de inmediato',
  },
]

/* ─── COMPONENT ──────────────────────────────────────────────── */

export default function WhatsAppClient({ negocio }: WhatsAppClientProps) {
  const supabase = createClient()

  const [status,      setStatus]      = useState<ConnectionStatus>(
    negocio.whatsapp_status === 'connected' ? 'connected' : 'disconnected'
  )
  const [qrCode,      setQrCode]      = useState<string | null>(null)
  const [phone,       setPhone]       = useState(negocio.whatsapp_phone ?? '')
  const [loading,     setLoading]     = useState(false)
  const [lastSync,    setLastSync]    = useState<string | null>(null)
  const [msgCount,    setMsgCount]    = useState<number | null>(null)
  const [wasConnected,setWasConnected]= useState(negocio.whatsapp_status === 'connected')
  const [activeStep,  setActiveStep]  = useState(0)

  /* ── Realtime ── */
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'businesses', filter: `id=eq.${negocio.id}` },
        (payload) => {
          const newStatus = (payload.new as Negocio).whatsapp_status
          if (newStatus === 'connected') {
            setStatus('connected')
            setQrCode(null)
            setWasConnected(true)
            toast.success('WhatsApp conectado exitosamente')
          } else if (newStatus === 'disconnected') {
            setStatus('disconnected')
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [negocio.id, supabase])

  useEffect(() => {
    if (status === 'connected') {
      setLastSync(new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }))
      setActiveStep(4)
    } else if (status === 'connecting') {
      setActiveStep(3)
    }
  }, [status])

  /* ── Load message count for today ── */
  useEffect(() => {
    if (status !== 'connected' || !negocio.id) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', negocio.id)
      .eq('role', 'assistant')
      .gte('timestamp', today.toISOString())
      .then(
        ({ count }) => setMsgCount(count ?? 0),
        () => setMsgCount(null)
      )
  }, [status, negocio.id, supabase])

  /* ── Actions ── */
  const generateQR = useCallback(async () => {
    setLoading(true)
    setStatus('connecting')
    setActiveStep(2)
    try {
      const res = await fetch('/api/whatsapp/qr', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ businessId: negocio.id }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.qr) {
          setQrCode(data.qr)
          setActiveStep(3)
          toast.info('Escanea el código QR con WhatsApp')
        } else if (data.status === 'connected') {
          setStatus('connected')
          toast.success('Ya estás conectado')
        }
      } else {
        setStatus('error')
        toast.error('Error al generar QR. Verifica la configuración del bot.')
      }
    } catch {
      setStatus('error')
      toast.error('No se pudo conectar al servidor del bot')
    } finally {
      setLoading(false)
    }
  }, [negocio.id])

  const disconnect = async () => {
    setLoading(true)
    try {
      await supabase
        .from('businesses')
        .update({ whatsapp_status: 'disconnected' })
        .eq('id', negocio.id)
      setStatus('disconnected')
      setQrCode(null)
      setActiveStep(0)
      toast.success('WhatsApp desconectado')
    } catch {
      toast.error('Error al desconectar')
    } finally {
      setLoading(false)
    }
  }

  const savePhone = async () => {
    if (!phone.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('businesses')
      .update({ whatsapp_phone: phone.trim() })
      .eq('id', negocio.id)
    if (!error) {
      toast.success('Teléfono guardado')
      if (activeStep === 0) setActiveStep(1)
    } else {
      toast.error('Error al guardar')
    }
    setLoading(false)
  }

  const cfg        = STATUS_CFG[status]
  const StatusIcon = cfg.icon

  /* ─── RENDER ─────────────────────────────────────────────── */

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">

      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
          WhatsApp
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Conecta tu cuenta de WhatsApp Business para activar el bot IA
        </p>
      </div>

      {/* ── Disconnect alert banner ── */}
      <AnimatePresence>
        {status === 'disconnected' && wasConnected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-3 px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#EF4444' }} strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                WhatsApp desconectado — el bot no está respondiendo
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Tus clientes están enviando mensajes sin respuesta automática. Reconecta lo antes posible para evitar pérdida de ventas.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${cfg.color}15` }}
            >
              <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
              {status === 'connected' && lastSync && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  Última sincronización: {lastSync}
                </p>
              )}
              {status === 'connecting' && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  Esperando escaneo del código QR…
                </p>
              )}
            </div>
          </div>
          {status === 'connected' && <CheckCircle2 className="w-6 h-6" style={{ color: '#10B981' }} />}
          {status === 'connecting' && (
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: '#F59E0B' }} strokeWidth={1.75} />
          )}
        </div>

        {/* Stats row (only when connected) */}
        {status === 'connected' && (
          <div
            className="grid grid-cols-3 gap-3 mt-4 pt-4"
            style={{ borderTop: `1px solid ${cfg.border}` }}
          >
            {[
              {
                icon:  MessageSquare,
                label: 'Mensajes hoy',
                value: msgCount !== null ? String(msgCount) : '—',
                color: '#10B981',
              },
              {
                icon:  Zap,
                label: 'Bot activo',
                value: 'IA ON',
                color: 'var(--accent)',
              },
              {
                icon:  Shield,
                label: 'Número baneado',
                value: 'No',
                color: '#10B981',
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.08)' }}
              >
                <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
                <p className="text-xs font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Phone number ── */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-dim)' }}
          >
            <Smartphone className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Paso 1 — Número de WhatsApp
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Ingresa el número de tu cuenta WhatsApp Business
            </p>
          </div>
          {phone && (
            <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: '#10B981' }} />
          )}
        </div>
        <div className="flex gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+56912345678"
            className="input-glass flex-1"
          />
          <button
            onClick={savePhone}
            disabled={loading || !phone.trim()}
            className="btn-accent px-5 py-2 text-sm font-semibold rounded-xl disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* ── QR section ── */}
      <div className="p-6 space-y-5" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-dim)' }}
          >
            <QrCode className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Paso 2 — Vincular dispositivo
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Escanea el QR desde WhatsApp &gt; Dispositivos vinculados
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'connected' ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  WhatsApp conectado correctamente
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  El bot IA está activo y respondiendo mensajes automáticamente
                </p>
              </div>
              <button
                onClick={disconnect}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                Desconectar
              </button>
            </motion.div>
          ) : qrCode ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4 space-y-4"
            >
              <div
                className="inline-block p-4 bg-white rounded-2xl shadow-lg"
                style={{ border: '3px solid rgba(16,185,129,0.3)' }}
              >
                <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Escanea desde tu celular
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  El código expira en 60 segundos
                </p>
              </div>
              <button
                onClick={generateQR}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                Regenerar QR
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'var(--bg-surface)' }}
              >
                <QrCode className="w-10 h-10 opacity-30" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {phone.trim() ? 'Genera el código QR para vincular WhatsApp' : 'Primero guarda tu número de WhatsApp arriba'}
                </p>
              </div>
              <button
                onClick={generateQR}
                disabled={loading || !phone.trim()}
                className="btn-accent px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generando…</>
                  : <><QrCode className="w-4 h-4" strokeWidth={1.75} /> Generar código QR</>
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Visual step guide ── */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Guía de conexión paso a paso
        </p>
        <div className="space-y-1">
          {STEPS.map((step, i) => {
            const Icon      = step.icon
            const isDone    = status === 'connected' || i < activeStep
            const isCurrent = !isDone && i === activeStep
            return (
              <div key={i} className="flex gap-3">
                {/* Connector line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: isDone
                        ? 'rgba(16,185,129,0.15)'
                        : isCurrent
                        ? 'var(--accent-dim)'
                        : 'var(--bg-surface)',
                      border: isDone
                        ? '1.5px solid rgba(16,185,129,0.4)'
                        : isCurrent
                        ? '1.5px solid var(--accent-border)'
                        : '1.5px solid var(--border-subtle)',
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: '#10B981' }}
                        strokeWidth={2}
                      />
                    ) : (
                      <Icon
                        className="w-4 h-4"
                        style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-tertiary)' }}
                        strokeWidth={1.75}
                      />
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="w-px flex-1 my-1 transition-colors duration-300"
                      style={{
                        background: isDone
                          ? 'rgba(16,185,129,0.3)'
                          : 'var(--border-subtle)',
                        minHeight: '16px',
                      }}
                    />
                  )}
                </div>
                {/* Content */}
                <div className={`pb-4 ${i === STEPS.length - 1 ? '' : ''}`}>
                  <p
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{
                      color: isDone
                        ? '#10B981'
                        : isCurrent
                        ? 'var(--text-primary)'
                        : 'var(--text-tertiary)',
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: isCurrent ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {step.desc}
                  </p>
                  {isCurrent && (
                    <p
                      className="text-[10px] mt-1 font-medium"
                      style={{ color: 'var(--accent)' }}
                    >
                      {step.hint}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Multi-number (Pro feature) ── */}
      <div
        className="p-6 rounded-2xl relative overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
      >
        <div
          className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          Plan Pro
        </div>
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <Smartphone className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Múltiples números de WhatsApp
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Conecta líneas separadas para ventas, soporte y sucursales. Cada número tiene su propio bot
              configurado independientemente, con métricas unificadas en el dashboard.
            </p>
            <div className="flex gap-2 mt-3">
              {['Ventas', 'Soporte', 'Sucursal Norte'].map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{
                    background:  'var(--bg-surface)',
                    border:      '1px solid var(--border-subtle)',
                    color:       'var(--text-tertiary)',
                    opacity:     i === 0 ? 1 : 0.5,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: i === 0 ? '#10B981' : 'var(--border-default)' }}
                  />
                  {label}
                </div>
              ))}
            </div>
            <button
              className="mt-3 text-xs font-semibold"
              style={{ color: 'var(--accent)' }}
              onClick={() => toast.info('Disponible en el Plan Pro. Ve a Billing para actualizar.')}
            >
              Actualizar a Pro →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
