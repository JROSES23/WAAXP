import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Ventas totales
    const { data: clients, error } = await supabase.from('clients').select('*')
    
    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener clientes' },
        { status: 500 }
      )
    }
    
    // Contar por estado
    const ventasCerradas = clients?.filter(c => c.status === 'cerrando_venta').length || 0
    const interesados = clients?.filter(c => c.status === 'interesado').length || 0
    
    // Tiempo promedio de respuesta (ejemplo)
    const tiempoPromedio = 24 // minutos
    
    return NextResponse.json({
      ventasTotales: ventasCerradas * 100, // Ejemplo
      recuperadasIA: ventasCerradas,
      tiempoRespuesta: tiempoPromedio,
      tasaConversion: clients.length > 0 
        ? ((ventasCerradas / clients.length) * 100).toFixed(0)
        : '0'
    })
  } catch (error) {
    console.error('Error en API status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
