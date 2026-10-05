'use server'
import { revalidatePath } from 'next/cache'
import { addAddendum, appt, apptsOfPatient, moveAppt, saveEntry, scheduleNext, service, setApptStatus } from './store'
import { currentAuthor } from './session'
import { hydrate, withState } from './state'
import { addDays, isoToLocal, localToIso, hhmm } from './dates'
import type { ApptStatus, EntryPayload, TemplateCode } from './types'

export async function moveAppointment(id: string, startIso: string, professionalId: string) {
  const r = await withState(() => moveAppt(id, startIso, professionalId))
  revalidatePath('/panel/agenda'); revalidatePath('/panel/hoy')
  return r
}

export async function changeStatus(id: string, status: ApptStatus) {
  const ok = await withState(() => setApptStatus(id, status))
  revalidatePath('/panel/hoy'); revalidatePath('/panel/agenda')
  return ok
}

export async function saveAttention(input: { id?: string; patientId: string; templateCode: TemplateCode; payload: EntryPayload; sign: boolean }) {
  const author = await currentAuthor()
  const r = await withState(() => {
    const res = saveEntry({ ...input, author })
    if (res.ok && input.sign) {
      // Firmar la atención cierra el turno de hoy de ese paciente.
      const today = isoToLocal(new Date().toISOString()).day
      for (const a of apptsOfPatient(input.patientId)) {
        if (isoToLocal(a.start).day === today && (a.status === 'pending' || a.status === 'confirmed' || a.status === 'in_room')) setApptStatus(a.id, 'done')
      }
    }
    return res
  })
  if (r.ok && input.sign) { revalidatePath('/panel/hoy'); revalidatePath('/panel/agenda') }
  revalidatePath(`/panel/pacientes/${input.patientId}`)
  return r.ok ? { ok: true as const, entryId: r.entry.id, status: r.entry.status } : r
}

/** "Próximo turno" en un click: sugiere hoy + intervalo, mismo horario y profesional. */
export async function bookNext(patientId: string, serviceId: string, professionalId: string, resource: string, days: number, time: string) {
  const out = await withState(() => {
    const s = service(serviceId)
    if (!s) return { error: 'No encontramos el servicio.' as const }
    const day = addDays(isoToLocal(new Date().toISOString()).day, days)
    return { a: scheduleNext(patientId, serviceId, professionalId, resource, localToIso(day, time)) }
  })
  revalidatePath('/panel/agenda'); revalidatePath('/panel/hoy'); revalidatePath(`/panel/pacientes/${patientId}`)
  if (out.error) return { ok: false as const, message: out.error }
  if (!out.a) return { ok: false as const, message: 'No encontramos un hueco libre cerca de esa fecha.' }
  const l = isoToLocal(out.a.start)
  return { ok: true as const, day: l.day, time: hhmm(l.minutes) }
}

export async function addendum(entryId: string, patientId: string, reason: string, text: string) {
  if (reason.trim().length < 3 || text.trim().length < 3) return { ok: false, message: 'Completá el motivo y el texto de la adenda.' }
  const author = await currentAuthor()
  const r = await withState(() => addAddendum(entryId, author, reason.trim(), text.trim()))
  revalidatePath(`/panel/pacientes/${patientId}`)
  return r
}

export async function apptInfo(id: string) {
  await hydrate()
  const a = appt(id)
  return a ? { professionalId: a.professionalId, resource: a.resource, serviceId: a.serviceId } : null
}
