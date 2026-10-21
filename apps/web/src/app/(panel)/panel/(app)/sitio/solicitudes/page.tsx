import { getGroups, listRequests } from '@genesis/db/content'
import { PageHead } from '@/panel/components/cms'
import { markRequest } from '@/panel/lib/cms-actions'

export const dynamic = 'force-dynamic'

const LABEL: Record<string, string> = { new: 'Nueva', done: 'Atendida', discarded: 'Descartada' }
const fmt = (iso: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short', hour12: false, timeZone: 'America/Argentina/Cordoba' }).format(new Date(iso))

export default async function Solicitudes() {
  const [reqs, groups] = await Promise.all([listRequests(), getGroups({ all: true })])
  const name = (slug: string | null) => groups.find((g) => g.slug === slug)?.name ?? 'Sin definir'
  return (
    <main className="max-w-3xl">
      <PageHead title="Solicitudes de turno" back={{ href: '/panel/sitio', label: 'Sitio web' }}
        intro="Los pedidos que llegan desde el formulario del sitio. No son turnos confirmados: contactá a la persona y agendá el turno en la Agenda." />
      <ul className="space-y-3">
        {reqs.map((r) => (
          <li key={r.id} className={`rounded-card p-4 shadow-soft ${r.status === 'new' ? 'bg-amber-50 ring-1 ring-amber-700/30' : 'bg-white'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{r.name}</p>
                <p><a href={`tel:${r.phone.replace(/[^+\d]/g, '')}`} className="inline-flex min-h-touch items-center underline">{r.phone}</a> · Le interesa: {name(r.service_slug)}</p>
                {r.note && <p className="mt-1">“{r.note}”</p>}
                <p className="mt-1 text-sm">Recibida el {fmt(r.created_at)}</p>
              </div>
              <span className="rounded-full bg-lila/50 px-3 py-1 text-sm">{LABEL[r.status] ?? r.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(r.status === 'new'
                ? [
                    { to: 'done', label: 'Marcar como atendida', cls: 'bg-violeta-oscuro text-white' },
                    { to: 'discarded', label: 'Descartar', cls: 'border border-red-800 text-red-900' },
                  ]
                : [{ to: 'new', label: 'Volver a “nueva”', cls: 'border border-violeta-oscuro text-violeta-oscuro' }]
              ).map((b) => (
                <form key={b.to} action={markRequest}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value={b.to} />
                  <button className={`min-h-touch rounded-control px-4 ${b.cls}`}>{b.label}</button>
                </form>
              ))}
            </div>
          </li>
        ))}
        {!reqs.length && <li>Todavía no llegaron solicitudes.</li>}
      </ul>
    </main>
  )
}
