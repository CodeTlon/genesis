import Link from 'next/link'
import { AlertBadges } from '@/panel/components/alert-badges'
import { PatientSearch } from '@/panel/components/patient-search'
import { requireUser } from '@/panel/lib/auth-server'
import { listPatients } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const PAGE = 25

export default async function Pacientes({ searchParams }: { searchParams: Promise<{ q?: string; n?: string }> }) {
  await requireUser()
  const { q, n } = await searchParams
  const limit = Math.min(Math.max(Number(n) || PAGE, PAGE), 200)
  const rows = await listPatients(q, limit + 1)
  const more = rows.length > limit
  const shown = rows.slice(0, limit)
  const moreHref = `/panel/pacientes?${new URLSearchParams({ ...(q ? { q } : {}), n: String(limit + PAGE) })}`
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Pacientes</h1>
        <Link href="/panel/pacientes/nuevo" className="inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Nuevo paciente
        </Link>
      </div>
      <PatientSearch initial={q ?? ''} />
      {shown.length === 0 ? (
        <div className="rounded-card bg-white p-8 text-center shadow-soft">
          <p className="text-xl font-semibold">{q ? 'No encontramos pacientes con esa búsqueda' : 'Todavía no hay pacientes'}</p>
          <p className="mt-1 text-tinta-suave">{q ? 'Revisá cómo escribiste el nombre o probá con el DNI.' : 'Cargá el primero para empezar su historia clínica.'}</p>
          {!q && <Link href="/panel/pacientes/nuevo" className="mt-4 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Cargar primer paciente</Link>}
        </div>
      ) : (
        <>
          <ul className="g-stagger divide-y divide-lila/50 rounded-card bg-white shadow-soft">
            {shown.map((p) => (
              <li key={p.id}>
                <Link href={`/panel/pacientes/${p.id}`} className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 hover:bg-lila/30">
                  <span className="min-w-0">
                    <span className="block truncate text-xl font-semibold">{p.lastName}, {p.firstName}</span>
                    <span className="block text-base text-tinta-suave">{[p.dni && `DNI ${p.dni}`, p.phone].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <AlertBadges alerts={p.alerts} compact max={3} />
                    <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {more && <div className="text-center"><Link href={moreHref} scroll={false} className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-6 font-semibold text-violeta-oscuro hover:bg-lila/40">Ver más pacientes</Link></div>}
        </>
      )}
    </div>
  )
}
