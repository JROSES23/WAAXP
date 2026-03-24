'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone, QrCode, CheckCircle2, XCircle,
  RefreshCw, Wifi, WifiOff, Clock,
} from 'lucide-react'
import type { Negocio } from '@/app/dashboard/types'

interface WhatsAppClientProps { negocio: Negocio }
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

const cardStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }

const STATUS_CFG = {
  disconnected: { icon: WifiOff,      label: 'Desconectado', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
  connecting:   { icon: Clock,        label: 'Conectando…',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  connected:    { icon: Wifi,         label: 'Conectado',    color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  error:        { icon: XCircle,      label: 'Error',        color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
}

export default function WhatsAppClient({ negocio }: WhatsAppClientProps) {
  const supabase = createClient()
  const [status,   setStatus]   = useState<ConnectionStatus>(
    negocio.whatsapp_status === 'connected' ? 'connected' : 'disconnected'
  )
  const [qrCode,   setQrCode]   = useState<string | null>(null)
  const [phone,    setPhone]    = useState(negocio.whatsapp_phone ?? '')
  const [loading,  setLoading]  = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'businesses', filter: `id=eq.${negocio.id}` },
        (payload) => {
          const newStatus = (payload.new as Negocio).whatsapp_status
          if (newStatus === 'connected') {
            setStatus('connected'); setQrCode(null)
            toast.success('WhatsApp conectado exitosamente')
          } else if (newStatus === 'disconnected') {
            setStatus('disconnected')
          }
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [negocio.id, supabase])

  useEffect(() => {
    if (status === 'connected') setLastSync(new Date().toLocaleString('es-CL'))
  }, [status])

  const generateQR = useCallback(async () => {
    setLoading(true); setStatus('connecting')
    try {
      const res  = await fetch('/api/whatsapp/qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: negocio.id }) })
      if (res.ok) {
        const data = await res.json()
        if (data.qr)                 { setQrCode(data.qr); toast.info('Escanea el código QR con WhatsApp') }
        else if (data.status === 'connected') { setStatus('connected'); toast.success('Ya estás conectado') }
      } else { setStatus('error'); toast.error('Error al generar QR. Verifica la configuración del bot.') }
    } catch { setStatus('error'); toast.error('No se pudo conectar al servidor del bot') }
    finally  { setLoading(false) }
  }, [negocio.id])

  const disconnect = async () => {
    setLoading(true)
    try {
      await supabase.from('businesses').update({ whatsapp_status: 'disconnected' }).eq('id', negocio.id)
      setStatus('disconnected'); setQrCode(null)
      toast.success('WhatsApp desconectado')
    } catch { toast.error('Error al desconectar') }
    finally  { setLoading(false) }
  }

  const savePhone = async () => {
    if (!phone.trim()) return
    setLoading(true)
    const { error } = await supabase.from('businesses').update({ whatsapp_phone: phone.trim() }).eq('id', negocio.id)
    error ? toast.error('Error al guardar') : toast.success('Teléfono guardado')
    setLoading(false)
  }

  const cfg        = STATUS_CFG[status]
  const StatusIcon = cfg.icon

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>WhatsApp QR</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Conecta tu cuenta de WhatsApp Business para activar el bot IA</p>
      </div>

      {/* Estado */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl flex items-center justify-between"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <div className="flex items-center gap-3">
          <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
            {status === 'connected' && lastSync && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Última sincronización: {lastSync}</p>
            )}
          </div>
        </div>
        {status === 'connected' && <CheckCircle2 className="w-6 h-6" style={{ color: '#10B981' }} />}
      </motion.div>

      {/* Teléfono */}
      <div className="p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
            <Smartphone className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Número de WhatsApp</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Formato internacional: +56912345678</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+56912345678" className="input-glass flex-1" />
          <button onClick={savePhone} disabled={loading}
            className="btn-accent px-5 py-2 text-sm font-semibold rounded-xl disabled:opacity-50">
            Guardar
          </button>
        </div>
      </div>

      {/* QR */}
      <div className="p-6 space-y-5" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
            <QrCode className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Vincular dispositivo</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Escanea el QR desde WhatsApp &gt; Dispositivos vinculados</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'connected' ? (
            <motion.div key="connected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="w-10 h-10" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>WhatsApp conectado correctamente</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>El bot IA está activo y respondiendo mensajes</p>
              <button onClick={disconnect} disabled={loading}
                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                Desconectar
              </button>
            </motion.div>
          ) : qrCode ? (
            <motion.div key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center py-4 space-y-4">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56" />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>El código expira en 60 segundos</p>
              <button onClick={generateQR} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                Regenerar QR
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'var(--bg-surface)' }}>
                <QrCode className="w-10 h-10 opacity-30" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.5} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Genera un código QR para vincular WhatsApp</p>
              <button onClick={generateQR} disabled={loading}
                className="btn-accent px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 inline-flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Generando…</> : <><QrCode className="w-4 h-4" strokeWidth={1.75} />Generar código QR</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instrucciones */}
      <div className="p-6 space-y-3" style={cardStyle}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Instrucciones</h3>
        <ol className="space-y-2">
          {[
            'Ingresa tu número de WhatsApp Business y guárdalo',
            'Presiona "Generar código QR"',
            'Abre WhatsApp en tu teléfono',
            'Ve a Ajustes > Dispositivos vinculados > Vincular dispositivo',
            'Escanea el código QR que aparece en pantalla',
            'Espera la confirmación de conexión',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
