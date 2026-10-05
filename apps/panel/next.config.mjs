import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Despliegue en un solo proceso (Docker): STANDALONE=1 genera .next/standalone con lo mínimo para correr.
  ...(process.env.STANDALONE === '1' ? { output: 'standalone', outputFileTracingRoot: path.join(import.meta.dirname, '../..') } : {}),
  transpilePackages: ['@genesis/config', '@genesis/ui', '@genesis/db', '@genesis/content'],
  serverExternalPackages: ['pg', 'sharp'],
  experimental: { serverActions: { bodySizeLimit: '5mb' } }, // subida de imágenes (límite propio de 4 MB)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}

export default nextConfig
