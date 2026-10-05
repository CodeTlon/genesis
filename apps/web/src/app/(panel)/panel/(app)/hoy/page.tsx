import Link from 'next/link'
import { hydrate } from '@/panel/lib/state'
import { AlertBadges } from '@/panel/components/alert-badges'
import { IconCake, IconPerson } from '@/panel/components/icons'
import { StatusActions, StatusBadge } from '@/panel/components/status-actions'
import { PrintButton } from '@/panel/components/print-button'
import { CountUp } from '@/components/count-up'
import { age, fmtDateLong, fmtTime, isBirthdayToday, todayKey } from '@/panel/lib/dates'
import { ALERT_LABEL, type Alert } from '@/panel/lib/types'
import { apptsOn, patient, patients, professional, PROFESSIONALS, service } from '@/panel/lib/store'

export const dynamic = 'force-dynamic'

export default async function Hoy() {
  await hydrate() // estado de esta persona (último await: lo que sigue lee de forma síncrona)
  const day = todayKey()
  const appts = apptsOn(day).filter((a) => a.status !== 'cancelled')
  const count = (s: string) => appts.filter((a) => a.status === s).length
  const done = count('done')
  const cumples = patients().filter((p) => isBirthdayToday(p.birthDate, day))
  const menores = appts.filter((a) => patient(a.patientId)?.guardian)
  const conAlertas = appts.filter((a) => patient(a.patientId)?.alerts.length)
  const alertCounts = (Object.keys(ALERT_LABEL) as Alert[]).map((a) => [a, conAlertas.filter((x) => patient(x.patientId)?.alerts.includes(a)).length] as const).filter(([, n]) => n > 0).sort((x, y) => y[1] - x[1])
  const pct = appts.length ? Math.round((done / appts.length) * 100) : 0
  const th = 'px-4 py-3 text-left font-semibold'

  const stat = (n: number, label: string, warn = false) => (
    <div className={`rounded-card p-4 shadow-soft ${warn && n > 0 ? 'bg-amber-100 text-amber-950' : 'bg-white'}`}>
      <p className="text-3xl font-normal"><CountUp to={n} /></p>
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
          <Link href="/panel/agenda" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white hover:bg-tinta">Ver agenda</Link>
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

      <section aria-labelledby="turnos" className="mt-6 min-w-0">
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
                      <td className="px-4 py-3"><Link href={`/panel/pacientes/${p.id}`} className="font-semibold hover:underline">{p.firstName} {p.lastName}</Link><p className="text-sm">{age(p.birthDate, day)} años</p></td>
                      <td className="px-4 py-3"><p>{s.name}</p><p className="flex items-center gap-2 text-sm"><span aria-hidden className="size-2.5 rounded-sm" style={{ background: pr.color }} />{pr.area} · {a.resource} · {a.durationMin} min</p></td>
                      <td className="px-4 py-3">{p.alerts.length ? <AlertBadges alerts={p.alerts} /> : <span className="text-tinta/60">—</span>}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                        <div className="mt-2 flex flex-wrap gap-2 print:hidden">
                          <StatusActions id={a.id} status={a.status} compact />
                          {a.status === 'in_room' && <Link href={`/panel/pacientes/${p.id}/atencion?turno=${a.id}`} className="inline-flex min-h-10 items-center rounded-control bg-violeta-oscuro px-3 text-sm text-white hover:bg-tinta">Registrar atención</Link>}
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
                  <div className="mt-3 flex flex-wrap gap-2"><StatusActions id={a.id} status={a.status} />{a.status === 'in_room' && <Link href={`/panel/pacientes/${p.id}/atencion?turno=${a.id}`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-4 text-white">Registrar atención</Link>}</div>
                </li>
              )
            })}
            {!appts.length && <li>No hay turnos para hoy.</li>}
          </ul>
      </section>

      <section aria-label="Avisos y carga del día" className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Avisos del día</h2>
          <ul className="mt-3 space-y-3">
            {cumples.map((p) => (
              <li key={p.id} className="flex items-start gap-3 rounded-control border-l-4 border-violeta-oscuro bg-lila/30 p-3">
                <span className="grid size-9 flex-none place-items-center rounded-full bg-white text-violeta-oscuro"><IconCake className="size-5" /></span>
                <span><strong className="block">Cumpleaños</strong>Hoy cumple años {p.firstName} {p.lastName}.</span>
              </li>
            ))}
            {menores.length > 0 && (
              <li className="flex items-start gap-3 rounded-control border-l-4 border-sky-700 bg-sky-50 p-3 text-sky-950">
                <span className="grid size-9 flex-none place-items-center rounded-full bg-white text-sky-800"><IconPerson className="size-5" /></span>
                <span><strong className="block">{menores.length === 1 ? 'Turno con un menor' : `${menores.length} turnos con menores`}</strong>El consentimiento lo firma el responsable.</span>
              </li>
            )}
            {!cumples.length && !menores.length && <li className="rounded-control bg-lila/20 p-3">Sin avisos para hoy.</li>}
          </ul>
        </div>

        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Alertas clínicas de hoy</h2>
          <p className="text-sm">{conAlertas.length} {conAlertas.length === 1 ? 'paciente' : 'pacientes'} con precauciones.</p>
          <ul className="mt-3 space-y-2">
            {alertCounts.map(([a, n]) => (
              <li key={a} className="flex items-center justify-between gap-3 rounded-control bg-lila/10 px-3 py-1.5"><AlertBadges alerts={[a]} /><span className="font-semibold tabular-nums">{n} {n === 1 ? 'turno' : 'turnos'}</span></li>
            ))}
            {!alertCounts.length && <li>Sin alertas para hoy.</li>}
          </ul>
        </div>

        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Turnos por profesional</h2>
          <ul className="mt-4 space-y-4">
            {PROFESSIONALS.map((pr) => {
              const mine = appts.filter((a) => a.professionalId === pr.id)
              const hecho = mine.filter((a) => a.status === 'done').length
              return (
                <li key={pr.id}>
                  <div className="flex items-baseline justify-between gap-3"><span className="flex items-center gap-2 font-semibold"><span aria-hidden className="size-3 rounded-sm" style={{ background: pr.color }} />{pr.area}</span><span><strong className="text-xl font-normal tabular-nums">{mine.length}</strong> {mine.length === 1 ? 'turno' : 'turnos'}</span></div>
                  <div className="mt-2 h-3 rounded-full bg-lila/30"><div className="h-3 rounded-full transition-[width] duration-700" style={{ width: `${appts.length ? (mine.length / appts.length) * 100 : 0}%`, background: pr.color }} /></div>
                  <p className="mt-1 text-sm">{hecho} de {mine.length} atendidos</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </main>
  )
}
