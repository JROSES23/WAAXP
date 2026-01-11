// src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import { handleMessageReceived } from './handlers/handleMessageReceived';
import { connectToWhatsApp } from './provider/whatsapp'; // 👈 IMPORTANTE: Traemos el conector

const app = express();
const PORT = 3005; 

app.use(bodyParser.json());

// EL ESPÍA (Log de actividad)
app.use((req, res, next) => {
    console.log(`\n🔔 INTERACCIÓN DETECTADA: ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.send('OK - Bot Activo en puerto 3005');
});

// Este webhook sigue sirviendo para pruebas manuales desde Postman/PowerShell
app.post('/webhook', async (req, res) => {
    try {
        console.log("   📩 Payload recibido vía HTTP...");
        await handleMessageReceived(req.body);
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error');
    }
});

app.listen(PORT, async () => {
    console.log(`
    =========================================
    🚀 SERVIDOR WEB LISTO EN PUERTO ${PORT}
    🔗 Salud: http://localhost:${PORT}/health
    =========================================
    `);

    // 🔥 INICIAMOS WHATSAPP AQUÍ
    console.log("🔋 Iniciando módulo de WhatsApp...");
    try {
        await connectToWhatsApp();
    } catch (error) {
        console.error("❌ Falló el inicio de WhatsApp:", error);
    }
});