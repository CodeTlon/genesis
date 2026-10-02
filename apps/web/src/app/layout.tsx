import type { Metadata, Viewport } from 'next'
import { Montserrat, Roboto_Condensed } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SITE } from '@/lib/site'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '600'], display: 'swap', variable: '--font-montserrat' })
const robotoCondensed = Roboto_Condensed({ subsets: ['latin'], weight: ['400'], display: 'swap', variable: '--font-roboto-condensed' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Genesis Estética Integral — Podología y estética en Córdoba', template: '%s · Genesis Estética Integral' },
  description: 'Podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas en Colorado 5827, Córdoba.',
  openGraph: { type: 'website', locale: 'es_AR', siteName: SITE.name, images: ['/img/logo.webp'] },
  robots: SITE.indexable ? undefined : { index: false, follow: false },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  name: SITE.name,
  url: SITE.url,
  image: `${SITE.url}/img/logo.webp`,
  address: { '@type': 'PostalAddress', streetAddress: 'Colorado 5827', addressLocality: 'Córdoba', addressCountry: 'AR' },
  sameAs: [SITE.instagram],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} ${robotoCondensed.variable}`}>
      <body>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-control focus:bg-white focus:p-3">Saltar al contenido</a>
        <Header />
        <div id="contenido">{children}</div>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  )
}
