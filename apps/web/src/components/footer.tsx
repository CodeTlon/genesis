import Link from 'next/link'
import { getContent, getGroups } from '@genesis/db/content'
import { SITE } from '@/lib/site'

export async function Footer() {
  const [contact, groups] = await Promise.all([getContent('contact'), getGroups()])
  return (
    <footer className="mt-24 bg-tinta text-marmol">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-normal uppercase tracking-[0.14em]">Genesis</p>
          <p className="font-label mt-1 text-base uppercase tracking-widest text-lila">Estética integral</p>
          <p className="mt-4 text-base">{contact.address}</p>
          {contact.phone && <p className="text-base">Tel. {contact.phone}</p>}
        </div>
        <nav aria-label="Servicios">
          <p className="font-label text-base uppercase tracking-widest text-lila">Servicios</p>
          <ul className="mt-3 space-y-1 text-base">
            {groups.map((g) => <li key={g.slug}><Link href={`/servicios/${g.slug}`} className="inline-block py-1 hover:underline">{g.name}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Más">
          <p className="font-label text-base uppercase tracking-widest text-lila">Más</p>
          <ul className="mt-3 space-y-1 text-base">
            <li><Link href="/pedir-turno" className="inline-block py-1 hover:underline">Pedir turno</Link></li>
            <li><a href={contact.instagram} className="inline-block py-1 hover:underline" rel="noopener noreferrer">Instagram {contact.instagramHandle}</a></li>
            <li><Link href="/privacidad" className="inline-block py-1 hover:underline">Privacidad y aviso legal</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-marmol/70">© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
    </footer>
  )
}
