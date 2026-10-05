export const SITE = {
  name: 'Genesis Estética Integral',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://genesis-demo.vercel.app',
  indexable: process.env.SITE_INDEXABLE === '1', // la demo va noindex
  panelUrl: process.env.PANEL_URL ?? '', // si está definida, se ofrece la demo guiada del panel
}

/** El contenido editable (textos, servicios, galería) vive en la base: ver @genesis/db/content. */
export const REVALIDATE = 60
