// src/db/connection.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('❌ FATAL: No encontré DATABASE_URL en el archivo .env');
}

// Creamos un "Pool" de conexiones (es más eficiente que abrir y cerrar a cada rato)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para conectar con Supabase desde local
  }
});

// Función simple para probar que funciona
export const probarConexion = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as hora_actual');
    console.log('✅ Conexión a Base de Datos EXITOSA:', res.rows[0].hora_actual);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a la BD:', err);
    return false;
  }
};