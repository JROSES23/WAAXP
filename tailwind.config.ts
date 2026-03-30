/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Bricolage Grotesque', 'system-ui', 'sans-serif'],
        ui:      ['var(--font-ui)',      'DM Sans',             'system-ui', 'sans-serif'],
        body:    ['var(--font-ui)',      'DM Sans',             'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'DM Mono',             'monospace'],
      },
      colors: {
        brand: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0F766E',
          600: '#0D6560',
          700: '#0B5550',
          800: '#094540',
          900: '#073530',
        },
        // WAAXP design tokens exposed as Tailwind utilities
        surface:    'var(--bg-surface)',
        background: 'var(--bg-base)',
        elevated:   'var(--bg-elevated)',
        glass:      'var(--bg-glass)',
        accent:     'var(--accent)',
        foreground: 'var(--text-primary)',
        muted: {
          DEFAULT:    'var(--bg-elevated)',
          foreground: 'var(--text-secondary)',
        },
        border:  'var(--border-default)',
        card:    'var(--bg-elevated)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
        },
        sidebar: {
          bg:     'var(--bg-surface)',
          border: 'var(--border-default)',
        },
        success: '#059669',
        warning: '#F59E0B',
        error:   '#EF4444',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        glass:   'var(--shadow-glass)',
        card:    'var(--shadow-card)',
        sm:      'var(--shadow-sm)',
        accent:  'var(--accent-glow)',
      },
      animation: {
        'fade-up':      'fade-up 0.5s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'fade-in':      'fade-in 0.3s ease-out both',
        'slide-in':     'slide-left 0.25s ease-out both',
        'scale-in':     'scale-in 0.2s ease-out both',
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
        shimmer:        'shimmer 1.5s linear infinite',
        float:          'float 4s ease-in-out infinite',
        'pulse-ring':   'pulse-ring 2s ease-out infinite',
        'spin-slow':    'spin-slow 3s linear infinite',
        'dot-bounce':   'dot-bounce 1.4s ease-in-out infinite',
        'shimmer-slide': 'shimmer-slide var(--speed, 3s) ease-in-out infinite alternate',
        'spin-around':  'spin-around calc(var(--speed, 3s) * 2) infinite linear',
        marquee:        'marquee var(--duration, 40s) linear infinite',
        gradient:       'gradient 8s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(10,186,181,0.15)' },
          '50%':       { boxShadow: '0 0 40px rgba(10,186,181,0.35)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)'     },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)'   },
          '50%':       { transform: 'translateY(-6px)'},
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 var(--accent-border)' },
          '70%':  { boxShadow: '0 0 0 8px transparent'        },
          '100%': { boxShadow: '0 0 0 0 transparent'          },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)'   },
          to:   { transform: 'rotate(360deg)' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)',   opacity: '0.4' },
          '40%':            { transform: 'translateY(-6px)', opacity: '1'  },
        },
        'shimmer-slide': {
          to: { transform: 'translate(calc(100cqw - 100%), 0)' },
        },
        'spin-around': {
          '0%':        { transform: 'translateZ(0) rotate(0)'      },
          '15%, 35%':  { transform: 'translateZ(0) rotate(90deg)'  },
          '65%, 85%':  { transform: 'translateZ(0) rotate(270deg)' },
          '100%':      { transform: 'translateZ(0) rotate(360deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        gradient: {
          to: { backgroundPosition: 'var(--bg-size) 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
