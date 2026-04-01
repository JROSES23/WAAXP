import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { getAuthContext } from '@/lib/auth'
import OnboardingClient from './OnboardingClient'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  await requireAuth()

  const auth = await getAuthContext()
  if (!auth) redirect('/login')
  // If already has a business, go to dashboard
  if (auth.businessId) redirect('/dashboard')

  return <OnboardingClient userId={auth.userId} email={auth.email} />
}
