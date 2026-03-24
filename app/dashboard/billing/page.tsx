import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import BillingClient from './BillingClient'
import { DEMO_NEGOCIO, DEMO_BUSINESS_ID } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return (
      <BillingClient
        business={DEMO_NEGOCIO}
        businessId={DEMO_BUSINESS_ID}
      />
    )
  }

  return (
    <BillingClient
      business={auth.business!}
      businessId={auth.businessId}
    />
  )
}
