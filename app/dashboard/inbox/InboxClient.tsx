'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Inbox from '@/app/dashboard/inbox/Inbox'
import type { Conversacion, Mensaje, Negocio, Producto, Staff } from '@/app/dashboard/types'

interface InboxClientProps {
  negocio: Negocio
  conversaciones: Conversacion[]
  productos: Producto[]
  equipo: Staff[]
}

export default function InboxClient({
  negocio,
  conversaciones: initialConversaciones,
  productos,
  equipo,
}: InboxClientProps) {
  const [conversaciones, setConversaciones] = useState(initialConversaciones)
  const [nuevosMensajes, setNuevosMensajes] = useState<Mensaje[]>([])
  const supabase = createClient()

  // Realtime subscription for conversations + messages
  useEffect(() => {
    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `business_id=eq.${negocio.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversaciones((prev) => [payload.new as Conversacion, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setConversaciones((prev) =>
              prev.map((c) =>
                c.id === (payload.new as Conversacion).id
                  ? (payload.new as Conversacion)
                  : c
              )
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `business_id=eq.${negocio.id}`,
        },
        (payload) => {
          setNuevosMensajes((prev) => [...prev, payload.new as Mensaje])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [negocio.id, supabase])

  const consumeNewMessages = useCallback(
    (conversationId: string) => {
      const msgs = nuevosMensajes.filter(
        (m) => m.conversation_id === conversationId
      )
      setNuevosMensajes((prev) =>
        prev.filter((m) => m.conversation_id !== conversationId)
      )
      return msgs
    },
    [nuevosMensajes]
  )

  return (
    <div className="h-[calc(100vh)] overflow-hidden">
      <Inbox
        negocio={negocio}
        conversaciones={conversaciones}
        productos={productos}
        equipo={equipo}
        realtimeMessages={nuevosMensajes}
        onConsumeMessages={consumeNewMessages}
      />
    </div>
  )
}
