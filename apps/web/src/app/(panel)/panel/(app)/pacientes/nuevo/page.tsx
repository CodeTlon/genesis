import { BackBar } from '@/panel/components/back-link'
import { PatientForm } from '@/panel/components/forms'
import { requireUser } from '@/panel/lib/auth-server'

export default async function Nuevo() {
  await requireUser()
  return (
    <div className="space-y-6">
      <BackBar trail={[{ href: '/panel/pacientes', label: 'Pacientes' }]} />
      <h1 className="text-3xl">Nuevo paciente</h1>
      <PatientForm />
    </div>
  )
}
