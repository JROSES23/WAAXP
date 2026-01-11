'use client'
import { Sidebar } from './Sidebar'  // Tu sidebar existente
import Metrics from './Metrics'
import Inbox from './Inbox'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />  {/* Items: Dashboard, Chats, Productos, Configuración */}
      <main className="flex-1 p-6 overflow-auto">
        <Metrics />  {/* $1.200 | 12 chats | 25% tasa */}
        <Inbox />    {/* Chats: María López (pendiente), etc. */}
      </main>
    </div>
  )
}
