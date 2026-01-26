'use client'

import { useState } from 'react'
import { Save, MessageSquare, Bell, Phone, Sparkles, Trash2, Send } from 'lucide-react'

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    miniPrompt: '',
    diasFollowUp: 3,
    tono: 'amigable',
    descuentoMax: 10,
    productosDestacados: [] as string[],
    whatsappNumero: '',
    whatsappWebhook: 'conectado',
    notificacionesPush: true
  })

  const [previewMessage, setPreviewMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('✅ Configuración guardada exitosamente')
    }, 1000)
  }

  const testChat = () => {
    if (!previewMessage.trim()) return
    
    const respuestaIA = generarRespuestaConPrompt(previewMessage)
    
    setChatMessages([
      ...chatMessages,
      { role: 'user', content: previewMessage },
      { role: 'assistant', content: respuestaIA }
    ])
    setPreviewMessage('')
  }

  const generarRespuestaConPrompt = (mensaje: string) => {
    const tonos = {
      amigable: '¡Hola! 😊 ',
      profesional: 'Estimado cliente, ',
      agresivo: '¡Oferta limitada! '
    }
    
    return `${tonos[config.tono as keyof typeof tonos]}${mensaje.includes('precio') ? 
      `Nuestros servicios parten desde $15.000 CLP. ` : 
      'Gracias por tu consulta. '}${config.miniPrompt ? `(Aplicando: ${config.miniPrompt.substring(0, 50)}...)` : ''}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuración</h1>
          <p className="text-sm text-slate-600">Personaliza el comportamiento de la IA sin código</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo - Configuración */}
        <div className="space-y-6">
          
          {/* Mini-Prompt IA */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Mini-Prompt IA</h2>
                <p className="text-xs text-slate-500">Define el comportamiento de la IA</p>
              </div>
            </div>
            
            <textarea
              value={config.miniPrompt}
              onChange={(e) => setConfig({...config, miniPrompt: e.target.value.slice(0, 500)})}
              placeholder='Ej: "Sé amigable para fontaneros residenciales, precios en CLP, follow-up día 3"'
              className="w-full border border-slate-200 rounded-lg p-3 h-32 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {config.miniPrompt.length}/500 caracteres
              </span>
              {config.miniPrompt.length > 0 && (
                <button
                  onClick={() => setConfig({...config, miniPrompt: ''})}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Opciones de Comportamiento */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Comportamiento</h2>
            
            <div className="space-y-5">
              {/* Días Follow-up */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Días para Follow-up Automático
                </label>
                <select
                  value={config.diasFollowUp}
                  onChange={(e) => setConfig({...config, diasFollowUp: Number(e.target.value)})}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value={1}>1 día</option>
                  <option value={3}>3 días (recomendado)</option>
                  <option value={7}>7 días</option>
                  <option value={14}>14 días</option>
                </select>
              </div>

              {/* Tono */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tono de Comunicación
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'amigable', label: 'Amigable', emoji: '😊' },
                    { value: 'profesional', label: 'Profesional', emoji: '💼' },
                    { value: 'agresivo', label: 'Directo', emoji: '⚡' }
                  ].map(tono => (
                    <button
                      key={tono.value}
                      onClick={() => setConfig({...config, tono: tono.value})}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        config.tono === tono.value 
                          ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{tono.emoji}</div>
                      <div className="text-xs font-semibold">{tono.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descuento Máximo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descuento Automático Máximo
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={config.descuentoMax}
                    onChange={(e) => setConfig({...config, descuentoMax: Number(e.target.value)})}
                    min={0}
                    max={50}
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-teal-600">{config.descuentoMax}</span>
                    <span className="text-sm text-slate-600">%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  La IA puede ofrecer hasta {config.descuentoMax}% de descuento
                </p>
              </div>

              {/* Productos Destacados */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Productos Destacados
                </label>
                <input
                  type="text"
                  placeholder="Ej: Llaves mezcladoras, Válvulas, Tuberías PVC"
                  onChange={(e) => setConfig({...config, productosDestacados: e.target.value.split(',')})}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Separa con comas</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">WhatsApp</h2>
                <p className="text-xs text-slate-500">Integración con WhatsApp Business</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Número Conectado
                </label>
                <input
                  type="text"
                  value={config.whatsappNumero}
                  onChange={(e) => setConfig({...config, whatsappNumero: e.target.value})}
                  placeholder="+56 9 1234 5678"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Estado Webhook</p>
                    <p className="text-xs text-slate-500 mt-0.5">Conexión con WhatsApp API</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      config.whatsappWebhook === 'conectado' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-sm font-semibold capitalize ${
                      config.whatsappWebhook === 'conectado' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {config.whatsappWebhook}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
                <p className="text-xs text-slate-500">Alertas y recordatorios</p>
              </div>
            </div>
            
            <label className="flex items-center justify-between cursor-pointer bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-slate-700">Notificaciones Push</p>
                <p className="text-xs text-slate-500 mt-0.5">Para aprobaciones móviles</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={config.notificacionesPush}
                  onChange={(e) => setConfig({...config, notificacionesPush: e.target.checked})}
                  className="sr-only"
                />
                <div className={`w-14 h-8 rounded-full transition ${
                  config.notificacionesPush ? 'bg-teal-600' : 'bg-slate-300'
                }`}>
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition transform ${
                    config.notificacionesPush ? 'translate-x-6' : ''
                  }`} />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Panel Derecho - Preview Chat */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit lg:sticky lg:top-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Preview & Test</h2>
              <p className="text-xs text-slate-500">Prueba tu configuración</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="border border-slate-200 rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gradient-to-b from-slate-50 to-white">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Sin mensajes aún</p>
                <p className="text-xs text-slate-400 mt-1">Escribe un mensaje de prueba abajo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={previewMessage}
                onChange={(e) => setPreviewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testChat()}
                placeholder="Escribe un mensaje de prueba..."
                className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={testChat}
                disabled={!previewMessage.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {chatMessages.length > 0 && (
              <button
                onClick={() => setChatMessages([])}
                className="w-full text-sm text-slate-600 hover:text-red-600 font-medium flex items-center justify-center gap-2 py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
