import Link from 'next/link'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'
import { AgendaBoard, type AgendaAppt } from '@/components/agenda-board'
import { PrintButton } from '@/components/print-button'
import { addDays, fmtDateLong, isoToLocal, todayKey } from '@/lib/dates'
import { apptsOn, patient, PROFESSIONALS, service } from '@/lib/store'

export const dynamic = 'force-dynamic'

const FERIADOS_DEMO: Record<string, string> = {} // Fase 1: feriados de Argentina

export default async function Agenda({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams
  const today = todayKey()
  const day = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : today

  const appts: AgendaAppt[] = apptsOn(day).map((a) => {
    const p = patient(a.patientId)!
    return {
      id: a.id, patient: `${p.firstName} ${p.lastName}`, service: service(a.serviceId)!.name, resource: a.resource, professionalId: a.professionalId,
      startMin: isoToLocal(a.start).minutes, durationMin: a.durationMin, status: a.status, alerts: p.alerts,
    }
  })

  const nav = 'inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro'
  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Agenda</h1>
          <p className="mt-1 first-letter:uppercase">{fmtDateLong(day)}{FERIADOS_DEMO[day] ? ` · ${FERIADOS_DEMO[day]}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Link href={`/agenda?dia=${addDays(day, -1)}`} className={nav}><IconChevronLeft /> Anterior</Link>
          <Link href="/agenda" className={nav}>Hoy</Link>
          <Link href={`/agenda?dia=${addDays(day, 1)}`} className={nav}>Siguiente <IconChevronRight /></Link>
          <PrintButton label="Imprimir" />
        </div>
      </div>
      <p className="mt-2 mb-6 text-sm print:hidden">Arrastrá un turno para cambiarle la hora o pasarlo a otra profesional. El sistema no deja reservar dos turnos en el mismo horario.</p>
      <AgendaBoard key={day} day={day} pros={PROFESSIONALS.map(({ id, name, color }) => ({ id, name, color }))} appts={appts} />
    </main>
  )
}
