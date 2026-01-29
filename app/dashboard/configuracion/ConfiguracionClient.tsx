'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Negocio, PlantillaRespuesta, Staff, VerticalNegocio } from '@/app/dashboard/types'
import { Save, Trash2 } from 'lucide-react'

interface ConfiguracionClientProps {
  negocio: Negocio
  equipoInicial: Staff[]
  plantillasIniciales: PlantillaRespuesta[]
}

const VERTICALES: { value: VerticalNegocio; label: string }[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'salon', label: 'Salón' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'services', label: 'Servicios' },
  { value: 'other', label: 'Otro' },
]

export default function ConfiguracionClient({
  negocio,
  equipoInicial,
  plantillasIniciales,
}: ConfiguracionClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const [datosNegocio, setDatosNegocio] = useState<Negocio>(negocio)
  const [equipo, setEquipo] = useState<Staff[]>(equipoInicial)
  const [plantillas, setPlantillas] = useState<PlantillaRespuesta[]>(plantillasIniciales)
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [rolEquipo, setRolEquipo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [plantillaEditando, setPlantillaEditando] = useState<PlantillaRespuesta | null>(null)
  const [mensajePlantilla, setMensajePlantilla] = useState('')
  const [keywordsPlantilla, setKeywordsPlantilla] = useState('')

  const modosServiciosActivos = datosNegocio.modos_activos?.some(
    (modo) => modo === 'servicios' || modo === 'reservas'
  )

  const actualizarNegocio = async () => {
    setGuardando(true)
    await supabase
      .from('businesses')
      .update({
        nombre: datosNegocio.nombre,
        vertical_principal: datosNegocio.vertical_principal,
        modos_activos: datosNegocio.modos_activos,
        whatsapp_phone: datosNegocio.whatsapp_phone,
        whatsapp_token: datosNegocio.whatsapp_token,
      })
      .eq('id', datosNegocio.id)
    setGuardando(false)
  }

  const agregarEquipo = async () => {
    if (!nombreEquipo.trim()) {
      return
    }
    const { data: datosEquipo, error } = await supabase
      .from('staff')
      .insert({
        business_id: datosNegocio.id,
        nombre: nombreEquipo.trim(),
        rol: rolEquipo.trim() || null,
        activo: true,
      })
      .select('*')
      .single()

    if (!error && datosEquipo) {
      setEquipo((estadoPrevio) => [datosEquipo as Staff, ...estadoPrevio])
      setNombreEquipo('')
      setRolEquipo('')
    }
  }

  const eliminarEquipo = async (id: string) => {
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (!error) {
      setEquipo((estadoPrevio) => estadoPrevio.filter((persona) => persona.id !== id))
    }
  }

  const guardarPlantilla = async () => {
    if (!plantillaEditando) {
      return
    }
    const palabras = keywordsPlantilla
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)

    if (plantillaEditando.id) {
      const { data: datosPlantilla, error } = await supabase
        .from('response_templates')
        .update({
          mensaje_template: mensajePlantilla,
          trigger_keywords: palabras,
        })
        .eq('id', plantillaEditando.id)
        .select('*')
        .single()

      if (!error && datosPlantilla) {
        setPlantillas((estadoPrevio) =>
          estadoPrevio.map((plantilla) =>
            plantilla.id === datosPlantilla.id ? (datosPlantilla as PlantillaRespuesta) : plantilla
          )
        )
      }
    } else {
      const { data: datosNuevaPlantilla, error } = await supabase
        .from('response_templates')
        .insert({
          business_id: datosNegocio.id,
          category: plantillaEditando.category ?? 'general',
          mensaje_template: mensajePlantilla,
          trigger_keywords: palabras,
          usage_count: 0,
        })
        .select('*')
        .single()

      if (!error && datosNuevaPlantilla) {
        setPlantillas((estadoPrevio) => [
          datosNuevaPlantilla as PlantillaRespuesta,
          ...estadoPrevio,
        ])
      }
    }

    setPlantillaEditando(null)
    setMensajePlantilla('')
    setKeywordsPlantilla('')
  }

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-600">Administra tu negocio y equipo</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Datos del negocio</h2>
          <button
            onClick={actualizarNegocio}
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Nombre del negocio</label>
            <input
              value={datosNegocio.nombre}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({ ...estadoPrevio, nombre: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Vertical principal</label>
            <select
              value={datosNegocio.vertical_principal}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({
                  ...estadoPrevio,
                  vertical_principal: event.target.value as VerticalNegocio,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {VERTICALES.map((vertical) => (
                <option key={vertical.value} value={vertical.value}>
                  {vertical.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Modos activos</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {['productos', 'servicios', 'reservas'].map((modo) => (
                <label key={modo} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={datosNegocio.modos_activos?.includes(modo)}
                    onChange={(event) => {
                      setDatosNegocio((estadoPrevio) => {
                        const actuales = estadoPrevio.modos_activos ?? []
                        const nuevos = event.target.checked
                          ? [...actuales, modo]
                          : actuales.filter((item) => item !== modo)
                        return { ...estadoPrevio, modos_activos: nuevos }
                      })
                    }}
                  />
                  {modo === 'productos' ? 'Productos' : modo === 'servicios' ? 'Servicios' : 'Reservas'}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">WhatsApp teléfono</label>
            <input
              value={datosNegocio.whatsapp_phone ?? ''}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({
                  ...estadoPrevio,
                  whatsapp_phone: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">WhatsApp token</label>
            <input
              value={datosNegocio.whatsapp_token ?? ''}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({
                  ...estadoPrevio,
                  whatsapp_token: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {modosServiciosActivos && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={nombreEquipo}
              onChange={(event) => setNombreEquipo(event.target.value)}
              placeholder="Nombre"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={rolEquipo}
              onChange={(event) => setRolEquipo(event.target.value)}
              placeholder="Rol"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              onClick={agregarEquipo}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Agregar
            </button>
          </div>
          <div className="space-y-2">
            {equipo.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no tienes equipo registrado.</p>
            ) : (
              equipo.map((persona) => (
                <div
                  key={persona.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{persona.nombre}</p>
                    <p className="text-xs text-slate-500">{persona.rol || 'Sin rol'}</p>
                  </div>
                  <button
                    onClick={() => eliminarEquipo(persona.id)}
                    className="text-xs text-red-600 inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Plantillas de IA</h2>
          <button
            onClick={() => {
              setPlantillaEditando({
                id: '',
                business_id: datosNegocio.id,
                trigger_keywords: [],
                mensaje_template: '',
                usage_count: 0,
                created_at: new Date().toISOString(),
              })
              setMensajePlantilla('')
              setKeywordsPlantilla('')
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            Crear plantilla
          </button>
        </div>
        <div className="space-y-2">
          {plantillas.length === 0 ? (
            <p className="text-sm text-slate-500">No hay plantillas creadas.</p>
          ) : (
            plantillas.map((plantilla) => (
              <div
                key={plantilla.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{plantilla.category || 'General'}</p>
                <p className="text-xs text-slate-500">
                  Palabras clave: {(plantilla.trigger_keywords || []).join(', ') || 'Sin keywords'}
                </p>
                <p className="mt-2 text-slate-700">{plantilla.mensaje_template}</p>
                <button
                  onClick={() => {
                    setPlantillaEditando(plantilla)
                    setMensajePlantilla(plantilla.mensaje_template)
                    setKeywordsPlantilla((plantilla.trigger_keywords || []).join(', '))
                  }}
                  className="mt-2 text-xs text-teal-600"
                >
                  Editar plantilla
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {plantillaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Editar plantilla</h3>
            <label className="text-sm font-semibold text-slate-700">Mensaje</label>
            <textarea
              value={mensajePlantilla}
              onChange={(event) => setMensajePlantilla(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={4}
            />
            <label className="mt-3 text-sm font-semibold text-slate-700">Palabras clave</label>
            <input
              value={keywordsPlantilla}
              onChange={(event) => setKeywordsPlantilla(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="precio, envío, stock"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPlantillaEditando(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPlantilla}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
