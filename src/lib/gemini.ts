import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

let cachedModel: any = null;
let cachedSystemInstruction: string = '';

export async function getGeminiResponse(
  userMessage: string,
  systemInstruction?: string
) {
  try {
    if (!cachedModel || cachedSystemInstruction !== systemInstruction) {
      cachedModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction || 'Eres un asistente de ventas profesional.',
      });
      cachedSystemInstruction = systemInstruction || '';
    }

    const result = await cachedModel.generateContent(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Error Gemini:', error);
    return 'Lo siento, hubo un error procesando tu mensaje.';
  }
}
