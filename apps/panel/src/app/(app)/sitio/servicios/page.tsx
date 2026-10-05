import Link from 'next/link'
import { IconChevronUp, IconChevronDown } from '@/components/icons'
import { getGroups } from '@genesis/db/content'
import { Notice, PageHead, inputCls } from '@/components/cms'
import { createGroup, moveItem } from '@/lib/cms-actions'

export const dynamic = 'force-dynamic'

export default async function Servicios({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams
  const groups = await getGroups({ all: true })
  return (
    <main>
      <PageHead title="Servicios" back={{ href: '/sitio', label: 'Sitio web' }} view="/servicios"
        intro="Los grupos son las páginas del sitio; cada grupo tiene sus tratamientos. Podés cambiar el orden, ocultar o crear grupos nuevos." />
      <Notice ok={sp.ok} error={sp.error} />
      <ul className="space-y-3">
        {groups.map((g, i) => (
          <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-white p-4 shadow-soft">
            <div>
              <Link href={`/sitio/servicios/${g.id}`} className="inline-flex min-h-touch items-center text-lg font-semibold underline">{g.name}</Link>
              <p className="text-sm">{g.services.length} {g.services.length === 1 ? 'tratamiento' : 'tratamientos'} · {g.published ? 'Visible en el sitio' : 'Oculto'}</p>
            </div>
            <div className="flex gap-2">
              {(['up', 'down'] as const).map((dir) => (
                <form key={dir} action={moveItem}>
                  <input type="hidden" name="table" value="service_groups" /><input type="hidden" name="id" value={g.id} /><input type="hidden" name="dir" value={dir} /><input type="hidden" name="return" value="/sitio/servicios" />
                  <button disabled={(dir === 'up' && i === 0) || (dir === 'down' && i === groups.length - 1)} aria-label={`${dir === 'up' ? 'Subir' : 'Bajar'} ${g.name}`} className="min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro disabled:opacity-40">{dir === 'up' ? <><IconChevronUp /> Subir</> : <><IconChevronDown /> Bajar</>}</button>
                </form>
              ))}
              <Link href={`/sitio/servicios/${g.id}`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white">Editar</Link>
            </div>
          </li>
        ))}
        {!groups.length && <li>Todavía no hay grupos.</li>}
      </ul>

      <form action={createGroup} className="mt-10 max-w-md space-y-3 rounded-card bg-lila/30 p-5">
        <h2 className="text-lg font-semibold">Nuevo grupo</h2>
        <label className="block">Nombre<input name="name" required className={inputCls} placeholder="Por ejemplo: Masajes" /></label>
        <button className="min-h-touch rounded-control bg-violeta-oscuro px-6 text-white">Crear grupo</button>
        <p className="text-sm">Se crea oculto: lo completás y lo publicás cuando esté listo.</p>
      </form>
    </main>
  )
}
