import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { fontVars } from '@/fonts'

export const metadata: Metadata = {
  title: 'GENESIS · Panel',
  description: 'Sistema interno de gestión',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={fontVars}>
      <body>{children}</body>
    </html>
  )
}
