import http from 'http'
import https from 'https'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import pino from 'pino'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// =======================================================
// ✏️ CONFIGURACIÓN
const NUMERO_BOT = "56935725488"
const NUMERO_ADMIN = "56936919849"
const NOMBRE_VENDEDOR = "Levi" // 🔧 Cambia aquí el nombre del vendedor
const EMPRESA_NOMBRE = "TechStore" // 🔧 Opcional: nombre de tu empresa
// =======================================================

const port = process.env.PORT || 10000
http.createServer((req, res) => res.end('LEVI ONLINE')).listen(port, () => console.log(`🌍 Puerto ${port} activo`))

// Mantener vivo (Ping para Render)
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    const url = process.env.RENDER_EXTERNAL_URL
    const lib = url.startsWith('https') ? https : http
    lib.get(url, () => {}).on('error', () => {})
  }, 300000)
}

console.log('🔍 DEBUG SUPABASE:')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

// === SUPABASE & GEMINI ===
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

// === RESPUESTAS PREDEFINIDAS (Ahorro de tokens) ===
const RESPUESTAS_RAPIDAS = {
  saludo: [
    `¡Hola! 👋 Soy *${NOMBRE_VENDEDOR}*. ¿En qué puedo ayudarte hoy?`,
    `Hola, soy *${NOMBRE_VENDEDOR}* 😊 ¿Buscas algo en particular?`,
    `¡Bienvenido! Soy *${NOMBRE_VENDEDOR}*. Cuéntame, ¿qué necesitas?`
  ],
  
  despedida: [
    `¡Hasta pronto! 👋 Estoy aquí si necesitas algo más.`,
    `Gracias por escribir. ¡Que tengas un excelente día! 😊`,
    `¡Nos vemos! No dudes en contactarme cuando quieras.`
  ],
  
  confirmacion_compra: `¡Perfecto! 🎉 He generado tu solicitud de cotización. Queda pendiente de aprobación y te contactaremos a la brevedad.`,
  
  error_generico: `Disculpa, tuve un problema técnico ⚙️ ¿Podrías repetir tu consulta?`
}

