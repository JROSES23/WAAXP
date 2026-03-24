interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { svg: 32, text: 'text-lg' },
    md: { svg: 40, text: 'text-xl' },
    lg: { svg: 48, text: 'text-2xl' },
    xl: { svg: 56, text: 'text-3xl' }
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg 
        width={currentSize.svg}
        height={currentSize.svg}
        viewBox="0 0 600 600" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="waaxpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00897B"/>
            <stop offset="100%" stopColor="#00bfa5"/>
          </linearGradient>
        </defs>

        {/* Burbuja trasera */}
        <path d="M330 90 C450 90 520 170 520 260 C520 360 440 420 360 430 L300 480 L310 430 C200 420 150 350 150 260 C150 160 230 90 330 90Z"
              fill="url(#waaxpGradient)"/>

        {/* Contorno interno */}
        <path d="M330 115 C430 115 485 180 485 255 C485 335 420 385 345 395 L310 430 L315 395 C230 385 185 330 185 255 C185 175 245 115 330 115Z"
              fill="white"/>

        {/* Flecha */}
        <path d="M260 315 L345 230 L345 270 L390 270 L390 200 L320 200 L320 240 L235 325Z"
              fill="#FFFFFF"/>
      </svg>
      
      {showText && (
        <span className={`font-semibold text-slate-900 ${currentSize.text}`}>
          Operly
        </span>
      )}
    </div>
  )
}
