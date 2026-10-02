import { PatientSearch, type PatientRow } from '@/components/patient-search'
import { age } from '@/lib/dates'
import { norm, patients } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default function Pacientes() {
  const rows: PatientRow[] = patients().map((p) => ({
    id: p.id, name: `${p.firstName} ${p.lastName}`, dni: p.dni, phone: p.phone, age: age(p.birthDate), alerts: p.alerts,
    search: norm(`${p.firstName} ${p.lastName} ${p.dni} ${p.phone}`),
  }))
  return (
    <main>
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Pacientes</h1>
      <p className="mt-2 mb-6">Pacientes ficticios para practicar. La búsqueda tolera tildes y errores de tipeo.</p>
      <PatientSearch rows={rows} />
    </main>
  )
}
