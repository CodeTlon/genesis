import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertBadges } from '@/panel/components/alert-badges'
import { AntecedentesForm, OpenCaseForm, PatientForm } from '@/panel/components/forms'
import { Consents } from '@/panel/components/photos'
import { audit, requireUser } from '@/panel/lib/auth-server'
import * as repo from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const day = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const p = await repo.getPatient(id)
  if (!p) notFound()
  const [ant, cases, consents] = await Promise.all([repo.latestAntecedentes(id), repo.listCases(id), repo.listConsents(id)])
  await audit(user.id, 'view_patient', 'patient', id)
  return (
    <div className="space-y-10">
      <div>
        <Link href="/panel/pacientes" className="underline">← Pacientes</Link>
        <h1 className="mt-2 text-3xl">{p.firstName} {p.lastName}</h1>
        <div className="mt-2"><AlertBadges alerts={p.alerts} /></div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={`/panel/pacientes/${id}/historia`} className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Historia clínica completa (imprimir / PDF)</Link>
        </div>
      </div>

      <section aria-labelledby="casos" className="space-y-3">
        <h2 id="casos" className="text-xl uppercase tracking-[0.06em]">Casos y tratamientos</h2>
        {cases.length === 0 ? <p>Todavía no hay casos. Abrí el primero para empezar a registrar evoluciones.</p> : (
          <ul className="divide-y divide-lila/50 rounded-card bg-white shadow-soft">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={`/panel/pacientes/${id}/casos/${c.id}`} className="flex min-h-touch flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-lila/30">
                  <span className="font-semibold">{c.title}</span>
                  <span className="text-sm">{c.status === 'open' ? 'Abierto' : 'Cerrado'} · desde {day(c.openedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <details className="rounded-card bg-white p-4 shadow-soft"><summary className="min-h-touch cursor-pointer font-semibold">Abrir un caso nuevo</summary><div className="mt-3"><OpenCaseForm patientId={id} /></div></details>
      </section>

      <section aria-labelledby="ant" className="space-y-3">
        <h2 id="ant" className="text-xl uppercase tracking-[0.06em]">Antecedentes</h2>
        <div className="rounded-card bg-white p-5 shadow-soft"><AntecedentesForm patientId={id} current={ant} /></div>
      </section>

      <section aria-labelledby="cons" className="space-y-3">
        <h2 id="cons" className="text-xl uppercase tracking-[0.06em]">Consentimientos</h2>
        <Consents patientId={id} consents={consents} />
      </section>

      <section aria-labelledby="datos" className="space-y-3">
        <h2 id="datos" className="text-xl uppercase tracking-[0.06em]">Datos personales</h2>
        <div className="rounded-card bg-white p-5 shadow-soft"><PatientForm patient={p} /></div>
      </section>
    </div>
  )
}
