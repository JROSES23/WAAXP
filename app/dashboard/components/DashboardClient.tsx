'use client'

import { useRouter } from "next/navigation"
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface DashboardClientProps {
  user: User
}

// Interface para ConversationPreview (FUERA del componente)
interface ConversationPreviewProps {
  conversation: {
    id: string
    name: string
    avatar: string
    msg: string
    aiResponse: string
    time: string
    status: string
    intent: string
  }
  onApprove: () => void
  onEdit: () => void
  onView: () => void
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    return createClient()
  }, [])

  const handleLogout = async () => {
    if (!supabase) {
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handlePendingClick = (conversationId: string) => {
    router.push(`/dashboard/inbox?conversation=${conversationId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Mejorado */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Logo + Breadcrumb */}
            <div className="flex items-center gap-4">
              <Logo size="md" showText={true} />
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Panel principal</h1>
                <p className="text-xs text-slate-500">Gestiona tu asistente IA</p>
              </div>
            </div>

            {/* Right: User + Status */}
            <div className="flex items-center gap-4">
              {/* WA Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">WA Conectado</span>
              </div>

              {/* IA Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-semibold text-teal-700">IA Activa</span>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">Administrador</p>
                  <p className="text-sm font-semibold text-slate-900">{user.email?.split('@')[0]}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Ventas este mes"
            value="$1.200"
            change="+12%"
            icon="chart"
            gradient="from-teal-500 to-cyan-600"
            bgGradient="from-teal-50 to-cyan-50"
          />
          <MetricCard 
            title="Chats activos"
            value="12"
            change="+3"
            icon="chat"
            gradient="from-blue-500 to-indigo-600"
            bgGradient="from-blue-50 to-indigo-50"
          />
          <MetricCard 
            title="Tasa de cierre"
            value="25%"
            change="+5%"
            icon="percent"
            gradient="from-purple-500 to-pink-600"
            bgGradient="from-purple-50 to-pink-50"
          />
        </div>

        {/* Inbox Híbrido Preview - Con acciones de aprobación */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Inbox Híbrido</h3>
                <p className="text-sm text-slate-600">3 mensajes pendientes de aprobación</p>
              </div>
            </div>
            <Link 
              href="/dashboard/inbox"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2"
            >
              Ver todo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Preview de conversaciones con acciones */}
          <div className="divide-y divide-slate-100">
            {[
              { 
                id: 'juan-perez-001',
                name: 'Juan Pérez', 
                avatar: 'J',
                msg: 'Hola, quería saber el precio del producto', 
                aiResponse: 'Hola Juan, el precio del producto Premium es $45.000 CLP. Incluye envío gratis a todo Chile. ¿Te gustaría proceder con la compra?',
                time: '2 min',
                status: 'pending',
                intent: 'Consulta de precio'
              },
              { 
                id: 'maria-lopez-002',
                name: 'María López', 
                avatar: 'M',
                msg: '¿Tienen stock del modelo anterior?', 
                aiResponse: 'Hola María, sí tenemos 5 unidades disponibles del modelo anterior a $32.000 CLP cada una. ¿Cuántas unidades necesitas?',
                time: '8 min',
                status: 'pending',
                intent: 'Consulta de stock'
              },
              { 
                id: 'ferreteria-003',
                name: 'Ferretería San Luis', 
                avatar: 'F',
                msg: 'Necesito cotización para 50 unidades', 
                aiResponse: 'Hola, para compras al por mayor de 50+ unidades tenemos precios especiales. El costo por unidad sería $38.000 CLP. Total: $1.900.000. ¿Te envío la cotización formal?',
                time: '15 min',
                status: 'pending',
                intent: 'Solicitud de cotización'
              },
            ].map((conv) => (
              <ConversationPreview 
                key={conv.id}
                conversation={conv}
                onApprove={() => {
                  router.push(`/dashboard/inbox?conversation=${conv.id}&action=approve`)
                }}
                onEdit={() => {
                  router.push(`/dashboard/inbox?conversation=${conv.id}&action=edit`)
                }}
                onView={() => {
                  router.push(`/dashboard/inbox?conversation=${conv.id}`)
                }}
              />
            ))}
          </div>
        </div>

        {/* Sección inferior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estado del asistente */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Estado del sistema</h3>
            </div>
            <div className="space-y-3">
              <StatusItem label="WhatsApp Business" status="Conectado" isConnected={true} />
              <StatusItem label="IA Gemini" status="Activa" isConnected={true} />
              <StatusItem label="Webhook" status="Funcionando" isConnected={true} />
              <StatusItem label="Base de datos" status="Online" isConnected={true} />
            </div>
          </div>

          {/* Impacto del asistente */}
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Impacto del asistente</h3>
            </div>
            <div className="space-y-4">
              <ImpactItem label="Ventas recuperadas" value="$1.250.000" isDark={true} />
              <ImpactItem label="Conversaciones atendidas" value="847" isDark={true} />
              <ImpactItem label="Horas ahorradas" value="42h" isDark={true} />
              <ImpactItem label="Satisfacción promedio" value="96%" isDark={true} />
            </div>
            <div className="mt-5 pt-5 border-t border-white/20">
              <p className="text-xs text-teal-100">Datos del último mes</p>
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pendientes</h3>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-bold">
                3
              </span>
            </div>
            <div className="space-y-3">
              <PendingItem 
                title="Cotización María López" 
                time="hace 3 min"
                type="aprobacion"
                onClick={() => handlePendingClick('maria-lopez-001')}
              />
              <PendingItem 
                title="Descuento Ferretería" 
                time="hace 8 min"
                type="aprobacion"
                onClick={() => handlePendingClick('ferreteria-san-luis')}
              />
              <PendingItem 
                title="Cierre David Frarez" 
                time="hace 15 min"
                type="urgente"
                onClick={() => handlePendingClick('david-frarez-002')}
              />
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors text-sm border border-slate-200">
              Ver todos los pendientes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: string
  gradient: string
  bgGradient: string
}

function MetricCard({ title, value, change, icon, gradient, bgGradient }: MetricCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon === 'chart' && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
            {icon === 'chat' && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
            {icon === 'percent' && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            change.startsWith('+') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {change}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

interface StatusItemProps {
  label: string
  status: string
  isConnected: boolean
}

function StatusItem({ label, status, isConnected }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className={`text-sm font-bold ${
          isConnected ? 'text-green-600' : 'text-red-600'
        }`}>{status}</span>
      </div>
    </div>
  )
}

interface ImpactItemProps {
  label: string
  value: string
  isDark?: boolean
}

function ImpactItem({ label, value, isDark = false }: ImpactItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${isDark ? 'text-teal-100' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  )
}

interface PendingItemProps {
  title: string
  time: string
  type: string
  onClick: () => void
}

function PendingItem({ title, time, type, onClick }: PendingItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-4 bg-slate-50 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 rounded-xl cursor-pointer border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left group"
    >
      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
        type === 'urgente' 
          ? 'bg-red-500 animate-pulse' 
          : 'bg-yellow-400 group-hover:bg-yellow-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <svg className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

// Componente de preview de conversación con acciones
function ConversationPreview({ conversation, onApprove, onEdit, onView }: ConversationPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      {/* Header de la conversación */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
          {conversation.avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Nombre y tiempo */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{conversation.name}</h4>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                PENDIENTE
              </span>
            </div>
            <span className="text-xs text-slate-500">{conversation.time}</span>
          </div>

          {/* Intent badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              {conversation.intent}
            </span>
          </div>

          {/* Mensaje del cliente */}
          <div className="bg-slate-100 rounded-lg p-3 mb-2">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Cliente:</span> {conversation.msg}
            </p>
          </div>

          {/* Respuesta de la IA (colapsable) */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-bold text-teal-900">Respuesta sugerida por IA</span>
              </div>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                {isExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            </div>
            <p className={`text-sm text-slate-700 ${!isExpanded && 'line-clamp-2'}`}>
              {conversation.aiResponse}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              onClick={onApprove}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Aprobar y enviar
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:border-teal-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={onView}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
