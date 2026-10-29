import Link from 'next/link'
import { CountUp } from '@/panel/components/count-up'
import { requireUser } from '@/panel/lib/auth-server'
import { hourInCordoba, longToday, when } from '@/panel/lib/format'
import { dashboard, type Pending } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const greeting = () => { const h = hourInCordoba(); return h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' }

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

function Stat({ icon, n, label, go, to, tone }: { icon: string; n: number; label: string; go: string; to: string; tone: string }) {
  return (
    <Link href={to} className="group flex flex-col gap-3 rounded-card bg-white p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-14px_rgb(123_63_184/.4)]">
      <span className="flex items-center gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-control ${tone}`}>{I(icon)}</span>
        <CountUp value={n} className="text-4xl font-semibold leading-none tracking-tight" />
      </span>
      <span className="text-base text-tinta-suave">{label}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-base font-semibold text-violeta-oscuro">{go}<svg aria-hidden viewBox="0 0 24 24" className="size-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></span>
    </Link>
  )
}

function List({ id, title, empty, items, tone, more }: { id?: string; title: string; empty: string; items: Pending[]; tone: string; more?: { href: string; label: string } }) {
  return (
    <section id={id} aria-labelledby={`${id ?? title}-h`} className="rounded-card bg-white p-5 shadow-soft">
      <h2 id={`${id ?? title}-h`} className="text-xl">{title}</h2>
      {items.length === 0 ? <p className="mt-3 text-tinta-suave">{empty}</p> : (
        <ul className="g-stagger mt-2 divide-y divide-tinta/10">
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
      {more && <Link href={more.href} className="mt-3 inline-flex min-h-touch items-center font-semibold text-violeta-oscuro hover:underline">{more.label}</Link>}
    </section>
  )
}

export default async function Inicio() {
  const user = await requireUser()
  const d = await dashboard()
  return (
    <div className="space-y-6">
      <header className="rounded-card border border-tinta/10 bg-white p-6 shadow-soft md:p-8">
        <p className="text-base text-tinta-suave">{longToday()}</p>
        <h1 className="mt-1 text-3xl md:text-4xl">{greeting()}, {user.name.split(' ')[0]}</h1>
        <p className="mt-2 max-w-xl text-tinta-suave">{d.drafts > 0 ? `Tenés ${d.drafts} ${d.drafts === 1 ? 'evolución' : 'evoluciones'} sin firmar para retomar.` : 'Todo al día. Buscá un paciente o cargá uno nuevo para empezar.'}</p>
      </header>

      <nav aria-label="Resumen" className="g-stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={ICON.people} n={d.patients} label={d.patients === 1 ? 'Paciente' : 'Pacientes'} go="Ver lista" to="/panel/pacientes" tone="bg-lila/50 text-violeta-oscuro" />
        <Stat icon={ICON.folder} n={d.openCases} label={d.openCases === 1 ? 'Caso abierto' : 'Casos abiertos'} go="Ver casos" to="/panel/casos" tone="bg-info-fondo text-info-texto" />
        <Stat icon={ICON.pencil} n={d.drafts} label="Sin firmar" go="Retomar" to="/panel/atenciones?tab=sin-firmar" tone="bg-aviso-fondo text-aviso-texto" />
        <Stat icon={ICON.check} n={d.signedThisMonth} label="Firmadas este mes" go="Ver firmadas" to="/panel/atenciones?tab=firmadas" tone="bg-ok-fondo text-ok-texto" />
      </nav>

      <List id="pendientes" title="Para retomar" empty="No hay evoluciones sin firmar. Todo al día." items={d.pending} tone="bg-aviso-fondo text-aviso-texto" more={d.drafts > d.pending.length ? { href: '/panel/atenciones?tab=sin-firmar', label: `Ver las ${d.drafts}` } : undefined} />

      <section aria-labelledby="nuevos-h" className="rounded-card bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="nuevos-h" className="text-xl">Pacientes recientes</h2>
        </div>
        {d.latestPatients.length === 0 ? <p className="mt-3 text-tinta-suave">Todavía no hay pacientes cargados.</p> : (
          <ul className="g-stagger mt-3 flex flex-wrap gap-2">
            {d.latestPatients.map((p) => (
              <li key={p.id}><Link href={`/panel/pacientes/${p.id}`} className="inline-flex min-h-touch items-center gap-2 rounded-full border border-lila bg-marmol px-4 transition-colors hover:bg-lila/40">
                {p.name}</Link></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
