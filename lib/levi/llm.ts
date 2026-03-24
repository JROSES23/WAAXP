/**
 * lib/levi/llm.ts
 * ───────────────
 * Capa de abstracción LLM para Bot LEVI.
 * Actualmente usa Google Gemini (ya instalado).
 * Diseñado para ser intercambiable con OpenAI / Anthropic.
 */

import { GoogleGenerativeAI, type Content } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

/* ─────────────────────────────────────────────
   SYSTEM PROMPT BASE — Bot LEVI
───────────────────────────────────────────── */

export function buildSystemPrompt(config: {
  businessName:    string
  welcomeMessage?: string
  tone?:           string
  products?:       string
  faqs?:           string
  customPrompt?:   string
  discountPct?:    number
  followupDays?:   number
}): string {
  // Si el negocio definió un prompt personalizado, se usa como base y se complementa con el catálogo
  const baseInstructions = config.customPrompt
    ? config.customPrompt
    : `Eres LEVI, el asistente de ventas de "${config.businessName}".

Tu misión es ayudar a los clientes a conocer los productos, responder preguntas y facilitar ventas.`

  const toneSection = config.tone
    ? `TONO: ${config.tone}`
    : 'TONO: Amable, claro y profesional. Respuestas breves (máx. 2-3 oraciones).'

  const discountSection = config.discountPct && config.discountPct > 0
    ? `DESCUENTOS: Puedes ofrecer hasta un ${config.discountPct}% de descuento si el cliente lo solicita o para cerrar una venta.`
    : ''

  return `${baseInstructions}

${toneSection}

${config.products ? `CATÁLOGO DE PRODUCTOS:\n${config.products}\n` : ''}
${config.faqs     ? `PREGUNTAS FRECUENTES:\n${config.faqs}\n`      : ''}
${discountSection}

REGLAS OBLIGATORIAS:
- Responde SIEMPRE en el mismo idioma que el cliente.
- Si no tienes información suficiente, di "Déjame consultar con el equipo y te respondo pronto."
- Para precios especiales, cotizaciones o solicitudes complejas → indica que un agente se contactará.
- Nunca inventes precios ni inventarios.
- Si el cliente quiere hablar con un humano, acepta y marca internamente: [REQUIERE_HUMANO].
- Sé conciso. Máximo 3 oraciones por respuesta.
${config.followupDays ? `- Puedes mencionar que harás seguimiento en ${config.followupDays} días si el cliente no concreta.` : ''}

${config.welcomeMessage ? `MENSAJE DE BIENVENIDA (usar SOLO en el primer contacto): ${config.welcomeMessage}` : ''}`
}

/* ─────────────────────────────────────────────
   HISTORY TYPES
───────────────────────────────────────────── */

export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

/* ─────────────────────────────────────────────
   MAIN LLM CALL
───────────────────────────────────────────── */

export interface LLMResponse {
  text:           string
  requiresHuman:  boolean
  tokensUsed?:    number
}

export async function callLLM(
  systemPrompt:  string,
  history:       ChatMessage[],
  userMessage:   string,
): Promise<LLMResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  })

  // Convert history to Gemini Content format
  const geminiHistory: Content[] = history.map((msg) => ({
    role:  msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const chat = model.startChat({
    history:          geminiHistory,
    generationConfig: {
      maxOutputTokens: 512,
      temperature:     0.7,
    },
  })

  const result = await chat.sendMessage(userMessage)
  const text   = result.response.text().trim()

  return {
    text:          text.replace('[REQUIERE_HUMANO]', '').trim(),
    requiresHuman: text.includes('[REQUIERE_HUMANO]'),
    tokensUsed:    result.response.usageMetadata?.totalTokenCount,
  }
}
