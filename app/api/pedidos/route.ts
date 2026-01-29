import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerNegocioActual } from '@/app/dashboard/lib/data'

interface ItemPedidoEntrada {
  idProducto: string
  cantidad: number
}

export async function POST(solicitud: Request) {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const cuerpo = await solicitud.json()
  const { idConversacion, itemsPedido, moneda } = cuerpo as {
    idConversacion?: string
    itemsPedido?: ItemPedidoEntrada[]
    moneda?: string
  }

  if (!idConversacion || !itemsPedido || itemsPedido.length === 0) {
    return NextResponse.json({ error: 'Ítems inválidos' }, { status: 400 })
  }

  const { data: conversacion, error: errorConversacion } = await supabase
    .from('conversations')
    .select('id, business_id, client_name, phone_number')
    .eq('id', idConversacion)
    .single()

  if (errorConversacion || !conversacion || conversacion.business_id !== negocio.id) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  const requestedIds = itemsPedido.map((itemPedido) => itemPedido.idProducto)
  const { data: validProducts } = await supabase
    .from('products')
    .select('id')
    .in('id', requestedIds)
    .eq('business_id', negocio.id)

  if (!validProducts || validProducts.length !== requestedIds.length) {
    return NextResponse.json(
      { error: 'Uno o más productos no pertenecen a tu negocio' },
      { status: 403 }
    )
  }

  const idsProductos = itemsPedido.map((itemPedido) => itemPedido.idProducto)
  const { data: productos, error: errorProductos } = await supabase
    .from('products')
    .select('id, nombre, precio, stock')
    .in('id', idsProductos)
    .eq('business_id', negocio.id)

  if (errorProductos || !productos) {
    return NextResponse.json({ error: 'No se pudieron cargar productos' }, { status: 500 })
  }

  const itemsPreparados = itemsPedido.map((itemPedido) => {
    const producto = productos.find((prod) => prod.id === itemPedido.idProducto)
    const precioUnitario = Number(producto?.precio ?? 0)
    const subtotal = precioUnitario * itemPedido.cantidad
    return {
      producto,
      cantidad: itemPedido.cantidad,
      precioUnitario,
      subtotal,
    }
  })

  const total = itemsPreparados.reduce((sum, item) => sum + item.subtotal, 0)

  const { data: pedido, error: errorPedido } = await supabase
    .from('orders')
    .insert({
      business_id: negocio.id,
      conversation_id: idConversacion,
      cliente_nombre: conversacion.client_name,
      cliente_phone: conversacion.phone_number,
      total,
      moneda: moneda ?? 'CLP',
      estado: 'pendiente',
    })
    .select('*')
    .single()

  if (errorPedido || !pedido) {
    return NextResponse.json({ error: 'No se pudo crear el pedido' }, { status: 500 })
  }

  const itemsInsertados = itemsPreparados.map((itemPedido) => ({
    order_id: pedido.id,
    product_id: itemPedido.producto?.id,
    nombre: itemPedido.producto?.nombre ?? 'Producto',
    cantidad: itemPedido.cantidad,
    precio_unitario: itemPedido.precioUnitario,
    subtotal: itemPedido.subtotal,
  }))

  const { error: errorItems } = await supabase.from('order_items').insert(itemsInsertados)

  if (errorItems) {
    return NextResponse.json({ error: 'No se pudieron crear los ítems' }, { status: 500 })
  }

  for (const itemPedido of itemsPreparados) {
    if (itemPedido.producto?.id && typeof itemPedido.producto.stock === 'number') {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, itemPedido.producto.stock - itemPedido.cantidad) })
        .eq('id', itemPedido.producto.id)
    }
  }

  const resumen = itemsPreparados
    .map((itemPedido) => `${itemPedido.producto?.nombre ?? 'Producto'} x${itemPedido.cantidad}`)
    .join(', ')

  await supabase.from('messages').insert({
    conversation_id: idConversacion,
    business_id: negocio.id,
    role: 'assistant',
    content: `Pedido creado: ${resumen}. Total ${total.toLocaleString()} ${moneda ?? 'CLP'}.`,
    timestamp: new Date().toISOString(),
    status: 'sent',
  })

  return NextResponse.json({ ok: true })
}
