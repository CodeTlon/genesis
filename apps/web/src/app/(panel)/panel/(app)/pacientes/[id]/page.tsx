import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertCard } from '@/panel/components/alert-card'
import { BackBar } from '@/panel/components/back-link'
import { Editable } from '@/panel/components/editable'
import { AntecedentesForm, OpenCaseForm, PatientForm } from '@/panel/components/forms'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { Tabs } from '@/panel/components/tabs'
import { audit, requireUser } from '@/panel/lib/auth-server'
import * as repo from '@/panel/lib/repo'
import { ANTECEDENTE_ITEMS, type Antecedentes, type Patient } from '@/panel/lib/types'

export const dynamic = 'force-dynamic'

const CASES_PAGE = 10

const day = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')
const TABS = ['casos', 'antecedentes', 'datos'] as const
type Tab = (typeof TABS)[number]

const ageOf = (birth: string) => {
  if (!birth) return ''
  const b = new Date(birth)
  const n = new Date()
  let a = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--
  return a >= 0 ? `${a} años` : ''
}

function Row({ label, value }: { label: string; value?: string }) {
  return <div><dt className="text-base text-tinta-suave">{label}</dt><dd className="text-lg">{value || <span className="text-tinta-suave">Sin dato</span>}</dd></div>
}

function PatientSummary({ p }: { p: Patient }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      <Row label="DNI" value={p.dni} />
      <Row label="Fecha de nacimiento" value={p.birthDate && `${day(p.birthDate)} (${ageOf(p.birthDate)})`} />
      <Row label="Teléfono" value={p.phone} />
      <Row label="Domicilio" value={p.address} />
      <Row label="Obra social / prepaga" value={p.insurance} />
      <Row label="Contacto de emergencia" value={p.emergencyContact} />
      {p.guardian && <Row label="Responsable" value={p.guardian} />}
      <Row label="Ocupación" value={p.occupation} />
    </dl>
  )
}

function AntecedentesSummary({ a }: { a: Antecedentes | null }) {
  if (!a) return <p className="text-lg">Todavía no se cargaron antecedentes.</p>
  const marked = ANTECEDENTE_ITEMS.filter((i) => a.flags[i.id])
  return (
    <div className="space-y-3">
      {marked.length === 0 ? <p className="text-lg">Sin antecedentes marcados.</p> : (
        <ul className="flex flex-wrap gap-2">
          {marked.map((i) => <li key={i.id} className={`rounded-full px-4 py-1.5 text-base font-semibold ring-1 ${i.alert ? 'bg-aviso-fondo text-aviso-texto ring-aviso-texto/30' : 'bg-white ring-tinta/30'}`}>{i.label}</li>)}
        </ul>
      )}
      {a.medication && <p><span className="text-tinta-suave">Medicación:</span> {a.medication}</p>}
      <p className="text-base text-tinta-suave">Versión {a.version}, guardada el {new Date(a.createdAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}.</p>
    </div>
  )
}

export default async function Ficha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; page?: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const { tab: rawTab, page: rawPage } = await searchParams
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'casos'
  const p = await repo.getPatient(id)
  if (!p) notFound()
  const [ant, cases] = await Promise.all([repo.latestAntecedentes(id), repo.listCases(id)])
  const casesPage = parsePage(rawPage, Math.ceil(cases.length / CASES_PAGE))
  await audit(user.id, 'view_patient', 'patient', id)
  const openCase = cases.find((c) => c.status === 'open')
  const base = `/panel/pacientes/${id}`
  const meta = [ageOf(p.birthDate), p.phone].filter(Boolean).join(' · ')
  return (
    <div className="space-y-6">
      <BackBar trail={[{ href: '/panel/pacientes', label: 'Pacientes' }]} />
      <header className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="flex items-start gap-4">
          <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-lila/50 text-2xl font-semibold text-violeta-oscuro">{p.firstName[0]}{p.lastName[0]}</span>
          <div className="min-w-0 space-y-1">
            <h1 className="text-3xl leading-tight">{p.firstName} {p.lastName}</h1>
            {meta && <p className="text-base text-tinta-suave">{meta}</p>}
            <div className="flex flex-wrap gap-3 pt-3">
              {openCase
                ? <Link href={`${base}/casos/${openCase.id}/atencion`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Nueva atención</Link>
                : <Link href={`${base}?tab=casos`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Abrir un caso</Link>}
              <Link href={`${base}/historia`} className="inline-flex min-h-touch items-center rounded-control border border-tinta/25 bg-white px-5 font-semibold hover:bg-lila/30">Historia clínica (imprimir / PDF)</Link>
            </div>
          </div>
        </div>
        <AlertCard alerts={p.alerts} />
      </header>

      <Tabs base={base} current={tab} items={[{ id: 'casos', label: 'Casos', badge: cases.length }, { id: 'antecedentes', label: 'Antecedentes' }, { id: 'datos', label: 'Datos' }]} />

      <div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="g-enter space-y-4 outline-offset-4">
        {tab === 'casos' && (
          <>
            {cases.length === 0 ? <p className="rounded-card bg-white p-6 text-lg shadow-soft">Todavía no hay casos. Abrí el primero (por ejemplo: uñero pie derecho) para empezar a registrar evoluciones.</p> : (
              <>
              <ul className="g-stagger divide-y divide-lila/50 rounded-card bg-white shadow-soft">
                {cases.slice((casesPage - 1) * CASES_PAGE, casesPage * CASES_PAGE).map((c) => (
                  <li key={c.id}>
                    <Link href={`${base}/casos/${c.id}`} className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-lila/30">
                      <span className="text-lg font-semibold">{c.title}</span>
                      <span className={`rounded-full px-3 py-0.5 text-base font-semibold ${c.status === 'open' ? 'bg-ok-fondo text-ok-texto' : 'bg-white text-tinta-suave ring-1 ring-tinta/30'}`}>{c.status === 'open' ? 'Abierto' : 'Cerrado'} · desde {day(c.openedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Pagination base={base} params={{ tab: 'casos' }} page={casesPage} total={cases.length} pageSize={CASES_PAGE} noun={cases.length === 1 ? 'caso' : 'casos'} />
              </>
            )}
            <details className="g-acc rounded-card bg-white p-4 shadow-soft">
              <summary className="flex min-h-touch items-center justify-between text-lg font-semibold text-violeta-oscuro">Abrir un caso nuevo<svg aria-hidden viewBox="0 0 24 24" className="g-chev size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg></summary>
              <div className="mt-3"><OpenCaseForm patientId={id} /></div>
            </details>
          </>
        )}
        {tab === 'antecedentes' && (
          <div className="rounded-card bg-white p-5 shadow-soft">
            <Editable summary={<AntecedentesSummary a={ant} />} editLabel="Editar antecedentes"><AntecedentesForm patientId={id} current={ant} /></Editable>
          </div>
        )}
        {tab === 'datos' && (
          <div className="rounded-card bg-white p-5 shadow-soft">
            <Editable summary={<PatientSummary p={p} />} editLabel="Editar datos"><PatientForm patient={p} /></Editable>
          </div>
        )}
      </div>
    </div>
  )
}
