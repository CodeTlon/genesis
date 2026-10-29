import Link from 'next/link'
import { FilterBar } from '@/panel/components/filter-bar'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { requireUser } from '@/panel/lib/auth-server'
import { fullDate } from '@/panel/lib/format'
import { countAttentions, listAttentions, type AttentionFilters } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const PAGE = 25
const ESTADOS = ['todas', 'borradores', 'firmadas'] as const
const PERIODOS = ['todas', 'hoy', '7', 'mes', 'mes-pasado', '90'] as const
const ORDENES = ['reciente', 'antiguo'] as const
const pick = <T extends string>(list: readonly T[], v: string | undefined, def: T): T => ((list as readonly string[]).includes(v ?? '') ? (v as T) : def)

export default async function Atenciones({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; estado?: string; periodo?: string; orden?: string }> }) {
  await requireUser()
  const sp = await searchParams
  const q = sp.q?.trim() || undefined
  const estado = pick(ESTADOS, sp.estado, 'todas')
  const periodo = pick(PERIODOS, sp.periodo, 'todas')
  const orden = pick(ORDENES, sp.orden, 'reciente')
  const f: AttentionFilters = { q, estado, periodo, orden }
  const total = await countAttentions(f)
  const page = parsePage(sp.page, Math.ceil(total / PAGE))
  const shown = await listAttentions({ ...f, limit: PAGE, offset: (page - 1) * PAGE })
  const filtered = !!q || estado !== 'todas' || periodo !== 'todas'
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Atenciones</h1>
        <p className="mt-1 text-tinta-suave">Cada evolución que se escribe en un caso, de todos los pacientes.</p>
      </header>
      <FilterBar base="/panel/atenciones" q={q ?? ''} placeholder="Buscar por paciente o caso" groups={[
        { key: 'estado', label: 'Estado', value: estado, options: [{ value: 'todas', label: 'Todas' }, { value: 'borradores', label: 'Borradores (sin firmar)' }, { value: 'firmadas', label: 'Firmadas' }] },
        { key: 'periodo', label: 'Período', value: periodo, options: [{ value: 'todas', label: 'Todo el tiempo' }, { value: 'hoy', label: 'Hoy' }, { value: '7', label: 'Últimos 7 días' }, { value: 'mes', label: 'Este mes' }, { value: 'mes-pasado', label: 'Mes pasado' }, { value: '90', label: 'Últimos 90 días' }] },
        { key: 'orden', label: 'Orden', value: orden, options: [{ value: 'reciente', label: 'Más recientes primero' }, { value: 'antiguo', label: 'Más antiguas primero' }] },
      ]} />
      {shown.length === 0 ? (
        <div className="rounded-card border border-tinta/10 bg-white p-8 text-center shadow-soft">
          <p className="text-xl font-semibold">{filtered ? 'No hay atenciones con esos filtros' : 'Todavía no hay atenciones'}</p>
          <p className="mt-1 text-tinta-suave">{filtered ? 'Probá con otro texto, estado o período.' : 'Las atenciones se empiezan desde el caso de cada paciente.'}</p>
        </div>
      ) : (
        <>
          <ul className="g-stagger divide-y divide-tinta/10 rounded-card border border-tinta/10 bg-white shadow-soft">
            {shown.map((p) => (
              <li key={p.entryId}>
                <Link href={p.caseId ? `/panel/pacientes/${p.patientId}/casos/${p.caseId}` : `/panel/pacientes/${p.patientId}`} className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-lila/30">
                  <span className="min-w-0">
                    <span className="block truncate text-xl font-semibold">{p.patient}</span>
                    <span className="block truncate text-base text-tinta-suave">{p.caseTitle ?? 'Sin caso'}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-3 py-0.5 text-base font-semibold ${p.status === 'draft' ? 'bg-aviso-fondo text-aviso-texto' : 'bg-ok-fondo text-ok-texto'}`}>{p.status === 'draft' ? 'Borrador' : 'Firmada'} · {fullDate(p.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination base="/panel/atenciones" params={{ q, estado: estado === 'todas' ? undefined : estado, periodo: periodo === 'todas' ? undefined : periodo, orden: orden === 'reciente' ? undefined : orden }} page={page} total={total} pageSize={PAGE} noun={total === 1 ? 'atención' : 'atenciones'} />
        </>
      )}
    </div>
  )
}
