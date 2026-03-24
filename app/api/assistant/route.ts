/**
 * app/api/assistant/route.ts
 * ────────────────────────────
 * API del Asistente Flotante para propietarios.
 * Recibe preguntas sobre el negocio y responde con contexto
 * de métricas, conversaciones y configuración del negocio.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI }        from '@google/generative-ai'
import { createClient }              from '@/lib/supabase/server'
import { getAuthContext }            from '@/lib/auth'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface AssistantMessage {
  role:    'user' | 'assistant'
  content: string
}

interface RequestBody {
  message:  string
  history?: AssistantMessage[]
}

/* ─────────────────────────────────────────────
   POST /api/assistant
───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  // Auth check
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

  const { message, history = [] } = body
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
  }

  // Obtener contexto del negocio
  const supabase   = await createClient()
  const businessId = auth.businessId

  let businessContext = ''

  if (businessId) {
    // Métricas básicas del mes actual
    const now      = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [salesRes, convsRes, pendingRes, businessRes] = await Promise.allSettled([
      supabase
        .from('sales')
        .select('amount')
        .eq('business_id', businessId)
        .gte('created_at', startOfMonth),
      supabase
        .from('conversations')
        .select('id, status')
        .eq('business_id', businessId)
        .gte('created_at', startOfMonth),
      supabase
        .from('conversations')
        .select('id')
        .eq('business_id', businessId)
        .eq('status', 'pending_approval'),
      supabase
        .from('businesses')
        .select('name, plan')
        .eq('id', businessId)
        .single(),
    ])

    const sales    = salesRes.status    === 'fulfilled' ? (salesRes.value.data    ?? []) : []
    const convs    = convsRes.status    === 'fulfilled' ? (convsRes.value.data    ?? []) : []
    const pending  = pendingRes.status  === 'fulfilled' ? (pendingRes.value.data  ?? []) : []
    const business = businessRes.status === 'fulfilled' ? businessRes.value.data  : null

    const totalSales   = sales.reduce((acc: number, s: { amount: number }) => acc + (s.amount ?? 0), 0)
    const autoChats    = convs.filter((c: { status: string }) => c.status === 'resolved').length
    const pctAuto      = convs.length > 0 ? Math.round((autoChats / convs.length) * 100) : 0

    businessContext = `
DATOS DEL NEGOCIO (actualizados al ${now.toLocaleDateString('es-CL')}):
- Nombre: ${business?.name ?? 'tu negocio'}
- Plan activo: ${business?.plan ?? 'desconocido'}
- Ventas del mes: $${totalSales.toLocaleString('es-CL')} CLP
- Conversaciones del mes: ${convs.length}
- Automatización: ${pctAuto}% manejado por IA
- Pendientes de revisión: ${pending.length} conversaciones
`
  }

  const systemPrompt = `Eres el asistente personal de WAAXP para propietarios de negocios.
Tu rol es ayudar al dueño a entender sus métricas, optimizar su bot, y sacar más provecho de la plataforma.

${businessContext}

REGLAS:
- Responde en español, de forma concisa y directa.
- Si el usuario pregunta sobre sus métricas, usa los datos del negocio proporcionados.
- Si no tienes datos suficientes para responder, dilo claramente.
- Sugiere acciones concretas cuando sea posible.
- Máximo 4 oraciones por respuesta.
- No inventes datos ni métricas que no se te hayan proporcionado.`

  // Construir historial para Gemini
  const model = genAI.getGenerativeModel({
    model:             'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  })

  const geminiHistory = history.map((msg) => ({
    role:  msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const chat = model.startChat({
    history:          geminiHistory,
    generationConfig: { maxOutputTokens: 512, temperature: 0.5 },
  })

  try {
    const result = await chat.sendMessage(message)
    const reply  = result.response.text().trim()

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Assistant API] LLM error:', err)
    return NextResponse.json(
      { error: 'Error al generar respuesta. Intenta de nuevo.' },
      { status: 500 },
    )
  }
}
