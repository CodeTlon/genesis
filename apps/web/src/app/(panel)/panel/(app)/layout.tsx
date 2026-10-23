import { Wordmark } from '@genesis/ui/wordmark'
import { Nav } from '@/panel/components/nav'
import { requireUser } from '@/panel/lib/auth-server'
import { signOut } from '@/panel/lib/session'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const nav = [{ href: '/panel/pacientes', label: 'Pacientes' }, { href: '/panel/pacientes/nuevo', label: 'Nuevo paciente' }]
  return (
    <div className="min-h-screen md:flex">
      <aside className="print:hidden border-b border-lila/50 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:py-4">
          <Wordmark size="md" />
          <form action={signOut} className="md:hidden"><button className="min-h-11 rounded-control border border-tinta/60 px-4">Salir</button></form>
        </div>
        <Nav items={nav} />
        <form action={signOut} className="px-4 pb-4 text-sm max-md:hidden">
          <p className="mb-2 truncate" title={user.email}>{user.name}</p>
          <button className="min-h-touch w-full rounded-control border border-tinta/60 px-3 transition-colors hover:bg-lila/40">Salir</button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-5 pb-28 md:py-8 md:pb-16">{children}</div>
      </div>
    </div>
  )
}
