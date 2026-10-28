'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ICONS: Record<string, string> = {
  '/panel/inicio': 'M3 11l9-7 9 7v8a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-8z',
  '/panel/casos': 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  '/panel/atenciones': 'M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z',
  '/panel/pacientes/nuevo': 'M12 5v14M5 12h14',
  '/panel/pacientes': 'M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1m8-9a3 3 0 100-6 3 3 0 000 6zm8 9v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8',
}


export function Nav({ items, drafts = 0 }: { items: { href: string; label: string; short?: string; desktopOnly?: boolean }[]; drafts?: number }) {
  const path = usePathname()
  return (
    <nav aria-label="Principal" style={{ minHeight: 'var(--tabbar-h)' }} className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-lila/50 bg-white px-1 pt-1 pb-[max(.25rem,env(safe-area-inset-bottom))] md:static md:!min-h-0 md:pb-3 md:flex-col md:justify-start md:gap-1 md:border-0 md:px-2">
      {items.map((n) => {
        const active = n.href === '/panel/inicio' ? path === n.href : n.href === '/panel/pacientes' ? path.startsWith('/panel/pacientes') && !path.startsWith('/panel/pacientes/nuevo') : path.startsWith(n.href)
        return (
          <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined}
            className={`${n.desktopOnly ? 'max-md:hidden ' : ''}group relative flex min-h-touch min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-0.5 text-[0.85rem] font-semibold leading-tight md:flex-none md:flex-row md:justify-start md:gap-3 md:px-4 md:text-base md:font-normal ${active ? 'bg-lila/60 font-semibold text-tinta' : 'hover:bg-lila/40'}`}>
            <span aria-hidden className={`absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-1 origin-center rounded-full bg-violeta-oscuro transition-transform duration-200 md:block ${active ? 'scale-y-100' : 'scale-y-0'}`} />
            <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0 text-violeta-oscuro transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[n.href]} /></svg>
            {n.short ? <><span className="md:hidden">{n.short}</span><span className="max-md:hidden">{n.label}</span></> : <span>{n.label}</span>}
            {n.href === '/panel/atenciones' && drafts > 0 && <span className="absolute left-1/2 top-0.5 ml-1.5 grid min-w-5 place-items-center rounded-full bg-aviso-fondo px-1 text-sm font-bold text-aviso-texto ring-1 ring-aviso-texto/30 md:static md:ml-auto md:min-w-6 md:px-1.5" aria-label={`${drafts} sin firmar`}>{drafts}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
