import Image from 'next/image'
import { NavLinks } from '@/components/nav-links'
import { countNewRequests } from '@genesis/db/content'
import { currentUser } from '@/lib/auth'
import { logout } from '@/lib/photo-actions'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/hoy', label: 'Hoy', icon: '☀' },
  { href: '/agenda', label: 'Agenda', icon: '▦' },
  { href: '/pacientes', label: 'Pacientes', icon: '☺' },
  { href: '/whatsapp', label: 'WhatsApp', icon: '✉' },
  { href: '/sitio', label: 'Sitio web', icon: '✎' },
  { href: '/auditoria', label: 'Accesos', icon: '⌕' },
  { href: '/plantillas', label: 'Plantillas', icon: '☰' },
  { href: '/ayuda', label: 'Ayuda', icon: '?' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const nuevas = await countNewRequests()
  const user = await currentUser()
  return (
    <div className="min-h-screen md:flex">
      <aside className="print:hidden md:sticky md:top-0 md:h-screen md:overflow-y-auto border-b border-lila/50 bg-white md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-4 py-4">
          <Image src="/logo.webp" alt="" width={44} height={44} className="rounded-full" />
          <span className="font-light uppercase tracking-[0.18em]">Genesis</span>
        </div>
        <NavLinks items={NAV} nuevas={nuevas} />
        {user && <form action={logout} className="px-4 pb-4 text-sm"><p>Sesión: {user.name}</p><button className="mt-1 min-h-touch underline">Salir</button></form>}
      </aside>
      <div className="min-w-0 flex-1">
        <p className="print:hidden bg-tinta px-4 py-2 text-center text-sm text-marmol">
          Modo capacitación · Demo con datos 100 % ficticios · Podés practicar sin miedo
        </p>
        <div className="page-in mx-auto max-w-6xl px-4 py-8">{children}</div>
      </div>
    </div>
  )
}
