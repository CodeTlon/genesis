import { addDays, isoToLocal, localToIso, todayKey } from './dates'
import type { Addendum, Appointment, ApptStatus, Entry, EntryPayload, Patient, Professional, Service, TemplateCode } from './types'

/**
 * Demo: datos 100 % ficticios en memoria del servidor (se reinician al reiniciar).
 * Fase 1: esta capa se reemplaza por Postgres (packages/db) con la misma interfaz.
 */

export const PROFESSIONALS: Professional[] = [
  { id: 'pr1', name: 'Inés (Podología)', area: 'Podología', color: '#7b3fb8' },
  { id: 'pr2', name: 'Valentina (Estética)', area: 'Estética', color: '#1d6354' },
]

export const SERVICES: Service[] = [
  { id: 's1', name: 'Podología clínica', area: 'Podología', durationMin: 45, followupDays: 45, templateCode: 'B' },
  { id: 's2', name: 'Heloma / durezas', area: 'Podología', durationMin: 45, followupDays: 30, templateCode: 'B' },
  { id: 's3', name: 'Depilación láser', area: 'Estética', durationMin: 30, followupDays: 30, templateCode: 'C' },
  { id: 's4', name: 'Limpieza facial profunda', area: 'Estética', durationMin: 60, followupDays: 30 },
  { id: 's5', name: 'Maderoterapia', area: 'Estética', durationMin: 60, followupDays: 7 },
  { id: 's6', name: 'Uñas soft gel', area: 'Estética', durationMin: 90, followupDays: 21 },
]

const ok = { data: 'vigente', imageClinical: 'vigente', imagePublic: 'pendiente' } as const
const P = (id: string, firstName: string, lastName: string, n: number, birthDate: string, extra: Partial<Patient> = {}): Patient => ({
  id, firstName, lastName, dni: `00.000.0${String(n).padStart(2, '0')}`, birthDate, phone: `351 000-00${String(n).padStart(2, '0')}`,
  alerts: [], consent: { ...ok }, ...extra,
})

