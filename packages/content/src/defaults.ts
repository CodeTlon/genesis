import data from '../servicios.json'

/**
 * Contenido por defecto del sitio. Es el respaldo cuando la base no responde y
 * lo que carga `npm run db:seed`. Desde el panel (Sitio web) todo esto es editable.
 */

export type Faq = { q: string; a: string }
export type ServiceDef = { slug: string; name: string; hook: string; summary: string; image: string; sessions: string; price: string; notice: string }
export type GroupDef = { slug: string; name: string; tagline: string; intro: string; image: string; faq: Faq[]; services: ServiceDef[] }

const FAQ_COMUN: Faq[] = [
  { q: '¿Cuántas sesiones necesito?', a: 'Depende de cada persona y de lo que busques. Lo definimos juntas en la primera consulta.' },
  { q: '¿Cómo pido turno?', a: 'Desde “Pedir turno” en esta web o por Instagram. Te confirmamos el horario a la brevedad.' },
]

type GroupSeed = Omit<GroupDef, 'services'> & { services: string[] }
const GROUPS: GroupSeed[] = [
  {
    slug: 'podologia', name: 'Podología', tagline: 'Pies sin molestias, caminar con confort', image: '',
    intro: 'Atención podológica para aliviar durezas, cuidar tus uñas y mejorar el confort al caminar.',
    services: ['podologia-clinica', 'heloma', 'onicolisis'],
    faq: [{ q: '¿Tengo que llevar algo a la consulta?', a: 'Traé el calzado que usás habitualmente y contanos si tomás medicación o tenés alguna condición, como diabetes o problemas circulatorios.' }, ...FAQ_COMUN],
  },
  {
    slug: 'depilacion', name: 'Depilación', tagline: 'Una piel más suave, a tu ritmo', image: '/img/img-10.webp',
    intro: 'Depilación tradicional con cera y depilación láser con equipo multilongitud de onda.',
    services: ['depilacion-con-cera', 'depilacion-laser'],
    faq: [{ q: '¿Puedo hacerme láser en cualquier época del año?', a: 'Depende de la exposición solar reciente y de tu tipo de piel. Lo evaluamos antes de empezar.' }, ...FAQ_COMUN],
  },
  {
    slug: 'facial', name: 'Tratamientos faciales', tagline: 'Una piel limpia, cuidada y luminosa', image: '/img/img-17.webp',
    intro: 'Limpieza, hidratación y renovación de la piel del rostro y de los labios.',
    services: ['limpieza-facial-profunda', 'glowskin', 'dermaplaning', 'exosomas-pdrn', 'hydra-gloss-lips'],
    faq: [{ q: '¿Puedo hacerme un tratamiento facial si estoy embarazada?', a: 'Algunos tratamientos no se recomiendan en embarazo o lactancia. Consultanos antes de pedir turno.' }, ...FAQ_COMUN],
  },
  {
    slug: 'cejas-pestanas-unas', name: 'Cejas, pestañas y uñas', tagline: 'Detalles que se notan', image: '/img/img-29.webp',
    intro: 'Laminado de cejas, lifting de pestañas y uñas soft gel.',
    services: ['laminado-de-cejas', 'lifting-de-pestanas', 'unas-soft-gel'],
    faq: [{ q: '¿Tengo que avisar si soy alérgica a algún producto?', a: 'Sí, siempre. Contanos tus alergias antes de empezar para cuidarte.' }, ...FAQ_COMUN],
  },
  {
    slug: 'corporal', name: 'Tratamientos corporales', tagline: 'Bienestar y cuidado para tu cuerpo', image: '/img/img-1.webp',
    intro: 'Masajes y aparatología para acompañar el modelado, la firmeza y la sensación de liviandad.',
    services: ['drenaje-linfatico-manual', 'maderoterapia', 'radiofrecuencia-fraccionada', 'crio-radiofrecuencia', 'lipolaser-frio', 'peeling-despigmentante'],
    faq: [{ q: '¿Hay contraindicaciones?', a: 'Algunos tratamientos no se recomiendan con embarazo, marcapasos o implantes metálicos, entre otras condiciones. Lo revisamos en la consulta.' }, ...FAQ_COMUN],
  },
]

