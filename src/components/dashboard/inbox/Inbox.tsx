'use client'

const inboxItems = [
  {
    id: 'maria-lopez',
    name: 'María López',
    status: 'pendiente',
    message: 'Quiere confirmar la última cotización.',
  },
  {
    id: 'carlos-ramirez',
    name: 'Carlos Ramírez',
    status: 'nuevo',
    message: 'Pregunta por disponibilidad de stock.',
  },
  {
    id: 'sofia-garcia',
    name: 'Sofía García',
    status: 'cerrado',
    message: 'Pedido aprobado, en preparación.',
  },
]

export default function Inbox() {
  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">Inbox</p>
          <h2 className="text-xl font-semibold text-gray-900">Últimos chats</h2>
        </div>
        <button className="rounded-full border border-gray-200 px-4 py-1 text-sm font-medium text-gray-600">
          Ver todos
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {inboxItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.message}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
