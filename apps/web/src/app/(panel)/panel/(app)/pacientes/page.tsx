import Link from 'next/link'
import { AlertBadges } from '@/panel/components/alert-badges'
import { requireUser } from '@/panel/lib/auth-server'
import { listPatients } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

export default async function Pacientes({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser()
  const { q } = await searchParams
  const rows = await listPatients(q)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Pacientes</h1>
        <Link href="/panel/pacientes/nuevo" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white max-md:hidden">Nuevo paciente</Link>
      </div>
      <form role="search" className="flex gap-2">
        <label className="sr-only" htmlFor="q">Buscar por nombre, DNI o teléfono</label>
        <input id="q" name="q" defaultValue={q} placeholder="Buscar: nombre, apellido, DNI o teléfono" className="min-h-touch w-full max-w-xl flex-1 rounded-control border border-tinta/60 bg-white px-4 placeholder:text-tinta/60" />
        <button className="min-h-touch rounded-control bg-violeta-oscuro px-5 font-semibold text-white">Buscar</button>
      </form>
      {rows.length === 0 ? (
        <p className="rounded-card bg-white p-6 shadow-soft">{q ? 'No encontramos pacientes con esa búsqueda.' : 'Todavía no hay pacientes. Creá el primero con "Nuevo paciente".'}</p>
      ) : (
        <ul className="divide-y divide-lila/50 rounded-card bg-white shadow-soft">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/panel/pacientes/${p.id}`} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-lila/30">
                <span className="min-w-0"><span className="block text-lg font-semibold">{p.lastName}, {p.firstName}</span>{p.dni && <span className="block text-sm text-tinta/70">DNI {p.dni}</span>}</span>
                <AlertBadges alerts={p.alerts} compact max={3} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
