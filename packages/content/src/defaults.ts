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
    slug: 'podologia', name: 'Podología', tagline: 'Pies sin molestias, caminar con confort', image: '/img/grupo-podologia.webp',
    intro: 'Atención podológica para aliviar durezas, cuidar tus uñas y mejorar el confort al caminar.',
    services: ['podologia-clinica', 'heloma', 'onicolisis'],
    faq: [{ q: '¿Tengo que llevar algo a la consulta?', a: 'Traé el calzado que usás habitualmente y contanos si tomás medicación o tenés alguna condición, como diabetes o problemas circulatorios.' }, ...FAQ_COMUN],
  },
  {
    slug: 'depilacion', name: 'Depilación', tagline: 'Una piel más suave, a tu ritmo', image: '/img/grupo-depilacion.webp',
    intro: 'Depilación tradicional con cera y depilación láser con equipo multilongitud de onda.',
    services: ['depilacion-con-cera', 'depilacion-laser'],
    faq: [{ q: '¿Puedo hacerme láser en cualquier época del año?', a: 'Depende de la exposición solar reciente y de tu tipo de piel. Lo evaluamos antes de empezar.' }, ...FAQ_COMUN],
  },
  {
    slug: 'facial', name: 'Tratamientos faciales', tagline: 'Una piel limpia, cuidada y luminosa', image: '/img/grupo-facial.webp',
    intro: 'Limpieza, hidratación y renovación de la piel del rostro y de los labios.',
    services: ['limpieza-facial-profunda', 'glowskin', 'dermaplaning', 'exosomas-pdrn', 'hydra-gloss-lips'],
    faq: [{ q: '¿Puedo hacerme un tratamiento facial si estoy embarazada?', a: 'Algunos tratamientos no se recomiendan en embarazo o lactancia. Consultanos antes de pedir turno.' }, ...FAQ_COMUN],
  },
  {
    slug: 'cejas-pestanas-unas', name: 'Cejas, pestañas y uñas', tagline: 'Detalles que se notan', image: '/img/grupo-cejas-pestanas-unas.webp',
    intro: 'Laminado de cejas, lifting de pestañas y uñas soft gel.',
    services: ['laminado-de-cejas', 'lifting-de-pestanas', 'unas-soft-gel'],
    faq: [{ q: '¿Tengo que avisar si soy alérgica a algún producto?', a: 'Sí, siempre. Contanos tus alergias antes de empezar para cuidarte.' }, ...FAQ_COMUN],
  },
  {
    slug: 'corporal', name: 'Tratamientos corporales', tagline: 'Bienestar y cuidado para tu cuerpo', image: '/img/grupo-corporal.webp',
    intro: 'Masajes y aparatología para acompañar el modelado, la firmeza y la sensación de liviandad.',
    services: ['drenaje-linfatico-manual', 'maderoterapia', 'radiofrecuencia-fraccionada', 'crio-radiofrecuencia', 'lipolaser-frio', 'peeling-despigmentante'],
    faq: [{ q: '¿Hay contraindicaciones?', a: 'Algunos tratamientos no se recomiendan con embarazo, marcapasos o implantes metálicos, entre otras condiciones. Lo revisamos en la consulta.' }, ...FAQ_COMUN],
  },
]

