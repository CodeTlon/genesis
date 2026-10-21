import { notFound } from 'next/navigation'
import { flags } from '@/lib/flags'

export const dynamic = 'force-dynamic'

// CMS del sitio público: apagado por defecto (FEATURE_CMS). Apagado = 404.
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  if (!flags.cms()) notFound()
  return children
}
