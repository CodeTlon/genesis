import type { Metadata, Viewport } from 'next'
import { Montserrat, Roboto_Condensed, Cormorant_Garamond } from 'next/font/google'
import { getContent } from '@genesis/db/content'
import './globals.css'
import { Header } from '@/components/header'
import { SiteTour } from '@/components/site-tour'
import { Footer } from '@/components/footer'
import { SITE } from '@/lib/site'

export const revalidate = 60

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '600'], display: 'swap', variable: '--font-montserrat' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], display: 'swap', variable: '--font-cormorant' })
const robotoCondensed = Roboto_Condensed({ subsets: ['latin'], weight: ['400'], display: 'swap', variable: '--font-roboto-condensed' })

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContent('seo')
  return {
    metadataBase: new URL(SITE.url),
    title: { default: seo.title, template: `%s · ${SITE.name}` },
    description: seo.description,
    openGraph: { type: 'website', locale: 'es_AR', siteName: SITE.name },
    robots: SITE.indexable ? undefined : { index: false, follow: false },
  }
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, notice] = await Promise.all([getContent('contact'), getContent('notice')])
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: SITE.name,
    url: SITE.url,
    address: { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'AR' },
    ...(contact.phone ? { telephone: contact.phone } : {}),
    sameAs: [contact.instagram],
  }
  return (
    <html lang="es-AR" className={`${montserrat.variable} ${robotoCondensed.variable} ${cormorant.variable}`}>
      <body>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-control focus:bg-white focus:p-3">Saltar al contenido</a>
        {notice.active && notice.text && <p role="status" className="bg-violeta-oscuro px-4 py-3 text-center text-white">{notice.text}</p>}
        <Header />
        <div id="contenido">{children}</div>
        <Footer />
        <SiteTour panelUrl={SITE.panelUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  )
}
