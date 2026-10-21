import Link from 'next/link'
import { PatientForm } from '@/panel/components/forms'
import { requireUser } from '@/panel/lib/auth-server'

export default async function Nuevo() {
  await requireUser()
  return (
    <div className="space-y-6">
      <Link href="/panel/pacientes" className="underline">← Pacientes</Link>
      <h1 className="text-3xl">Nuevo paciente</h1>
      <PatientForm />
    </div>
  )
}
