import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductosClient from './ProductosClient'
import {
  obtenerCategoriasPorNegocio,
  obtenerNegocioActual,
  obtenerProductosPorNegocio,
} from '@/app/dashboard/lib/data'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const supabase = await createClient()
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser()

  if (!usuario) {
    redirect('/login')
  }

  const negocio = await obtenerNegocioActual(usuario.id)
  const [productosIniciales, categoriasIniciales] = await Promise.all([
    obtenerProductosPorNegocio(negocio.id),
    obtenerCategoriasPorNegocio(negocio.id),
  ])

  return (
    <ProductosClient
      negocio={negocio}
      productosIniciales={productosIniciales}
      categoriasIniciales={categoriasIniciales}
    />
  )
}
