import { notFound } from "next/navigation"

type BlogPost = {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  category: string
  readingTime: string
}

/* MOCK TEMPORAL — luego lo conectas a BD o MDX */
const posts: BlogPost[] = [
  {
    slug: "como-automatizar-whatsapp-chile-2026",
    title: "Cómo automatizar ventas en WhatsApp Chile 2026",
    excerpt:
      "Guía completa para PYMEs chilenas que quieren automatizar WhatsApp Business sin perder el trato humano.",
    content: `
WhatsApp es el canal de ventas más importante para las PYMEs en Chile.

Automatizar no significa perder cercanía, sino responder más rápido,
ordenar conversaciones y convertir más clientes.

### Qué puedes automatizar
- Respuestas frecuentes
- Calificación de leads
- Horarios y mensajes fuera de horario

### Qué NO debes automatizar
- Conversaciones complejas
- Reclamos sensibles
- Cierre final de ventas

La clave es combinar IA + humano.
`,
    date: "10 Enero 2026",
    category: "Guías",
    readingTime: "5 min",
  },
]

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  
  // Buscar el post
  const post = posts.find((p) => p.slug === slug)
  
  // Si no existe, mostrar 404
  if (!post) {
    notFound()
  }

  return (
    <article className="w-full">
      {/* CONTENEDOR CENTRAL */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* META */}
        <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-teal-700 font-medium">
            {post.category}
          </span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        {/* TITULO */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
          {post.title}
        </h1>

        {/* EXCERPT */}
        <p className="text-lg text-gray-600 mb-10">
          {post.excerpt}
        </p>

        {/* CONTENIDO */}
        <div className="prose prose-lg max-w-none">
          {post.content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
