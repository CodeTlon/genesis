'use client'
import { Wordmark } from '@genesis/ui/wordmark'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const LINKS = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/galeria', label: 'Galería' },
  { href: '/consejos', label: 'Consejos' },
  { href: '/contacto', label: 'Contacto' },
]

export function Header() {
  const path = usePathname()
  const menu = useRef<HTMLDetailsElement>(null)
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`)

  // El header vive en el layout: hay que cerrar el menú móvil al navegar, con Escape o tocando afuera.
  useEffect(() => { menu.current?.removeAttribute('open') }, [path])
  useEffect(() => {
    const close = (e: KeyboardEvent | MouseEvent) => {
      const el = menu.current
      if (!el?.open) return
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !el.contains(e.target as Node)) el.removeAttribute('open')
    }
    document.addEventListener('keydown', close)
    document.addEventListener('click', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('click', close) }
  }, [])

  const linkClass = (href: string) => `${isActive(href) ? 'font-semibold text-violeta-oscuro' : ''}`
  return (
    <header className="sticky top-0 z-30 border-b border-lila/40 bg-marmol/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Genesis Estética Integral, inicio">
          <Wordmark size="md" tagline />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} className={`py-3 hover:text-violeta-oscuro ${linkClass(l.href)}`}>{l.label}</Link>)}
          <Link href="/pedir-turno" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white hover:bg-tinta">Pedir turno</Link>
        </nav>
        <details ref={menu} className="relative lg:hidden">
          <summary className="flex min-h-touch cursor-pointer list-none items-center rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro">Menú</summary>
          <nav aria-label="Principal móvil" className="g-enter absolute right-0 mt-2 flex w-64 flex-col rounded-card bg-white p-3 shadow-soft">
            {LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} className={`flex min-h-touch items-center px-3 ${linkClass(l.href)}`}>{l.label}</Link>)}
            <Link href="/pedir-turno" className="mt-2 flex min-h-touch items-center justify-center rounded-control bg-violeta-oscuro text-white hover:bg-tinta">Pedir turno</Link>
          </nav>
        </details>
      </div>
    </header>
  )
}
