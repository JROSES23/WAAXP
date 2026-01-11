/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          teal: {
            50: '#f0fdfa',
            600: '#0F766E',
            700: '#0D5B55',
            800: '#0A4A45',
          }
        }
      },
    },
    plugins: [],
  }
  