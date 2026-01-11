// src/handlers/handleMessageReceived.ts
import { IncomingMessagePayload, Conversation, Message } from "../types";
import { analyzeIntent } from "../ai/analyzeIntent";
import { createQuote } from "../quotes/createQuote";
import { initializeProducts } from "../db/products";
import { sock } from "../provider/whatsapp"; // 👈 IMPORTANTE: Conexión real
import supabase from '../utils/supabase';

// Base de datos en memoria (Simulada para el MVP)
let CONVERSATIONS_DB: Conversation[] = [];
let MESSAGES_DB: Message[] = [];

export async function handleMessageReceived(
  payload: IncomingMessagePayload
): Promise<void> {
  const startTime = Date.now();

  // MVP CONTROL FLUJO: Negocio y límite diario IA
  try {
    // 1. Buscar Negocio en Supabase
    const phone = payload.display_phone_number || payload.phone || payload.business_id;
    const { data: negocio, error: negocioError } = await supabase
      .from('negocios')
      .select('id, daily_ai_limit')
      .eq('phone_number', phone)
      .single();

    if (negocioError || !negocio) {
      console.error('❌ Negocio no existe o error DB:', negocioError);
      return;
    }
    const businessId = negocio.id;
    const dailyAiLimit = negocio.daily_ai_limit;

    // 2. Verificación de usage diario
    const hoy = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    let { data: uso, error: usoError } = await supabase
      .from('daily_usage')
      .select('id, message_count')
      .eq('business_id', businessId)
      .eq('date', hoy)
      .single();
    if (usoError || !uso) {
      const { error: insertUsoError } = await supabase
        .from('daily_usage')
        .insert([{ business_id: businessId, date: hoy, message_count: 0 }]);
      uso = { id: null, message_count: 0 };
      if (insertUsoError) {
        console.error('❌ Error creando uso diario:', insertUsoError);
        return;
      }
    }
    // 3. Lógica de bloqueo por límite
    if ((uso?.message_count ?? 0) >= dailyAiLimit) {
      await sendMessageFallbackSupabase(payload.phone || phone, 'Gracias por tu mensaje. Un asesor revisará tu consulta a la brevedad.');
      return;
    }

    // Continúa flujo normal abajo...
    console.log("📨 Mensaje recibido de:", payload.phone);

    const conversation = await getOrCreateConversation(
      payload.business_id,
      payload.phone
    );

    const mensajeGuardado = await saveMessage({
      conversation_id: conversation.id,
      sender: "client",
      content: payload.message,
    });

    console.log(`💾 Mensaje guardado: ${mensajeGuardado.id}`);

    if (!conversation.ai_enabled) {
      console.log("🤖 IA desactivada para esta conversación");
      return;
    }

    // --- INCREMENTAR el contador al responder (solo si NO bloquea ---
    // Se aplica tras lógica de Gemini (debajo del try/catch de IA mas abajo)


    const historial = await getRecentMessages(conversation.id, 5);

    console.log("🧠 Analizando intención...");
    const intent = await analyzeIntent(payload.message, historial);

    mensajeGuardado.intent = intent;
    mensajeGuardado.metadata.processed = true;

    console.log(
      `✅ Intención detectada: action=${intent.action}, reason="${intent.reason}"`
    );

    // HUMAN-IN-THE-LOOP: Manejo según action
    if (intent.action === "DIRECT_SEND") {
      // CASO A: Enviar directamente
      console.log("📤 DIRECT_SEND: Enviando mensaje directamente a WhatsApp");
      await sendMessage(conversation.id, "assistant", intent.message_to_user);
      
      // Incrementar contador después de enviar exitosamente
      await incrementarContadorIA(businessId, hoy, uso);
      
    } else if (intent.action === "REQUIRE_APPROVAL") {
      // CASO B: Requiere aprobación humana
      console.log("⏸️ REQUIRE_APPROVAL: Enviando a cola de aprobación");
      
      // Determinar action_type basado en el tipo de intención
      let actionType = "COTIZACION";
      if (intent.type === "confirmacion_compra") actionType = "CONFIRMACION";
      else if (intent.type === "datos_envio") actionType = "DATOS_ENVIO";
      else if (intent.type === "metodo_pago") actionType = "METODO_PAGO";
      
      // Insertar en ai_action_queue
      const { error: queueError } = await supabase
        .from('ai_action_queue')
        .insert([{
          business_id: businessId,
          whatsapp_chat_id: payload.phone || phone,
          suggested_text: intent.message_to_user,
          action_type: actionType,
          status: 'PENDING',
          created_at: new Date().toISOString()
        }]);

      if (queueError) {
        console.error('❌ Error insertando en ai_action_queue:', queueError);
      } else {
        console.log('✅ Solicitud agregada a cola de aprobación');
      }

      // Enviar mensaje placeholder
      await sendMessage(
        conversation.id,
        "assistant",
        "Estoy verificando esa información exacta. Te confirmo en unos minutos."
      );
      
      // NO incrementar contador porque no se envió el mensaje real de IA
    } else {
      // Fallback: si no viene action, usar lógica legacy
      console.warn("⚠️ Action no reconocida, usando lógica legacy");
      if (intent.requiere_humano) {
        await escalarAHumano(conversation, intent);
        await incrementarContadorIA(businessId, hoy, uso);
        return;
      }
      await ejecutarAccionSegunIntent(conversation, payload.message, intent);
      await incrementarContadorIA(businessId, hoy, uso);
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️  Mensaje procesado en ${duration}ms`);
  } catch (error) {
    console.error("❌ Error en handleMessageReceived:", error);
    if (payload.phone) {
        console.log("Enviando mensaje de error al cliente:", payload.phone);
    }
  }
}

// Fallback para bloqueo IA (NO requiere conversation)
async function sendMessageFallbackSupabase(phone: string, mensaje: string) {
  try {
    const jid = `${phone}@s.whatsapp.net`;
    if (sock) {
      await sock.sendMessage(jid, { text: mensaje });
      console.log(`📡 Fallback IA enviado a ${jid}`);
    }
  } catch (error) {
    console.error('❌ Error enviando fallback IA:', error);
  }
}

// Incrementa el contador de uso de IA de forma silenciosa (no rompe el flujo)
async function incrementarContadorIA(
  businessId: string,
  hoy: string,
  uso: { id: any; message_count: number } | null
): Promise<void> {
  try {
    const nuevoCount = (uso?.message_count ?? 0) + 1;
    const { error } = await supabase
      .from('daily_usage')
      .update({ message_count: nuevoCount })
      .eq('business_id', businessId)
      .eq('date', hoy);

    if (error) {
      console.error('❌ Error incrementando contador IA:', error);
    } else {
      console.log(`📊 Contador IA actualizado: ${nuevoCount}`);
    }
  } catch (error) {
    // Manejo silencioso: solo loguea, no lanza excepción
    console.error('❌ Error inesperado incrementando contador IA:', error);
  }
}

async function ejecutarAccionSegunIntent(
  conversation: Conversation,
  mensaje: string,
  intent: any
): Promise<void> {
  switch (intent.type) {
    case "cotizacion":
      console.log("💰 Procesando solicitud de cotización...");
      await manejarCotizacion(conversation, mensaje);
      break;

    case "confirmacion_compra":
      console.log("✅ Cliente confirma compra");
      await manejarConfirmacion(conversation);
      break;

    case "consulta_producto":
      console.log("❓ Consulta sobre producto");
      await manejarConsultaProducto(conversation, mensaje, intent);
      break;

    case "saludo":
      console.log("👋 Saludo detectado");
      await enviarSaludo(conversation);
      break;

    case "despedida":
      console.log("👋 Despedida detectada");
      await enviarDespedida(conversation);
      break;

    case "datos_envio":
      console.log("📍 Recibiendo datos de envío");
      await procesarDatosEnvio(conversation, mensaje);
      break;

    case "metodo_pago":
      console.log("💳 Recibiendo método de pago");
      await procesarMetodoPago(conversation, mensaje);
      break;

    case "reclamo":
      console.log("⚠️ Reclamo detectado - escalando");
      await escalarAHumano(conversation, intent);
      break;

    default:
      console.log("🤷 Intención no clasificada - respuesta general");
      await enviarRespuestaGeneral(conversation, mensaje);
      break;
  }
}

async function manejarCotizacion(
  conversation: Conversation,
  mensaje: string
): Promise<void> {
  const resultado = await createQuote(conversation, mensaje);

  if (!resultado.success) {
    console.error("Error creando cotización:", resultado.error);

    await sendMessage(
      conversation.id,
      "assistant",
      "Disculpa, no pude encontrar los productos que mencionas. " +
        "¿Podrías decirme qué productos te interesan?"
    );
    return;
  }

  conversation.status = "cotizacion_enviada";
  conversation.metadata.ultima_cotizacion_id = resultado.quote!.id;
  conversation.metadata.ultima_actividad = new Date();

  await sendMessage(conversation.id, "assistant", resultado.mensaje!);

  console.log(`✅ Cotización ${resultado.quote!.id} enviada`);
}

async function manejarConfirmacion(conversation: Conversation): Promise<void> {
  if (!conversation.metadata.ultima_cotizacion_id) {
    await sendMessage(
      conversation.id,
      "assistant",
      "No tengo una cotización pendiente. ¿En qué te puedo ayudar?"
    );
    return;
  }

  conversation.status = "esperando_datos";

  await sendMessage(
    conversation.id,
    "assistant",
    "¡Perfecto! 🎉\n\n" +
      "Para continuar con tu pedido, necesito los siguientes datos:\n\n" +
      "📍 *Dirección de envío completa*\n" +
      "(calle, número, comuna, ciudad)\n\n" +
      "Por favor envíamela en un solo mensaje."
  );

  console.log("✅ Confirmación procesada, esperando datos");
}

async function procesarDatosEnvio(
  conversation: Conversation,
  mensaje: string
): Promise<void> {
  conversation.metadata = {
    ...conversation.metadata,
    direccion_envio: mensaje,
  };

  await sendMessage(
    conversation.id,
    "assistant",
    "¡Gracias! 📦\n\n" +
      "Ahora, ¿cómo prefieres pagar?\n\n" +
      "💳 Transferencia\n" +
      "💵 Efectivo\n" +
      "🏧 Tarjeta\n\n" +
      "Responde con el método que prefieras."
  );

  console.log("✅ Datos de envío guardados");
}

async function procesarMetodoPago(
  conversation: Conversation,
  mensaje: string
): Promise<void> {
  conversation.metadata = {
    ...conversation.metadata,
    metodo_pago: mensaje,
  };

  conversation.status = "finalizada";

  await sendMessage(
    conversation.id,
    "assistant",
    "✅ *¡Pedido confirmado!*\n\n" +
      "Tu pedido ha sido registrado exitosamente.\n\n" +
      "📦 Te enviaremos la confirmación de despacho pronto.\n" +
      "📞 Cualquier duda, estamos disponibles.\n\n" +
      "¡Gracias por tu compra! 🎉"
  );

  console.log("✅ Pedido finalizado");
}

async function enviarSaludo(conversation: Conversation): Promise<void> {
  const hora = new Date().getHours();
  let saludo = "Buenos días";

  if (hora >= 12 && hora < 20) {
    saludo = "Buenas tardes";
  } else if (hora >= 20) {
    saludo = "Buenas noches";
  }

  await sendMessage(
    conversation.id,
    "assistant",
    `¡${saludo}! 👋\n\n` +
      `Soy el asistente de ventas de [NOMBRE NEGOCIO].\n\n` +
      `¿En qué te puedo ayudar hoy?`
  );
}

async function enviarDespedida(conversation: Conversation): Promise<void> {
  await sendMessage(
    conversation.id,
    "assistant",
    "¡Gracias por escribir! 😊\n\n" +
      "Cualquier cosa que necesites, acá estamos.\n\n" +
      "¡Que tengas un excelente día!"
  );
}

async function enviarRespuestaGeneral(
  conversation: Conversation,
  mensaje: string
): Promise<void> {
  await sendMessage(
    conversation.id,
    "assistant",
    "Entiendo. ¿Te puedo ayudar con algo más? " +
      "Puedo ayudarte a cotizar productos o resolver dudas."
  );
}

async function manejarConsultaProducto(
  conversation: Conversation,
  mensaje: string,
  intent: any
): Promise<void> {
  await sendMessage(
    conversation.id,
    "assistant",
    "Claro, déjame ayudarte con eso. " +
      "¿Qué producto específico te interesa?"
  );
}

async function escalarAHumano(
  conversation: Conversation,
  intent: any
): Promise<void> {
  conversation.status = "escalada";
  conversation.ai_enabled = false;

  await sendMessage(
    conversation.id,
    "assistant",
    "Entiendo tu situación. " +
      "Voy a conectarte con un asesor que te ayudará personalmente. " +
      "Un momento por favor."
  );

  console.log(
    `⚠️ CONVERSACIÓN ESCALADA: ${conversation.id} - Razón: ${intent.type}`
  );
}

async function getOrCreateConversation(
  businessId: string,
  phone: string
): Promise<Conversation> {
  let conversation = CONVERSATIONS_DB.find(
    (c) => c.business_id === businessId && c.phone === phone
  );

  if (!conversation) {
    conversation = {
      id: `conv_${Date.now()}`,
      business_id: businessId,
      phone: phone,
      status: "activa",
      ai_enabled: true,
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {
        total_mensajes: 0,
        ultima_actividad: new Date(),
      },
    };

    CONVERSATIONS_DB.push(conversation);

    if (CONVERSATIONS_DB.length === 1) {
      initializeProducts(businessId);
      console.log("✅ Productos inicializados");
    }

    console.log(`✅ Nueva conversación creada: ${conversation.id}`);
  }

  return conversation;
}

async function saveMessage(data: {
  conversation_id: string;
  sender: "client" | "assistant" | "human";
  content: string;
}): Promise<Message> {
  const mensaje: Message = {
    id: `msg_${Date.now()}`,
    conversation_id: data.conversation_id,
    sender: data.sender,
    content: data.content,
    created_at: new Date(),
    metadata: {
      processed: false,
    },
  };

  MESSAGES_DB.push(mensaje);

  const conversation = CONVERSATIONS_DB.find(
    (c) => c.id === data.conversation_id
  );
  if (conversation) {
    conversation.metadata.total_mensajes++;
    conversation.metadata.ultima_actividad = new Date();
  }

  return mensaje;
}

async function getRecentMessages(
  conversationId: string,
  limit: number
): Promise<Message[]> {
  return MESSAGES_DB.filter((m) => m.conversation_id === conversationId)
    .slice(-limit)
    .reverse();
}

async function sendMessage(
    conversationId: string,
    sender: "assistant" | "human",
    contenido: string
  ): Promise<void> {
    
    // 1. Guardar mensaje en el historial interno
    await saveMessage({
      conversation_id: conversationId,
      sender: sender,
      content: contenido,
    });
  
    // 2. Mostrar en consola para debug
    console.log(`\n📤 [INTENTO ENVÍO] Contenido:\n${'-'.repeat(40)}\n${contenido}\n${'-'.repeat(40)}\n`);

    // 3. ENVIAR A WHATSAPP REAL (Si es el bot quien habla)
    if (sender === "assistant" || sender === "human") {
        try {
            // Buscamos el número de teléfono en nuestra "Base de Datos" temporal
            const conversation = CONVERSATIONS_DB.find(c => c.id === conversationId);

            if (conversation && sock) {
                const phone = conversation.phone;
                // Formato requerido por Baileys: numero@s.whatsapp.net
                const jid = `${phone}@s.whatsapp.net`;

                console.log(`📡 Enviando señal a WhatsApp (${jid})...`);
                
                await sock.sendMessage(jid, { text: contenido });
                
                console.log(`✅ ¡Mensaje entregado a WhatsApp!`);
            } else {
                console.warn("⚠️ No se pudo enviar: Socket desconectado o conversación no encontrada.");
            }
        } catch (error) {
            console.error("❌ Error enviando mensaje real a WhatsApp:", error);
        }
    }
}