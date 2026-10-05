import { BarList } from '@/panel/components/charts'
import { hydrate } from '@/panel/lib/state'
import { PatientSearch, type PatientRow } from '@/panel/components/patient-search'
import { age, isoToLocal } from '@/panel/lib/dates'
import { apptsOfPatient, entriesOf, norm, patients } from '@/panel/lib/store'
import { ALERT_LABEL, type Alert } from '@/panel/lib/types'

export const dynamic = 'force-dynamic'

export default async function Pacientes() {
  await hydrate()
  const now = Date.now()
  const rows: PatientRow[] = patients().map((p) => {
    const next = apptsOfPatient(p.id)
      .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show' && a.status !== 'done' && new Date(a.start).getTime() >= now - 3_600_000)
      .sort((a, b) => a.start.localeCompare(b.start))[0]
    const l = next ? isoToLocal(next.start) : null
    const hh = l ? `${String(Math.floor(l.minutes / 60)).padStart(2, '0')}:${String(l.minutes % 60).padStart(2, '0')}` : ''
    return {
      id: p.id, name: `${p.firstName} ${p.lastName}`, dni: p.dni, phone: p.phone, age: age(p.birthDate), alerts: p.alerts,
      visits: entriesOf(p.id).filter((e) => e.status === 'signed').length,
      nextLabel: l ? `${l.day.slice(8)}/${l.day.slice(5, 7)} · ${hh}` : '', nextTs: next ? new Date(next.start).getTime() : 0,
      search: norm(`${p.firstName} ${p.lastName} ${p.dni} ${p.phone}`),
    }
  })

  const withAlerts = rows.filter((r) => r.alerts.length).length
  const upcoming = rows.filter((r) => r.nextTs && r.nextTs - now < 7 * 86_400_000).length
  const minors = rows.filter((r) => r.age < 18).length
  const counts = (Object.keys(ALERT_LABEL) as Alert[]).map((a) => ({ label: ALERT_LABEL[a], value: rows.filter((r) => r.alerts.includes(a)).length, color: '#b45309', owner: 'Alerta clínica' })).filter((i) => i.value > 0).sort((a, b) => b.value - a.value)
  const stat = (n: number, label: string) => <div className="rounded-card bg-white p-4 shadow-soft"><p className="text-3xl font-normal">{n}</p><p className="mt-1 text-sm">{label}</p></div>

  return (
    <main>
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Pacientes</h1>
      <p className="mt-2">Pacientes ficticios para practicar. La búsqueda tolera tildes y errores de tipeo.</p>

      <section aria-label="Resumen" className="g-stagger mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat(rows.length, 'pacientes')}
        {stat(withAlerts, 'con alertas clínicas')}
        {stat(upcoming, 'con turno en los próximos 7 días')}
        {stat(minors, 'menores de edad')}
      </section>

      <div className="mt-6 min-w-0"><PatientSearch rows={rows} /></div>

      <section aria-labelledby="alertas-frecuentes" className="mt-6 rounded-card bg-white p-5 shadow-soft">
        <h2 id="alertas-frecuentes" className="sr-only">Alertas más frecuentes</h2>
        <BarList title="Alertas más frecuentes" unit="pacientes" columns={['Alerta', 'Tipo', 'Pacientes']} items={counts} series={[]} />
      </section>
    </main>
  )
}
