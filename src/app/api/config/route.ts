import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('bot_config')
      .upsert({
        id: 1,
        mini_prompt: config.miniPrompt,
        dias_followup: config.diasFollowUp,
        tono: config.tono,
        descuento_max: config.descuentoMax,
        productos_destacados: config.productosDestacados,
        whatsapp_numero: config.whatsappNumero,
        notificaciones_push: config.notificacionesPush,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Error guardando config' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('bot_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error cargando config' }, { status: 500 });
  }
}
