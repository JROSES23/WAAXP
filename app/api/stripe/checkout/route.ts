import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
  })
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { priceId, businessId } = await request.json()

  const { data: business } = await supabase
    .from('businesses')
    .select('stripe_customer_id, nombre')
    .eq('id', businessId)
    .single()

  let customerId = business?.stripe_customer_id as string | undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: (business?.nombre as string) ?? undefined,
      metadata: { business_id: businessId, user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('businesses')
      .update({ stripe_customer_id: customerId })
      .eq('id', businessId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${request.headers.get('origin')}/dashboard/billing?success=true`,
    cancel_url: `${request.headers.get('origin')}/dashboard/billing?cancelled=true`,
    metadata: { business_id: businessId },
  })

  return NextResponse.json({ url: session.url })
}
