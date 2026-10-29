import Link from 'next/link'
import { requireUser } from '@/panel/lib/auth-server'
import { fullDate, when } from '@/panel/lib/format'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { FilterBar } from '@/panel/components/filter-bar'
import { countAllCases, listAllCases, type CaseFilters } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const PAGE = 25

const ESTADOS = ['abiertos', 'cerrados', 'todos'] as const
const ORDENES = ['reciente', 'antiguo'] as const
const pick = <T extends string>(list: readonly T[], v: string | undefined, def: T): T => (list as readonly string[]).includes(v ?? '') ? (v as T) : def

export default async function Casos({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; estado?: string; borrador?: string; orden?: string }> }) {
  await requireUser()
  const sp = await searchParams
  const q = sp.q?.trim() || undefined
  const estado = pick(ESTADOS, sp.estado, 'abiertos')
  const orden = pick(ORDENES, sp.orden, 'reciente')
  const borrador = sp.borrador === 'si'
  const f: CaseFilters = { q, estado, borrador, orden }
  const total = await countAllCases(f)
  const page = parsePage(sp.page, Math.ceil(total / PAGE))
  const shown = await listAllCases(f, PAGE, (page - 1) * PAGE)
  const filtered = !!q || estado !== 'abiertos' || borrador
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Casos</h1>
        <p className="mt-1 text-tinta-suave">Tratamientos de todos los pacientes. Por defecto, los que están abiertos.</p>
      </header>
      <FilterBar base="/panel/casos" q={q ?? ''} placeholder="Buscar por paciente o título del caso" groups={[
        { key: 'estado', label: 'Estado', value: estado, options: [{ value: 'abiertos', label: 'Abiertos' }, { value: 'cerrados', label: 'Cerrados' }, { value: 'todos', label: 'Todos' }] },
        { key: 'borrador', label: 'Atenciones', value: borrador ? 'si' : '', options: [{ value: '', label: 'Todos los casos' }, { value: 'si', label: 'Con borradores sin firmar' }] },
        { key: 'orden', label: 'Orden', value: orden, options: [{ value: 'reciente', label: 'Actividad más reciente primero' }, { value: 'antiguo', label: 'Actividad más antigua primero' }] },
      ]} />
      {shown.length === 0 ? (
        <div className="rounded-card bg-white p-8 text-center shadow-soft">
          <p className="text-xl font-semibold">{filtered ? 'No hay casos con esos filtros' : 'No hay casos abiertos'}</p>
          <p className="mt-1 text-tinta-suave">{filtered ? 'Probá con otro texto, o sacá algún filtro.' : 'Los casos se abren desde la ficha de cada paciente.'}</p>
          {!filtered && <Link href="/panel/pacientes" className="mt-4 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Ir a pacientes</Link>}
        </div>
      ) : (
        <>
          <ul className="g-stagger divide-y divide-lila/50 rounded-card bg-white shadow-soft">
            {shown.map((c) => (
              <li key={c.caseId}>
                <Link href={`/panel/pacientes/${c.patientId}/casos/${c.caseId}`} className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-lila/30">
                  <span className="min-w-0">
                    <span className="block truncate text-xl font-semibold">{c.title}</span>
                    <span className="block truncate text-base text-tinta-suave">{c.patient} · {c.status === 'closed' ? 'abierto' : 'abierto'} el {fullDate(c.openedAt)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-base">
                    {c.status === 'closed' && <span className="rounded-full bg-white px-3 py-0.5 font-semibold text-tinta-suave ring-1 ring-tinta/30">Cerrado</span>}
                    {c.drafts > 0 && <span className="rounded-full bg-aviso-fondo px-3 py-0.5 font-semibold text-aviso-texto">{c.drafts === 1 ? '1 sin firmar' : `${c.drafts} sin firmar`}</span>}
                    <span className="text-tinta-suave">Última actividad: {when(c.lastAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination base="/panel/casos" params={{ q, estado: estado === 'abiertos' ? undefined : estado, borrador: borrador ? 'si' : undefined, orden: orden === 'reciente' ? undefined : orden }} page={page} total={total} pageSize={PAGE} noun={total === 1 ? 'caso' : 'casos'} />
        </>
      )}
    </div>
  )
}
