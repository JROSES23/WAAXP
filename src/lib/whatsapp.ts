import { Boom } from '@hapi/boom'
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  WASocket 
} from '@whiskeysockets/baileys'

let sock: WASocket | null = null

export async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)
  
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Conexión cerrada, reconectando...', shouldReconnect)
      if(shouldReconnect) {
        connectWhatsApp()
      }
    } else if(connection === 'open') {
      console.log('✅ WhatsApp conectado')
    }
  })

  return sock
}

export function getWhatsAppInstance() {
  return sock
}

export function isConnected() {
  return sock !== null && sock.user !== undefined
}
