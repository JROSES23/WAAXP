import Link from 'next/link'

export default function Footer({ onContact }: { onContact?: () => void }) {
  return (
    <footer
      className="relative py-12"
      style={{
        background: '#060a10',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'var(--font-ui), DM Sans, system-ui, sans-serif',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
              style={{ background: '#0ABAB5', fontFamily: 'var(--font-display)' }}>W</div>
            <span className="font-bold text-sm" style={{ color: 'rgba(240,246,255,0.70)', fontFamily: 'var(--font-display)' }}>WAAXP</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Términos', href: '#', onClick: undefined },
              { label: 'Privacidad', href: '#', onClick: undefined },
              { label: 'Contacto', href: '#', onClick: onContact },
            ].map(l => (
              <button key={l.label} onClick={l.onClick}
                className="text-xs transition-colors duration-150"
                style={{ color: 'rgba(240,246,255,0.30)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,246,255,0.70)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,246,255,0.30)')}>
                {l.label}
              </button>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'rgba(240,246,255,0.25)' }}>
            &copy; 2025 WAAXP. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