const bySlug = (slug: string) => data.servicios.find((s) => s.slug === slug)!

export const DEFAULT_GROUPS: GroupDef[] = GROUPS.map((g) => ({
  ...g,
  services: g.services.map((slug) => {
    const s = bySlug(slug)
    return { slug, name: s.nombre, hook: s.gancho, summary: s.resumen, image: s.imagenes[0] ? `/img/img-${s.imagenes[0]}.webp` : '', sessions: '', price: '', notice: '' }
  }),
}))

export const DEFAULT_CONTENT = {
  hero: {
    eyebrow: 'Podología y estética · Córdoba',
    title: 'Cuidamos tus pies y tu piel',
    text: 'Un lugar tranquilo para cuidarte. Atención personalizada en podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas.',
    primaryCta: 'Pedir turno',
    secondaryCta: 'Ver servicios',
    image: '/img/logo.webp',
  },
  groupsSection: { title: '¿Qué estás buscando?', text: 'Agrupamos los tratamientos por tema para que encuentres rápido lo que necesitás.' },
  steps: [
    { title: 'Pedí tu turno', text: 'Desde esta web o por Instagram. No hace falta tener cuenta.' },
    { title: 'Te confirmamos', text: 'Te avisamos el día y el horario disponibles.' },
    { title: 'Venís y te cuidamos', text: 'Te esperamos en Colorado 5827, Córdoba.' },
  ],
  about: {
    title: 'Nosotros',
    lead: 'Genesis nació para cuidar la salud y el bienestar de las personas desde los pies hasta el rostro, en un ambiente cálido y tranquilo.',
    body: 'Inés atiende podología. En el piso de arriba funciona el área de estética, con el mismo nombre y el mismo cuidado: tratamientos faciales y corporales, depilación, cejas, pestañas y uñas.',
    howTitle: 'Cómo trabajamos',
    how: 'En la primera consulta conversamos sobre lo que necesitás y revisamos tus antecedentes para cuidarte. Después te proponemos un plan, sin apuros.',
  },
  team: [
    { name: 'Inés', role: 'Podología', license: '', photo: '' },
    { name: 'Equipo de estética', role: 'Estética', license: '', photo: '' },
  ],
  contact: {
    address: 'Colorado 5827, Córdoba, Argentina',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Colorado+5827+C%C3%B3rdoba+Argentina',
    hours: ['A confirmar. Pedí tu turno y te indicamos los días y horarios disponibles.'],
    instagram: 'https://www.instagram.com/genesistulugar',
    instagramHandle: '@genesistulugar',
    phone: '',
    email: '',
  },
  notice: { active: false, text: '' },
  seo: {
    title: 'Genesis Estética Integral — Podología y estética en Córdoba',
    description: 'Podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas en Colorado 5827, Córdoba.',
  },
  disclaimer: 'Los resultados varían según cada persona. La información de esta web es orientativa y no reemplaza la consulta profesional.',
}

export type SiteContent = typeof DEFAULT_CONTENT
export type ContentKey = keyof SiteContent

// Galería inicial: solo imágenes de equipos y productos, sin personas (ver docs/imagenes.md, categoría 3).
export const DEFAULT_GALLERY = [
  { image: '/img/img-10.webp', alt: 'Equipo de depilación láser con pantalla de control' },
  { image: '/img/img-11.webp', alt: 'Cabezales del equipo de crio radiofrecuencia' },
  { image: '/img/img-21.webp', alt: 'Cabezal de radiofrecuencia fraccionada' },
  { image: '/img/img-17.webp', alt: 'Mesa con productos y accesorios para tratamientos faciales' },
  { image: '/img/img-29.webp', alt: 'Estante con esmaltes de colores para uñas soft gel' },
  { image: '/img/img-1.webp', alt: 'Herramientas de madera para maderoterapia' },
]
