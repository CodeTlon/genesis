import type { Metadata, Viewport } from 'next'
import { Montserrat, Roboto_Condensed, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '600'], display: 'swap', variable: '--font-montserrat' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], display: 'swap', variable: '--font-cormorant' })
const robotoCondensed = Roboto_Condensed({ subsets: ['latin'], weight: ['400'], display: 'swap', variable: '--font-roboto-condensed' })

export const metadata: Metadata = {
  title: 'Genesis · Panel',
  description: 'Sistema interno de gestión',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} ${robotoCondensed.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  )
}
