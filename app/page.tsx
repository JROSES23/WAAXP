'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-3xl">🤖</div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Operly
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#inicio" className="text-gray-700 hover:text-teal-600 transition">Inicio</a>
              <a href="#caracteristicas" className="text-gray-700 hover:text-teal-600 transition">Características</a>
              <a href="#nosotros" className="text-gray-700 hover:text-teal-600 transition">Nosotros</a>
              <a href="#contacto" className="text-gray-700 hover:text-teal-600 transition">Contacto</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                href="/login"
                className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium transition"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#inicio" className="block py-2 text-gray-700">Inicio</a>
              <a href="#caracteristicas" className="block py-2 text-gray-700">Características</a>
              <a href="#nosotros" className="block py-2 text-gray-700">Nosotros</a>
              <a href="#contacto" className="block py-2 text-gray-700">Contacto</a>
              <Link href="/login" className="block py-2 text-teal-600 font-medium">Iniciar sesión</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                🚀 Automatiza tus ventas por WhatsApp
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Tu asistente de ventas
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"> IA 24/7</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Levi responde a tus clientes, genera cotizaciones y cierra ventas automáticamente mientras duermes. Aumenta tus conversiones hasta 3x con inteligencia artificial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition text-center"
                >
                  Probar gratis 14 días
                </Link>
                <a 
                  href="#caracteristicas"
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:shadow-lg border-2 border-gray-200 transition text-center"
                >
                  Ver cómo funciona
                </a>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                ✓ Sin tarjeta de crédito · ✓ Configuración en 5 minutos · ✓ Soporte en español
              </p>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex-1 text-right">
                      <div className="inline-block bg-teal-500 text-white rounded-2xl px-4 py-2 text-sm">
                        ¡Hola! ¿En qué puedo ayudarte? 🤖
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="inline-block bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-700">
                        Necesito cotización para mi proyecto
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Operly?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automatiza tu proceso de ventas con IA y recupera el tiempo que perdías respondiendo mensajes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "IA Conversacional",
                description: "Levi entiende el contexto y responde como un vendedor experto, adaptándose al tono de cada cliente"
              },
              {
                icon: "⚡",
                title: "Respuesta Instantánea",
                description: "Atiende a múltiples clientes simultáneamente sin perder calidad en la atención"
              },
              {
                icon: "📊",
                title: "Dashboard Completo",
                description: "Métricas en tiempo real: ventas, conversiones, productos más vendidos y mucho más"
              },
              {
                icon: "🔔",
                title: "Alertas Inteligentes",
                description: "Te notifica cuando un cliente está listo para comprar o necesita atención personalizada"
              },
              {
                icon: "💰",
                title: "Aumenta Ventas",
                description: "Recupera ventas perdidas con seguimientos automáticos y ofertas personalizadas"
              },
              {
                icon: "🌎",
                title: "Multi-idioma",
                description: "Atiende en español, inglés y más idiomas sin configuración adicional"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Quiénes somos
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Somos un equipo apasionado por la tecnología y las ventas. Creemos que cada negocio merece tener acceso a herramientas de inteligencia artificial sin complicaciones técnicas.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Operly nació de la frustración de ver cómo pequeños y medianos negocios perdían ventas por no poder responder rápido a sus clientes en WhatsApp. Hoy ayudamos a cientos de empresas a automatizar sus ventas y recuperar su tiempo.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-300">
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-1">500+</div>
                  <div className="text-sm text-gray-600">Empresas activas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-1">50k+</div>
                  <div className="text-sm text-gray-600">Conversaciones/mes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-1">3x</div>
                  <div className="text-sm text-gray-600">Más conversiones</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Nuestra misión</h4>
                    <p className="text-gray-600">Democratizar la IA para que cualquier negocio pueda automatizar sus ventas sin necesitar un equipo técnico.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Nuestra visión</h4>
                    <p className="text-gray-600">Ser la plataforma líder en automatización de ventas conversacionales en Latinoamérica.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contacto" className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para automatizar tus ventas?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de empresas que ya confían en Operly
          </p>
          <Link 
            href="/login"
            className="inline-block px-10 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition"
          >
            Empezar prueba gratuita
          </Link>
          <p className="mt-6 text-sm opacity-75">
            Sin compromiso · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl">🤖</div>
                <span className="text-xl font-bold text-white">Operly</span>
              </div>
              <p className="text-sm">
                Automatiza tus ventas por WhatsApp con inteligencia artificial.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#caracteristicas" className="hover:text-white transition">Características</a></li>
                <li><a href="#" className="hover:text-white transition">Precios</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#nosotros" className="hover:text-white transition">Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 Operly. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