// Función para elegir respuesta aleatoria
function respuestaAleatoria(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// === CATÁLOGO FORMATEADO (Sin Gemini - Ahorro de tokens) ===
async function mostrarCatalogo() {
  const { data, error } = await supabase.from('products').select('*');
  
  if (error || !data || data.length === 0) {
    return `Lo siento, ahora no puedo mostrar el catálogo 😔 Intenta más tarde.`;
  }
  
  let respuesta = `¡Hola! 👋 Soy *${NOMBRE_VENDEDOR}*. Te muestro lo que tenemos:\n\n`;
  
  const emojis = ['💻', '🖱️', '⌨️', '📺', '📱', '🎧', '🖨️', '💾'];
  
  data.forEach((p, i) => {
    const emoji = emojis[i % emojis.length];
    respuesta += `${emoji} *${p.name}*\n`;
    respuesta += `$${p.price_clp.toLocaleString('es-CL')} CLP | $${p.price_usd} USD\n\n`;
  });
  
  respuesta += `¿Te interesa alguno? 😊`;
  return respuesta;
}

// === DETECCIÓN DE INTENCIÓN (Sin Gemini cuando no es necesario) ===
async function procesarMensaje(mensaje, historial) {
  const m = mensaje.toLowerCase();
  
  // 1. CATÁLOGO - PRIMERO (Prioridad máxima)
  if (m.includes('catalogo') || m.includes('catálogo') || m.includes('productos') || 
      m.includes('que tienes') || m.includes('qué tienes') || m.includes('mostrar') ||
      m.includes('ver') && (m.includes('productos') || m.includes('catalogo'))) {
    return await mostrarCatalogo();
  }
  
  // 2. CONFIRMACIÓN DE COMPRA
  if (m.includes('comprar') || m.includes('compro') || m.includes('me interesa') || 
      m.includes('lo quiero') || m.includes('aseguremoslo')) {
    return RESPUESTAS_RAPIDAS.confirmacion_compra;
  }
  
  // 3. SALUDOS (solo si NO mencionan catálogo)
  if (m.match(/^(hola|buenas|hey|hi|buenos días|buenas tardes|buenas noches)\s*$/i)) {
    return respuestaAleatoria(RESPUESTAS_RAPIDAS.saludo);
  }
  
  // 4. DESPEDIDAS
  if (m.match(/^(chao|adiós|adios|gracias|bye|nos vemos|hasta luego)\s*$/i)) {
    return respuestaAleatoria(RESPUESTAS_RAPIDAS.despedida);
  }
  
  // 5. PREGUNTA ESPECÍFICA → Gemini
  return await consultarGemini(mensaje, historial);
}

// === GEMINI (Solo para consultas complejas - Ahorro de tokens) ===
async function consultarGemini(mensaje, historial) {
  try {
    if (!process.env.GEMINI_API_KEY) {
        return RESPUESTAS_RAPIDAS.error_generico;
    }
    
    const { data } = await supabase.from('products').select('*');
    const inventario = data?.map(p => `${p.name}: $${p.price_clp.toLocaleString('es-CL')} CLP`).join('\n') || "Sin productos";

    const prompt = `
    ACTÚA COMO: ${NOMBRE_VENDEDOR}, vendedor experto de ${EMPRESA_NOMBRE}.
    
    INVENTARIO: 
    ${inventario}

    HISTORIAL RECIENTE:
    ${historial.slice(-500)}

    REGLAS:
    - Respuestas MUY cortas (máx 5 líneas)
    - Usa emojis y *negritas* para productos
    - Si preguntan precio, responde directo con formato: $XXX.XXX CLP
    - NO des datos de pago ni links
    - Si quieren comprar, usa: "${RESPUESTAS_RAPIDAS.confirmacion_compra}"

    CLIENTE: "${mensaje}"
    RESPUESTA CORTA:`
    
    const result = await model.generateContent(prompt)
    return result.response.text()

  } catch (e) { 
    console.log("🔥 ERROR GEMINI:", e.message); 
    return RESPUESTAS_RAPIDAS.error_generico; 
  }
}

// === GESTIÓN DE CLIENTES (CRM + MEMORIA) ===
async function gestionarConversacion(telefono, mensajeUsuario, mensajeBot) {
  try {
      const m = mensajeUsuario.toLowerCase();
      let nuevoEstado = 'indefinido';
      let dispararAlerta = false;

      if (m.includes('precio') || m.includes('valor') || m.includes('info')) nuevoEstado = 'interesado';
      
      if (m.includes('aseguremoslo') || m.includes('comprar') || m.includes('compro') || 
          m.includes('pagar') || m.includes('me interesa') || m.includes('lo quiero')) {
          nuevoEstado = 'cerrando_venta';
          dispararAlerta = true;
      }
      
      if (m.includes('queja') || m.includes('no funciona') || m.includes('ayuda') || m.includes('problema')) {
          nuevoEstado = 'soporte';
      }

      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', telefono)
        .single();
      
      let historialPrevio = clients?.history || "";
      let estadoFinal = (nuevoEstado !== 'indefinido') ? nuevoEstado : (clients?.status || 'nuevo');

      const nuevoHistorial = `${historialPrevio}\nC: ${mensajeUsuario}\nL: ${mensajeBot}`.slice(-2500);

      const { error } = await supabase.from('clients').upsert({
          phone: telefono,
          history: nuevoHistorial,
          last_message: mensajeUsuario,
          status: estadoFinal
      }, { onConflict: 'phone' });

      if (error) console.log('❌ Error Supabase:', error.message);
      
      return { estado: estadoFinal, alerta: dispararAlerta };

  } catch (e) {
      console.log("⚠️ Error gestión:", e.message);
      return { estado: "nuevo", alerta: false };
  }
}

// === CONEXIÓN PRINCIPAL WHATSAPP ===
async function conectarWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_levi_qr_final')
  
  console.log(`🚀 Iniciando ${NOMBRE_VENDEDOR}...`)

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'), 
  })

  if (!sock.authState.creds.registered) {
      setTimeout(async () => {
          try {
             const numeroLimpio = NUMERO_BOT.replace(/[^0-9]/g, '')
             const code = await sock.requestPairingCode(numeroLimpio)
             const codeFormateado = code?.match(/.{1,4}/g)?.join("-") || code
             console.log(`\n===================================================`)
             console.log(`⚡ TU CÓDIGO:    ${codeFormateado}`)
             console.log(`===================================================\n`)
          } catch (error) {
             console.log("⚠️ Error código:", error.message)
          }
      }, 6000)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
        const reason = (lastDisconnect?.error)?.output?.statusCode
        if (reason !== DisconnectReason.loggedOut) conectarWhatsapp()
        else console.log("⛔ Sesión cerrada. Borra la carpeta 'auth' y reinicia.")
    } else if (connection === 'open') {
        console.log(`✅ ${NOMBRE_VENDEDOR} CONECTADO`)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const m = messages[0]
    if (!m.message || m.key.fromMe) return 
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const remoteJid = m.key.remoteJid
    const telefono = remoteJid.split('@')[0]
    
    if (!text) return

    console.log(`[Cliente ${telefono}]: ${text}`)
    await sock.sendPresenceUpdate('composing', remoteJid)

    const { data } = await supabase
      .from('clients')
      .select('history')
      .eq('phone', telefono)
      .single();
      
    const historialCtx = data?.history || "";

    // ✅ AHORA USA procesarMensaje en vez de consultarGemini
    const respuesta = await procesarMensaje(text, historialCtx)

    await sock.sendMessage(remoteJid, { text: respuesta }, { quoted: m })

    const resultado = await gestionarConversacion(telefono, text, respuesta);

    if (resultado.alerta === true && NUMERO_ADMIN) {
        try {
            const msgAdmin = `🚨 *COTIZACIÓN PENDIENTE*\n\n👤 Cliente: +${telefono}\n💬 "${text}"\n\n👉 Contacta para cerrar.`;
            await sock.sendMessage(`${NUMERO_ADMIN}@s.whatsapp.net`, { text: msgAdmin });
            console.log("🔔 Alerta enviada al Admin");
        } catch (err) {
            console.log("❌ Error alerta:", err.message);
        }
    }
  })
}

conectarWhatsapp()
