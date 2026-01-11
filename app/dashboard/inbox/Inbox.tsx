'use client'
import { useState } from 'react';

export default function Inbox() {
  const [selectedChat, setSelectedChat] = useState(1);
  
  const chats = [
    { 
      id: 1, 
      name: 'Juan Pérez', 
      status: 'nuevo', 
      preview: 'Hola, quería saber el precio del producto', 
      time: '18 acto',
      avatar: 'J',
      messages: [
        { id: 1, text: 'Hola, quería saber el precio del producto', from: 'client', time: '18:30' },
        { id: 2, text: '¡Hola! Claro, el plan premium incluye asesoría ilimitada y declaración mensual. El costo es $80 USD/mes.', from: 'vendia', time: '18:31' },
        { id: 3, text: '¿Te gustaría una cotización formal?', from: 'vendia', time: '18:31' }
      ]
    },
    { 
      id: 2, 
      name: 'María López', 
      status: 'esperando', 
      preview: 'Consulta por producto...', 
      time: '3 de cito',
      avatar: 'M',
      messages: [
        { id: 1, text: '¿Tienen disponibilidad para el martes?', from: 'client', time: '14:20' }
      ]
    },
    { 
      id: 3, 
      name: 'Ferretería San Luis', 
      status: 'activo', 
      preview: 'Consulta por producto...', 
      time: '8 de cito',
      avatar: 'F',
      messages: []
    }
  ];

  const currentChat = chats.find(c => c.id === selectedChat);

  return (
    <div 
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e2efec',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        height: 480
      }}
    >
      <div 
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e2efec',
          background: '#ffffff'
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
          Inbox Híbrido
        </h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 2.2fr', height: 'calc(100% - 48px)' }}>
        <div 
          style={{
            borderRight: '1px solid #e2efec',
            overflowY: 'auto',
            background: '#F6FBFA'
          }}
        >
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid #e2efec',
                background: selectedChat === chat.id ? '#E6F4EF' : 'transparent',
                borderLeft: selectedChat === chat.id ? '3px solid #0f766e' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedChat !== chat.id) {
                  e.currentTarget.style.background = '#f0f9f6';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedChat !== chat.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div 
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#0f766e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {chat.avatar}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <h3 
                      style={{ 
                        fontSize: 13, 
                        fontWeight: 700, 
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}
                    >
                      {chat.name}
                    </h3>
                    {chat.status === 'nuevo' && (
                      <span 
                        style={{
                          padding: '2px 7px',
                          background: '#0f766e',
                          color: '#ffffff',
                          fontSize: 9,
                          borderRadius: 999,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        nuevo
                      </span>
                    )}
                  </div>
                  <p 
                    style={{ 
                      fontSize: 12, 
                      color: '#6b7f7a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      margin: 0
                    }}
                  >
                    {chat.preview}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          {currentChat ? (
            <>
              <div 
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2efec',
                  background: '#F9FCFB'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0, marginBottom: 2 }}>
                      {currentChat.name}
                    </h3>
                    <p style={{ fontSize: 12, color: '#6b7f7a', margin: 0 }}>Cliente</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11 }}>
                    <p style={{ margin: '0 0 3px 0', color: '#1a1a1a', fontWeight: 700 }}>
                      Interés: Compra mayorista
                    </p>
                    <p style={{ margin: 0, color: '#6b7f7a' }}>
                      Probabilidad: Alta
                    </p>
                  </div>
                </div>
              </div>

              <div 
                style={{
                  flex: 1,
                  padding: 14,
                  overflowY: 'auto',
                  background: '#F9FCFB',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {currentChat.messages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentChat.messages.map((msg) => (
                      <div 
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: msg.from === 'vendia' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div 
                          style={{
                            maxWidth: '75%',
                            borderRadius: 8,
                            padding: '9px 13px',
                            background: msg.from === 'vendia' ? '#0f766e' : '#ffffff',
                            color: msg.from === 'vendia' ? '#ffffff' : '#1a1a1a',
                            border: msg.from === 'vendia' ? 'none' : '1px solid #e2efec',
                            fontSize: 13,
                            lineHeight: 1.4
                          }}
                        >
                          <p style={{ margin: 0, marginBottom: 4 }}>
                            {msg.text}
                          </p>
                          <p 
                            style={{ 
                              fontSize: 11, 
                              color: msg.from === 'vendia' ? 'rgba(255,255,255,0.65)' : '#9ca3af',
                              textAlign: 'right',
                              margin: 0
                            }}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {currentChat.id === 2 && (
                      <div 
                        style={{
                          background: '#E6F4EF',
                          border: '1px solid #b8dfd0',
                          borderRadius: 8,
                          padding: 13,
                          marginTop: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                          <div 
                            style={{
                              width: 30,
                              height: 30,
                              background: '#0f766e',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            V
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 11, color: '#0f766e', fontWeight: 700, margin: '0 0 7px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Vendia respondiendo
                            </p>
                            <div 
                              style={{
                                background: '#ffffff',
                                padding: 9,
                                borderRadius: 6,
                                marginBottom: 9,
                                border: '1px solid #d1e7dd',
                                fontSize: 12,
                                lineHeight: 1.4
                              }}
                            >
                              <p style={{ margin: 0 }}>
                                Hola María, claro. Podemos agendar tu cita para el martes a las 10am. ¿Te parece bien?
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: 7 }}>
                              <button 
                                style={{
                                  padding: '7px 13px',
                                  background: '#0f766e',
                                  color: '#ffffff',
                                  fontSize: 12,
                                  borderRadius: 6,
                                  border: 'none',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Aprobar
                              </button>
                              <button 
                                style={{
                                  padding: '7px 13px',
                                  background: '#ffffff',
                                  color: '#5f7f7a',
                                  fontSize: 12,
                                  borderRadius: 6,
                                  border: '1px solid #d1e7dd',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#9ca3af',
                    fontSize: 13
                  }}>
                    Sin mensajes
                  </div>
                )}
              </div>

              <div 
                style={{
                  padding: '11px 13px',
                  borderTop: '1px solid #e2efec',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', gap: 7 }}>
                  <input 
                    type="text"
                    placeholder="Escribe o deja que la IA responda..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1e7dd',
                      borderRadius: 6,
                      fontSize: 13,
                      outline: 'none',
                      background: '#F9FCFB'
                    }}
                  />
                  <button 
                    style={{
                      padding: '8px 15px',
                      background: '#0f766e',
                      color: '#ffffff',
                      borderRadius: 6,
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#9ca3af',
              fontSize: 13
            }}>
              Selecciona una conversación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
