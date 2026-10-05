import { Wordmark } from '@genesis/ui/wordmark'
import Link from 'next/link'
import { countNewRequests } from '@genesis/db/content'
import { ConfirmButton } from '@/components/confirm-button'
import { MotionRoot } from '@/components/motion-root'
import { Nav } from '@/components/nav'
import { Tour } from '@/components/tour'
import { WEB_URL } from '@/lib/cms'
import { leaveDemo, restartDemo } from '@/lib/session'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/hoy', label: 'Hoy' },
  { href: '/resumen', label: 'Resumen' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/sitio', label: 'Sitio web' },
  { href: '/plantillas', label: 'Plantillas' },
  { href: '/ayuda', label: 'Ayuda', desktopOnly: true },
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
        <Tour webUrl={WEB_URL || '/'} />
      </div>
    </div>
    </MotionRoot>
  )
}
