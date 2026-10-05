'use server'
import { revalidatePath } from 'next/cache'
import { addAddendum, appt, apptsOfPatient, moveAppt, saveEntry, scheduleNext, service, setApptStatus } from './store'
import { currentAuthor } from './session'
import { addDays, isoToLocal, localToIso, hhmm } from './dates'
import type { ApptStatus, EntryPayload, TemplateCode } from './types'

export async function moveAppointment(id: string, startIso: string, professionalId: string) {
  const r = moveAppt(id, startIso, professionalId)
  revalidatePath('/agenda'); revalidatePath('/hoy')
  return r
}

export async function changeStatus(id: string, status: ApptStatus) {
  const ok = setApptStatus(id, status)
  revalidatePath('/hoy'); revalidatePath('/agenda')
  return ok
}

export async function saveAttention(input: { id?: string; patientId: string; templateCode: TemplateCode; payload: EntryPayload; sign: boolean }) {
  const r = saveEntry({ ...input, author: await currentAuthor() })
  if (r.ok && input.sign) {
    // Firmar la atención cierra el turno de hoy de ese paciente.
    const today = isoToLocal(new Date().toISOString()).day
    for (const a of apptsOfPatient(input.patientId)) {
      if (isoToLocal(a.start).day === today && (a.status === 'pending' || a.status === 'confirmed' || a.status === 'in_room')) setApptStatus(a.id, 'done')
    }
    revalidatePath('/hoy'); revalidatePath('/agenda')
  }
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
  const r = addAddendum(entryId, await currentAuthor(), reason.trim(), text.trim())
  revalidatePath(`/pacientes/${patientId}`)
  return r
}

export async function apptInfo(id: string) {
  const a = appt(id)
  return a ? { professionalId: a.professionalId, resource: a.resource, serviceId: a.serviceId } : null
}

/** Simulador de WhatsApp: la respuesta de la paciente actualiza el turno real de la demo (Carlos Ferreyra, mañana 10:00). */
export async function whatsappRespond(choice: 'confirm' | 'cancel') {
  const ok = setApptStatus('a9', choice === 'confirm' ? 'confirmed' : 'cancelled')
  revalidatePath('/hoy'); revalidatePath('/agenda')
  return ok
}
