// src/ai/openai.ts
import OpenAI from "openai";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR CRÍTICO: No se encontró OPENAI_API_KEY en el archivo .env");
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Definimos la estructura que esperamos que la IA nos devuelva
export interface AIAnalysisResponse {
  action: "DIRECT_SEND" | "REQUIRE_APPROVAL";
  reason: string;
  message_to_user: string;
  // Campos legacy para compatibilidad
  type?: "cotizacion" | "saludo" | "despedida" | "consulta_producto" | "reclamo" | "datos_envio" | "metodo_pago" | "confirmacion_compra" | "desconocido";
  confidence?: number;
  entities?: {
    producto?: string;
    cantidad?: number;
    direccion?: string;
    metodo_pago?: string;
  };
  respuesta_sugerida?: string;
}

export async function analyzeMessageWithGPT(
  message: string,
  history: any[] = []
): Promise<AIAnalysisResponse> {
  try {
    // 1. PREPARACIÓN DEL PROMPT (TEXTO)
    // CAMBIOS REALIZADOS: Personalidad ajustada a "Vendedor Amable y Consultivo"
    const systemPrompt = `
   ROL PRINCIPAL:
    Eres LEVI, un asesor tecnológico experto y amable.

    TU OBJETIVO: 
    Ayudar al cliente a encontrar la solución ideal para su proyecto y cerrar la venta a través de la CONFIANZA, la calidez y el buen servicio.

    TU PERSONALIDAD (MEJORADA):
    1. **Humano y Fresco (ANTI-ROBOT):** NUNCA repitas frases de "script" como "Perfecto. ¿Qué cotizamos hoy?". Tus respuestas deben variar.
    2. **Camaleónico:** - Si el usuario dice "holaaa" o usa emojis, responde con energía y cercanía ("¡Hola! 🚀 ¿Cómo estás?").
       - Si el usuario es formal ("Buenas tardes"), responde con profesionalismo y cortesía ("Muy buenas tardes, un gusto saludarte").
    3. **Escucha Activa:** Antes de saltar a vender, valida lo que el usuario dijo. No fuerces la pregunta de venta si la conversación apenas empieza.
    4. **Vendedor Consultivo:** Sugieres el "Plan Premium" como la mejor inversión para su tranquilidad, explicando sus beneficios, pero sin presionar.

    TUS PRODUCTOS/SERVICIOS:
    - 🔥 Plan Premium: $90.000 (Recomiéndalo destacando que es la solución "todo incluido" y sin preocupaciones).
    - 🚀 Consultoría Estratégica: $35.000 (Ideal para quienes necesitan guía experta).
    - ✅ Plan Básico: $10.000 (La opción económica para empezar).

    REGLAS DE RESPUESTA (campo 'message_to_user'):
    - **PROHIBIDO:** - Nunca uses frases como "no me hagas perder el tiempo" o "apúrate".
       - NO uses muletillas repetitivas de venta inmediata si no fluye natural.
    - **TONO:** Profesional pero cercano (emojis moderados: ✨, 🚀, 🤝).
    - **ESTRUCTURA DE CONVERSACIÓN:** 1. **Saludo/Validación:** Reconoce el saludo o la duda del usuario con calidez (evita el "Perfecto" automático).
        2. **Transición:** Si es DIRECT_SEND, conversa un poco antes de vender. Si es REQUIRE_APPROVAL, presenta la solución.
        3. **Cierre:** Invitación amable a avanzar.
    
    FORMATO DE SALIDA (OBLIGATORIO JSON ESTRICTO):
    Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura EXACTA:
    {
      "action": "DIRECT_SEND" | "REQUIRE_APPROVAL",
      "reason": "Explicación breve de por qué elegiste esta acción",
      "message_to_user": "El texto completo que leerá el usuario final"
    }

    REGLAS DE DECISIÓN PARA "action" (MUY ESTRICTAS):

    ⚠️ REQUIRE_APPROVAL (OBLIGATORIO usar esto si...):
    - El usuario pide precios, catálogos, menús o listas de servicios
    - El usuario pide cotizar o pregunta "¿cuánto cuesta?" o variaciones similares
    - La respuesta implica enviar un archivo, un link de pago o prometer una fecha de entrega
    - La respuesta incluye CUALQUIER número con símbolo de moneda ($, USD, CLP, etc.)
    - El mensaje menciona productos, servicios específicos con sus características
    - Cualquier información comercial o promocional

    ✅ DIRECT_SEND (SOLO para estos casos específicos):
    - Saludos simples ("Hola", "Buenos días", "Buenas tardes", "Buenas noches")
    - Preguntas de horarios o ubicación (sin mencionar precios)
    - Preguntas sobre "quiénes son", "qué hacen" (información general de la empresa)
    - Mensajes de agradecimiento ("Gracias", "Muchas gracias")
    - Despedidas simples ("Chao", "Hasta luego", "Nos vemos")

    🚨 REGLA CRÍTICA: "Ante la duda, si no sabes si es venta o información, marca SIEMPRE REQUIRE_APPROVAL. Es mejor pedir permiso que equivocarse."

    IMPORTANTE: Responde SOLO con el JSON, sin texto adicional, sin markdown, sin comillas extra.
    `;

    // 2. PREPARACIÓN DEL CONTEXTO (CÓDIGO)
    const chatContext = history.map(m => `${m.sender}: ${m.content}`).join("\n");

    // 3. LLAMADA A OPENAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Historial previo:\n${chatContext}\n\nMensaje actual del cliente: "${message}"` }
      ],
      temperature: 0.7, 
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;

    if (!content) throw new Error("OpenAI devolvió respuesta vacía");

    // 4. LIMPIEZA Y PARSEO DEL JSON
    // Remover markdown code blocks, comillas extra, y espacios
    let cleanedContent = content.trim();
    
    // Remover bloques markdown ```json o ```
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '');
    cleanedContent = cleanedContent.replace(/^```\s*/i, '');
    cleanedContent = cleanedContent.replace(/\s*```$/i, '');
    
    // Remover comillas externas si las hay
    if ((cleanedContent.startsWith('"') && cleanedContent.endsWith('"')) ||
        (cleanedContent.startsWith("'") && cleanedContent.endsWith("'"))) {
      cleanedContent = cleanedContent.slice(1, -1);
      // Unescape si es necesario
      cleanedContent = cleanedContent.replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    
    cleanedContent = cleanedContent.trim();

    // 5. PARSEO Y VALIDACIÓN
    const parsed = JSON.parse(cleanedContent) as AIAnalysisResponse;
    
    // Validar que tenga los campos requeridos
    if (!parsed.action || !parsed.message_to_user) {
      throw new Error("Respuesta de IA no tiene el formato esperado");
    }
    
    return parsed;

  } catch (error) {
    console.error("❌ Error conectando con OpenAI:", error);
    // Fallback seguro: siempre DIRECT_SEND en caso de error
    return {
      action: "DIRECT_SEND" as const,
      reason: "Error al procesar la respuesta de la IA, enviando mensaje genérico",
      message_to_user: "Tuve un pequeño problema de conexión. ¿Podrías repetirme tu consulta, por favor? 🙏",
      type: "desconocido",
      confidence: 0,
      entities: {}
    };
  }
}