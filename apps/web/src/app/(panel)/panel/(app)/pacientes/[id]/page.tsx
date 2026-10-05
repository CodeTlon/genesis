import Link from 'next/link'
import { hydrate } from '@/panel/lib/state'
import { IconArrowLeft } from '@/panel/components/icons'
import { notFound } from 'next/navigation'
import { AlertBadges } from '@/panel/components/alert-badges'
import { EntryView } from '@/panel/components/entry-view'
import { StatusBadge } from '@/panel/components/status-actions'
import { age, fmtDate, fmtTime, isoToLocal } from '@/panel/lib/dates'
import { apptsOfPatient, entriesOf, patient, service } from '@/panel/lib/store'
import { TEMPLATES } from '@/panel/lib/templates'

export const dynamic = 'force-dynamic'

const Consent = ({ label, v }: { label: string; v: 'vigente' | 'pendiente' }) => (
  <li className={`rounded-full px-3 py-1 text-sm ${v === 'vigente' ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950'}`}>{label}: {v}</li>
)

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await hydrate()
  const p = patient(id)
  if (!p) notFound()
  const entries = entriesOf(p.id)
  const appts = apptsOfPatient(p.id).sort((a, b) => b.start.localeCompare(a.start))
  const a = age(p.birthDate)

  return (
    <main>
      <Link href="/panel/pacientes" className="inline-flex min-h-touch items-center underline"><IconArrowLeft /> Pacientes</Link>
      <header className="rounded-card bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-normal">{p.firstName} {p.lastName}</h1>
        <div className="mt-2"><AlertBadges alerts={p.alerts} /></div>
        <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm text-tinta/70">Edad</dt><dd>{a} años ({fmtDate(p.birthDate)})</dd></div>
          <div><dt className="text-sm text-tinta/70">DNI (ficticio)</dt><dd>{p.dni}</dd></div>
          <div><dt className="text-sm text-tinta/70">Teléfono</dt><dd>{p.phone}</dd></div>
          {p.insurance && <div><dt className="text-sm text-tinta/70">Obra social</dt><dd>{p.insurance}</dd></div>}
          {p.guardian && <div><dt className="text-sm text-tinta/70">Responsable legal</dt><dd>{p.guardian}</dd></div>}
          <div><dt className="text-sm text-tinta/70">Plantillas ortopédicas</dt><dd>{p.usesInsoles === undefined ? '—' : p.usesInsoles ? 'Sí' : 'No'}</dd></div>
          {p.medication && <div className="sm:col-span-2"><dt className="text-sm text-tinta/70">Medicación</dt><dd>{p.medication}</dd></div>}
        </dl>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Consentimientos">
          <Consent label="Tratamiento de datos" v={p.consent.data} />
          <Consent label="Imagen clínica" v={p.consent.imageClinical} />
          <Consent label="Imagen pública" v={p.consent.imagePublic} />
        </ul>
        {p.guardian && <p className="mt-3 text-sm">Menor de 18: el consentimiento lo firma el responsable.</p>}
      </header>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        {(['A', 'B', 'C'] as const).map((c) => (
          <Link key={c} href={`/panel/pacientes/${p.id}/atencion?plantilla=${c}`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white">
            Registrar: {TEMPLATES[c].name}
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-normal uppercase tracking-[0.06em]">Turnos</h2>
      <ul className="mt-3 space-y-2">
        {appts.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-card bg-white p-3 shadow-soft">
            <span>{fmtDate(isoToLocal(t.start).day)} {fmtTime(t.start)}</span>
            <span>{service(t.serviceId)?.name}</span>
            <StatusBadge status={t.status} />
          </li>
        ))}
        {!appts.length && <li>Sin turnos.</li>}
      </ul>

      <h2 className="mt-10 text-xl font-normal uppercase tracking-[0.06em]">Línea de tiempo clínica</h2>
      <div className="mt-3 space-y-4">
        {entries.map((e) => <EntryView key={e.id} entry={e} />)}
        {!entries.length && <p>Todavía no hay atenciones registradas.</p>}
      </div>
    </main>
  )
}