function buildSeed(today: string) {
const md = today.slice(5)

const patientsSeed: Patient[] = [
  P('p1', 'Norma', 'Ledesma', 1, '1946-03-12', { alerts: ['anticoagulantes', 'diabetes'], usesInsoles: true, medication: 'Acenocumarol 2 mg/día (ficticio)', address: 'Calle Ficticia 100' }),
  P('p2', 'Roberto', 'Sánchez', 2, '1951-08-30', { alerts: ['diabetes'], usesInsoles: true, medication: 'Metformina 850 mg (ficticio)', insurance: 'Obra social demo' }),
  P('p3', 'María Eugenia', 'Gómez', 3, `1984-${md}`, { alerts: ['alergia'], medication: '—' }), // cumple hoy
  P('p4', 'Carlos', 'Ferreyra', 4, '1968-11-02', { usesInsoles: false }),
  P('p5', 'Lucía', 'Benítez', 5, '1992-05-21', { consent: { data: 'vigente', imageClinical: 'vigente', imagePublic: 'vigente' } }),
  P('p6', 'Camila', 'Rojas', 6, '1996-01-17', { alerts: ['embarazo'] }),
  P('p7', 'Hugo', 'Altamirano', 7, '1944-09-09', { alerts: ['marcapasos', 'anticoagulantes'], usesInsoles: true }),
  P('p8', 'Sofía', 'Díaz', 8, '2010-04-04', { alerts: ['menor'], guardian: 'Laura Díaz (madre, ficticia)', consent: { data: 'pendiente', imageClinical: 'pendiente', imagePublic: 'pendiente' } }),
  P('p9', 'Marta', 'Quiroga', 9, '1957-12-25', { alerts: ['diabetes'], usesInsoles: false }),
  P('p10', 'Julieta', 'Moreyra', 10, '1989-07-14', {}),
]

const A = (id: string, patientId: string, serviceId: string, professionalId: string, resource: string, day: number, hhmm: string, durationMin: number, status: ApptStatus): Appointment => ({
  id, patientId, serviceId, professionalId, resource, start: localToIso(addDays(today, day), hhmm), durationMin, status,
})

const apptsSeed: Appointment[] = [
  A('a1', 'p1', 's1', 'pr1', 'Camilla 1', 0, '09:00', 45, 'confirmed'),
  A('a2', 'p2', 's2', 'pr1', 'Camilla 1', 0, '10:00', 45, 'pending'),
  A('a3', 'p7', 's1', 'pr1', 'Camilla 1', 0, '11:00', 45, 'pending'),
  A('a4', 'p9', 's1', 'pr1', 'Camilla 1', 0, '15:00', 45, 'confirmed'),
  A('a5', 'p3', 's4', 'pr2', 'Cabina 1', 0, '09:30', 60, 'confirmed'),
  A('a6', 'p5', 's3', 'pr2', 'Equipo láser', 0, '11:00', 30, 'pending'),
  A('a7', 'p6', 's5', 'pr2', 'Cabina 1', 0, '16:00', 60, 'pending'),
  A('a8', 'p10', 's6', 'pr2', 'Cabina 2', 0, '14:00', 90, 'confirmed'),
  A('a9', 'p4', 's1', 'pr1', 'Camilla 1', 1, '10:00', 45, 'pending'),
  A('a10', 'p8', 's4', 'pr2', 'Cabina 1', 1, '17:00', 60, 'pending'),
  A('a11', 'p2', 's1', 'pr1', 'Camilla 1', -30, '10:00', 45, 'done'),
  A('a12', 'p5', 's3', 'pr2', 'Equipo láser', -30, '11:00', 30, 'done'),
]

const E = (id: string, patientId: string, templateCode: TemplateCode, daysAgo: number, payload: EntryPayload): Entry => ({
  id, patientId, templateCode, templateVersion: 1, payload, status: 'signed', author: templateCode === 'C' ? 'Valentina (Estética)' : 'Inés (Podología)',
  createdAt: localToIso(addDays(today, -daysAgo), '10:30'), signedAt: localToIso(addDays(today, -daysAgo), '10:50'), addenda: [],
})

const entriesSeed: Entry[] = [
  E('e1', 'p2', 'A', 120, { motivo: 'Dolor al caminar y durezas', antecedentes: ['Diabetes', 'Hipertensión'], alergias: [], medicacion: 'Metformina 850 mg (ficticio)', embarazo: 'No', marcapasos: false, plantillas: 'Sí' }),
  E('e2', 'p2', 'B', 75, {
    motivo: 'Control de durezas', hallazgos: ['Heloma', 'Hiperqueratosis'], procedimiento: 'Deslaminado de hiperqueratosis y enucleación de heloma.', indicaciones: 'Hidratación diaria. Revisar calzado.',
    sensibilidad: 'Conservada', pulsos: 'Presentes',
    markers: [{ side: 'right', view: 'plantar', zone: 'Metatarsos', finding: 'Heloma', severity: 2, note: 'Núcleo central' }, { side: 'left', view: 'plantar', zone: 'Talón', finding: 'Hiperqueratosis', severity: 1 }],
  }),
  E('e3', 'p2', 'B', 30, {
    motivo: 'Control', hallazgos: ['Heloma'], procedimiento: 'Enucleación de heloma.', indicaciones: 'Continuar hidratación.',
    sensibilidad: 'Conservada', pulsos: 'Presentes',
    markers: [{ side: 'right', view: 'plantar', zone: 'Metatarsos', finding: 'Heloma', severity: 1 }],
  }),
  E('e4', 'p1', 'A', 200, { motivo: 'Cuidado general de pies', antecedentes: ['Diabetes', 'Trastornos de coagulación / anticoagulantes'], alergias: ['Látex'], medicacion: 'Acenocumarol 2 mg/día (ficticio)', embarazo: 'No', marcapasos: false }),
  E('e5', 'p5', 'C', 30, { zona: 'Axilas', sesion: 3, fototipo: 'III', contra: [], longitud: '808 nm', energia: 18, pulso: 30, frecuencia: 2, reaccion: 'Leve eritema', indicaciones: 'Evitar sol directo 48 h.' }),
]

return { patients: patientsSeed, appts: apptsSeed, entries: entriesSeed }
}

type DB = { patients: Patient[]; appts: Appointment[]; entries: Entry[]; seq: number; day: string }
const g = globalThis as unknown as { __genesis?: DB }
const fresh = (): DB => { const day = todayKey(); return { ...buildSeed(day), seq: 100, day } }
/** La semilla es relativa a "hoy": si cambia el día, se regenera para que la agenda nunca quede vacía. */
const cur = (): DB => (g.__genesis && g.__genesis.day === todayKey() ? g.__genesis : (g.__genesis = fresh()))
export const resetDemo = () => { g.__genesis = fresh() }
const nextId = (p: string) => `${p}${++cur().seq}`

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const patients = () => cur().patients
export const patient = (id: string) => cur().patients.find((p) => p.id === id)
export const service = (id: string) => SERVICES.find((s) => s.id === id)
export const professional = (id: string) => PROFESSIONALS.find((p) => p.id === id)

export const apptsOn = (day: string) => cur().appts.filter((a) => isoToLocal(a.start).day === day).sort((a, b) => a.start.localeCompare(b.start))
export const appt = (id: string) => cur().appts.find((a) => a.id === id)
export const apptsOfPatient = (pid: string) => cur().appts.filter((a) => a.patientId === pid)

const overlaps = (a: Appointment, start: number, dur: number) => {
  const s = new Date(a.start).getTime()
  return s < start + dur * 60_000 && start < s + a.durationMin * 60_000
}

export type Conflict = { ok: false; message: string } | { ok: true }

