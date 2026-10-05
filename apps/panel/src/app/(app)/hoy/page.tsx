import Link from 'next/link'
import { AlertBadges } from '@/components/alert-badges'
import { IconCake, IconWarning } from '@/components/icons'
import { StatusActions, StatusBadge } from '@/components/status-actions'
import { PrintButton } from '@/components/print-button'
import CountUp from '@genesis/ui/vendor/CountUp'
import { age, fmtDateLong, fmtTime, isBirthdayToday, todayKey } from '@/lib/dates'
import { apptsOn, patient, patients, professional, PROFESSIONALS, service } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default function Hoy() {
  const day = todayKey()
  const appts = apptsOn(day).filter((a) => a.status !== 'cancelled')
  const count = (s: string) => appts.filter((a) => a.status === s).length
  const done = count('done')
  const cumples = patients().filter((p) => isBirthdayToday(p.birthDate, day))
  const menores = appts.filter((a) => patient(a.patientId)?.guardian)
  const conAlertas = appts.filter((a) => patient(a.patientId)?.alerts.length)
  const pct = appts.length ? Math.round((done / appts.length) * 100) : 0
  const th = 'px-4 py-3 text-left font-semibold'

  const stat = (n: number, label: string, warn = false) => (
    <div className={`rounded-card p-4 shadow-soft ${warn && n > 0 ? 'bg-amber-100 text-amber-950' : 'bg-white'}`}>
      <p className="text-3xl font-normal"><CountUp to={n} duration={1.2} /></p>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  )

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Hoy</h1>
          <p className="mt-1 first-letter:uppercase">{fmtDateLong(day)}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <PrintButton />
          <Link href="/agenda" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white hover:bg-tinta">Ver agenda</Link>
        </div>
      </div>

      <section aria-label="Resumen" className="g-stagger mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat(appts.length, 'turnos hoy')}
        {stat(count('pending'), 'a confirmar', true)}
        {stat(count('in_room'), 'en sala')}
        {stat(done, 'atendidos')}
      </section>

      <div className="mt-4 rounded-card bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between"><p className="font-semibold">Avance del día</p><p>{done} de {appts.length} turnos · {pct}%</p></div>
        <div className="mt-2 h-3 rounded-full bg-lila/30" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance del día"><div className="h-3 rounded-full bg-violeta-oscuro transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="turnos" className="min-w-0">
          <h2 id="turnos" className="text-xl font-normal uppercase tracking-[0.06em]">Turnos del día</h2>

          {/* Escritorio: tabla */}
          <div className="relative mt-3 hidden overflow-x-auto rounded-card bg-white shadow-soft md:block">
            <table className="w-full min-w-[54rem] table-fixed text-left">
              <caption className="sr-only">Turnos de hoy</caption>
              <colgroup><col className="w-20" /><col className="w-44" /><col className="w-44" /><col className="w-48" /><col /></colgroup>
              <thead className="border-b border-lila/60 bg-lila/20">
                <tr><th scope="col" className={th}>Hora</th><th scope="col" className={th}>Paciente</th><th scope="col" className={th}>Tratamiento</th><th scope="col" className={th}>Alertas</th><th scope="col" className={th}>Estado y acciones</th></tr>
              </thead>
              <tbody>
                {appts.map((a) => {
                  const p = patient(a.patientId)!, pr = professional(a.professionalId)!, s = service(a.serviceId)!
                  return (
                    <tr key={a.id} className="border-b border-lila/30 align-top last:border-0">
                      <td className="px-4 py-3 text-xl whitespace-nowrap">{fmtTime(a.start)}</td>
                      <td className="px-4 py-3"><Link href={`/pacientes/${p.id}`} className="font-semibold hover:underline">{p.firstName} {p.lastName}</Link><p className="text-sm">{age(p.birthDate, day)} años</p></td>
                      <td className="px-4 py-3"><p>{s.name}</p><p className="flex items-center gap-2 text-sm"><span aria-hidden className="size-2.5 rounded-sm" style={{ background: pr.color }} />{pr.area} · {a.resource} · {a.durationMin} min</p></td>
                      <td className="px-4 py-3">{p.alerts.length ? <AlertBadges alerts={p.alerts} /> : <span className="text-tinta/60">—</span>}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                        <div className="mt-2 flex flex-wrap gap-2 print:hidden">
                          <StatusActions id={a.id} status={a.status} compact />
                          {a.status === 'in_room' && <Link href={`/pacientes/${p.id}/atencion?turno=${a.id}`} className="inline-flex min-h-10 items-center rounded-control bg-violeta-oscuro px-3 text-sm text-white hover:bg-tinta">Registrar atención</Link>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!appts.length && <tr><td colSpan={5} className="px-4 py-6">No hay turnos para hoy.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Celular: lista compacta */}
          <ul className="mt-3 space-y-3 md:hidden">
            {appts.map((a) => {
              const p = patient(a.patientId)!, s = service(a.serviceId)!
              return (
                <li key={a.id} className="rounded-card bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="text-lg"><span className="font-semibold">{fmtTime(a.start)}</span> · {p.firstName} {p.lastName}</p><p className="truncate text-sm">{s.name} · {a.resource}</p></div>
                    <StatusBadge status={a.status} />
                  </div>
                  {p.alerts.length > 0 && <div className="mt-2"><AlertBadges alerts={p.alerts} /></div>}
                  <div className="mt-3 flex flex-wrap gap-2"><StatusActions id={a.id} status={a.status} />{a.status === 'in_room' && <Link href={`/pacientes/${p.id}/atencion?turno=${a.id}`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-4 text-white">Registrar atención</Link>}</div>
                </li>
              )
            })}
            {!appts.length && <li>No hay turnos para hoy.</li>}
          </ul>
        </section>

        <aside className="grid min-w-0 gap-4 md:grid-cols-2 2xl:block 2xl:space-y-4" aria-label="Avisos y carga del día">
          <section className="rounded-card bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Avisos</h2>
            <ul className="mt-3 space-y-3">
              {cumples.map((p) => <li key={p.id} className="flex gap-3 rounded-control bg-lila/40 p-3"><IconCake className="mt-0.5 size-5 text-violeta-oscuro" /><span>Hoy cumple años <strong>{p.firstName} {p.lastName}</strong>.</span></li>)}
              {menores.length > 0 && <li className="flex gap-3 rounded-control bg-amber-100 p-3 text-amber-950"><IconWarning className="mt-0.5 size-5" /><span>{menores.length === 1 ? '1 turno con un menor' : `${menores.length} turnos con menores`}: el consentimiento lo firma el responsable.</span></li>}
              {conAlertas.length > 0 && <li className="flex gap-3 rounded-control bg-amber-100 p-3 text-amber-950"><IconWarning className="mt-0.5 size-5" /><span>{conAlertas.length} {conAlertas.length === 1 ? 'paciente con alerta clínica' : 'pacientes con alertas clínicas'} hoy. Mirá la columna Alertas.</span></li>}
              {!cumples.length && !menores.length && !conAlertas.length && <li>Sin avisos para hoy.</li>}
            </ul>
          </section>
          <section className="rounded-card bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Turnos por profesional</h2>
            <ul className="mt-3 space-y-3">
              {PROFESSIONALS.map((pr) => {
                const n = appts.filter((a) => a.professionalId === pr.id).length
                return (
                  <li key={pr.id}>
                    <div className="flex justify-between gap-3"><span className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: pr.color }} />{pr.area}</span><span className="font-semibold tabular-nums">{n}</span></div>
                    <div className="mt-1 h-3 rounded-full bg-lila/30"><div className="h-3 rounded-full" style={{ width: `${appts.length ? (n / appts.length) * 100 : 0}%`, background: pr.color }} /></div>
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  )
}