/** Sesiones, precios y avisos de ejemplo (ficticios, a validar con la profesional). */
const DETAILS: Record<string, { sessions: string; price: string; notice?: string }> = {
  'podologia-clinica': { sessions: '1 sesión de 45 min · control cada 45 días', price: 'Desde $18.000' },
  heloma: { sessions: '1 a 3 sesiones de 45 min', price: 'Desde $20.000', notice: 'Si tenés diabetes o tomás anticoagulantes, avisanos al pedir el turno.' },
  onicolisis: { sessions: '3 a 6 sesiones, una cada 3 semanas', price: 'Desde $22.000', notice: 'Si tenés diabetes o tomás anticoagulantes, avisanos al pedir el turno.' },
  'unas-soft-gel': { sessions: '1 sesión de 90 min · renovación cada 21 días', price: 'Desde $24.000' },
  'depilacion-con-cera': { sessions: '1 sesión de 30 a 60 min según la zona', price: 'Desde $9.000' },
  'depilacion-laser': { sessions: 'Pack de 6 a 8 sesiones, una por mes', price: 'Pack desde $120.000', notice: 'Requiere evaluación previa. No se realiza con la piel bronceada ni durante el embarazo.' },
  'limpieza-facial-profunda': { sessions: '1 sesión de 60 min · una por mes', price: 'Desde $26.000' },
  glowskin: { sessions: '3 sesiones, una cada 15 días', price: 'Desde $32.000' },
  dermaplaning: { sessions: '1 sesión de 45 min', price: 'Desde $22.000' },
  'exosomas-pdrn': { sessions: 'Plan de 4 sesiones', price: 'Plan desde $180.000', notice: 'Se indica después de una consulta de evaluación.' },
  'hydra-gloss-lips': { sessions: '1 sesión de 40 min', price: 'Desde $20.000' },
  'laminado-de-cejas': { sessions: '1 sesión de 60 min · dura de 6 a 8 semanas', price: 'Desde $19.000' },
  'lifting-de-pestanas': { sessions: '1 sesión de 60 min · dura de 6 a 8 semanas', price: 'Desde $21.000' },
  'crio-radiofrecuencia': { sessions: 'Plan de 6 a 10 sesiones', price: 'Plan desde $150.000', notice: 'Requiere evaluación previa.' },
  'drenaje-linfatico-manual': { sessions: '1 sesión de 50 min · plan de 8 sesiones', price: 'Desde $17.000' },
  maderoterapia: { sessions: 'Plan de 10 sesiones, una o dos por semana', price: 'Plan desde $130.000' },
  'radiofrecuencia-fraccionada': { sessions: 'Plan de 4 a 6 sesiones', price: 'Plan desde $140.000', notice: 'Requiere evaluación previa.' },
  'lipolaser-frio': { sessions: 'Plan de 8 sesiones', price: 'Plan desde $160.000', notice: 'Requiere evaluación previa.' },
  'peeling-despigmentante': { sessions: 'Plan de 3 a 4 sesiones, una cada 21 días', price: 'Desde $30.000', notice: 'Durante el tratamiento es obligatorio usar protector solar.' },
}

const bySlug = (slug: string) => data.servicios.find((s) => s.slug === slug)!

export const DEFAULT_GROUPS: GroupDef[] = GROUPS.map((g) => ({
  ...g,
  services: g.services.map((slug) => {
    const s = bySlug(slug)
    return { slug, name: s.nombre, hook: s.gancho, summary: s.resumen, image: s.imagenes[0] ? `/img/img-${s.imagenes[0]}.webp` : '', sessions: DETAILS[slug]?.sessions ?? '', price: DETAILS[slug]?.price ?? '', notice: DETAILS[slug]?.notice ?? '' }
  }),
}))

