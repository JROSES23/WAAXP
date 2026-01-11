// src/test_connection.ts
import { probarConexion, pool } from './db/connection';

async function test() {
    console.log("📡 Intentando conectar a Supabase...");
    const exito = await probarConexion();
    
    if (exito) {
        console.log("🎉 ¡Todo listo! Tu bot ya tiene memoria en la nube.");
    } else {
        console.log("⚠️ Revisa tu contraseña en el archivo .env");
    }

    // Cerramos la conexión para terminar el script
    await pool.end();
}

test();