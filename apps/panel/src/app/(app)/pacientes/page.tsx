import Link from 'next/link'
import { PatientSearch, type PatientRow } from '@/components/patient-search'
import { age } from '@/lib/dates'
import { norm, patients } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function Pacientes() {
  const rows: PatientRow[] = (await patients()).map((p) => ({
    id: p.id, name: `${p.firstName} ${p.lastName}`, dni: p.dni, phone: p.phone, age: age(p.birthDate), alerts: p.alerts,
    search: norm(`${p.firstName} ${p.lastName} ${p.dni} ${p.phone}`),
  }))
  return (
    <main>
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Pacientes</h1>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3"><p>La búsqueda tolera tildes y errores de tipeo.</p><Link href="/pacientes/nuevo" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white">Nuevo paciente</Link></div>
      <PatientSearch rows={rows} />
    </main>
  )
}
