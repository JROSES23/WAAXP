import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Ventas totales
  const { data: clients } = await supabase.from('clients').select('*')
  
  // Contar por estado
  const ventasCerradas = clients?.filter(c => c.status === 'cerrando_venta').length || 0
  const interesados = clients?.filter(c => c.status === 'interesado').length || 0
  
  // Tiempo promedio de respuesta (ejemplo)
  const tiempoPromedio = 24 // minutos
  
  res.json({
    ventasTotales: ventasCerradas * 100, // Ejemplo
    recuperadasIA: ventasCerradas,
    tiempoRespuesta: tiempoPromedio,
    tasaConversion: ((ventasCerradas / clients.length) * 100).toFixed(0)
  })
}
