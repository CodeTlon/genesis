import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PatientForm } from '@/components/patient-form'
import { patient } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function EditarPaciente({ params }: { params: Promise<{ id: string }> }) {
  const p = await patient((await params).id)
  if (!p) notFound()
  return (
    <main>
      <Link href={`/pacientes/${p.id}`} className="inline-flex min-h-touch items-center underline">← Ficha de {p.firstName}</Link>
      <h1 className="mt-2 mb-6 text-3xl font-light uppercase tracking-[0.15em]">Editar datos</h1>
      <PatientForm patient={p} />
    </main>
  )
}
