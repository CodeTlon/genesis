import type { MetadataRoute } from 'next'

// Sistema interno: ningún buscador debe indexar nada.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } }
}
