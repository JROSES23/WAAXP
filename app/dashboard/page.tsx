'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';  // ⭐ AGREGAR ESTA LÍNEA
import Inbox from './inbox/Inbox';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Session['user'] | null>(null)

  // ⭐ Verificación de autenticación
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login')
        } else {
          setUser(session.user)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Pantalla de carga mientras verifica auth
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  const handlePendingClick = (conversationId: string) => {
    router.push(`/dashboard/inbox?conversation=${conversationId}`);
  };

  // ⭐ UN SOLO RETURN
  return (
    <div className="p-6">
      {/* Header con logout */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Panel principal
          </h1>
          <p className="text-sm text-gray-500">
            Revisa cómo tu asistente está ayudando a tu negocio.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-right">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Métricas principales - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard 
          title="Ventas este mes"
          value="$1,200"
          change="+12%"
          icon="chart"
          color="#0f766e"
        />
        <MetricCard 
          title="Chats activos"
          value="12"
          change="+3"
          icon="chat"
          color="#0f766e"
        />
        <MetricCard 
          title="Tasa de cierre"
          value="25%"
          change="+5%"
          icon="percent"
          color="#0f766e"
        />
      </div>

      {/* Inbox Híbrido - más grande */}
      <div className="mb-6">
        <Inbox />
      </div>

      {/* Sección inferior: Estado, Impacto, Pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado del asistente */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Estado del asistente
          </h3>
          <div className="space-y-3">
            <StatusItem label="WhatsApp" status="Conectado" isConnected={true} />
            <StatusItem label="IA Gemini" status="Activa" isConnected={true} />
            <StatusItem label="Webhook" status="Funcionando" isConnected={true} />
          </div>
        </div>

        {/* Impacto del asistente */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Impacto del asistente
          </h3>
          <div className="space-y-3">
            <ImpactItem label="Ventas recuperadas" value="$1.250.000" />
            <ImpactItem label="Conversaciones" value="847" />
            <ImpactItem label="Horas ahorradas" value="42h" />
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">
              Pendientes
            </h3>
            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">
              3
            </span>
          </div>
          <div className="space-y-2">
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
        </div>
      </div>
    </div>
  );
}

// Componente de métrica superior
function MetricCard({ title, value, change, icon, color }: { 
  title: string; 
  value: string; 
  change: string;
  icon: string; 
  color: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700 flex-shrink-0">
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
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <span className={`text-sm font-semibold ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de estado
function StatusItem({ label, status, isConnected }: { 
  label: string; 
  status: string;
  isConnected: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className={`text-sm font-semibold ${
          isConnected ? 'text-green-600' : 'text-red-600'
        }`}>{status}</span>
      </div>
    </div>
  );
}

// Componente de impacto
function ImpactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

// Componente de pendiente
function PendingItem({ title, time, type, onClick }: { 
  title: string; 
  time: string; 
  type: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer border border-gray-200 hover:border-teal-300 transition-all text-left"
    >
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
        type === 'urgente' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </button>
  );
}