/** Sin doble reserva por profesional ni por recurso (en Fase 1 lo garantiza la base con EXCLUDE). */
export function checkConflict(id: string | null, professionalId: string, resource: string, startIso: string, dur: number): Conflict {
  const start = new Date(startIso).getTime()
  for (const a of cur().appts) {
    if (a.id === id || a.status === 'cancelled' || a.status === 'no_show') continue
    if (!overlaps(a, start, dur)) continue
    if (a.professionalId === professionalId) return { ok: false, message: 'Ese horario ya está ocupado para esa profesional. Probá con otro.' }
    if (a.resource === resource) return { ok: false, message: `${resource} ya está en uso en ese horario. Probá con otro.` }
  }
  return { ok: true }
}

export function moveAppt(id: string, startIso: string, professionalId: string): Conflict {
  const a = appt(id)
  if (!a) return { ok: false, message: 'No encontramos ese turno.' }
  const pro = professional(professionalId)
  if (!pro) return { ok: false, message: 'No encontramos a esa profesional.' }
  if (pro.area !== service(a.serviceId)?.area) return { ok: false, message: `Ese turno es de ${service(a.serviceId)?.area}: solo se puede mover dentro de su área.` }
  if (new Date(startIso).getTime() < Date.now() - 24 * 3_600_000) return { ok: false, message: 'No se pueden mover turnos a una fecha pasada.' }
  const c = checkConflict(id, professionalId, a.resource, startIso, a.durationMin)
  if (!c.ok) return c
  a.start = startIso
  a.professionalId = professionalId
  return { ok: true }
}

const NEXT_STATUS: Record<ApptStatus, ApptStatus[]> = {
  pending: ['confirmed', 'in_room', 'cancelled', 'no_show'],
  confirmed: ['pending', 'in_room', 'cancelled', 'no_show'],
  in_room: ['done', 'confirmed', 'cancelled'],
  done: [],
  no_show: ['pending'],
  cancelled: ['pending'],
}

/** Solo transiciones lógicas: un turno atendido no vuelve a pendiente. */
export function setApptStatus(id: string, status: ApptStatus): boolean {
  const a = appt(id)
  if (!a || (a.status !== status && !NEXT_STATUS[a.status].includes(status))) return false
  a.status = status
  return true
}

/** Agenda el próximo turno: prueba el horario sugerido y avanza de a 15 min hasta encontrar hueco. */
export function scheduleNext(patientId: string, serviceId: string, professionalId: string, resource: string, startIso: string): Appointment | null {
  const s = service(serviceId)
  if (!s) return null
  let start = new Date(startIso).getTime()
  for (let i = 0; i < 32; i++, start += 15 * 60_000) {
    if (checkConflict(null, professionalId, resource, new Date(start).toISOString(), s.durationMin).ok) {
      const a: Appointment = { id: nextId('a'), patientId, serviceId, professionalId, resource, start: new Date(start).toISOString(), durationMin: s.durationMin, status: 'pending' }
      cur().appts.push(a)
      return a
    }
  }
  return null
}

export const entriesOf = (pid: string) => cur().entries.filter((e) => e.patientId === pid).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
export const entry = (id: string) => cur().entries.find((e) => e.id === id)
export const lastSigned = (pid: string, code: TemplateCode) => entriesOf(pid).find((e) => e.templateCode === code && e.status === 'signed')

export function saveEntry(input: { id?: string; patientId: string; templateCode: TemplateCode; payload: EntryPayload; sign: boolean; author: string }): { ok: true; entry: Entry } | { ok: false; message: string } {
  if (input.id) {
    const e = entry(input.id)
    if (!e) return { ok: false, message: 'No encontramos esa atención.' }
    // Inmutabilidad: una entrada firmada no se edita (en Fase 1 lo impone un trigger de la base).
    if (e.status === 'signed') return { ok: false, message: 'Esta atención ya está firmada. Para corregirla, agregá una adenda.' }
    e.payload = input.payload
    if (input.sign) { e.status = 'signed'; e.signedAt = new Date().toISOString() }
    return { ok: true, entry: e }
  }
  const now = new Date().toISOString()
  const e: Entry = {
    id: nextId('e'), patientId: input.patientId, templateCode: input.templateCode, templateVersion: 1, payload: input.payload,
    status: input.sign ? 'signed' : 'draft', author: input.author, createdAt: now, signedAt: input.sign ? now : undefined, addenda: [],
  }
  cur().entries.push(e)
  return { ok: true, entry: e }
}

export function addAddendum(entryId: string, author: string, reason: string, text: string): { ok: boolean; message?: string } {
  const e = entry(entryId)
  if (!e || e.status !== 'signed') return { ok: false, message: 'Solo se pueden agregar adendas a atenciones firmadas.' }
  const a: Addendum = { id: nextId('ad'), author, reason, text, at: new Date().toISOString() }
  e.addenda.push(a)
  return { ok: true }
}
