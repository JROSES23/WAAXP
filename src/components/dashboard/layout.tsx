'use client'
import Sidebar from "@/components/dashboard/Sidebar";
import Metrics from './metrics'
import Inbox from './inbox/Inbox'


export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversacionesTotales={0}
        conversacionesPendientes={0}
        usoPorcentaje={0}
        planActual="Starter"
      />
      <main className="flex-1 p-6 overflow-auto">
        <Metrics />  {/* $1.200 | 12 chats | 25% tasa */}
        <Inbox />    {/* Chats: María López (pendiente), etc. */}
      </main>
    </div>
  )
}
