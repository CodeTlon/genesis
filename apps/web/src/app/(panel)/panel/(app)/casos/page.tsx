import Link from 'next/link'
import { requireUser } from '@/panel/lib/auth-server'
import { fullDate, when } from '@/panel/lib/format'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { countOpenCases, listOpenCases } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const PAGE = 25

export default async function Casos({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireUser()
  const sp = await searchParams
  const total = await countOpenCases()
  const page = parsePage(sp.page, Math.ceil(total / PAGE))
  const shown = await listOpenCases(PAGE, (page - 1) * PAGE)
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Casos abiertos</h1>
        <p className="mt-1 text-tinta-suave">Tratamientos en curso, con el de actividad más reciente primero.</p>
      </header>
      {shown.length === 0 ? (
        <div className="rounded-card bg-white p-8 text-center shadow-soft">
          <p className="text-xl font-semibold">No hay casos abiertos</p>
          <p className="mt-1 text-tinta-suave">Los casos se abren desde la ficha de cada paciente.</p>
          <Link href="/panel/pacientes" className="mt-4 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Ir a pacientes</Link>
        </div>
      ) : (
        <>
          <ul className="g-stagger divide-y divide-lila/50 rounded-card bg-white shadow-soft">
            {shown.map((c) => (
              <li key={c.caseId}>
                <Link href={`/panel/pacientes/${c.patientId}/casos/${c.caseId}`} className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-lila/30">
                  <span className="min-w-0">
                    <span className="block truncate text-xl font-semibold">{c.title}</span>
                    <span className="block truncate text-base text-tinta-suave">{c.patient} · abierto el {fullDate(c.openedAt)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-base">
                    {c.drafts > 0 && <span className="rounded-full bg-aviso-fondo px-3 py-0.5 font-semibold text-aviso-texto">{c.drafts === 1 ? '1 sin firmar' : `${c.drafts} sin firmar`}</span>}
                    <span className="text-tinta-suave">Última actividad: {when(c.lastAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination base="/panel/casos" page={page} total={total} pageSize={PAGE} noun={total === 1 ? 'caso abierto' : 'casos abiertos'} />
        </>
      )}
    </div>
  )
}
