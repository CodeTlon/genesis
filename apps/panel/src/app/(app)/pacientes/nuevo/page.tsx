import Link from 'next/link'
import { PatientForm } from '@/components/patient-form'

export const dynamic = 'force-dynamic'

export default function NuevoPaciente() {
  return (
    <main>
      <Link href="/pacientes" className="inline-flex min-h-touch items-center underline">← Pacientes</Link>
      <h1 className="mt-2 mb-6 text-3xl font-light uppercase tracking-[0.15em]">Nuevo paciente</h1>
      <PatientForm />
    </main>
  )
}
