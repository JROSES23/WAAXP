'use client'

import Link from 'next/link'

interface FooterProps {
  onContact: () => void
}

const columns = [
  {
    heading: 'Producto',
    links: [
      { label: 'Funciones', href: '#caracteristicas' },
      { label: 'Planes', href: '#planes' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Recursos',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Documentación', href: '#' },
      { label: 'API', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacidad', href: '#' },
      { label: 'Términos', href: '#' },
    ],
  },
]

export default function Footer({ onContact }: FooterProps) {
  return (
    <footer
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a href="#inicio" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                style={{
                  background: '#0ABAB5',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                }}
              >
                W
              </div>
              <span
                className="text-base font-bold tracking-tight"
                style={{
                  color: '#0D1B2A',
                  fontFamily: 'var(--font-display), Bricolage Grotesque, system-ui, sans-serif',
                }}
              >
                WAAXP
              </span>
            </a>
            <p className="text-sm leading-relaxed" style={{ color: '#5C6B7A' }}>
              El vendedor IA que nunca duerme.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: '#0D1B2A' }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-150"
                      style={{ color: '#5C6B7A' }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color = '#5C6B7A'
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: '#0D1B2A' }}
            >
              Contacto
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:hello@waaxp.com"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#5C6B7A' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#5C6B7A'
                  }}
                >
                  hello@waaxp.com
                </a>
              </li>
              <li>
                <button
                  onClick={onContact}
                  className="text-sm transition-colors duration-150 text-left"
                  style={{ color: '#5C6B7A' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#0ABAB5'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#5C6B7A'
                  }}
                >
                  WhatsApp
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#5C6B7A' }}>
            &copy; 2025 WAAXP. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs transition-colors"
              style={{ color: '#5C6B7A' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#5C6B7A'
              }}
            >
              Privacidad
            </a>
            <a
              href="#"
              className="text-xs transition-colors"
              style={{ color: '#5C6B7A' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#0ABAB5'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#5C6B7A'
              }}
            >
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
