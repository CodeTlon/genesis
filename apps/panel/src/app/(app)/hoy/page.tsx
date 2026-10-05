import Link from 'next/link'
import { AlertBadges } from '@/components/alert-badges'
import { StatusActions, StatusBadge } from '@/components/status-actions'
import { PrintButton } from '@/components/print-button'
import CountUp from '@genesis/ui/vendor/CountUp'
import { age, fmtDateLong, fmtTime, isBirthdayToday, todayKey } from '@/lib/dates'
import { apptsOn, patient, patients, professional, service } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default function Hoy() {
  const day = todayKey()
  const appts = apptsOn(day).filter((a) => a.status !== 'cancelled')
  const toConfirm = appts.filter((a) => a.status === 'pending')
  const cumples = patients().filter((p) => isBirthdayToday(p.birthDate, day))
  const menores = appts.filter((a) => patient(a.patientId)?.guardian)

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Hoy</h1>
          <p className="mt-1 first-letter:uppercase">{fmtDateLong(day)}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <PrintButton />
          <Link href="/agenda" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white">Ver agenda</Link>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Resumen">
        <Stat n={appts.length} label="turnos hoy" />
        <Stat n={toConfirm.length} label="a confirmar" tone="warn" />
        <Stat n={cumples.length} label={'cumpleaños'} />
      </section>

      {cumples.length > 0 && (
        <p className="mt-6 rounded-card bg-lila/50 p-4">🎂 Hoy cumple años: <strong>{cumples.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}</strong>. Podés mandarle un saludo.</p>
      )}
      {menores.length > 0 && (
        <p className="mt-3 rounded-card bg-amber-100 p-4 text-amber-950">{menores.length === 1 ? 'Hay 1 turno con un menor de edad' : `Hay ${menores.length} turnos con menores de edad`}: el consentimiento lo firma el responsable.</p>
      )}

      <h2 className="mt-10 text-xl font-normal uppercase tracking-[0.06em]">Turnos del día</h2>
      <ul className="g-stagger mt-4 space-y-3">
        {appts.map((a) => {
          const p = patient(a.patientId)!
          const pr = professional(a.professionalId)!
          const s = service(a.serviceId)!
          return (
            <li key={a.id} className="rounded-card bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <p className="min-w-16 text-2xl font-normal">{fmtTime(a.start)}</p>
                  <div>
                    <Link href={`/pacientes/${p.id}`} className="inline-flex min-h-touch items-center text-lg font-semibold underline">{p.firstName} {p.lastName}</Link>
                    <p>{s.name} · {pr.name} · {a.resource} · {a.durationMin} min · {age(p.birthDate, day)} años</p>
                    <div className="mt-1"><AlertBadges alerts={p.alerts} /></div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                <StatusActions id={a.id} status={a.status} />
                {a.status === 'in_room' && (
                  <Link href={`/pacientes/${p.id}/atencion?turno=${a.id}`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-4 text-white">Registrar atención</Link>
                )}
              </div>
            </li>
          )
        })}
        {!appts.length && <li>No hay turnos para hoy.</li>}
      </ul>
    </main>
  )
}

function Stat({ n, label, tone }: { n: number; label: string; tone?: 'warn' }) {
  return (
    <div className={`rounded-card p-5 shadow-soft ${tone === 'warn' && n > 0 ? 'bg-amber-100 text-amber-950' : 'bg-white'}`}>
      <p className="text-4xl font-normal"><CountUp to={n} duration={1.2} /></p>
      <p>{label}</p>
    </div>
  )
}
