'use server'
import { revalidatePath } from 'next/cache'
import { addAddendum, appt, moveAppt, saveEntry, scheduleNext, service, setApptStatus } from './store'
import { addDays, isoToLocal, localToIso, hhmm } from './dates'
import type { ApptStatus, EntryPayload, TemplateCode } from './types'

const AUTHOR = 'Inés (Podología)' // demo: sesión única

export async function moveAppointment(id: string, startIso: string, professionalId: string) {
  const r = moveAppt(id, startIso, professionalId)
  revalidatePath('/agenda'); revalidatePath('/hoy')
  return r
}

export async function changeStatus(id: string, status: ApptStatus) {
  setApptStatus(id, status)
  revalidatePath('/hoy'); revalidatePath('/agenda')
}

export async function saveAttention(input: { id?: string; patientId: string; templateCode: TemplateCode; payload: EntryPayload; sign: boolean }) {
  const r = saveEntry({ ...input, author: AUTHOR })
  revalidatePath(`/pacientes/${input.patientId}`)
  return r.ok ? { ok: true as const, entryId: r.entry.id, status: r.entry.status } : r
}

/** "Próximo turno" en un click: sugiere hoy + intervalo, mismo horario y profesional. */
export async function bookNext(patientId: string, serviceId: string, professionalId: string, resource: string, days: number, time: string) {
  const s = service(serviceId)
  if (!s) return { ok: false as const, message: 'No encontramos el servicio.' }
  const day = addDays(isoToLocal(new Date().toISOString()).day, days)
  const a = scheduleNext(patientId, serviceId, professionalId, resource, localToIso(day, time))
  revalidatePath('/agenda'); revalidatePath('/hoy'); revalidatePath(`/pacientes/${patientId}`)
  if (!a) return { ok: false as const, message: 'No encontramos un hueco libre cerca de esa fecha.' }
  const l = isoToLocal(a.start)
  return { ok: true as const, day: l.day, time: hhmm(l.minutes) }
}

export async function addendum(entryId: string, patientId: string, reason: string, text: string) {
  if (reason.trim().length < 3 || text.trim().length < 3) return { ok: false, message: 'Completá el motivo y el texto de la adenda.' }
  const r = addAddendum(entryId, AUTHOR, reason.trim(), text.trim())
  revalidatePath(`/pacientes/${patientId}`)
  return r
}

export async function apptInfo(id: string) {
  const a = appt(id)
  return a ? { professionalId: a.professionalId, resource: a.resource, serviceId: a.serviceId } : null
}
