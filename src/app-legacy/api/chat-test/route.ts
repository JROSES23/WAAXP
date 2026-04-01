import { getGeminiResponse } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, systemPrompt } = await request.json();
    
    const response = await getGeminiResponse(message, systemPrompt);
    
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Error en chat' }, { status: 500 });
  }
}
