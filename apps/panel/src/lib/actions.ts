'use server'
import { revalidatePath } from 'next/cache'
import { addAddendum, appt, markMinor, moveAppt, savePatient, saveEntry, scheduleNext, service, setApptStatus, type PatientInput } from './store'
import { addDays, age, isoToLocal, localToIso, hhmm } from './dates'
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
  const r = await saveEntry({ ...input, author: AUTHOR })
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
  const r = await addAddendum(entryId, AUTHOR, reason.trim(), text.trim())
  revalidatePath(`/pacientes/${patientId}`)
  return r
}

export async function apptInfo(id: string) {
  const a = appt(id)
  return a ? { professionalId: a.professionalId, resource: a.resource, serviceId: a.serviceId } : null
}

/** Alta o edición de la ficha del paciente. Un menor de 18 exige responsable legal (REQ-PAC-004). */
export async function savePatientAction(input: PatientInput) {
  if (!input.firstName?.trim() || !input.lastName?.trim()) return { ok: false as const, message: 'Completá nombre y apellido.' }
  if (input.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) return { ok: false as const, message: 'La fecha de nacimiento no es válida.' }
  const minor = input.birthDate ? age(input.birthDate) < 18 : false
  if (minor && !input.guardian?.trim()) return { ok: false as const, message: 'Es menor de 18: completá el responsable legal.' }
  const p = await savePatient(input)
  if (minor) await markMinor(p.id)
  revalidatePath('/pacientes'); revalidatePath(`/pacientes/${p.id}`)
  return { ok: true as const, id: p.id }
}
