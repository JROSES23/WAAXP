'use client';

import { useState } from 'react';
import { Save, MessageSquare, Bell, Phone, Sparkles } from 'lucide-react';

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
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);

  const handleSave = () => {
    // Aquí guardarías en tu base de datos
    alert('Configuración guardada exitosamente');
  };

  const testChat = () => {
    if (!previewMessage.trim()) return;
    
    // Simula respuesta de IA con el prompt aplicado
    const respuestaIA = generarRespuestaConPrompt(previewMessage);
    
    setChatMessages([
      ...chatMessages,
      { role: 'user', content: previewMessage },
      { role: 'assistant', content: respuestaIA }
    ]);
    setPreviewMessage('');
  };

  const generarRespuestaConPrompt = (mensaje: string) => {
    // Simula cómo respondería la IA con la configuración actual
    const tonos = {
      amigable: '¡Hola! 😊 ',
      profesional: 'Estimado cliente, ',
      agresivo: '¡Oferta limitada! '
    };
    
    return `${tonos[config.tono as keyof typeof tonos]}${mensaje.includes('precio') ? 
      `Nuestros servicios parten desde $${(15000).toLocaleString('es-CL')} CLP. ` : 
      'Gracias por tu consulta. '}${config.miniPrompt ? `(Aplicando: ${config.miniPrompt.substring(0, 50)}...)` : ''}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-gray-600 mt-1">Personaliza el comportamiento de la IA sin código</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo - Configuración */}
        <div className="space-y-6">
          
          {/* Mini-Prompt IA */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-600" size={20} />
              <h2 className="text-xl font-semibold">Mini-Prompt IA</h2>
            </div>
            
            <textarea
              value={config.miniPrompt}
              onChange={(e) => setConfig({...config, miniPrompt: e.target.value.slice(0, 500)})}
              placeholder='Ej: "Sé amigable para fontaneros residenciales, precios en CLP, follow-up día 3"'
              className="w-full border rounded-lg p-3 h-32 resize-none"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 mt-2">
              {config.miniPrompt.length}/500 caracteres
            </div>
          </div>

          {/* Opciones de Comportamiento */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Comportamiento</h2>
            
            <div className="space-y-4">
              {/* Días Follow-up */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Días para Follow-up Automático
                </label>
                <select
                  value={config.diasFollowUp}
                  onChange={(e) => setConfig({...config, diasFollowUp: Number(e.target.value)})}
                  className="w-full border rounded-lg p-2"
                >
                  <option value={1}>1 día</option>
                  <option value={3}>3 días</option>
                  <option value={7}>7 días</option>
                </select>
              </div>

              {/* Tono */}
              <div>
                <label className="block text-sm font-medium mb-2">Tono de Comunicación</label>
                <div className="grid grid-cols-3 gap-2">
                  {['amigable', 'profesional', 'agresivo'].map(tono => (
                    <button
                      key={tono}
                      onClick={() => setConfig({...config, tono})}
                      className={`p-3 rounded-lg border-2 capitalize ${
                        config.tono === tono 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {tono}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descuento Máximo */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descuento Automático Máximo (%)
                </label>
                <input
                  type="number"
                  value={config.descuentoMax}
                  onChange={(e) => setConfig({...config, descuentoMax: Number(e.target.value)})}
                  min={0}
                  max={50}
                  className="w-full border rounded-lg p-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  La IA puede ofrecer hasta {config.descuentoMax}% de descuento
                </div>
              </div>

              {/* Productos Destacados */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Productos Destacados (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Llaves mezcladoras, Válvulas, Tuberías PVC"
                  onChange={(e) => setConfig({...config, productosDestacados: e.target.value.split(',')})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="text-green-600" size={20} />
              <h2 className="text-xl font-semibold">WhatsApp</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número Conectado</label>
                <input
                  type="text"
                  value={config.whatsappNumero}
                  onChange={(e) => setConfig({...config, whatsappNumero: e.target.value})}
                  placeholder="+56 9 1234 5678"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Estado Webhook</label>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    config.whatsappWebhook === 'conectado' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="capitalize">{config.whatsappWebhook}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-orange-600" size={20} />
              <h2 className="text-xl font-semibold">Notificaciones</h2>
            </div>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Notificaciones Push para Aprobaciones Móviles</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={config.notificacionesPush}
                  onChange={(e) => setConfig({...config, notificacionesPush: e.target.checked})}
                  className="sr-only"
                />
                <div className={`w-14 h-8 rounded-full transition ${
                  config.notificacionesPush ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                    config.notificacionesPush ? 'translate-x-6' : ''
                  }`} />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Panel Derecho - Preview Chat */}
        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold">Preview & Test</h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Prueba cómo responderá la IA con tu configuración actual
          </p>

          {/* Chat Messages */}
          <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Escribe un mensaje de prueba abajo
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto max-w-[80%]'
                        : 'bg-white border mr-auto max-w-[80%]'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={previewMessage}
              onChange={(e) => setPreviewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testChat()}
              placeholder="Escribe un mensaje de prueba..."
              className="flex-1 border rounded-lg p-2"
            />
            <button
              onClick={testChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Enviar
            </button>
          </div>

          <button
            onClick={() => setChatMessages([])}
            className="w-full mt-3 text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar Chat
          </button>
        </div>
      </div>
    </div>
  );
}
