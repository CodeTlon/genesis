/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@genesis/config', '@genesis/ui', '@genesis/db', '@genesis/content'],
  serverExternalPackages: ['pg', 'sharp'],
  experimental: { serverActions: { bodySizeLimit: '5mb' } }, // subida de imágenes (límite propio de 4 MB)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}

export default nextConfig