export const DEFAULT_CONTENT = {
  hero: {
    eyebrow: 'Podología y estética · Córdoba',
    title: 'Cuidamos tus pies y tu piel',
    text: 'Un lugar tranquilo para cuidarte. Atención personalizada en podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas.',
    primaryCta: 'Pedir turno',
    secondaryCta: 'Ver servicios',
    image: '',
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
    body: 'El área de podología atiende en la planta baja. En el piso de arriba funciona estética, con el mismo nombre y el mismo cuidado: tratamientos faciales y corporales, depilación, cejas, pestañas y uñas.',
    howTitle: 'Cómo trabajamos',
    how: 'En la primera consulta conversamos sobre lo que necesitás y revisamos tus antecedentes para cuidarte. Después te proponemos un plan, sin apuros.',
    values: [
      { title: 'Atención personalizada', text: 'Cada persona es distinta: el plan se arma a tu medida y se ajusta en cada visita.' },
      { title: 'Cuidado de verdad', text: 'Revisamos tus antecedentes antes de empezar, para que cada tratamiento sea seguro para vos.' },
      { title: 'Claridad', text: 'Te explicamos qué vamos a hacer, cuántas sesiones hacen falta y cuánto cuesta, sin sorpresas.' },
    ],
    timeline: [
      { year: '2012', text: 'Abrimos el consultorio de podología en Colorado 5827.' },
      { year: '2016', text: 'Sumamos tratamientos de depilación y cuidado de manos.' },
      { year: '2019', text: 'Nace el área de estética en el piso de arriba.' },
      { year: '2023', text: 'Incorporamos equipos de última generación para tratamientos corporales.' },
    ],
    hygiene: [
      'Instrumental esterilizado en autoclave y envasado individual.',
      'Material descartable de un solo uso en cada sesión.',
      'Superficies desinfectadas entre paciente y paciente.',
      'Ficha clínica con tus antecedentes, guardada con tu consentimiento.',
    ],
  },
  team: [
    { name: 'Equipo de podología', role: 'Podología clínica y cuidado de manos', license: 'M.P. 0000 (ficticia)', photo: '' },
    { name: 'Equipo de estética', role: 'Tratamientos faciales, corporales y depilación', license: 'M.P. 0000 (ficticia)', photo: '' },
  ],
  contact: {
    address: 'Colorado 5827, Córdoba, Argentina',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Colorado+5827+C%C3%B3rdoba+Argentina',
    hours: ['Lunes a viernes de 9 a 19 h', 'Sábados de 9 a 13 h', 'Domingos y feriados cerrado'],
    howToGet: ['Líneas de colectivo que paran sobre la avenida más cercana (ficticio).', 'Estacionamiento sobre la calle, sin límite de tiempo.', 'Entrada accesible, sin escalones.'],
    payment: ['Efectivo', 'Transferencia', 'Tarjetas de débito y crédito', 'Mercado Pago'],
    insurance: 'Algunas obras sociales reintegran la podología clínica. Consultá por tu cobertura al pedir el turno.',
    instagram: 'https://www.instagram.com/genesistulugar',
    instagramHandle: '@genesistulugar',
    phone: '351 000-0000',
    email: 'hola@genesis.example',
  },
  stats: [
    { value: 12, suffix: '+', label: 'años de trayectoria' },
    { value: 4800, suffix: '+', label: 'personas atendidas' },
    { value: 19, suffix: '', label: 'tratamientos' },
    { value: 98, suffix: '%', label: 'nos recomienda' },
  ],
  whyUs: [
    { icon: 'shield', title: 'Seguridad primero', text: 'Revisamos tus antecedentes y trabajamos con material esterilizado o descartable.' },
    { icon: 'heart', title: 'Trato cercano', text: 'Un lugar tranquilo, sin apuro, donde te explicamos cada paso.' },
    { icon: 'sparkle', title: 'Equipos modernos', text: 'Tecnología actual para tratamientos faciales y corporales.' },
    { icon: 'calendar', title: 'Seguimiento', text: 'Te acompañamos entre sesiones y te recordamos tu próximo turno.' },
  ],
  testimonials: [
    { name: 'María L.', service: 'Podología clínica', text: 'Llegué con dolor al caminar y salí aliviada. Me explicaron todo y me dieron cuidados para la casa.' },
    { name: 'Carolina P.', service: 'Depilación láser', text: 'Me hicieron una evaluación antes de empezar y el plan fue claro desde el primer día.' },
    { name: 'Lucía B.', service: 'Limpieza facial profunda', text: 'Un ambiente muy tranquilo. Mi piel quedó luminosa y me recomendaron la rutina justa.' },
    { name: 'Roberto S.', service: 'Heloma', text: 'Tengo diabetes y me sentí cuidado: avisaron cada cosa que hacían y por qué.' },
  ],
  testimonialsNote: 'Opiniones de ejemplo para la demo.',
  faqGeneral: [
    { q: '¿Cómo pido un turno?', a: 'Desde el botón "Pedir turno" de esta web. Te escribimos para confirmar el día y el horario; el pedido no es un turno confirmado hasta que te avisemos.' },
    { q: '¿Necesito una consulta previa?', a: 'En tratamientos como depilación láser o radiofrecuencia sí: hacemos una evaluación para ver si es adecuado para vos.' },
    { q: '¿Atienden a personas con diabetes o que toman anticoagulantes?', a: 'Sí, con precauciones. Avisanos al pedir el turno y adaptamos la atención.' },
    { q: '¿Cuánto dura cada sesión?', a: 'Depende del tratamiento, entre 30 y 90 minutos. En cada servicio ves la duración estimada.' },
    { q: '¿Cuáles son los medios de pago?', a: 'Efectivo, transferencia, tarjetas de débito y crédito, y Mercado Pago.' },
    { q: '¿Puedo cancelar o cambiar mi turno?', a: 'Sí. Te pedimos que nos avises con al menos 24 horas de anticipación para ofrecerle el horario a otra persona.' },
  ],
  tips: [
    { slug: 'cuidado-de-los-pies-en-verano', title: 'Cuidado de los pies en verano', text: 'Hidratación diaria, calzado que respire y secar bien entre los dedos evitan la mayoría de las molestias.', minutes: 3, body: ['En verano los pies sufren más: el calor, la transpiración y las sandalias abiertas favorecen la resequedad, las grietas y los hongos.', 'Hidratá todos los días, sobre todo talones y plantas, con una crema específica. Secá bien entre los dedos después de bañarte y elegí calzado que deje respirar la piel.', 'Si notás durezas que duelen, uñas que se encarnan o cambios de color, consultá con una podóloga: lo que se trata a tiempo se resuelve más fácil.'] },
    { slug: 'cada-cuanto-hacerse-una-limpieza-facial', title: '¿Cada cuánto hacerse una limpieza facial?', text: 'Para la mayoría de las pieles, una vez por mes. Te contamos cómo saber cuál es tu ritmo.', minutes: 4, body: ['No hay un ritmo único: depende del tipo de piel, de la estación y de tu rutina diaria.', 'Para la mayoría de las pieles, una limpieza profunda por mes acompaña bien el ciclo natural de renovación. Las pieles muy sensibles o con rosácea pueden necesitar más espacio entre sesiones.', 'En la primera consulta evaluamos tu piel y te proponemos un ritmo y una rutina para la casa, sin productos de más.'] },
    { slug: 'despues-de-la-depilacion-laser', title: 'Cuidados después de la depilación láser', text: 'Evitar el sol, hidratar y no usar cera entre sesiones: lo que conviene hacer y lo que no.', minutes: 3, body: ['Los días posteriores a la sesión la piel puede estar enrojecida o sensible: es normal y pasa rápido.', 'Evitá el sol directo y las cabinas de bronceado, usá protector solar de alto factor, hidratá la zona y no te depiles con cera entre sesiones: el láser necesita el vello en la raíz.', 'Si aparece ardor intenso, ampollas o manchas, avisanos para revisarlo.'] },
    { slug: 'unas-fuertes-y-sanas', title: 'Uñas fuertes y sanas', text: 'Qué hábitos las cuidan y cuándo conviene consultar a una profesional.', minutes: 3, body: ['Las uñas reflejan tus hábitos: la hidratación, la alimentación y el modo en que las cortás influyen en cómo crecen.', 'Cortalas rectas, no muy al ras; limá en una sola dirección y usá aceite o crema de cutículas. Descansá del esmalte semipermanente cada tanto.', 'Si una uña cambia de color, se engrosa o se despega, conviene que la vea una profesional antes de seguir con tratamientos estéticos.'] },
  ],
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
