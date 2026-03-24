'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface ThemeColor {
  name: string
  hex: string
  rgb: string
}

const THEME_COLORS: ThemeColor[] = [
  { name: 'Teal', hex: '#0F766E', rgb: '15 118 110' },
  { name: 'Azul Océano', hex: '#0369A1', rgb: '3 105 161' },
  { name: 'Violeta', hex: '#7C3AED', rgb: '124 58 237' },
  { name: 'Rosa Coral', hex: '#E11D48', rgb: '225 29 72' },
  { name: 'Naranja', hex: '#EA580C', rgb: '234 88 12' },
  { name: 'Amarillo', hex: '#CA8A04', rgb: '202 138 4' },
  { name: 'Lima', hex: '#65A30D', rgb: '101 163 13' },
  { name: 'Índigo', hex: '#4338CA', rgb: '67 56 202' },
  { name: 'Gris Pizarra', hex: '#475569', rgb: '71 85 105' },
  { name: 'Negro Minimal', hex: '#171717', rgb: '23 23 23' },
]

const STORAGE_KEY = 'waaxp-theme-color'

function applyColor(hex: string, rgb: string) {
  document.documentElement.style.setProperty('--primary', rgb)
  document.documentElement.style.setProperty('--primary-hex', hex)
}

export function useThemeColor() {
  const [activeColor, setActiveColor] = useState(THEME_COLORS[0])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const found = THEME_COLORS.find((c) => c.hex === saved)
      if (found) {
        setActiveColor(found)
        applyColor(found.hex, found.rgb)
      }
    }
  }, [])

  const setColor = (color: ThemeColor) => {
    setActiveColor(color)
    applyColor(color.hex, color.rgb)
    localStorage.setItem(STORAGE_KEY, color.hex)
  }

  return { activeColor, setColor, colors: THEME_COLORS }
}

export default function ThemeColorPicker() {
  const { activeColor, setColor, colors } = useThemeColor()

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[rgb(var(--muted-fg))] px-1">
        Color del tema
      </p>
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <button
            key={color.hex}
            onClick={() => setColor(color)}
            title={color.name}
            className="relative w-8 h-8 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--surface))]"
            style={{
              backgroundColor: color.hex,
              boxShadow:
                activeColor.hex === color.hex
                  ? `0 0 0 2px rgb(var(--surface)), 0 0 0 4px ${color.hex}`
                  : undefined,
            }}
          >
            {activeColor.hex === color.hex && (
              <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
