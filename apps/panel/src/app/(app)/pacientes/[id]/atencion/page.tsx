import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TemplateForm } from '@/components/template-form'
import { AlertBadges } from '@/components/alert-badges'
import { fmtDate, fmtTime } from '@/lib/dates'
import { appt, lastSigned, patient, service } from '@/lib/store'
import { TEMPLATES } from '@/lib/templates'
import type { TemplateCode } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Atencion({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ plantilla?: string; turno?: string }>
}) {
  const { id } = await params
  const { plantilla, turno } = await searchParams
  const p = patient(id)
  if (!p) notFound()

  const t = turno ? appt(turno) : undefined
  const svc = t ? service(t.serviceId) : undefined
  const code = ((plantilla ?? svc?.templateCode ?? 'B') as TemplateCode)
  const template = TEMPLATES[code] ?? TEMPLATES.B

  // "Chart by exception": precarga con la última entrada firmada de la misma plantilla
  const prev = lastSigned(p.id, template.code)
  const initial = prev ? structuredClone(prev.payload) : Object.fromEntries(template.fields.filter((f) => f.default !== undefined).map((f) => [f.id, f.default]))
  const prefilledFrom = prev ? fmtDate(prev.createdAt.slice(0, 10)) : undefined

  const next = t && svc
    ? { serviceId: svc.id, professionalId: t.professionalId, resource: t.resource, time: fmtTime(t.start) }
    : (() => { const s = service(template.code === 'C' ? 's3' : 's1')!; return { serviceId: s.id, professionalId: template.code === 'C' ? 'pr2' : 'pr1', resource: template.code === 'C' ? 'Equipo láser' : 'Camilla 1', time: '10:00' } })()

  return (
    <main>
      <Link href={`/pacientes/${p.id}`} className="inline-flex min-h-touch items-center underline">← Ficha de {p.firstName}</Link>
      <h1 className="mt-2 text-3xl font-normal uppercase tracking-[0.06em]">{template.name}</h1>
      <p className="mt-1 text-lg">{p.firstName} {p.lastName}</p>
      <div className="mt-2 mb-6"><AlertBadges alerts={p.alerts} /></div>
      <TemplateForm patientId={p.id} patientName={`${p.firstName} ${p.lastName}`} template={template} initial={initial} prefilledFrom={prefilledFrom} next={next} />
    </main>
  )
}
