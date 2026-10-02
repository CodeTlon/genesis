import Image from 'next/image'
import Link from 'next/link'

const LINKS = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/galeria', label: 'Galería' },
  { href: '/contacto', label: 'Contacto' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-lila/40 bg-marmol/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Genesis Estética Integral, inicio">
          <Image src="/img/logo.webp" alt="" width={48} height={48} className="rounded-full" priority />
          <span className="font-light uppercase tracking-[0.2em]">Genesis</span>
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className="py-3 hover:text-violeta-oscuro">{l.label}</Link>)}
          <Link href="/pedir-turno" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white">Pedir turno</Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="flex min-h-touch cursor-pointer list-none items-center rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro">Menú</summary>
          <nav aria-label="Principal móvil" className="absolute right-0 mt-2 flex w-64 flex-col rounded-card bg-white p-3 shadow-soft">
            {LINKS.map((l) => <Link key={l.href} href={l.href} className="flex min-h-touch items-center px-3">{l.label}</Link>)}
            <Link href="/pedir-turno" className="mt-2 flex min-h-touch items-center justify-center rounded-control bg-violeta-oscuro text-white">Pedir turno</Link>
          </nav>
        </details>
      </div>
    </header>
  )
}
