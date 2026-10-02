import Link from 'next/link'
import { SITE, GRUPOS } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-24 bg-tinta text-marmol">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-light uppercase tracking-[0.2em]">Genesis</p>
          <p className="font-label mt-1 text-sm uppercase tracking-widest text-lila">Estética integral</p>
          <p className="mt-4 text-sm">{SITE.address}</p>
        </div>
        <nav aria-label="Servicios">
          <p className="font-label text-sm uppercase tracking-widest text-lila">Servicios</p>
          <ul className="mt-3 space-y-1 text-sm">
            {GRUPOS.map((g) => <li key={g.slug}><Link href={`/servicios/${g.slug}`} className="inline-block py-1 hover:underline">{g.nombre}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Más">
          <p className="font-label text-sm uppercase tracking-widest text-lila">Más</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link href="/pedir-turno" className="inline-block py-1 hover:underline">Pedir turno</Link></li>
            <li><a href={SITE.instagram} className="inline-block py-1 hover:underline" rel="noopener noreferrer">Instagram {SITE.instagramHandle}</a></li>
            <li><Link href="/privacidad" className="inline-block py-1 hover:underline">Privacidad y aviso legal</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-marmol/70">© {new Date().getFullYear()} Genesis Estética Integral. Todos los derechos reservados.</p>
    </footer>
  )
}
