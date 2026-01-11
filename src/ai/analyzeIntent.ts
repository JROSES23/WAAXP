// src/ai/analyzeIntent.ts
import { analyzeMessageWithGPT } from "./openai";

export async function analyzeIntent(mensaje: string, historial: any[]) {
  // 1. Llamamos a GPT-4o-mini
  const analisisIA = await analyzeMessageWithGPT(mensaje, historial);

  // 2. Retornamos la respuesta completa con el nuevo formato
  return {
    action: analisisIA.action,
    reason: analisisIA.reason,
    message_to_user: analisisIA.message_to_user,
    // Campos legacy para compatibilidad
    type: analisisIA.type || "desconocido",
    confidence: analisisIA.confidence || 0.8,
    payload: mensaje,
    entities: analisisIA.entities || {},
    requiere_humano: analisisIA.action === "REQUIRE_APPROVAL"
  };
}