import data from '@genesis/content/servicios.json'

export const SITE = {
  name: 'Genesis Estética Integral',
  address: 'Colorado 5827, Córdoba, Argentina',
  instagram: 'https://www.instagram.com/genesistulugar',
  instagramHandle: '@genesistulugar',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Colorado+5827+C%C3%B3rdoba+Argentina',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://genesis-demo.vercel.app',
  indexable: process.env.SITE_INDEXABLE === '1', // la demo va noindex
}

export type Servicio = (typeof data.servicios)[number]

export type Grupo = {
  slug: string
  nombre: string
  lema: string
  intro: string
  imagen?: string
  servicios: string[] // slugs de servicios
  faq: { q: string; a: string }[]
}

const FAQ_COMUN = [
  { q: '¿Cuántas sesiones necesito?', a: 'Depende de cada persona y de lo que busques. Lo definimos juntas en la primera consulta.' },
  { q: '¿Cómo pido turno?', a: 'Desde “Pedir turno” en esta web o por Instagram. Te confirmamos el horario a la brevedad.' },
]

export const GRUPOS: Grupo[] = [
  {
    slug: 'podologia', nombre: 'Podología', lema: 'Pies sin molestias, caminar con confort',
    intro: 'Atención podológica para aliviar durezas, cuidar tus uñas y mejorar el confort al caminar.',
    servicios: ['podologia-clinica', 'heloma', 'onicolisis'],
    faq: [
      { q: '¿Tengo que llevar algo a la consulta?', a: 'Traé el calzado que usás habitualmente y contanos si tomás medicación o tenés alguna condición, como diabetes o problemas circulatorios.' },
      ...FAQ_COMUN,
    ],
  },
  {
    slug: 'depilacion', nombre: 'Depilación', lema: 'Una piel más suave, a tu ritmo', imagen: 'img-10',
    intro: 'Depilación tradicional con cera y depilación láser con equipo multilongitud de onda.',
    servicios: ['depilacion-con-cera', 'depilacion-laser'],
    faq: [
      { q: '¿Puedo hacerme láser en cualquier época del año?', a: 'Depende de la exposición solar reciente y de tu tipo de piel. Lo evaluamos antes de empezar.' },
      ...FAQ_COMUN,
    ],
  },
  {
    slug: 'facial', nombre: 'Tratamientos faciales', lema: 'Una piel limpia, cuidada y luminosa', imagen: 'img-17',
    intro: 'Limpieza, hidratación y renovación de la piel del rostro y de los labios.',
    servicios: ['limpieza-facial-profunda', 'glowskin', 'dermaplaning', 'exosomas-pdrn', 'hydra-gloss-lips'],
    faq: [
      { q: '¿Puedo hacerme un tratamiento facial si estoy embarazada?', a: 'Algunos tratamientos no se recomiendan en embarazo o lactancia. Consultanos antes de pedir turno.' },
      ...FAQ_COMUN,
    ],
  },
  {
    slug: 'cejas-pestanas-unas', nombre: 'Cejas, pestañas y uñas', lema: 'Detalles que se notan', imagen: 'img-29',
    intro: 'Laminado de cejas, lifting de pestañas y uñas soft gel.',
    servicios: ['laminado-de-cejas', 'lifting-de-pestanas', 'unas-soft-gel'],
    faq: [
      { q: '¿Tengo que avisar si soy alérgica a algún producto?', a: 'Sí, siempre. Contanos tus alergias antes de empezar para cuidarte.' },
      ...FAQ_COMUN,
    ],
  },
  {
    slug: 'corporal', nombre: 'Tratamientos corporales', lema: 'Bienestar y cuidado para tu cuerpo', imagen: 'img-1',
    intro: 'Masajes y aparatología para acompañar el modelado, la firmeza y la sensación de liviandad.',
    servicios: ['drenaje-linfatico-manual', 'maderoterapia', 'radiofrecuencia-fraccionada', 'crio-radiofrecuencia', 'lipolaser-frio', 'peeling-despigmentante'],
    faq: [
      { q: '¿Hay contraindicaciones?', a: 'Algunos tratamientos no se recomiendan con embarazo, marcapasos o implantes metálicos, entre otras condiciones. Lo revisamos en la consulta.' },
      ...FAQ_COMUN,
    ],
  },
]

export const AVISO = 'Los resultados varían según cada persona. La información de esta web es orientativa y no reemplaza la consulta profesional.'

export const servicioPorSlug = (slug: string) => data.servicios.find((s) => s.slug === slug)
export const serviciosDe = (g: Grupo) => g.servicios.map((s) => servicioPorSlug(s)).filter(Boolean) as Servicio[]
export const grupoPorSlug = (slug: string) => GRUPOS.find((g) => g.slug === slug)
