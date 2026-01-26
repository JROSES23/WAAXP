'use client'

import { User } from '@supabase/supabase-js'
import Inbox from '@/app/dashboard/inbox/Inbox'

interface InboxClientProps {
  user: User
}

export default function InboxClient({ user }: InboxClientProps) {
  return (
    <div className="h-screen bg-white overflow-hidden">
      <Inbox />
    </div>
  )
}
