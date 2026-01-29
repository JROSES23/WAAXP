'use client'

import { useEffect, useState } from 'react'
import { Search, Check, AlertCircle, Send, Paperclip, Smile, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: boolean
  status: 'new' | 'pending' | 'active' | 'closed'
  avatar: string
  hasAIResponse: boolean
  aiSuggestion?: string
}

export default function Inbox() {
  const [selectedConv, setSelectedConv] = useState<string>('juan-perez')
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const conversations: Conversation[] = [
    {
      id: 'juan-perez',
      name: 'Juan Pérez',
      lastMessage: 'Hola, quería saber el precio del producto',
      time: '2 min',
      unread: true,
      status: 'new',
      avatar: 'J',
      hasAIResponse: true,
      aiSuggestion: 'Hola Juan, el precio del producto Premium es $45.000 CLP. Incluye envío gratis a todo Chile. ¿Te gustaría proceder con la compra?'
    },
    {
      id: 'maria-lopez',
      name: 'María López',
      lastMessage: '¿Tienen stock del modelo anterior?',
      time: '15 min',
      unread: true,
      status: 'pending',
      avatar: 'M',
      hasAIResponse: true,
      aiSuggestion: 'Hola María, sí tenemos 5 unidades disponibles del modelo anterior a $32.000 CLP.'
    },
    {
      id: 'ferreteria',
      name: 'Ferretería San Luis',
      lastMessage: 'Necesito cotización para 50 unidades',
      time: '1h',
      unread: false,
      status: 'pending',
      avatar: 'F',
      hasAIResponse: true,
      aiSuggestion: 'Para compras mayoristas de 50+ unidades ofrecemos precio especial de $38.000 por unidad.'
    },
    {
      id: 'carlos',
      name: 'Carlos Muñoz',
      lastMessage: 'Gracias por la atención',
      time: '2h',
      unread: false,
      status: 'closed',
      avatar: 'C',
      hasAIResponse: false
    },
  ]

  const selectedConversation = conversations.find(c => c.id === selectedConv)

  const messages = [
    {
      id: 1,
      sender: 'client',
      text: 'Hola, quería saber el precio del producto',
      time: '18:30',
      status: 'read'
    },
  ]

  useEffect(() => {
    if (!selectedConv) {
      return
    }

    if (!isLoading) {
      return
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 350)

    return () => clearTimeout(timer)
  }, [selectedConv, isLoading])

  const handleSelectConversation = (id: string) => {
    setIsLoading(true)
    setSelectedConv(id)
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header único del Inbox */}
      <div className="border-b border-slate-200 px-6 py-5 bg-white flex-shrink-0">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
            <p className="text-sm text-slate-600 mt-1">Gestiona todas tus conversaciones</p>
          </div>
          
          {/* Filtros rápidos */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors">
              Nuevos (3)
            </button>
            <button className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              En curso
            </button>
            <button className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              Archivados
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal del chat */}
      <div className="flex flex-1 max-w-[1800px] mx-auto w-full overflow-hidden">
        {/* Lista de conversaciones - Izquierda */}
        <div className="w-[380px] border-r border-slate-200 flex flex-col bg-white flex-shrink-0">
          {/* Header de conversaciones */}
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Conversaciones</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 bg-teal-600 text-white rounded-md text-xs font-medium">
                Nuevos (2)
              </button>
              <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-50">
                Pendientes
              </button>
              <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-50">
                Todos
              </button>
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full flex items-start gap-3 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  selectedConv === conv.id ? 'bg-slate-100' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {conv.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-semibold truncate ${
                      conv.unread ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                      {conv.name}
                    </h3>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{conv.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${
                      conv.unread ? 'text-slate-600 font-medium' : 'text-slate-500'
                    }`}>
                      {conv.lastMessage}
                    </p>
                    
                    {conv.unread && (
                      <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ml-2">
                        1
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="mt-2">
                    {conv.status === 'new' && (
                      <Badge variant="success">
                        <AlertCircle className="w-3 h-3" />
                        Nuevo
                      </Badge>
                    )}
                    {conv.status === 'pending' && conv.hasAIResponse && (
                      <Badge variant="warning" className="border border-amber-300/70 bg-amber-100/80">
                        <Clock className="w-3 h-3" />
                        Pendiente aprobación
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de chat - Derecha */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {selectedConversation ? (
            <>
              {isLoading ? (
                <div className="flex-1 animate-pulse">
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 rounded w-40" />
                      <div className="h-2.5 bg-slate-200 rounded w-52" />
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-20 bg-white rounded-xl border border-slate-200" />
                    <div className="h-32 bg-white rounded-xl border border-slate-200" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Header del chat */}
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
                        {selectedConversation.avatar}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{selectedConversation.name}</h3>
                        <p className="text-xs text-slate-500">Cliente • Alta intención de compra</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="success">WhatsApp conectado</Badge>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Mensaje del cliente */}
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {selectedConversation.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-slate-200 rounded-lg rounded-tl-none p-3 max-w-[70%]">
                          <p className="text-sm text-slate-800">{messages[0].text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs text-slate-500">18:30</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sugerencia de IA */}
                    {selectedConversation.hasAIResponse && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-900">Respuesta sugerida por IA</p>
                            <p className="text-xs text-blue-700">Revisa y aprueba antes de enviar</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 mb-3">
                          <p className="text-sm text-slate-800">{selectedConversation.aiSuggestion}</p>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                            <Check className="w-4 h-4" />
                            Aprobar y enviar
                          </button>
                          <button className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                            Editar respuesta
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input de mensaje */}
                  <div className="px-6 py-4 bg-white border-t border-slate-200 flex-shrink-0">
                    <div className="flex items-end gap-3">
                      <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>

                      <div className="flex-1">
                        <textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Escribe un mensaje o deja que la IA responda..."
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          rows={1}
                        />
                      </div>

                      <button className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">Enter</kbd> para enviar
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Selecciona una conversación</h3>
                <p className="text-sm text-slate-500">Elige un chat para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
