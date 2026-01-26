'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail, Phone, X, Play } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [roiInputs, setRoiInputs] = useState({ mensajes: 50, precio: 15000 })
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const tiempoAhorrado = Math.round((roiInputs.mensajes * 3) / 60)
  const costoVendedor = 500000
  const ahorroMensual = Math.round(costoVendedor * 0.7)
  const ventasExtras = Math.round((roiInputs.mensajes * 0.3 * roiInputs.precio))

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" showText={true} />
            </Link>

            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#caracteristicas" className="text-sm font-medium text-slate-600 hover:text-[#0ABAB5] transition-colors">
                Características
              </a>
              <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-[#0ABAB5] transition-colors">
                Cómo funciona
              </a>
              <a href="#planes" className="text-sm font-medium text-slate-600 hover:text-[#0ABAB5] transition-colors">
                Planes
              </a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-[#0ABAB5] transition-colors">
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#2D3748] transition-colors"
              >
                Iniciar sesión
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/login"
                  className="px-5 py-2 bg-[#0ABAB5] text-white text-sm font-semibold rounded-lg hover:bg-[#089a96] hover:shadow-lg hover:shadow-[#0ABAB5]/30 transition-all"
                >
                  Probar gratis
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section MEJORADO con Dashboard */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D3557]/10 via-[#F1FAEE] to-[#0ABAB5]/5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texto Izquierda */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-[#2D3748] leading-tight mb-6">
                Automatiza tu WhatsApp y vende 24/7 sin contratar más vendedores
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Atiende cientos de clientes simultáneamente, genera cotizaciones automáticas y cierra ventas mientras duermes. 
                Tu asistente IA trabaja sin descanso.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/login"
                    className="px-8 py-4 bg-[#0ABAB5] text-white font-bold rounded-lg hover:bg-[#089a96] hover:shadow-xl hover:shadow-[#0ABAB5]/30 transition-all text-center inline-block"
                  >
                    Comenzar prueba gratuita
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsVideoOpen(true)}
                  className="px-8 py-4 bg-white text-[#2D3748] font-bold rounded-lg border-2 border-slate-200 hover:border-[#0ABAB5] hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 text-[#0ABAB5]" />
                  Ver demostración
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0ABAB5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">14 días gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0ABAB5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Datos protegidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0ABAB5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Setup en 5 minutos</span>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Screenshot Derecha */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                {/* REEMPLAZA '/dashboard-screenshot.png' con tu imagen real */}
                <Image 
                  src="/images/dashboard.png" 
                  alt="Dashboard Operly"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0ABAB5]/10 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Decoración flotante */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#0ABAB5] to-[#A8DADC] rounded-full blur-2xl opacity-50"
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal Video */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsVideoOpen(false)}
          >
            <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-[#A8DADC] transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="aspect-video bg-[#1D3557] rounded-xl overflow-hidden">
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Play className="w-20 h-20 mx-auto mb-4 text-[#A8DADC]" />
                    <p className="text-lg">Video demo próximamente</p>
                    <p className="text-sm text-slate-400 mt-2">Por ahora puedes probar el producto gratis</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Badges MEJORADO */}
      <section className="py-16 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                title: 'Seguridad SSL',
                desc: 'Encriptación de extremo a extremo para tus conversaciones'
              },
              {
                icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
                title: 'GDPR Compliant',
                desc: 'Cumplimiento total de regulaciones europeas de datos'
              },
              {
                icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
                title: 'Servidores Chile',
                desc: 'Hosting local para máxima velocidad y baja latencia'
              }
            ].map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0ABAB5]/20 to-[#A8DADC]/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#0ABAB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2D3748] mb-2">{badge.title}</h3>
                  <p className="text-sm text-slate-600">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué Operly - Tabla Comparativa */}
      <section className="py-20 px-6 bg-[#F1FAEE]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              ¿Por qué Operly vs otras opciones?
            </h2>
            <p className="text-xl text-slate-600">
              Compara el costo real de gestionar WhatsApp manualmente
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-[#1D3557] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Característica</th>
                  <th className="px-6 py-4 text-center font-semibold">Manual</th>
                  <th className="px-6 py-4 text-center font-semibold">Vendedor Extra</th>
                  <th className="px-6 py-4 text-center font-semibold bg-[#0ABAB5]">Operly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { feature: 'Costo mensual', manual: 'Tu tiempo', vendedor: '$500.000+', operly: '$19.990' },
                  { feature: 'Atención 24/7', manual: '✕', vendedor: '✕', operly: '✓', highlight: true },
                  { feature: 'Respuesta instantánea', manual: '✕', vendedor: '~', operly: '✓', highlight: true },
                  { feature: 'Múltiples conversaciones', manual: '1 a la vez', vendedor: '1-3 a la vez', operly: 'Ilimitadas' },
                  { feature: 'Analytics y reportes', manual: '✕', vendedor: '✕', operly: '✓', highlight: true },
                  { feature: 'Setup', manual: '-', vendedor: '2-4 semanas', operly: '5 minutos' }
                ].map((row, i) => (
                  <motion.tr 
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`${i % 2 === 0 ? 'bg-[#F1FAEE]' : 'bg-white'} hover:bg-[#A8DADC]/10 transition-colors`}
                  >
                    <td className="px-6 py-4 font-medium text-[#2D3748]">{row.feature}</td>
                    <td className={`px-6 py-4 text-center ${row.manual === '✕' ? 'text-red-500 text-xl' : 'text-slate-600'}`}>{row.manual}</td>
                    <td className={`px-6 py-4 text-center ${row.vendedor === '✕' ? 'text-red-500 text-xl' : row.vendedor === '~' ? 'text-yellow-500 text-xl' : 'text-slate-600'}`}>{row.vendedor}</td>
                    <td className={`px-6 py-4 text-center font-bold ${row.highlight ? 'text-[#0ABAB5] text-xl' : 'text-[#0ABAB5]'}`}>{row.operly}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0ABAB5] text-white font-bold rounded-lg hover:bg-[#089a96] hover:shadow-xl transition-all"
              >
                Empezar ahora
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Para quién es Operly */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              ¿Para quién es Operly?
            </h2>
            <p className="text-xl text-slate-600">
              Perfecto para PYMEs chilenas que quieren crecer sin complicaciones
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
                title: 'Tiendas Retail',
                desc: 'Ropa, calzado, accesorios, tecnología',
                features: [
                  'Consultas de stock y precios automáticas',
                  'Catálogo digital con fotos',
                  'Gestión de pedidos y despachos'
                ]
              },
              {
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Servicios',
                desc: 'Peluquerías, salones, talleres, clínicas',
                features: [
                  'Agendamiento 24/7',
                  'Recordatorios automáticos',
                  'Cotizaciones instantáneas'
                ]
              },
              {
                icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
                title: 'E-commerce',
                desc: 'Tiendas online, dropshipping, Instagram',
                features: [
                  'Seguimiento de pedidos automatizado',
                  'Recuperación de carritos abandonados',
                  'Integración con redes sociales'
                ]
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-[#F1FAEE] rounded-2xl p-8 border border-slate-200 hover:border-[#0ABAB5] hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0ABAB5] to-[#A8DADC] rounded-xl flex items-center justify-center text-white mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#2D3748] mb-4">{card.title}</h3>
                <p className="text-slate-600 mb-4">{card.desc}</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {card.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#0ABAB5] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview CON SCREENSHOT REAL */}
      <section className="py-20 px-6 lg:px-8 bg-[#F1FAEE]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Un panel que lo controla todo
            </h2>
            <p className="text-xl text-slate-600">
              Interfaz intuitiva diseñada para vendedores, no programadores
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* SCREENSHOT DASHBOARD REAL */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src="/images/dashboard.png" 
                alt="Panel de Control Operly"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
              
              {/* Overlay gradiente sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557]/20 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Badge flotante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200"
              >
                <p className="text-sm font-bold text-[#0ABAB5]">✨ Vista en tiempo real</p>
              </motion.div>
            </div>

            {/* Features flotantes */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: '📊', title: 'Analytics detallados', desc: 'Métricas en vivo' },
                { icon: '🤖', title: 'IA integrada', desc: 'Respuestas automáticas' },
                { icon: '⚡', title: 'Súper rápido', desc: 'Carga instantánea' }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0ABAB5] transition-all"
                >
                  <div className="text-2xl mb-2">{feat.icon}</div>
                  <h4 className="font-bold text-[#2D3748] text-sm mb-1">{feat.title}</h4>
                  <p className="text-xs text-slate-600">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculadora ROI SIMPLIFICADA */}
      <section id="como-funciona" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Calcula tu ahorro con Operly
            </h2>
            <p className="text-xl text-slate-600">
              Descubre cuánto tiempo y dinero puedes ahorrar
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#F1FAEE] to-white rounded-2xl p-8 lg:p-12 border-2 border-[#0ABAB5]/20 shadow-xl"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Mensajes por día
                </label>
                <input
                  type="number"
                  value={roiInputs.mensajes}
                  onChange={(e) => setRoiInputs({ ...roiInputs, mensajes: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] focus:outline-none focus:border-[#0ABAB5] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Precio promedio producto ($)
                </label>
                <input
                  type="number"
                  value={roiInputs.precio}
                  onChange={(e) => setRoiInputs({ ...roiInputs, precio: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] focus:outline-none focus:border-[#0ABAB5] transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Tiempo ahorrado/día', value: `${tiempoAhorrado}h`, icon: '⏱️', color: 'from-[#0ABAB5] to-[#A8DADC]' },
                { label: 'Ahorro vs vendedor', value: `$${ahorroMensual.toLocaleString()}`, icon: '💰', color: 'from-[#1D3557] to-[#2D3748]' },
                { label: 'Ventas extras/mes', value: `$${ventasExtras.toLocaleString()}`, icon: '📈', color: 'from-[#A8DADC] to-[#0ABAB5]' }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${metric.color} p-6 rounded-xl text-white text-center shadow-lg`}
                >
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <p className="text-sm opacity-90 mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-20 px-6 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Herramientas profesionales diseñadas para equipos de ventas modernos
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Inbox Centralizado',
                desc: 'Gestiona todas las conversaciones de WhatsApp en una interfaz tipo email. Filtra, busca y organiza eficientemente.',
                icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              },
              {
                title: 'Aprobaciones Inteligentes',
                desc: 'Revisa y aprueba cotizaciones generadas automáticamente por IA antes de enviarlas a los clientes.',
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                title: 'Analytics en Tiempo Real',
                desc: 'Métricas de ventas, tasa de conversión y desempeño del bot actualizadas en vivo.',
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
              },
              {
                title: 'Alertas Personalizadas',
                desc: 'Notificaciones automáticas cuando un cliente necesita atención humana o está listo para comprar.',
                icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              },
              {
                title: 'Gestión de Equipo',
                desc: 'Asigna conversaciones a vendedores específicos. Controla permisos y monitorea el desempeño individual.',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              },
              {
                title: 'Integraciones Nativas',
                desc: 'Conecta con tu CRM, ERP y herramientas existentes. Sincronización automática de datos.',
                icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-[#0ABAB5] hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#0ABAB5] to-[#A8DADC] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2D3748] mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona - 4 Pasos */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Tu asistente trabaja en 4 pasos
            </h2>
            <p className="text-xl text-slate-600">
              Automatización inteligente sin complicaciones técnicas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Cliente escribe',
                desc: 'Recibe el mensaje por WhatsApp de forma automática',
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              },
              {
                step: '02',
                title: 'IA responde',
                desc: 'El asistente entiende la consulta y responde al instante',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
              },
              {
                step: '03',
                title: 'Genera cotización',
                desc: 'Crea presupuestos automáticos basados en tu catálogo',
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              },
              {
                step: '04',
                title: 'Tú apruebas',
                desc: 'Revisas desde el panel y cierras la venta con un click',
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-[#F1FAEE] p-8 rounded-2xl border border-slate-200 hover:border-[#0ABAB5] hover:shadow-xl transition-all h-full">
                  <div className="text-5xl font-bold text-[#0ABAB5]/20 mb-4">{step.step}</div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0ABAB5] to-[#A8DADC] rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3748] mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-[#0ABAB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Planes */}
      <section id="planes" className="py-20 px-6 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Comienza gratis, escala cuando lo necesites
            </h2>
            <p className="text-xl text-slate-600">
              Planes flexibles para PYMEs de todos los tamaños
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: 'Para probar el producto',
                features: [
                  '100 conversaciones/mes',
                  '1 asistente IA',
                  'Soporte por email',
                  'Analytics básicos'
                ],
                cta: 'Empezar gratis',
                popular: false,
                link: '/login'
              },
              {
                name: 'Pro',
                price: '$19',
                period: 'por mes',
                features: [
                  'Conversaciones ilimitadas',
                  '3 asistentes IA',
                  'Analytics avanzados',
                  'Soporte prioritario',
                  'Integraciones premium'
                ],
                cta: 'Comenzar ahora',
                popular: true,
                link: '/login'
              },
              {
                name: 'Enterprise',
                price: '$50',
                period: 'Personalizable',
                features: [
                  'Todo de Pro +',
                  'Asistentes ilimitados',
                  'API personalizada',
                  'Account manager',
                  'SLA garantizado'
                ],
                cta: 'Disponible pronto',
                popular: false,
                link: '#'
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: plan.popular ? 0 : -8 }}
                className={`relative bg-white rounded-2xl p-8 border-2 ${
                  plan.popular 
                    ? 'border-[#0ABAB5] shadow-2xl scale-105' 
                    : 'border-slate-200 hover:border-[#0ABAB5]'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#0ABAB5] text-white px-6 py-2 rounded-full font-bold text-sm">
                    Más popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#2D3748] mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-[#0ABAB5]">{plan.price}</span>
                    {plan.price === '$19' && <span className="text-slate-600">.990</span>}
                  </div>
                  <p className="text-sm text-slate-600">{plan.period}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-[#2D3748]">
                      <svg className="w-5 h-5 text-[#0ABAB5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: plan.name === 'Enterprise' ? 1 : 1.05 }} whileTap={{ scale: plan.name === 'Enterprise' ? 1 : 0.98 }}>
                  <Link 
                    href={plan.link}
                    className={`block w-full py-4 px-6 rounded-lg font-bold text-center shadow-lg transition-all ${
                      plan.popular
                        ? 'bg-[#0ABAB5] text-white hover:bg-[#089a96]'
                        : plan.name === 'Enterprise'
                        ? 'bg-white text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-[#0ABAB5] border-2 border-[#0ABAB5] hover:bg-[#0ABAB5] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION INTERACTIVO */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
              Todo lo que necesitas saber sobre Operly
            </h2>
            <p className="text-lg text-slate-600">
              Preguntas frecuentes de nuestros clientes
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: '¿Cómo funciona la prueba gratuita?',
                a: 'Registras tu WhatsApp Business, configuras tu catálogo y empiezas a recibir mensajes. Sin tarjeta de crédito, sin compromisos. Después de 14 días, si quieres seguir usándolo, eliges un plan.'
              },
              {
                q: '¿Puedo cancelar en cualquier momento?',
                a: 'Sí, puedes cancelar cuando quieras. No hay contratos ni permanencias. Si cancelas, tus datos se guardan por 30 días por si decides volver.'
              },
              {
                q: '¿Qué pasa si mi negocio crece y necesito más conversaciones?',
                a: 'Puedes cambiar de plan en cualquier momento. Si estás en el plan Starter y superas las 100 conversaciones, te avisamos para que upgradees al plan Pro con conversaciones ilimitadas.'
              },
              {
                q: '¿Es compatible con WhatsApp Business API?',
                a: 'Sí, Operly funciona con la API oficial de WhatsApp Business. Nosotros gestionamos toda la integración técnica por ti.'
              },
              {
                q: '¿Necesito conocimientos técnicos?',
                a: 'No. La interfaz está diseñada para vendedores, no programadores. Si sabes usar Gmail o Instagram, sabes usar Operly.'
              },
              {
                q: '¿Cómo se entrena el asistente IA?',
                a: 'Subes tu catálogo de productos/servicios, defines respuestas clave y el asistente aprende automáticamente. También mejora con cada conversación que manejas manualmente.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#F1FAEE] rounded-xl overflow-hidden border border-slate-200 hover:border-[#0ABAB5] transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                >
                  <h3 className="text-lg font-bold text-[#2D3748] pr-4">{faq.q}</h3>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-[#0ABAB5] flex-shrink-0" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-slate-600">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final CON MODAL CONTACTO */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#0ABAB5] to-[#1D3557]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            ¿Listo para transformar tu atención al cliente?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a cientos de PYMEs chilenas que ya están transformando su atención al cliente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/login"
                className="inline-block px-10 py-5 bg-white text-[#0ABAB5] font-bold rounded-lg hover:bg-[#F1FAEE] shadow-2xl transition-all"
              >
                Comenzar prueba gratuita
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => setIsContactOpen(true)}
                className="inline-block px-10 py-5 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 shadow-2xl transition-all"
              >
                Hablar con ventas
              </button>
            </motion.div>
          </div>
          <p className="text-sm text-white/70 mt-6">
            Respondemos en menos de 24 horas
          </p>
        </motion.div>
      </section>

      {/* MODAL FORMULARIO CONTACTO */}
      <AnimatePresence>
        {isContactOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" 
            onClick={() => setIsContactOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsContactOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#2D3748] mb-2">
                  Habla con nuestro equipo
                </h3>
                <p className="text-slate-600">
                  Cuéntanos sobre tu negocio y te ayudaremos a encontrar la mejor solución
                </p>
              </div>

              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                // Aquí integrarás tu lógica de envío (emailjs, api, etc)
                alert('Formulario enviado (integrar con tu backend)')
                setIsContactOpen(false)
              }}>
                <div>
                  <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] focus:outline-none focus:border-[#0ABAB5] transition-colors"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] focus:outline-none focus:border-[#0ABAB5] transition-colors"
                      placeholder="juan@empresa.cl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] focus:outline-none focus:border-[#0ABAB5] transition-colors"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-[#2D3748] focus:outline-none focus:border-[#0ABAB5] transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu negocio y cómo podemos ayudarte..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-[#0ABAB5] text-white font-bold rounded-lg hover:bg-[#089a96] shadow-lg transition-all"
                >
                  Enviar mensaje
                </motion.button>

                <p className="text-xs text-center text-slate-500">
                  Te responderemos en menos de 24 horas
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#2D3748] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo size="md" showText={true} />
              <p className="text-slate-400 mt-4">
                Gestión profesional de ventas por WhatsApp con IA
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#caracteristicas" className="hover:text-[#A8DADC] transition-colors">Características</a></li>
                <li><a href="#como-funciona" className="hover:text-[#A8DADC] transition-colors">Cómo funciona</a></li>
                <li><a href="#planes" className="hover:text-[#A8DADC] transition-colors">Planes</a></li>
                <li><a href="#faq" className="hover:text-[#A8DADC] transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/sobre-nosotros" className="hover:text-[#A8DADC] transition-colors">Sobre nosotros</Link></li>
                <li><Link href="/blog" className="hover:text-[#A8DADC] transition-colors">Blog</Link></li>
                <li><button onClick={() => setIsContactOpen(true)} className="hover:text-[#A8DADC] transition-colors">Contacto</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacidad" className="hover:text-[#A8DADC] transition-colors">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-[#A8DADC] transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-600 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 Operly. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-[#A8DADC] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-[#A8DADC] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-[#A8DADC] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}