import { Wordmark } from '@genesis/ui/wordmark'
import { Nav } from '@/panel/components/nav'
import { ToastProvider } from '@/panel/components/toast'
import { requireUser } from '@/panel/lib/auth-server'
import { draftCount } from '@/panel/lib/repo'
import { signOut } from '@/panel/lib/session'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const drafts = await draftCount()
  const nav = [{ href: '/panel/inicio', label: 'Inicio' }, { href: '/panel/pacientes', label: 'Pacientes' }, { href: '/panel/casos', label: 'Casos' }, { href: '/panel/atenciones', label: 'Atenciones' }, { href: '/panel/pacientes/nuevo', label: 'Nuevo paciente', short: 'Nuevo' }]
  return (
    <ToastProvider>
    <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-control focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:shadow-soft">Saltar al contenido</a>
    <div className="min-h-screen md:flex">
      <aside className="print:hidden border-b border-lila/50 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:py-4">
          <Wordmark size="md" />
          <form action={signOut} className="md:hidden"><button className="min-h-11 rounded-control border border-tinta/60 px-4">Salir</button></form>
        </div>
        <Nav items={nav} drafts={drafts} />
        <div className="mt-auto max-md:hidden">
          <div className="mx-3 mb-3 rounded-card bg-lila/30 p-3">
            <p className="text-base font-semibold">Historias clínicas</p>
            <p className="text-base text-tinta-suave">{drafts > 0 ? `${drafts} ${drafts === 1 ? 'evolución sin firmar' : 'evoluciones sin firmar'}.` : 'No hay nada pendiente de firma.'}</p>
          </div>
          <form action={signOut} className="border-t border-lila/50 px-3 py-3">
            <div className="mb-2 flex items-center gap-3">
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-violeta-oscuro font-semibold text-white">{user.name[0]}</span>
              <p className="min-w-0 leading-tight"><span className="block truncate font-semibold" title={user.email}>{user.name}</span><span className="block truncate text-base text-tinta-suave">{user.role === 'admin' ? 'Administradora' : 'Profesional'}</span></p>
            </div>
            <button className="min-h-touch w-full rounded-control border border-tinta/60 px-3 transition-colors hover:bg-lila/40">Salir</button>
          </form>
        </div>
      </aside>
      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        <div className="mx-auto max-w-6xl px-4 py-5 pb-[calc(var(--tabbar-h)+1.5rem)] md:py-8 md:pb-16">{children}</div>
      </main>
    </div>
    </ToastProvider>
  )
}
