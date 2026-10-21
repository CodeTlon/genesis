import { Montserrat, Roboto_Condensed, Cormorant_Garamond } from 'next/font/google'

// Fuentes de la marca, autoalojadas por next/font (sin pedirlas a terceros desde el navegador). Las usan el sitio y el panel.
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '600'], display: 'swap', variable: '--font-montserrat' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], display: 'swap', variable: '--font-cormorant' })
const robotoCondensed = Roboto_Condensed({ subsets: ['latin'], weight: ['400'], display: 'swap', variable: '--font-roboto-condensed' })

export const fontVars = `${montserrat.variable} ${robotoCondensed.variable} ${cormorant.variable}`
