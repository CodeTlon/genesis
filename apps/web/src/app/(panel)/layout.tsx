import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { fontVars } from '@/fonts'
import { EnvBanner } from '@/panel/components/env-banner'
import { FormValidity } from '@/panel/components/form-validity'

export const metadata: Metadata = {
  title: 'GENESIS · Panel',
  description: 'Sistema interno de gestión',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f4f3f5', colorScheme: 'light' }

// Lee APP_ENV al servir cada pedido (no al construir la imagen), así el mismo build sirve para prueba y producción.
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={fontVars}>
      <body className="flex min-h-dvh flex-col"><EnvBanner />{children}<FormValidity /></body>
    </html>
  )
}
