/**
 * POST /api/bot/test
 * ──────────────────
 * Simula una respuesta del bot IA con el prompt configurado por el negocio.
 * Usado desde la página de Configuración IA para testear antes de ir a WhatsApp.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI }        from '@google/generative-ai'
import { getAuthContext }            from '@/lib/auth'

interface RequestBody {
  message: string
  prompt:  string
  tone:    string
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { message, prompt, tone } = body
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // Sin API key: respuesta mock realista para que el propietario entienda el flujo
    return NextResponse.json({
      reply: 'Hola, gracias por contactarnos. Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?',
    })
  }

  const systemPrompt = prompt?.trim()
    || `Eres un asistente de ventas. Responde en español, con un tono ${tone ?? 'amigable'}.`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model  = genAI.getGenerativeModel({
      model:             'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    })

    const result = await model.generateContent({
      contents:         [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens: 256, temperature: 0.7 },
    })

    const reply = result.response.text().trim()
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Bot Test] Gemini error:', err)
    return NextResponse.json(
      { reply: 'El bot no pudo responder. Verifica la configuración del prompt e intenta de nuevo.' },
    )
  }
}
