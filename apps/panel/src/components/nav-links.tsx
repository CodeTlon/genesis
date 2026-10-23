'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = { href: string; label: string; icon: string }

/** Navegación con la sección activa marcada (texto + barra + aria-current, no solo color). */
export function NavLinks({ items, nuevas }: { items: NavItem[]; nuevas: number }) {
  const path = usePathname()
  return (
    <nav aria-label="Principal" className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
      {items.map((n) => {
        const active = path === n.href || path.startsWith(n.href + '/')
        return (
          <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined}
            className={`nav-link relative flex min-h-touch shrink-0 items-center gap-3 rounded-control px-4 transition-colors ${active ? 'bg-violeta-oscuro font-semibold text-white' : 'hover:bg-lila/40'}`}>
            <span aria-hidden className={`w-5 text-center ${active ? 'text-white' : 'text-violeta-oscuro'}`}>{n.icon}</span>
            {n.label}
            {n.href === '/sitio' && nuevas > 0 && <span className="ml-auto rounded-full bg-amber-200 px-2 text-sm text-amber-950" aria-label={`${nuevas} solicitudes nuevas`}>{nuevas}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
