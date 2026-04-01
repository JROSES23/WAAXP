import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  /*
   * Paquetes Node.js-only que Webpack NO debe bundlear para el runtime de Next.js.
   * Se resuelven en tiempo de ejecución por Node.js, no en el bundle del frontend.
   * Evita que @whiskeysockets/baileys y sus dependencias contaminen el build.
   */
  serverExternalPackages: [
    '@whiskeysockets/baileys',
    'pino',
    'pino-pretty',
    'qrcode-terminal',
    'node-cache',
    'jimp',
    'sharp',
  ],
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      // Evita que Watchpack escanee System Volume Information en Windows
      ignored: ['**/System Volume Information/**', '**/.next/**'],
    }
    return config
  },
}

export default nextConfig
