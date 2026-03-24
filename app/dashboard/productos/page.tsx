import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth'
import ProductosClient from './ProductosClient'
import { obtenerCategoriasPorNegocio, obtenerProductosPorNegocio } from '@/app/dashboard/lib/data'
import { DEMO_CATEGORIAS, DEMO_NEGOCIO, DEMO_PRODUCTOS } from '@/app/dashboard/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')

  if (!auth.businessId) {
    return (
      <ProductosClient
        negocio={DEMO_NEGOCIO}
        productosIniciales={DEMO_PRODUCTOS}
        categoriasIniciales={DEMO_CATEGORIAS}
      />
    )
  }

  const [productosIniciales, categoriasIniciales] = await Promise.all([
    obtenerProductosPorNegocio(auth.businessId),
    obtenerCategoriasPorNegocio(auth.businessId),
  ])

  return (
    <ProductosClient
      negocio={auth.business!}
      productosIniciales={productosIniciales}
      categoriasIniciales={categoriasIniciales}
    />
  )
}
