'use client'

import Link from 'next/link'

interface FooterProps {
  onContact: () => void
}

const LINKS = {
  Producto: [
    { label: 'Características', href: '#caracteristicas' },
    { label: 'Precios', href: '#planes' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'FAQ', href: '#faq' },
  ],
  Empresa: [
    { label: 'Blog', href: '/blog' },
    { label: 'Iniciar sesión', href: '/login' },
    { label: 'Crear cuenta', href: '/login' },
  ],
  Legal: [
    { label: 'Términos de uso', href: '#' },
    { label: 'Privacidad', href: '#' },
  ],
}

export default function Footer({ onContact }: FooterProps) {
  return (
    <footer className="bg-[#080C14] border-t border-white/[0.05] px-5 sm:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[280px_1fr] gap-12 mb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0ABAB5] flex items-center justify-center">
                <span className="font-display font-black text-white text-sm">W</span>
              </div>
              <span className="font-display font-bold text-lg text-white tracking-[-0.02em]">WAAXP</span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed max-w-xs mb-5">
              El asistente IA que atiende, cotiza y cierra ventas por WhatsApp 24/7.
              Para PYMEs que no quieren perder ni un cliente.
            </p>
            <button
              onClick={onContact}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0ABAB5] border border-[#0ABAB5]/25 rounded-lg hover:bg-[#0ABAB5]/8 transition-colors duration-200"
            >
              Contactar ventas
            </button>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8">
            {Object.entries(LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-4">{group}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/35 hover:text-white/70 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} WAAXP. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/15">
            Hecho para PYMEs de Latinoamérica.
          </p>
        </div>
      </div>
    </footer>
  )
}
