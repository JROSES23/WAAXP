/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta profesional turquesa/slate
        brand: {
          50: '#F1FAEE',
          100: '#E5F5F3',
          500: '#0ABAB5',
          600: '#089A96',
          700: '#067B78',
          900: '#1D3557',
        },
        surface: '#FFFFFF',
        muted: '#94A3B8',
        primary: '#0ABAB5',
        secondary: '#1D3557',
        accent: '#A8DADC',
        background: '#F1FAEE',
        textPrimary: '#2D3748',
      },
    },
  },
  plugins: [],
}
