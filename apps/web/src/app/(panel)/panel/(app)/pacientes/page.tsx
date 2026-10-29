import Link from 'next/link'
import { AlertSummary } from '@/panel/components/alert-card'
import { FilterBar } from '@/panel/components/filter-bar'
import { requireUser } from '@/panel/lib/auth-server'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { countPatients, listPatients, type PatientFilters } from '@/panel/lib/repo'
import { ALERT_LABEL, type Alert } from '@/panel/lib/types'

export const dynamic = 'force-dynamic'

const PAGE = 25

const FILTROS = ['todos', 'alertas', 'caso-abierto', 'sin-casos', 'menores'] as const
const ORDENES = ['apellido', 'recientes'] as const
const pick = <T extends string>(list: readonly T[], v: string | undefined, def: T): T => (list as readonly string[]).includes(v ?? '') ? (v as T) : def

export default async function Pacientes({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; filtro?: string; alerta?: string; orden?: string }> }) {
  await requireUser()
  const sp = await searchParams
  const q = sp.q?.trim() || undefined
  const filtro = pick(FILTROS, sp.filtro, 'todos')
  const orden = pick(ORDENES, sp.orden, 'apellido')
  const alerta = (Object.keys(ALERT_LABEL) as Alert[]).find((a) => a === sp.alerta)
  const f: PatientFilters = { filter: filtro === 'todos' ? undefined : filtro, alert: alerta, orden }
  const total = await countPatients(q, f)
  const page = parsePage(sp.page, Math.ceil(total / PAGE))
  const shown = await listPatients(q, PAGE, (page - 1) * PAGE, f)
  const filtered = !!q || filtro !== 'todos' || !!alerta
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Pacientes</h1>
        <Link href="/panel/pacientes/nuevo" className="inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Nuevo paciente
        </Link>
      </div>
      <FilterBar base="/panel/pacientes" q={q ?? ''} placeholder="Buscar por nombre, DNI o teléfono" groups={[
        { key: 'filtro', label: 'Mostrar', value: filtro, options: [{ value: 'todos', label: 'Todos' }, { value: 'alertas', label: 'Con alertas' }, { value: 'caso-abierto', label: 'Con caso abierto' }, { value: 'sin-casos', label: 'Sin casos' }, { value: 'menores', label: 'Menores' }] },
        { key: 'alerta', label: 'Alerta', value: alerta ?? '', options: [{ value: '', label: 'Cualquiera' }, ...(Object.keys(ALERT_LABEL) as Alert[]).map((a) => ({ value: a, label: ALERT_LABEL[a] }))] },
        { key: 'orden', label: 'Orden', value: orden, options: [{ value: 'apellido', label: 'Apellido A–Z' }, { value: 'recientes', label: 'Más recientes' }] },
      ]} />
      {shown.length === 0 ? (
        <div className="rounded-card bg-white p-8 text-center shadow-soft">
          <p className="text-xl font-semibold">{filtered ? 'No hay pacientes con esos filtros' : 'Todavía no hay pacientes'}</p>
          <p className="mt-1 text-tinta-suave">{filtered ? 'Probá con otro nombre, o sacá algún filtro.' : 'Cargá el primero para empezar su historia clínica.'}</p>
          {!filtered && <Link href="/panel/pacientes/nuevo" className="mt-4 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Cargar primer paciente</Link>}
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
                    <AlertSummary alerts={p.alerts} />
                    <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination base="/panel/pacientes" params={{ q, filtro: filtro === 'todos' ? undefined : filtro, alerta, orden: orden === 'apellido' ? undefined : orden }} page={page} total={total} pageSize={PAGE} noun={total === 1 ? 'paciente' : 'pacientes'} />
        </>
      )}
    </div>
  )
}
