// src/cron/recoverSales.ts
import { pool } from '../db/connection';

async function recuperarVentas() {
    console.log("🕵️  Buscando clientes indecisos...");

    try {
        // Buscamos cotizaciones que sigan 'enviada' (no compraron)
        // En la vida real usaríamos una fecha (ej: hace 30 min). 
        // Para el test, traemos TODAS las enviadas.
        const res = await pool.query(
            "SELECT * FROM quotes WHERE status = 'enviada' LIMIT 5"
        );

        if (res.rows.length === 0) {
            console.log("✅ No hay ventas perdidas por ahora.");
            return;
        }

        console.log(`⚠️  Encontré ${res.rows.length} cotizaciones sin cerrar.`);

        for (const quote of res.rows) {
            console.log(`\n📢 ENVIANDO RECORDATORIO para Cotización ID: ${quote.id}`);
            
            // Parseamos el JSON para saber qué querían comprar
            const items = quote.items; // Postgres devuelve el JSON ya parseado usualmente
            const nombreProducto = items[0].nombre;

            // Simulamos el envío del mensaje de seguimiento
            const mensajeSeguimiento = 
                `👋 Hola! Noté que te interesaste en *${nombreProducto}*.\n` +
                `¿Te gustaría finalizar tu compra ahora? Quedan pocas unidades. 🏃‍♂️`;

            console.log(`--------------------------------------------------`);
            console.log(`📱 WHATSAPP AUTOMÁTICO:\n${mensajeSeguimiento}`);
            console.log(`--------------------------------------------------`);

            // Marcar como 'recuperada' para no molestar de nuevo
            await pool.query("UPDATE quotes SET status = 'seguimiento_enviado' WHERE id = $1", [quote.id]);
        }

    } catch (error) {
        console.error("❌ Error en el recuperador:", error);
    } finally {
        await pool.end();
    }
}

recuperarVentas();