import Link from 'next/link'
import { countNewRequests, getGallery, getGroups } from '@genesis/db/content'
import { PageHead } from '@/components/cms'

export const dynamic = 'force-dynamic'

export default async function Sitio() {
  const [groups, gallery, nuevas] = await Promise.all([getGroups({ all: true }), getGallery({ all: true }), countNewRequests()])
  const treatments = groups.reduce((n, g) => n + g.services.length, 0)
  const cards = [
    { href: '/sitio/inicio', t: 'Inicio', d: 'Título, texto de bienvenida, imagen y pasos de la portada.' },
    { href: '/sitio/servicios', t: 'Servicios', d: `${groups.length} grupos y ${treatments} tratamientos: textos, fotos, sesiones y precios.` },
    { href: '/sitio/nosotros', t: 'Nosotros', d: 'Historia, equipo y matrículas profesionales.' },
    { href: '/sitio/contacto', t: 'Contacto y horarios', d: 'Dirección, horarios, teléfono, email e Instagram.' },
    { href: '/sitio/galeria', t: 'Galería', d: `${gallery.filter((g) => g.published).length} fotos publicadas. Se sube con confirmación de consentimiento.` },
    { href: '/sitio/general', t: 'Avisos y buscadores', d: 'Aviso en la parte de arriba (por ejemplo, feriados) y cómo aparece en Google.' },
    { href: '/sitio/solicitudes', t: 'Solicitudes de turno', d: nuevas ? `${nuevas} nueva${nuevas === 1 ? '' : 's'} para responder.` : 'Los pedidos que llegan desde el sitio.' },
  ]
  return (
    <main>
      <PageHead title="Sitio web" intro="Desde acá editás todo lo que se ve en el sitio, sin tocar código. Al guardar, el sitio se actualiza solo." view="/" />
      <ul className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block h-full rounded-card bg-white p-5 shadow-soft hover:ring-2 hover:ring-violeta">
              <h2 className="text-lg font-semibold">{c.t}</h2>
              <p className="mt-1">{c.d}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
