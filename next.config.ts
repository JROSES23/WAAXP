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
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/System Volume Information/**', '**/.next/**'],
    }
    return config
  },
}

export default nextConfig
