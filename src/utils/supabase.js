import { createClient } from '@supabase/supabase-js'
import 'dotenv/config' // Agregamos esto por seguridad para cargar las env vars aquí también

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validación simple para que no te vuelvas loco si faltan las claves
if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase