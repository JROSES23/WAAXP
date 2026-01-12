// src/ai/analyzeIntent.ts
// src/ai/analyzeIntent.ts
import { analyzeMessageWithGemini } from "./gemini";

export async function analyzeIntent(mensaje: string, historial: any[]) {
  // 1. Llamamos a Gemini
  const resultado = await analyzeMessageWithGemini(mensaje, historial);

  // 2. Retornamos la respuesta completa con el nuevo formato
  return {
    action: resultado.action,
    reason: resultado.reason,
    message_to_user: resultado.message_to_user,
    // Campos legacy para compatibilidad
    type: resultado.type || "desconocido",
    confidence: resultado.confidence || 0.8,
    payload: mensaje,
    entities: resultado.entities || {},
    requiere_humano: resultado.action === "REQUIRE_APPROVAL"
  };
}
