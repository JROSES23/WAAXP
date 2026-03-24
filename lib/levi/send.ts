/**
 * lib/levi/send.ts
 * ─────────────────
 * Envío de mensajes vía Meta WhatsApp Business API.
 * Requiere variables de entorno:
 *   WHATSAPP_ACCESS_TOKEN   — token de acceso permanente
 *   WHATSAPP_PHONE_NUMBER_ID — ID del número de teléfono
 */

const BASE_URL = 'https://graph.facebook.com/v19.0'

export async function sendTextMessage(
  to:      string,
  message: string,
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token         = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !token) {
    console.error('[LEVI] Faltan variables WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN')
    return
  }

  const body = {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to,
    type:              'text',
    text:              { body: message },
  }

  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`[LEVI] Error al enviar mensaje: ${res.status} — ${err}`)
    throw new Error(`WhatsApp API error ${res.status}`)
  }
}

/**
 * Marca un mensaje como leído en WhatsApp.
 */
export async function markAsRead(messageId: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token         = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneNumberId || !token) return

  await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status:            'read',
      message_id:        messageId,
    }),
  }).catch(() => {})
}
