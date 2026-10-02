import type { MetadataRoute } from 'next'
import { getGroups } from '@genesis/db/content'
import { SITE } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fijas = ['', '/servicios', '/nosotros', '/galeria', '/contacto', '/pedir-turno', '/privacidad']
  const groups = await getGroups()
  return [
    ...fijas.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: 'monthly' as const, priority: p === '' ? 1 : 0.7 })),
    ...groups.map((g) => ({ url: `${SITE.url}/servicios/${g.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ]
}
