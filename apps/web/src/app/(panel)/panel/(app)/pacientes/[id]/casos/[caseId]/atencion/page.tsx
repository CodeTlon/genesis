import { BackBar } from '@/panel/components/back-link'
import { notFound, redirect } from 'next/navigation'
import { AlertCard } from '@/panel/components/alert-card'
import { AttentionForm } from '@/panel/components/attention-form'
import { requireUser } from '@/panel/lib/auth-server'
import * as repo from '@/panel/lib/repo'
import { TEMPLATE } from '@/panel/lib/templates'

export const dynamic = 'force-dynamic'

export default async function Atencion({ params }: { params: Promise<{ id: string; caseId: string }> }) {
  await requireUser()
  const { id, caseId } = await params
  const [p, c] = await Promise.all([repo.getPatient(id), repo.getCase(caseId)])
  if (!p || !c || c.patientId !== id) notFound()
  if (c.status === 'closed') redirect(`/panel/pacientes/${id}/casos/${caseId}`)
  return (
    <div className="space-y-6">
      <BackBar trail={[{ href: '/panel/pacientes', label: 'Pacientes' }, { href: `/panel/pacientes/${id}`, label: `${p.firstName} ${p.lastName}` }, { href: `/panel/pacientes/${id}/casos/${caseId}`, label: c.title }]} />
      <h1 className="text-3xl">Nueva evolución · {p.firstName} {p.lastName}</h1>
      <div className="max-w-xl"><AlertCard alerts={p.alerts} /></div>
      <AttentionForm patientId={id} patientName={`${p.firstName} ${p.lastName}`} caseId={caseId} caseTitle={c.title} template={TEMPLATE} initial={{}} />
    </div>
  )
}
