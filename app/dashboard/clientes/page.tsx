'use client'

import { useState } from 'react'
import { Search, Users, Zap, DollarSign } from 'lucide-react'

interface Cliente {
  id: number
  nombre: string
  empresa: string
  estado: 'Activo' | 'Inactivo'
  conversaciones: number
  ultimaCompra: string
  valorTotal: string
  potencial: 'Alto' | 'Medio' | 'Bajo'
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterPotencial, setFilterPotencial] = useState('Todos los potenciales')

  const stats = [
    { label: 'Clientes activos', value: '3', icon: Users, color: 'bg-teal-50 text-teal-600' },
    { label: 'Oportunidades', value: '1', icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Valor total', value: '$12.000', icon: DollarSign, color: 'bg-green-50 text-green-600' }
  ]

  const clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      empresa: 'Pérez Construcciones',
      estado: 'Activo',
      conversaciones: 8,
      ultimaCompra: '14-01-2024',
      valorTotal: '$4200',
      potencial: 'Alto'
    },
    {
      id: 2,
      nombre: 'María López',
      empresa: 'Ferretería López',
      estado: 'Activo',
      conversaciones: 5,
      ultimaCompra: '09-01-2024',
      valorTotal: '$2800',
      potencial: 'Medio'
    },
    {
      id: 3,
      nombre: 'David Frarez',
      empresa: 'Taller Mecánico',
      estado: 'Inactivo',
      conversaciones: 3,
      ultimaCompra: '19-11-2023',
      valorTotal: '$1500',
      potencial: 'Bajo'
    }
  ]

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'Todos' || cliente.estado === filterEstado
    const matchesPotencial = filterPotencial === 'Todos los potenciales' || cliente.potencial === filterPotencial
    return matchesSearch && matchesEstado && matchesPotencial
  })

  const getPotencialColor = (potencial: string) => {
    switch(potencial) {
      case 'Alto':
        return 'bg-green-500'
      case 'Medio':
        return 'bg-yellow-500'
      case 'Bajo':
        return 'bg-red-500'
      default:
        return 'bg-slate-300'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Clientes</h1>
        <p className="text-sm text-slate-600">
          Gestiona tus clientes y visualiza su historial
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer min-w-[140px]"
        >
          <option>Todos</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
        <select
          value={filterPotencial}
          onChange={(e) => setFilterPotencial(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer min-w-[160px]"
        >
          <option>Todos los potenciales</option>
          <option>Alto</option>
          <option>Medio</option>
          <option>Bajo</option>
        </select>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Conversaciones
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Última Compra
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Potencial
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500 font-medium">No se encontraron clientes</p>
                      <p className="text-xs text-slate-400 mt-1">Intenta con otros filtros</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr 
                    key={cliente.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold text-sm flex-shrink-0">
                          {cliente.nombre.charAt(0)}{cliente.nombre.split(' ')[1]?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {cliente.nombre}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cliente.empresa}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        cliente.estado === 'Activo' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          cliente.estado === 'Activo' ? 'bg-green-500' : 'bg-slate-400'
                        }`} />
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-medium text-slate-900">
                          {cliente.conversaciones}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cliente.ultimaCompra}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-teal-600">
                      {cliente.valorTotal}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPotencialColor(cliente.potencial)}`} />
                        <span className="text-xs font-medium text-slate-600">
                          {cliente.potencial}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de resultados */}
      {filteredClientes.length > 0 && (
        <div className="mt-4 text-sm text-slate-500">
          Mostrando <span className="font-semibold text-slate-700">{filteredClientes.length}</span> de <span className="font-semibold text-slate-700">{clientes.length}</span> clientes
        </div>
      )}
    </div>
  )
}
