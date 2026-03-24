'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'

/* ─────────────────────────────────────────────
   ACCENT CONTEXT
   6 accent colors + light/dark management
───────────────────────────────────────────── */

export type AccentColor =
  | 'teal'
  | 'violet'
  | 'coral'
  | 'amber'
  | 'emerald'
  | 'rose'

interface AccentContextValue {
  accent: AccentColor
  setAccent: (color: AccentColor) => void
}

const AccentContext = createContext<AccentContextValue>({
  accent: 'teal',
  setAccent: () => {},
})

export function useAccent() {
  return useContext(AccentContext)
}

const ACCENT_STORAGE_KEY = 'waaxp-accent'

function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>('teal')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null
    if (stored) setAccentState(stored)
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Apply data-accent to the root element
    document.documentElement.setAttribute('data-accent', accent)
    localStorage.setItem(ACCENT_STORAGE_KEY, accent)
  }, [accent, mounted])

  const setAccent = (color: AccentColor) => {
    setAccentState(color)
  }

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  )
}

/* ─────────────────────────────────────────────
   PROVIDERS — root wrapper
   Composes: next-themes + AccentProvider
───────────────────────────────────────────── */

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AccentProvider>
        {children}
      </AccentProvider>
    </NextThemesProvider>
  )
}

/* ─────────────────────────────────────────────
   ACCENT SELECTOR — UI component for Sidebar
   6 color circles + active ring
───────────────────────────────────────────── */

const ACCENT_OPTIONS: { color: AccentColor; hex: string; label: string }[] = [
  { color: 'teal',    hex: '#0ABAB5', label: 'Teal'    },
  { color: 'violet',  hex: '#8B5CF6', label: 'Violet'  },
  { color: 'coral',   hex: '#FF6B6B', label: 'Coral'   },
  { color: 'amber',   hex: '#F59E0B', label: 'Amber'   },
  { color: 'emerald', hex: '#10B981', label: 'Esmeralda' },
  { color: 'rose',    hex: '#F43F5E', label: 'Rosa'    },
]

export function AccentSelector() {
  const { accent, setAccent } = useAccent()

  return (
    <div className="flex items-center gap-1.5">
      {ACCENT_OPTIONS.map(({ color, hex, label }) => (
        <button
          key={color}
          title={label}
          onClick={() => setAccent(color)}
          className="relative w-5 h-5 rounded-full transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ backgroundColor: hex }}
          aria-label={`Tema ${label}`}
          aria-pressed={accent === color}
        >
          {accent === color && (
            <span
              className="absolute inset-0 rounded-full ring-2 ring-offset-1 ring-offset-transparent"
              style={{ '--tw-ring-color': hex } as React.CSSProperties}
            />
          )}
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   THEME TOGGLE — dark/light icon button
───────────────────────────────────────────── */

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        w-8 h-8 rounded-lg flex items-center justify-center
        text-[var(--text-secondary)] hover:text-[var(--text-primary)]
        hover:bg-white/[0.06] transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)]
      "
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        // Sun icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
