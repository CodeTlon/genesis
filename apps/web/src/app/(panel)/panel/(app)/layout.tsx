import { Wordmark } from '@genesis/ui/wordmark'
import Link from 'next/link'
import { countNewRequests } from '@genesis/db/content'
import { ConfirmButton } from '@/panel/components/confirm-button'
import { MotionRoot } from '@/panel/components/motion-root'
import { Nav } from '@/panel/components/nav'
import { Tour } from '@/panel/components/tour'
import { leaveDemo, restartDemo } from '@/panel/lib/session'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/panel/hoy', label: 'Hoy' },
  { href: '/panel/resumen', label: 'Resumen' },
  { href: '/panel/agenda', label: 'Agenda' },
  { href: '/panel/pacientes', label: 'Pacientes' },
  { href: '/panel/sitio', label: 'Sitio web' },
  { href: '/panel/plantillas', label: 'Plantillas' },
  { href: '/panel/ayuda', label: 'Ayuda', desktopOnly: true },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const nuevas = await countNewRequests()
  return (
    <MotionRoot>
    <div className="min-h-screen md:flex">
      <aside className="print:hidden border-b border-lila/50 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-4 py-4">
          <Wordmark size="md" />
        </div>
        <Nav items={NAV} nuevas={nuevas} />
        <form className="flex gap-2 px-4 pb-4 text-sm md:flex-col">
          <ConfirmButton label="Reiniciar demo" title="¿Reiniciar la demo?" text="Se borra lo que hiciste y vuelven los datos de partida. Es solo una práctica: no se pierde nada real." confirmLabel="Sí, reiniciar" formAction={restartDemo} className="min-h-touch flex-1 rounded-control border border-tinta/60 px-3 transition-colors hover:bg-lila/40" />
          <button formAction={leaveDemo} className="min-h-touch flex-1 rounded-control px-3 transition-colors hover:bg-lila/40">Salir</button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">
        <p className="print:hidden bg-tinta px-4 py-2 text-center text-sm text-marmol">
          Modo capacitación · Demo con datos 100 % ficticios · Podés practicar sin miedo
        </p>
        <div className="mx-auto max-w-6xl px-4 py-8 pb-56 md:pb-40">{children}</div>
        <Tour webUrl="/" />
      </div>
    </div>
    </MotionRoot>
  )
}
