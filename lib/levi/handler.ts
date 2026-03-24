/**
 * lib/levi/handler.ts
 * ────────────────────
 * Lógica central de Bot LEVI.
 * Recibe un mensaje entrante de WhatsApp, busca el contexto
 * del negocio en Supabase, llama al LLM y responde.
 */

import { createClient }                  from '@supabase/supabase-js'
import { buildSystemPrompt, callLLM, type ChatMessage } from './llm'
import { sendTextMessage, markAsRead }   from './send'

/* ─────────────────────────────────────────────
   SUPABASE ADMIN CLIENT (service role)
───────────────────────────────────────────── */

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

/* ─────────────────────────────────────────────
   INCOMING MESSAGE TYPE
───────────────────────────────────────────── */

export interface IncomingWhatsAppMessage {
  businessPhoneId: string   // Identificador del número de WA del negocio
  from:            string   // Número del cliente (E.164, sin +)
  messageId:       string   // ID del mensaje en Meta
  text:            string   // Texto del mensaje
  timestamp:       number   // Unix timestamp
}

/* ─────────────────────────────────────────────
   MAIN HANDLER
───────────────────────────────────────────── */

export async function handleLeviMessage(msg: IncomingWhatsAppMessage): Promise<void> {
  const supabase = getAdminClient()

  // 1. Marcar mensaje como leído
  await markAsRead(msg.messageId)

  // 2. Buscar la configuración del negocio por phone number ID
  const { data: botConfig } = await supabase
    .from('bot_config')
    .select(`
      id, business_id, active, tone, welcome_message,
      businesses (
        id, name, ai_prompt, ai_tone, ai_discount_pct, ai_followup_days,
        products ( name, description, price, category ),
        response_templates ( trigger, response )
      )
    `)
    .eq('whatsapp_phone_id', msg.businessPhoneId)
    .eq('active', true)
    .single()

  if (!botConfig) {
    console.warn(`[LEVI] No bot config found for phone id ${msg.businessPhoneId}`)
    return
  }

  const business = botConfig.businesses as {
    id:               string
    name:             string
    ai_prompt?:       string | null
    ai_tone?:         string | null
    ai_discount_pct?: number | null
    ai_followup_days?: number | null
    products?: Array<{ name: string; description: string | null; price: number | null; category: string | null }>
    response_templates?: Array<{ trigger: string; response: string }>
  } | null

  if (!business) return

  // 3. Obtener / crear cliente en la tabla customers
  const { data: customer } = await supabase
    .from('customers')
    .select('id, conversation_count')
    .eq('phone', msg.from)
    .eq('business_id', business.id)
    .single()

  let customerId: string
  const isFirstContact = !customer

  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        phone:              msg.from,
        business_id:        business.id,
        first_contact_at:   new Date().toISOString(),
        conversation_count: 0,
      })
      .select('id')
      .single()
    customerId = newCustomer?.id ?? crypto.randomUUID()
  } else {
    customerId = customer.id
  }

  // 4. Obtener historial de conversación (últimos 12 mensajes)
  const { data: history } = await supabase
    .from('messages')
    .select('content, role')
    .eq('customer_phone', msg.from)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(12)

  const chatHistory: ChatMessage[] = (history ?? [])
    .reverse()
    .map((m) => ({
      role:    m.role as 'user' | 'assistant',
      content: m.content as string,
    }))

  // 5. Guardar mensaje entrante
  await supabase.from('messages').insert({
    business_id:    business.id,
    customer_phone: msg.from,
    role:           'user',
    content:        msg.text,
    channel:        'whatsapp',
    message_id:     msg.messageId,
  })

  // 6. Revisar plantillas de respuesta rápida antes de llamar al LLM
  const templates = business.response_templates ?? []
  const template  = templates.find((t) =>
    msg.text.toLowerCase().includes(t.trigger.toLowerCase()),
  )

  if (template && !isFirstContact) {
    await sendTextMessage(msg.from, template.response)
    await supabase.from('messages').insert({
      business_id:    business.id,
      customer_phone: msg.from,
      role:           'assistant',
      content:        template.response,
      channel:        'whatsapp',
      source:         'template',
    })
    return
  }

  // 7. Construir system prompt con catálogo del negocio
  const productsList = (business.products ?? [])
    .map((p) => `• ${p.name}${p.price ? ` — $${p.price.toLocaleString('es-CL')}` : ''}${p.description ? `: ${p.description}` : ''}`)
    .join('\n')

  // ai_tone from businesses takes precedence over bot_config.tone
  const effectiveTone = business.ai_tone ?? botConfig.tone ?? undefined

  const systemPrompt = buildSystemPrompt({
    businessName:   business.name,
    welcomeMessage: isFirstContact ? (botConfig.welcome_message ?? undefined) : undefined,
    tone:           effectiveTone,
    products:       productsList || undefined,
    customPrompt:   business.ai_prompt ?? undefined,
    discountPct:    business.ai_discount_pct ?? undefined,
    followupDays:   business.ai_followup_days ?? undefined,
  })

  // 8. Llamar al LLM
  let llmResponse
  try {
    llmResponse = await callLLM(
      systemPrompt,
      chatHistory,
      isFirstContact ? `[PRIMER CONTACTO] ${msg.text}` : msg.text,
    )
  } catch (err) {
    console.error('[LEVI] LLM error:', err)
    await sendTextMessage(msg.from, 'Hola, en este momento estoy teniendo dificultades técnicas. Un agente te contactará pronto.')
    return
  }

  // 9. Enviar respuesta
  await sendTextMessage(msg.from, llmResponse.text)

  // 10. Guardar respuesta del bot + actualizar stats
  await Promise.all([
    supabase.from('messages').insert({
      business_id:    business.id,
      customer_phone: msg.from,
      role:           'assistant',
      content:        llmResponse.text,
      channel:        'whatsapp',
      source:         'levi',
      requires_human: llmResponse.requiresHuman,
      tokens_used:    llmResponse.tokensUsed ?? null,
    }),
    supabase.rpc('increment_conversation_count', {
      p_customer_id: customerId,
    }).catch(() => {}),
  ])

  // 11. Si requiere humano, actualizar la conversación a "pending_approval"
  if (llmResponse.requiresHuman) {
    await supabase
      .from('conversations')
      .update({ status: 'pending_approval', requires_human: true })
      .eq('customer_phone', msg.from)
      .eq('business_id', business.id)
  }
}
