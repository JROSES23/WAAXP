'use client'

import Sidebar from "@/src/components/dashboard/Sidebar";
import { ReactNode, useState, useEffect } from "react";
import { Bell, Search, ChevronDown, Power } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isAIActive, setIsAIActive] = useState(true);
  const router = useRouter();

  // Simular verificación de conexión WhatsApp
  useEffect(() => {
    // Aquí conectarías con tu backend para verificar estado real
    const checkWhatsAppStatus = async () => {
      // Por ahora simulamos que no está conectado
      setIsWhatsAppConnected(false);
    };
    checkWhatsAppStatus();
    // Verificar cada 30 segundos
    const interval = setInterval(checkWhatsAppStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePendingClick = (conversationId: string) => {
    router.push(`/dashboard/inbox?conversation=${conversationId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar clientes, productos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Toggle */}
            <button
              onClick={() => setIsAIActive(!isAIActive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isAIActive
                  ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isAIActive ? 'Desactivar IA' : 'Activar IA'}
            >
              <Power className="w-4 h-4" />
              <span className="hidden md:inline">IA {isAIActive ? 'Activa' : 'Pausada'}</span>
            </button>

            {/* WhatsApp Status Badge - Solo si está conectado */}
            {isWhatsAppConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                <span className="hidden md:inline">WhatsApp</span>
              </div>
            )}

            {/* WhatsApp Desconectado */}
            {!isWhatsAppConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="hidden md:inline">WA Desconectado</span>
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  R
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">Renato</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Mi Empresa S.A.</p>
                    <p className="text-xs text-gray-500 mt-1">vendia@empresa.cl</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Mi perfil
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Configuración
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Ayuda y soporte
                  </a>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Cerrar sesión
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  );
}
