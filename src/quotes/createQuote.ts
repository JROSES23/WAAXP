// src/quotes/createQuote.ts
import { Conversation } from "../types";
import { findProducts } from "../db/products";
import { applyDiscounts } from "../sales/discounts";
import { pool } from "../db/connection"; // 👈 Importamos la conexión a BD
import { v4 as uuidv4 } from "uuid";

interface QuoteItem {
    product_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Quote {
    id: string;
    conversation_id: string;
    items: QuoteItem[];
    subtotal: number;
    discount?: {
        name: string;
        amount: number;
    };
    total: number;
    created_at: Date;
}

export async function createQuote(
  conversation: Conversation,
  mensaje: string
) {
  try {
    // 1. LIMPIEZA
    const palabrasRuido = ["precio", "valor", "costo", "cuanto", "vale", "quiero", "necesito", "cotizar", "hola", "de"];
    let terminoBusqueda = mensaje.toLowerCase();
    palabrasRuido.forEach(p => {
        terminoBusqueda = terminoBusqueda.replace(new RegExp(`\\b${p}\\b`, 'gi'), "");
    });
    terminoBusqueda = terminoBusqueda.trim() || mensaje;

    console.log(`🧠 Buscando: "${terminoBusqueda}"`);

    // 2. BUSCAR
    const productosEncontrados = await findProducts(terminoBusqueda);

    if (productosEncontrados.length === 0) {
        return { success: false, error: "No se encontraron productos." };
    }

    // 3. ARMAR ITEMS (Seguimos con el truco de x3 para ver el descuento)
    const items: QuoteItem[] = productosEncontrados.map(p => ({
        product_id: p.id,
        nombre: p.name,
        cantidad: 3, 
        precio_unitario: p.price,
        subtotal: p.price * 3
    }));

    // 4. CALCULAR
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
    const discountResult = applyDiscounts(subtotal, totalItems);

    const quoteId = uuidv4(); // Generamos ID aquí

    const quote: Quote = {
      id: quoteId,
      conversation_id: conversation.id,
      items: items,
      subtotal: subtotal,
      discount: discountResult.applied ? {
          name: discountResult.name,
          amount: discountResult.amount
      } : undefined,
      total: discountResult.finalTotal,
      created_at: new Date(),
    };

    // 5. 💾 GUARDAR EN SUPABASE (La parte nueva)
    console.log("💾 Guardando cotización en base de datos...");
    await pool.query(
        `INSERT INTO quotes (id, conversation_id, items, subtotal, discount, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            quote.id,
            quote.conversation_id,
            JSON.stringify(quote.items), // Convertimos array a texto JSON
            quote.subtotal,
            quote.discount ? JSON.stringify(quote.discount) : null,
            quote.total
        ]
    );

    const mensajeFormateado = formatearMensajeCotizacion(quote);

    return {
      success: true,
      quote: quote,
      mensaje: mensajeFormateado,
    };

  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: "Error interno" };
  }
}

function formatearMensajeCotizacion(quote: Quote): string {
  let mensaje = "📋 *COTIZACIÓN*\n\n";

  quote.items.forEach((item, index) => {
    mensaje += `${index + 1}. *${item.nombre}* (x${item.cantidad})\n`;
    mensaje += `   💰 Unitario: $${item.precio_unitario.toLocaleString("es-CL")}\n`;
    mensaje += `   Subtotal: $${item.subtotal.toLocaleString("es-CL")}\n\n`;
  });

  mensaje += `━━━━━━━━━━━━━━━━\n`;
  mensaje += `Subtotal: $${quote.subtotal.toLocaleString("es-CL")}\n`;

  if (quote.discount) {
      mensaje += `🎁 ${quote.discount.name}: -$${quote.discount.amount.toLocaleString("es-CL")}\n`;
  }

  mensaje += `\n*TOTAL FINAL: $${quote.total.toLocaleString("es-CL")}*\n\n`;
  mensaje += `✅ Responde *"CONFIRMAR"* para pedirlo.`;

  return mensaje;
}