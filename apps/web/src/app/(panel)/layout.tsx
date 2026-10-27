import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { fontVars } from '@/fonts'
import { FormValidity } from '@/panel/components/form-validity'

export const metadata: Metadata = {
  title: 'GENESIS · Panel',
  description: 'Sistema interno de gestión',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f4f3f5', colorScheme: 'light' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={fontVars}>
      <body>{children}<FormValidity /></body>
    </html>
  )
}
