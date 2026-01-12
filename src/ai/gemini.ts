// src/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AIAnalysisResponse {
  action: "DIRECT_SEND" | "REQUIRE_APPROVAL";
  reason: string;
  message_to_user: string;
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

export async function analyzeMessageWithGemini(
  message: string,
  history: any[] = []
): Promise<AIAnalysisResponse> {
  try {
    // 🔥 CARGAR PRODUCTOS DINÁMICAMENTE DESDE SUPABASE
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, price_clp, price_usd')
      .order('price_clp', { ascending: true });

    // Construir catálogo dinámico
    let catalogoTexto = '';
    if (!productsError && products && products.length > 0) {
      catalogoTexto = products
        .map(p => {
          const precioCLP = p.price_clp 
            ? `$${p.price_clp.toLocaleString('es-CL')} CLP` 
            : '';
          const precioUSD = p.price_usd 
            ? `/ $${p.price_usd} USD` 
            : '';
          return `- ${p.name}: ${precioCLP} ${precioUSD}`.trim();
        })
        .join('\n');
    } else {
      // Fallback si no hay productos o hay error
      catalogoTexto = `
- 🔥 Plan Premium: $90.000 CLP
- 🚀 Consultoría Estratégica: $35.000 CLP
- ✅ Plan Básico: $10.000 CLP`;
    }

    const systemPrompt = `
    ROL PRINCIPAL:
    Eres LEVI, un asesor tecnológico experto y amable.

    TU OBJETIVO: 
    Ayudar al cliente a encontrar la solución ideal para su proyecto y cerrar la venta a través de la CONFIANZA, la calidez y el buen servicio.

    TU PERSONALIDAD (MEJORADA):
    1. **Humano y Fresco (ANTI-ROBOT):** NUNCA repitas frases de "script" como "Perfecto. ¿Qué cotizamos hoy?". Tus respuestas deben variar.
    2. **Camaleónico:** 
       - Si el usuario dice "holaaa" o usa emojis, responde con energía y cercanía ("¡Hola! 🚀 ¿Cómo estás?").
       - Si el usuario es formal ("Buenas tardes"), responde con profesionalismo y cortesía ("Muy buenas tardes, un gusto saludarte").
    3. **Escucha Activa:** Antes de saltar a vender, valida lo que el usuario dijo.
    4. **Vendedor Consultivo:** Sugiere los productos según las necesidades del cliente.

    🛍️ CATÁLOGO ACTUAL (actualizado automáticamente desde la base de datos):
${catalogoTexto}

    REGLAS DE DECISIÓN PARA "action":
    
    ⚠️ REQUIRE_APPROVAL (OBLIGATORIO):
    - El usuario pide precios, catálogos, cotizaciones
    - La respuesta incluye precios ($)
    - Información comercial o promocional
    - Mencionar productos específicos con sus características
    
    ✅ DIRECT_SEND (SOLO):
    - Saludos simples
    - Preguntas generales sin precios
    - Agradecimientos
    - Despedidas
    - Consultas sobre horarios o ubicación (sin precios)

    🚨 REGLA CRÍTICA: Ante la duda, usa REQUIRE_APPROVAL.

    RESPONDE ÚNICAMENTE con JSON válido:
    {
      "action": "DIRECT_SEND" o "REQUIRE_APPROVAL",
      "reason": "explicación breve",
      "message_to_user": "mensaje al cliente"
    }
    `;

    const chatContext = history.map(m => `${m.sender}: ${m.content}`).join("\n");
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const prompt = `${systemPrompt}\n\nHistorial:\n${chatContext}\n\nMensaje actual: "${message}"`;
    
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    // Limpiar y parsear
    let cleanedContent = content.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedContent) as AIAnalysisResponse;
    
    if (!parsed.action || !parsed.message_to_user) {
      throw new Error("Respuesta sin formato esperado");
    }
    
    return parsed;

  } catch (error) {
    console.error("❌ Error con Gemini:", error);
    return {
      action: "DIRECT_SEND" as const,
      reason: "Error al procesar",
      message_to_user: "Tuve un pequeño problema. ¿Podrías repetirme tu consulta? 🙏",
      type: "desconocido",
      confidence: 0,
      entities: {}
    };
  }
}
