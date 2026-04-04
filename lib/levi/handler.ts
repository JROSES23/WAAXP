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
        id, nombre, ai_prompt, ai_tone, ai_discount_pct, ai_followup_days,
        products ( nombre, descripcion, precio, categoria_id ),
        response_templates ( trigger_keywords, mensaje_template )
      )
    `)
    .eq('whatsapp_phone_id', msg.businessPhoneId)
    .eq('active', true)
    .single()

  if (!botConfig) {
    console.warn(`[LEVI] No bot config found for phone id ${msg.businessPhoneId}`)
    return
  }

  const business = botConfig.businesses as unknown as {
    id:               string
    nombre:           string
    ai_prompt?:       string | null
    ai_tone?:         string | null
    ai_discount_pct?: number | null
    ai_followup_days?: number | null
    products?: Array<{ nombre: string; descripcion: string | null; precio: number | null; categoria_id: string | null }>
    response_templates?: Array<{ trigger_keywords: string[]; mensaje_template: string }>
  } | null

  if (!business) {
    console.error(`[LEVI] bot_config found but businesses join returned null for phone id ${msg.businessPhoneId}`)
    return
  }

  // 3. Upsert cliente en la tabla clients (tabla canónica del CRM)
  const { data: client } = await supabase
    .from('clients')
    .select('id, conversation_count')
    .eq('phone_number', msg.from)
    .eq('business_id', business.id)
    .single()

  let clientId: string
  const isFirstContact = !client

  if (!client) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        phone_number:       msg.from,
        business_id:        business.id,
        first_contact_at:   new Date().toISOString(),
        conversation_count: 0,
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      console.error('[LEVI] Failed to create client record:', clientError)
      return
    }
    clientId = newClient.id
  } else {
    clientId = client.id
  }

  // 4. Upsert conversación — necesario para obtener conversation_id,
  //    que es requerido (NOT NULL) en la tabla messages.
  //    Requiere el índice único: conversations(business_id, phone_number)
  //    (ver supabase/migrations/002_conversations_unique_index.sql)
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .upsert(
      {
        business_id:     business.id,
        phone_number:    msg.from,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'business_id,phone_number' },
    )
    .select('id')
    .single()

  if (convError || !conversation) {
    console.error('[LEVI] Failed to upsert conversation:', convError)
    return
  }

  const conversationId = conversation.id

  // 5. Obtener historial de conversación (últimos 12 mensajes)
  const { data: history } = await supabase
    .from('messages')
    .select('content, role')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: false })
    .limit(12)

  const chatHistory: ChatMessage[] = (history ?? [])
    .reverse()
    .map((m) => ({
      role:    m.role as 'user' | 'assistant',
      content: m.content as string,
    }))

  // 6. Guardar mensaje entrante
  const { error: inboundError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    business_id:     business.id,
    role:            'user',
    content:         msg.text,
  })

  if (inboundError) {
    console.error('[LEVI] Failed to insert inbound message:', inboundError)
    return
  }

  // 7. Revisar plantillas de respuesta rápida antes de llamar al LLM
  const templates = business.response_templates ?? []
  const msgLower  = msg.text.toLowerCase()
  const template  = templates.find((t) =>
    t.trigger_keywords.some((kw) => msgLower.includes(kw.toLowerCase())),
  )

  if (template && !isFirstContact) {
    await sendTextMessage(msg.from, template.mensaje_template)
    await Promise.all([
      supabase.from('messages').insert({
        conversation_id: conversationId,
        business_id:     business.id,
        role:            'assistant',
        content:         template.mensaje_template,
        source:          'template',
      }),
      supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId),
    ])
    return
  }

  // 8. Construir system prompt con catálogo del negocio
  const productsList = (business.products ?? [])
    .map((p) => `• ${p.nombre}${p.precio ? ` — $${p.precio.toLocaleString('es-CL')}` : ''}${p.descripcion ? `: ${p.descripcion}` : ''}`)
    .join('\n')

  // ai_tone from businesses takes precedence over bot_config.tone
  const effectiveTone = business.ai_tone ?? botConfig.tone ?? undefined

  const systemPrompt = buildSystemPrompt({
    businessName:   business.nombre,
    welcomeMessage: isFirstContact ? (botConfig.welcome_message ?? undefined) : undefined,
    tone:           effectiveTone,
    products:       productsList || undefined,
    customPrompt:   business.ai_prompt ?? undefined,
    discountPct:    business.ai_discount_pct ?? undefined,
    followupDays:   business.ai_followup_days ?? undefined,
  })

  // 9. Llamar al LLM
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

  // 10. Enviar respuesta
  await sendTextMessage(msg.from, llmResponse.text)

  // 11. Guardar respuesta del bot + actualizar stats y timestamp de conversación
  await Promise.all([
    supabase.from('messages').insert({
      conversation_id: conversationId,
      business_id:     business.id,
      role:            'assistant',
      content:         llmResponse.text,
      source:          'levi',
      requires_human:  llmResponse.requiresHuman,
      tokens_used:     llmResponse.tokensUsed ?? null,
    }),
    supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId),
    supabase.rpc('increment_conversation_count', {
      p_customer_id: clientId,
    }),
  ])

  // 12. Si requiere humano, marcar conversación como pending_approval
  if (llmResponse.requiresHuman) {
    await supabase
      .from('conversations')
      .update({ status: 'pending_approval' })
      .eq('id', conversationId)
  }
}
