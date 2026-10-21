import { notFound } from 'next/navigation'
import { EntryView } from '@/panel/components/entry-view'
import { PrintButton } from '@/panel/components/print-button'
import { ALERT_LABEL, ANTECEDENTE_ITEMS } from '@/panel/lib/types'
import { audit, requireUser } from '@/panel/lib/auth-server'
import * as repo from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'
const day = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

// Historia clínica completa para entregar copia al paciente (Ley 26.529). Se imprime o se guarda como PDF desde el navegador.
export default async function Historia({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const p = await repo.getPatient(id)
  if (!p) notFound()
  const [ant, cases, entries, consents] = await Promise.all([repo.latestAntecedentes(id), repo.listCases(id), repo.listEntries(id), repo.listConsents(id)])
  await audit(user.id, 'export', 'patient', id)
  return (
    <article className="space-y-8">
      <div className="flex items-start justify-between gap-4 print:hidden"><h1 className="text-3xl">Historia clínica</h1><PrintButton label="Imprimir / guardar PDF" /></div>
      <header>
        <h1 className="hidden text-2xl print:block">Historia clínica — Genesis Estética Integral</h1>
        <p className="text-xl font-semibold">{p.lastName}, {p.firstName}</p>
        <p>DNI {p.dni || '—'} · Nacimiento {p.birthDate ? day(p.birthDate) : '—'} · Tel. {p.phone || '—'}</p>
        <p>{p.address || '—'} · {p.occupation || '—'} · {p.insurance || 'Sin cobertura informada'}</p>
        <p>Contacto de emergencia: {p.emergencyContact || '—'}</p>
        <p className="text-sm">Emitida el {day(new Date().toISOString())} por {user.name}{user.licenseNo ? ` (M.P. ${user.licenseNo})` : ''}.</p>
      </header>
      <section><h2 className="text-xl">Antecedentes</h2>
        {ant ? (<>
          <p>{ANTECEDENTE_ITEMS.filter((it) => ant.flags[it.id]).map((it) => it.label).join(', ') || 'Sin antecedentes marcados.'}</p>
          {ant.medication && <p>Medicación: {ant.medication}</p>}{ant.footwear && <p>Calzado: {ant.footwear}</p>}{ant.activity && <p>Actividad: {ant.activity}</p>}{ant.notes && <p>{ant.notes}</p>}
        </>) : <p>Sin antecedentes registrados.</p>}
        {p.alerts.length > 0 && <p className="mt-1 font-semibold">Alertas: {p.alerts.map((a) => ALERT_LABEL[a]).join(', ')}</p>}
      </section>
      <section><h2 className="text-xl">Consentimientos</h2>
        <ul>{consents.map((c) => <li key={c.id}>{c.kind}: otorgado {day(c.grantedAt)}{c.revokedAt ? `, revocado ${day(c.revokedAt)}` : ''}</li>)}{!consents.length && <li>Ninguno registrado.</li>}</ul>
      </section>
      {cases.map((c) => (
        <section key={c.id} className="space-y-3 break-inside-avoid-page">
          <h2 className="text-xl">{c.title} <span className="text-base font-normal">({c.status === 'open' ? 'abierto' : 'cerrado'}, desde {day(c.openedAt)})</span></h2>
          {c.reason && <p>Motivo: {c.reason}</p>}
          {entries.filter((e) => e.caseId === c.id).map((e) => <EntryView key={e.id} entry={e} />)}
          {c.status === 'closed' && <p><strong>Conclusión:</strong> {c.conclusion}{c.suggestions && <><br /><strong>Sugerencias:</strong> {c.suggestions}</>}</p>}
        </section>
      ))}
    </article>
  )
}
