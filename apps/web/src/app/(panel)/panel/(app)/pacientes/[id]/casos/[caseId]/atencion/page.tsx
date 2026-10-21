import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertBadges } from '@/panel/components/alert-badges'
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
      <Link href={`/panel/pacientes/${id}/casos/${caseId}`} className="underline">← {c.title}</Link>
      <h1 className="text-3xl">Nueva evolución · {p.firstName} {p.lastName}</h1>
      <AlertBadges alerts={p.alerts} />
      <AttentionForm patientId={id} patientName={`${p.firstName} ${p.lastName}`} caseId={caseId} caseTitle={c.title} template={TEMPLATE} initial={{}} />
    </div>
  )
}
