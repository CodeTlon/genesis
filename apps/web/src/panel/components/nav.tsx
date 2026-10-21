'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ICONS: Record<string, string> = {
  '/panel/pacientes': 'M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1m8-9a3 3 0 100-6 3 3 0 000 6zm8 9v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8',
}


export function Nav({ items }: { items: { href: string; label: string; desktopOnly?: boolean }[] }) {
  const path = usePathname()
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-lila/50 bg-white px-1 py-1 md:static md:flex-col md:justify-start md:gap-1 md:border-0 md:px-2 md:pb-3">
      {items.map((n) => {
        const active = path === n.href || path.startsWith(`${n.href}/`)
        return (
          <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined}
            className={`${n.desktopOnly ? 'max-md:hidden ' : ''}relative flex min-h-touch min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-0.5 text-[10px] leading-tight md:flex-none md:flex-row md:justify-start md:gap-3 md:px-4 md:text-base ${active ? 'bg-lila/60 font-semibold text-tinta' : 'hover:bg-lila/40'}`}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 md:size-6 text-violeta-oscuro" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[n.href]} /></svg>
            <span className="md:hidden">{n.label}</span>
            <span className="hidden md:inline">{n.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
