// src/provider/whatsapp.ts
import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { handleMessageReceived } from '../handlers/handleMessageReceived';

// Número de teléfono del bot (puede venir de variable de entorno o hardcodeado)
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER || "56935725488"; // ⚠️ CAMBIA ESTE NÚMERO

// Función para enviar mensajes (La usaremos para responder)
export let sock: any;

export async function connectToWhatsApp() {
    // 1. Guardamos la sesión (credenciales) en una carpeta para no escanear QR siempre
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // 2. Iniciamos el socket
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // QR desactivado explícitamente
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Navegador para evitar errores
        // Ignoramos logs basura
        logger: require('pino')({ level: 'silent' }) 
    });

    // 3. Lógica para forzar el código de vinculación
    if (!sock.authState.creds.registered) {
        console.log('⏳ Solicitando código de vinculación para:', phoneNumber);
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('\n');
                console.log('═'.repeat(60));
                console.log('═'.repeat(60));
                console.log('═'.repeat(60));
                console.log('');
                console.log('🚨🚨🚨 TU CÓDIGO DE VINCULACIÓN ES: 🚨🚨🚨');
                console.log('');
                console.log('   ╔════════════════════════════════════════╗');
                console.log(`   ║                                        ║`);
                console.log(`   ║         ${code}         ║`);
                console.log(`   ║                                        ║`);
                console.log('   ╚════════════════════════════════════════╝');
                console.log('');
                console.log('📱 Ve a WhatsApp > Configuración > Dispositivos vinculados');
                console.log('📱 Toca "Vincular un dispositivo"');
                console.log('📱 Ingresa el código de arriba');
                console.log('');
                console.log('═'.repeat(60));
                console.log('═'.repeat(60));
                console.log('═'.repeat(60));
                console.log('\n');
            } catch (err) {
                console.error('❌ Error pidiendo código:', err);
            }
        }, 3000);
    }

    // 4. Manejamos la conexión (Si se cae, reconecta)
    sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔌 Conexión cerrada. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ ¡CONEXIÓN A WHATSAPP EXITOSA!');
            console.log('🤖 El bot está escuchando mensajes reales...');
        } else if (connection === 'connecting') {
            console.log('🔄 Conectando a WhatsApp...');
        }
    });

    // 5. Guardamos credenciales cuando cambian
    sock.ev.on('creds.update', saveCreds);

    // 6. ESCUCHAMOS MENSAJES REALES 👂
    sock.ev.on('messages.upsert', async (m: any) => {
        const msg = m.messages[0];

        // Ignoramos mensajes propios o estados
        if (!msg.message || msg.key.fromMe) return;

        // Obtenemos el teléfono y el texto
        const phone = msg.key.remoteJid?.split('@')[0];
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!phone || !texto) return;

        console.log(`\n📨 MENSAJE REAL DE ${phone}: ${texto}`);

        // 🔥 ¡AQUÍ CONECTAMOS CON TU CEREBRO!
        // Llamamos a tu lógica actual
        await handleMessageReceived({
            business_id: 'negocio_demo', // Por ahora hardcodeado
            phone: phone,
            message: texto
        });
    });
}