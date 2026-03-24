'use client'

import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'

const articles = [
  {
    title: "Cómo automatizar ventas en WhatsApp Chile 2026",
    excerpt:
      "Guía completa para PYMEs chilenas que quieren automatizar WhatsApp Business sin perder el trato humano.",
    date: "10 Enero 2026",
    readTime: "5 min",
    category: "Guías",
    slug: "automatizar-ventas-whatsapp-chile",
    image: "/blog/whatsapp-automatizacion.jpg",
    comingSoon: false
  },
  {
    title: "5 errores al gestionar WhatsApp Business que te cuestan ventas",
    excerpt:
      "Errores comunes que hacen perder clientes y cómo evitarlos usando automatización inteligente.",
    date: "8 Enero 2026",
    readTime: "4 min",
    category: "Tips",
    slug: "errores-whatsapp-business",
    image: "/blog/errores-whatsapp.jpg",
    comingSoon: false
  },
  {
    title: "ROI de automatizar WhatsApp: Casos reales de PYMEs chilenas",
    excerpt:
      "Cómo negocios locales aumentaron ventas entre 40% y 200% usando WhatsApp con IA.",
    date: "5 Enero 2026",
    readTime: "7 min",
    category: "Casos de éxito",
    slug: "roi-automatizacion-whatsapp",
    image: "/blog/roi-whatsapp.jpg",
    comingSoon: false
  },

  // PRÓXIMAMENTE
  {
    title: "WhatsApp + IA: Cómo atender 24/7 sin contratar más personal",
    excerpt: "Próximamente",
    category: "Guías",
    image: "/blog/proximamente-1.jpg",
    comingSoon: true
  },
  {
    title: "Chatbots vs atención humana: cuándo usar cada uno",
    excerpt: "Próximamente",
    category: "Educativo",
    image: "/blog/proximamente-2.jpg",
    comingSoon: true
  },
  {
    title: "Cómo escalar ventas con WhatsApp sin perder control",
    excerpt: "Próximamente",
    category: "Ventas",
    image: "/blog/proximamente-3.jpg",
    comingSoon: true
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="md" showText />
          </Link>
          <div className="hidden lg:flex gap-8">
            <Link href="/" className="text-sm text-slate-700 hover:text-teal-600">Inicio</Link>
            <Link href="/#caracteristicas" className="text-sm text-slate-700 hover:text-teal-600">Características</Link>
            <Link href="/#planes" className="text-sm text-slate-700 hover:text-teal-600">Planes</Link>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-slate-700">Iniciar sesión</Link>
            <Link href="/login" className="px-5 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-sm rounded-lg">
              Probar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Blog de WAAXP</h1>
        <p className="text-xl text-slate-600">
          Estrategias reales para vender más con WhatsApp e IA
        </p>
      </section>

      {/* GRID */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {articles.map((a, i) => (
            <article
              key={i}
              className={`rounded-xl border overflow-hidden transition ${
                a.comingSoon
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:shadow-lg"
              }`}
            >
              <div className="relative h-48">
                <Image src={a.image} alt={a.title} fill className="object-cover" />
                {a.comingSoon && (
                  <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold bg-slate-900 text-white rounded-full">
                    PRÓXIMAMENTE
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="flex gap-3 text-xs text-slate-600 mb-3">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-semibold">
                    {a.category}
                  </span>
                  {!a.comingSoon && (
                    <>
                      <span>{a.date}</span>
                      <span>·</span>
                      <span>{a.readTime}</span>
                    </>
                  )}
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  {a.title}
                </h2>

                <p className="text-slate-600 text-sm mb-4">
                  {a.excerpt}
                </p>

                {!a.comingSoon && (
                  <Link
                    href={`/blog/${a.slug}`}
                    className="text-teal-600 font-semibold text-sm"
                  >
                    Leer más →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
