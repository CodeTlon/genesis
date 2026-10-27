import Link from 'next/link'
import { requireUser } from '@/panel/lib/auth-server'
import { dashboard, type Pending } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const TZ = 'America/Argentina/Cordoba'
const hour = () => Number(new Intl.DateTimeFormat('es-AR', { hour: 'numeric', hour12: false, timeZone: TZ }).format(new Date()))
const greeting = () => (hour() < 6 ? 'Buenas noches' : hour() < 13 ? 'Buenos días' : hour() < 20 ? 'Buenas tardes' : 'Buenas noches')
const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
/** "hoy", "ayer" o dd/mm, en horario de Córdoba. */
function when(iso: string) {
  const d = new Date(iso), now = new Date()
  if (dayKey(d) === dayKey(now)) return 'hoy'
  if (dayKey(d) === dayKey(new Date(now.getTime() - 864e5))) return 'ayer'
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', timeZone: TZ }).format(d)
}

const I = (d: string) => <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
const ICON = {
  people: 'M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1m8-9a3 3 0 100-6 3 3 0 000 6zm8 9v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  pencil: 'M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z',
}

const href = (p: Pending) => (p.caseId ? `/panel/pacientes/${p.patientId}/casos/${p.caseId}` : `/panel/pacientes/${p.patientId}`)

function Stat({ icon, n, label, to, tone }: { icon: string; n: number; label: string; to: string; tone: string }) {
  return (
    <Link href={to} className="group flex flex-col items-start gap-3 rounded-card bg-white p-4 sm:flex-row sm:items-center sm:gap-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-14px_rgb(123_63_184/.4)]">
      <span className={`grid size-12 shrink-0 place-items-center rounded-control ${tone}`}>{I(icon)}</span>
      <span className="min-w-0">
        <span className="block text-4xl font-semibold leading-none tracking-tight">{n}</span>
        <span className="mt-1 block text-base text-tinta-suave">{label}</span>
      </span>
    </Link>
  )
}

function List({ id, title, empty, items, tone }: { id?: string; title: string; empty: string; items: Pending[]; tone: string }) {
  return (
    <section id={id} aria-labelledby={`${id ?? title}-h`} className="rounded-card bg-white p-5 shadow-soft">
      <h2 id={`${id ?? title}-h`} className="text-xl">{title}</h2>
      {items.length === 0 ? <p className="mt-3 text-tinta-suave">{empty}</p> : (
        <ul className="g-stagger mt-2 divide-y divide-lila/50">
          {items.map((p) => (
            <li key={p.entryId}>
              <Link href={href(p)} className="-mx-2 flex min-h-touch items-center justify-between gap-3 rounded-control px-2 py-2 transition-colors hover:bg-lila/30">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{p.patient}</span>
                  <span className="block truncate text-base text-tinta-suave">{p.caseTitle ?? 'Sin caso'}</span>
                </span>
                <span className={`shrink-0 rounded-full px-3 py-0.5 text-base font-semibold ${tone}`}>{when(p.at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function Inicio() {
  const user = await requireUser()
  const d = await dashboard()
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(new Date())
  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-violeta-oscuro to-[#4f2480] p-6 text-white shadow-soft md:p-8">
        <span aria-hidden className="g-blob g-blob-1 !size-72 !opacity-25" />
        <span aria-hidden className="g-blob g-blob-3 !right-[-4rem] !left-auto !size-64 !opacity-20" />
        <div className="relative">
          <p className="text-base text-white/85">{today.charAt(0).toUpperCase() + today.slice(1)}</p>
          <h1 className="mt-1 text-3xl md:text-4xl">{greeting()}, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 max-w-xl text-white/90">{d.drafts > 0 ? `Tenés ${d.drafts} ${d.drafts === 1 ? 'evolución' : 'evoluciones'} sin firmar para retomar.` : 'Todo al día. Buscá un paciente o cargá uno nuevo para empezar.'}</p>
          <form action="/panel/pacientes" className="mt-5 flex max-w-xl gap-2">
            <label className="sr-only" htmlFor="inicio-q">Buscar por nombre, DNI o teléfono</label>
            <input id="inicio-q" name="q" type="search" autoComplete="off" placeholder="Nombre, DNI o teléfono" className="min-h-touch min-w-0 flex-1 rounded-control border-0 bg-white px-4 text-tinta placeholder:text-tinta-suave" />
            <button className="inline-flex min-h-touch items-center gap-2 rounded-control bg-white px-5 font-semibold text-violeta-oscuro hover:bg-lila/50">{I(ICON.search)}<span className="max-sm:sr-only">Buscar</span></button>
          </form>
        </div>
      </header>

      <div className="g-stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={ICON.people} n={d.patients} label={d.patients === 1 ? 'Paciente' : 'Pacientes'} to="/panel/pacientes" tone="bg-lila/50 text-violeta-oscuro" />
        <Stat icon={ICON.folder} n={d.openCases} label={d.openCases === 1 ? 'Caso abierto' : 'Casos abiertos'} to="/panel/pacientes" tone="bg-info-fondo text-info-texto" />
        <Stat icon={ICON.pencil} n={d.drafts} label={d.drafts === 1 ? 'Sin firmar' : 'Sin firmar'} to="#pendientes" tone="bg-aviso-fondo text-aviso-texto" />
        <Stat icon={ICON.check} n={d.signedThisMonth} label="Firmadas este mes" to="#recientes" tone="bg-ok-fondo text-ok-texto" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <List id="pendientes" title="Para retomar" empty="No hay evoluciones sin firmar." items={d.pending} tone="bg-aviso-fondo text-aviso-texto" />
        <List id="recientes" title="Últimas firmadas" empty="Todavía no se firmó ninguna evolución." items={d.recent} tone="bg-ok-fondo text-ok-texto" />
      </div>

      <section aria-labelledby="nuevos-h" className="rounded-card bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="nuevos-h" className="text-xl">Pacientes recientes</h2>
          <Link href="/panel/pacientes/nuevo" className="inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-5 font-semibold text-white hover:bg-tinta">{I(ICON.plus)}Nuevo paciente</Link>
        </div>
        {d.latestPatients.length === 0 ? <p className="mt-3 text-tinta-suave">Todavía no hay pacientes cargados.</p> : (
          <ul className="g-stagger mt-3 flex flex-wrap gap-2">
            {d.latestPatients.map((p) => (
              <li key={p.id}><Link href={`/panel/pacientes/${p.id}`} className="inline-flex min-h-touch items-center gap-2 rounded-full border border-lila bg-marmol px-4 transition-colors hover:bg-lila/40">
                <span aria-hidden className="grid size-8 place-items-center rounded-full bg-violeta-oscuro text-base font-semibold text-white">{p.name[0]}</span>{p.name}</Link></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
