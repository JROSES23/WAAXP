'use client'

import Inbox from '@/app/dashboard/inbox/Inbox'
import type { Conversacion, Negocio, Producto, Staff } from '@/app/dashboard/types'

interface InboxClientProps {
  negocio: Negocio
  conversaciones: Conversacion[]
  productos: Producto[]
  equipo: Staff[]
}

export default function InboxClient({ negocio, conversaciones, productos, equipo }: InboxClientProps) {
  return (
    <div className="h-screen bg-white overflow-hidden">
      <Inbox
        negocio={negocio}
        conversaciones={conversaciones}
        productos={productos}
        equipo={equipo}
      />
    </div>
  )
}
