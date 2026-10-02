import type { Metadata, Viewport } from 'next'
import { Montserrat, Roboto_Condensed } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '600'], display: 'swap', variable: '--font-montserrat' })
const robotoCondensed = Roboto_Condensed({ subsets: ['latin'], weight: ['400'], display: 'swap', variable: '--font-roboto-condensed' })

export const metadata: Metadata = {
  title: 'Genesis Estética Integral — Córdoba',
  description: 'Podología, estética facial y corporal, depilación y más en Colorado 5827, Córdoba.',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} ${robotoCondensed.variable}`}>
      <body>{children}</body>
    </html>
  )
}
