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
        // Nueva paleta profesional turquesa/slate
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