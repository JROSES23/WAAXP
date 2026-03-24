/**
 * app/api/webhook/whatsapp/route.ts
 * ───────────────────────────────────
 * Webhook oficial de Meta WhatsApp Business API.
 *
 * GET  → Verificación del webhook (challenge de Meta)
 * POST → Mensajes entrantes, proceados por Bot LEVI
 *
 * Variables de entorno requeridas:
 *   WHATSAPP_VERIFY_TOKEN   — token de verificación configurado en Meta
 *   WHATSAPP_ACCESS_TOKEN   — token de acceso de Meta
 *   WHATSAPP_PHONE_NUMBER_ID — ID del número de WA
 *   GEMINI_API_KEY           — para LLM
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleLeviMessage }         from '@/lib/levi/handler'

/* ─────────────────────────────────────────────
   GET — Verificación del webhook
───────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[LEVI Webhook] Verificación exitosa')
    return new NextResponse(challenge ?? '', { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

/* ─────────────────────────────────────────────
   POST — Mensajes entrantes de WhatsApp
───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Siempre responder 200 a Meta de inmediato
  // El procesamiento ocurre async (sin bloquear el webhook)
  processInBackground(body as WhatsAppWebhookBody).catch((err) => {
    console.error('[LEVI Webhook] Error en procesamiento:', err)
  })

  return new NextResponse('EVENT_RECEIVED', { status: 200 })
}

/* ─────────────────────────────────────────────
   TYPES — Meta Webhook Payload
───────────────────────────────────────────── */

interface WhatsAppMessage {
  id:        string
  from:      string
  timestamp: string
  type:      string
  text?:     { body: string }
}

interface WhatsAppChange {
  value: {
    metadata?:          { phone_number_id: string }
    messages?:          WhatsAppMessage[]
    statuses?:          unknown[]
  }
  field: string
}

interface WhatsAppEntry {
  id:      string
  changes: WhatsAppChange[]
}

interface WhatsAppWebhookBody {
  object: string
  entry:  WhatsAppEntry[]
}

/* ─────────────────────────────────────────────
   BACKGROUND PROCESSOR
───────────────────────────────────────────── */

async function processInBackground(body: WhatsAppWebhookBody): Promise<void> {
  if (body.object !== 'whatsapp_business_account') return

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue

      const { value } = change
      const phoneNumberId = value.metadata?.phone_number_id

      if (!phoneNumberId) continue

      for (const message of value.messages ?? []) {
        // Solo procesar mensajes de texto por ahora
        if (message.type !== 'text' || !message.text?.body) continue

        try {
          await handleLeviMessage({
            businessPhoneId: phoneNumberId,
            from:            message.from,
            messageId:       message.id,
            text:            message.text.body,
            timestamp:       parseInt(message.timestamp, 10),
          })
        } catch (err) {
          console.error(`[LEVI] Error procesando mensaje ${message.id}:`, err)
        }
      }
    }
  }
}
