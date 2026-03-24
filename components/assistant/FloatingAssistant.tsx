'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, RefreshCw } from 'lucide-react'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

/* ─────────────────────────────────────────────
   SUGGESTED STARTERS
───────────────────────────────────────────── */

const SUGGESTIONS = [
  '¿Cómo van mis ventas este mes?',
  '¿Cuántos chats están pendientes?',
  '¿Qué porcentaje automatiza el bot?',
  'Dame un resumen rápido del negocio',
]

/* ─────────────────────────────────────────────
   FLOATING ASSISTANT COMPONENT
───────────────────────────────────────────── */

export default function FloatingAssistant() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  const sendMessage = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message: content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json() as { reply?: string; error?: string }

      const assistantMsg: Message = {
        id:      crypto.randomUUID(),
        role:    'assistant',
        content: data.reply ?? data.error ?? 'Error al obtener respuesta.',
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => setMessages([])

  const showEmpty = messages.length === 0

  return (
    <>
      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92,  y: 16 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-[88px] right-6 z-50 w-[380px] max-h-[520px] flex flex-col glass-card overflow-hidden"
            style={{ boxShadow: 'var(--shadow-glass)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    Asistente WAAXP
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    Powered by IA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color      = 'var(--text-primary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color      = 'var(--text-tertiary)'
                    }}
                    title="Limpiar chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color      = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = ''
                    e.currentTarget.style.color      = 'var(--text-tertiary)'
                  }}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none min-h-0">
              {showEmpty ? (
                <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'var(--accent-dim)',
                      border:     '1px solid var(--accent-border)',
                      boxShadow:  'var(--accent-glow)',
                    }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    ¿En qué te ayudo?
                  </p>
                  <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
                    Pregúntame sobre tus métricas o tu bot
                  </p>

                  {/* Suggested questions */}
                  <div className="w-full space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-150"
                        style={{
                          background: 'var(--bg-elevated)',
                          border:     '1px solid var(--border-subtle)',
                          color:      'var(--text-secondary)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--accent-border)'
                          e.currentTarget.style.color       = 'var(--text-primary)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)'
                          e.currentTarget.style.color       = 'var(--text-secondary)'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={
                          msg.role === 'user'
                            ? {
                                background: 'var(--accent)',
                                color:      '#080c10',
                                borderBottomRightRadius: '4px',
                              }
                            : {
                                background: 'var(--bg-elevated)',
                                border:     '1px solid var(--border-subtle)',
                                color:      'var(--text-primary)',
                                borderBottomLeftRadius: '4px',
                              }
                        }
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading indicator */}
                  {loading && (
                    <div className="flex justify-start">
                      <div
                        className="px-4 py-3 rounded-2xl rounded-bl-[4px]"
                        style={{
                          background: 'var(--bg-elevated)',
                          border:     '1px solid var(--border-subtle)',
                        }}
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full dot-bounce"
                              style={{
                                background:      'var(--accent)',
                                animationDelay: `${i * 0.2}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 shrink-0"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: 'var(--bg-input)',
                  border:     '1px solid var(--border-default)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregunta algo sobre tu negocio..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
                  style={{
                    color:             'var(--text-primary)',
                    caretColor:        'var(--accent)',
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-40"
                  style={{
                    background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
                    color:      input.trim() ? '#080c10' : 'var(--text-tertiary)',
                  }}
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FAB button ─── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{   scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center focus:outline-none"
        style={{
          background: 'var(--accent)',
          boxShadow:  'var(--accent-glow), 0 8px 24px rgba(0,0,0,0.3)',
        }}
        aria-label="Abrir asistente"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0,   opacity: 1 }}
            exit={{   rotate:  90,  opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {isOpen
              ? <X             className="w-5 h-5 text-[#080c10]" strokeWidth={2.5} />
              : <MessageSquare className="w-5 h-5 text-[#080c10]" strokeWidth={2}   />
            }
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  )
}
