import { Wordmark } from '@genesis/ui/wordmark'
import { Nav } from '@/panel/components/nav'
import { requireUser } from '@/panel/lib/auth-server'
import { signOut } from '@/panel/lib/session'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const nav = [{ href: '/panel/pacientes', label: 'Pacientes' }]
  return (
    <div className="min-h-screen md:flex">
      <aside className="print:hidden border-b border-lila/50 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-4 py-4"><Wordmark size="md" /></div>
        <Nav items={nav} />
        <form action={signOut} className="px-4 pb-4 text-sm">
          <p className="mb-2 truncate" title={user.email}>{user.name}</p>
          <button className="min-h-touch w-full rounded-control border border-tinta/60 px-3 transition-colors hover:bg-lila/40">Salir</button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-40 md:pb-16">{children}</div>
      </div>
    </div>
  )
}
