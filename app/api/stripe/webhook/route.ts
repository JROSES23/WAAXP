import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
  })
}

// Use service role for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_MAP: Record<string, { plan: string; usage_limit: number }> = {
  starter: { plan: 'starter', usage_limit: 100 },
  pro: { plan: 'pro', usage_limit: 1500 },
  enterprise: { plan: 'enterprise', usage_limit: 999999 },
}

function resolvePlan(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0]
  const nickname = item?.price?.nickname?.toLowerCase() ?? ''
  if (nickname.includes('enterprise')) return 'enterprise'
  if (nickname.includes('pro')) return 'pro'
  return 'starter'
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = event.data.object as any

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const planKey = resolvePlan(subscription)
      const planConfig = PLAN_MAP[planKey] ?? PLAN_MAP.starter

      const businessId =
        subscription.metadata?.business_id ??
        (
          await supabase
            .from('businesses')
            .select('id')
            .eq('stripe_customer_id', subscription.customer as string)
            .single()
        ).data?.id

      if (businessId) {
        await supabase
          .from('businesses')
          .update({
            plan: planConfig.plan,
            usage_limit: planConfig.usage_limit,
            stripe_subscription_id: subscription.id,
            plan_expires_at: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
          })
          .eq('id', businessId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const businessId =
        subscription.metadata?.business_id ??
        (
          await supabase
            .from('businesses')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
        ).data?.id

      if (businessId) {
        await supabase
          .from('businesses')
          .update({
            plan: 'starter',
            usage_limit: 100,
            stripe_subscription_id: null,
            plan_expires_at: null,
          })
          .eq('id', businessId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
