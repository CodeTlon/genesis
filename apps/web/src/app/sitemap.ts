import type { MetadataRoute } from 'next'
import { GRUPOS, SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ['', '/servicios', '/nosotros', '/galeria', '/contacto', '/pedir-turno', '/privacidad']
  return [
    ...fijas.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: 'monthly' as const, priority: p === '' ? 1 : 0.7 })),
    ...GRUPOS.map((g) => ({ url: `${SITE.url}/servicios/${g.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ]
}
