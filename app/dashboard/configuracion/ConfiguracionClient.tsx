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
  { value: 'tienda', label: 'Tienda' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'restaurante', label: 'Restaurante' },
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
  const [descuentoPlantilla, setDescuentoPlantilla] = useState(0)
  const [seguimientoAutomatico, setSeguimientoAutomatico] = useState(false)
  const [diasSeguimiento, setDiasSeguimiento] = useState('3')
  const [descripcionEmpresa, setDescripcionEmpresa] = useState('')
  const [modalVerticalAbierto, setModalVerticalAbierto] = useState(false)
  const [nombreVerticalNueva, setNombreVerticalNueva] = useState('')
  const [verticalesPersonalizadas, setVerticalesPersonalizadas] = useState<
    { value: VerticalNegocio; label: string }[]
  >([])

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
    setDescuentoPlantilla(0)
    setSeguimientoAutomatico(false)
    setDiasSeguimiento('3')
    setDescripcionEmpresa('')
  }

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-600">Administra tu negocio y equipo</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Datos del negocio</h2>
          <button
            onClick={actualizarNegocio}
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
          >
            <Save className="h-4 w-4" />
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <input
              id="nombre-negocio"
              value={datosNegocio.nombre}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({ ...estadoPrevio, nombre: event.target.value }))
              }
              placeholder=" "
              className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
            />
            <label
              htmlFor="nombre-negocio"
              className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
            >
              Nombre del negocio
            </label>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Vertical principal</label>
            <div className="mt-2 flex gap-2">
              <select
                value={datosNegocio.vertical_principal}
                onChange={(event) =>
                  setDatosNegocio((estadoPrevio) => ({
                    ...estadoPrevio,
                    vertical_principal: event.target.value as VerticalNegocio,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {[...VERTICALES, ...verticalesPersonalizadas].map((vertical) => (
                  <option key={vertical.value} value={vertical.value}>
                    {vertical.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setModalVerticalAbierto(true)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
              >
                + Agregar nueva vertical
              </button>
            </div>
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
          <div className="relative">
            <input
              id="whatsapp-phone"
              value={datosNegocio.whatsapp_phone ?? ''}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({
                  ...estadoPrevio,
                  whatsapp_phone: event.target.value,
                }))
              }
              placeholder=" "
              className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
            />
            <label
              htmlFor="whatsapp-phone"
              className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
            >
              WhatsApp teléfono
            </label>
          </div>
          <div className="relative">
            <input
              id="whatsapp-token"
              value={datosNegocio.whatsapp_token ?? ''}
              onChange={(event) =>
                setDatosNegocio((estadoPrevio) => ({
                  ...estadoPrevio,
                  whatsapp_token: event.target.value,
                }))
              }
              placeholder=" "
              className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
            />
            <label
              htmlFor="whatsapp-token"
              className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
            >
              WhatsApp token
            </label>
          </div>
        </div>
      </section>

      {modosServiciosActivos && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                id="equipo-nombre"
                value={nombreEquipo}
                onChange={(event) => setNombreEquipo(event.target.value)}
                placeholder=" "
                className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
              />
              <label
                htmlFor="equipo-nombre"
                className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
              >
                Nombre
              </label>
            </div>
            <div className="relative">
              <input
                id="equipo-rol"
                value={rolEquipo}
                onChange={(event) => setRolEquipo(event.target.value)}
                placeholder=" "
                className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
              />
              <label
                htmlFor="equipo-rol"
                className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
              >
                Rol
              </label>
            </div>
            <button
              onClick={agregarEquipo}
              className="rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
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
              setDescuentoPlantilla(0)
              setSeguimientoAutomatico(false)
              setDiasSeguimiento('3')
              setDescripcionEmpresa('')
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-300 hover:bg-slate-50"
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
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  id="mensaje-plantilla"
                  value={mensajePlantilla}
                  onChange={(event) => setMensajePlantilla(event.target.value)}
                  className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                  rows={4}
                  placeholder=" "
                />
                <label
                  htmlFor="mensaje-plantilla"
                  className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                >
                  Template mensaje
                </label>
              </div>
              <div className="relative">
                <input
                  id="keywords-plantilla"
                  value={keywordsPlantilla}
                  onChange={(event) => setKeywordsPlantilla(event.target.value)}
                  className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  htmlFor="keywords-plantilla"
                  className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                >
                  Trigger keywords
                </label>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Descuento sugerido</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={descuentoPlantilla}
                    onChange={(event) => setDescuentoPlantilla(Number(event.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-sm font-semibold text-slate-900">{descuentoPlantilla}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="seguimiento-automatico"
                  type="checkbox"
                  checked={seguimientoAutomatico}
                  onChange={(event) => setSeguimientoAutomatico(event.target.checked)}
                />
                <label htmlFor="seguimiento-automatico" className="text-sm text-slate-700">
                  Seguimiento automático
                </label>
                {seguimientoAutomatico && (
                  <select
                    value={diasSeguimiento}
                    onChange={(event) => setDiasSeguimiento(event.target.value)}
                    className="ml-auto rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    <option value="3">3 días</option>
                    <option value="5">5 días</option>
                    <option value="7">7 días</option>
                  </select>
                )}
              </div>
              <div className="relative">
                <textarea
                  id="descripcion-empresa"
                  value={descripcionEmpresa}
                  onChange={(event) => setDescripcionEmpresa(event.target.value)}
                  className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
                  placeholder=" "
                  rows={2}
                />
                <label
                  htmlFor="descripcion-empresa"
                  className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
                >
                  Descripción empresa
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPlantillaEditando(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-all duration-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPlantilla}
                className="rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVerticalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Agregar nueva vertical</h3>
            <div className="relative">
              <input
                id="nueva-vertical"
                value={nombreVerticalNueva}
                onChange={(event) => setNombreVerticalNueva(event.target.value)}
                placeholder=" "
                className="peer w-full rounded-lg border border-slate-200 px-3 pb-2 pt-5 text-sm focus:border-emerald-400 focus:outline-none"
              />
              <label
                htmlFor="nueva-vertical"
                className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400"
              >
                Nombre de la vertical
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalVerticalAbierto(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-all duration-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const nombre = nombreVerticalNueva.trim()
                  if (!nombre) {
                    return
                  }
                  const nuevaVertical = {
                    value: nombre.toLowerCase().replace(/\s+/g, '-') as VerticalNegocio,
                    label: nombre,
                  }
                  setVerticalesPersonalizadas((estadoPrevio) => [nuevaVertical, ...estadoPrevio])
                  setDatosNegocio((estadoPrevio) => ({
                    ...estadoPrevio,
                    vertical_principal: nuevaVertical.value,
                  }))
                  setNombreVerticalNueva('')
                  setModalVerticalAbierto(false)
                }}
                className="rounded-lg bg-[#0f9d58] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0b8b4e]"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
