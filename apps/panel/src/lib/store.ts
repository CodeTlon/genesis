import { query, TENANT_ID } from '@genesis/db/client'
import { open, openJson, openText, seal, sealJson, sealText } from './crypto'
import { addDays, isoToLocal, localToIso, todayKey } from './dates'
import type { Addendum, Alert, Appointment, ApptStatus, Entry, EntryPayload, Patient, Professional, Service, TemplateCode } from './types'

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

const today = todayKey()
const md = today.slice(5)

export const PATIENTS_SEED: Patient[] = [
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

export const APPTS_SEED: Appointment[] = [
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

export const ENTRIES_SEED: Entry[] = [
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

type DB = { appts: Appointment[]; seq: number }
const g = globalThis as unknown as { __genesis?: DB }
const db: DB = (g.__genesis ??= { appts: structuredClone(APPTS_SEED), seq: 100 })
const nextId = (p: string) => `${p}${++db.seq}`

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const service = (id: string) => SERVICES.find((s) => s.id === id)
export const professional = (id: string) => PROFESSIONALS.find((p) => p.id === id)

export const apptsOn = (day: string) => db.appts.filter((a) => isoToLocal(a.start).day === day).sort((a, b) => a.start.localeCompare(b.start))
export const appt = (id: string) => db.appts.find((a) => a.id === id)
export const apptsOfPatient = (pid: string) => db.appts.filter((a) => a.patientId === pid)

const overlaps = (a: Appointment, start: number, dur: number) => {
  const s = new Date(a.start).getTime()
  return s < start + dur * 60_000 && start < s + a.durationMin * 60_000
}

export type Conflict = { ok: false; message: string } | { ok: true }

/** Sin doble reserva por profesional ni por recurso (en Fase 1 lo garantiza la base con EXCLUDE). */
export function checkConflict(id: string | null, professionalId: string, resource: string, startIso: string, dur: number): Conflict {
  const start = new Date(startIso).getTime()
  for (const a of db.appts) {
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
  const c = checkConflict(id, professionalId, a.resource, startIso, a.durationMin)
  if (!c.ok) return c
  a.start = startIso
  a.professionalId = professionalId
  return { ok: true }
}

export function setApptStatus(id: string, status: ApptStatus) {
  const a = appt(id)
  if (a) a.status = status
}

/** Agenda el próximo turno: prueba el horario sugerido y avanza de a 15 min hasta encontrar hueco. */
export function scheduleNext(patientId: string, serviceId: string, professionalId: string, resource: string, startIso: string): Appointment | null {
  const s = service(serviceId)
  if (!s) return null
  let start = new Date(startIso).getTime()
  for (let i = 0; i < 32; i++, start += 15 * 60_000) {
    if (checkConflict(null, professionalId, resource, new Date(start).toISOString(), s.durationMin).ok) {
      const a: Appointment = { id: nextId('a'), patientId, serviceId, professionalId, resource, start: new Date(start).toISOString(), durationMin: s.durationMin, status: 'pending' }
      db.appts.push(a)
      return a
    }
  }
  return null
}

// ── Historias clínicas en Postgres (REQ-HC-012). Los turnos siguen en memoria: la agenda está fuera de alcance (decisión del 18/10). ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila cruda de pg
type PRow = Record<string, any>
/** pg devuelve las columnas date como Date a medianoche local: se formatea con getters locales (sin corrimiento por zona). */
const ymd = (d: unknown): string => (d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : d ? String(d).slice(0, 10) : '')
const toPatient = (r: PRow): Patient => ({
  id: r.id, firstName: r.first_name, lastName: r.last_name, dni: r.dni ?? '', birthDate: ymd(r.birth_date), phone: r.phone ?? '',
  address: r.address ?? undefined, insurance: r.insurance ?? undefined, guardian: r.guardian ?? undefined, alerts: r.alerts ?? [], consent: r.consent,
  usesInsoles: r.uses_insoles ?? undefined, medication: r.medication ?? undefined,
  firstVisit: ymd(r.first_visit) || undefined, nationality: r.nationality ?? undefined, sex: r.sex ?? undefined,
  heightCm: r.height_cm == null ? undefined : Number(r.height_cm), weightKg: r.weight_kg == null ? undefined : Number(r.weight_kg), bloodGroup: r.blood_group ?? undefined,
  occupation: r.occupation ?? undefined, otherActivities: r.other_activities ?? undefined,
  emergency: r.emergency_name ? { name: r.emergency_name, phone: r.emergency_phone ?? '' } : undefined,
})

const toEntry = (r: PRow, addenda: Addendum[]): Entry => ({
  id: r.id, patientId: r.patient_id, templateCode: r.template_code, templateVersion: r.template_version, payload: openJson<EntryPayload>(r.payload, r.id), status: r.status, author: r.author,
  createdAt: new Date(r.created_at).toISOString(), signedAt: r.signed_at ? new Date(r.signed_at).toISOString() : undefined, addenda,
})

async function insertPatient(p: Patient) {
  await query(
    `INSERT INTO hc_patients (id, tenant_id, first_name, last_name, dni, birth_date, phone, address, insurance, guardian, alerts, consent, uses_insoles, medication,
       first_visit, nationality, sex, height_cm, weight_kg, blood_group, occupation, other_activities, emergency_name, emergency_phone)
     VALUES ($1,$2,$3,$4,$5,NULLIF($6,'')::date,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) ON CONFLICT (id) DO NOTHING`,
    [p.id, TENANT_ID, p.firstName, p.lastName, p.dni, p.birthDate, p.phone, p.address ?? null, p.insurance ?? null, p.guardian ?? null, p.alerts, JSON.stringify(p.consent),
      p.usesInsoles ?? null, p.medication ?? null, p.firstVisit ?? null, p.nationality ?? null, p.sex ?? null, p.heightCm ?? null, p.weightKg ?? null, p.bloodGroup ?? null,
      p.occupation ?? null, p.otherActivities ?? null, p.emergency?.name ?? null, p.emergency?.phone ?? null])
}

/** Carga los datos ficticios de la demo la primera vez (base vacía). Se desactiva con GENESIS_SEED=0. */
let seeded: Promise<void> | undefined
function ensureSeed(): Promise<void> {
  return (seeded ??= (async () => {
    if (process.env.GENESIS_SEED === '0') return
    const [{ n }] = await query<{ n: string }>('SELECT count(*) AS n FROM hc_patients WHERE tenant_id=$1', [TENANT_ID])
    if (Number(n) > 0) return
    for (const p of PATIENTS_SEED) await insertPatient(p)
    for (const e of ENTRIES_SEED) {
      await query(
        `INSERT INTO hc_entries (id, tenant_id, patient_id, template_code, template_version, payload, status, author, signed_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,'signed',$7,$8,$9)`,
        [e.id, TENANT_ID, e.patientId, e.templateCode, e.templateVersion, JSON.stringify(sealJson(e.payload, e.id)), e.author, e.signedAt, e.createdAt])
    }
  })().catch((err) => { seeded = undefined; throw err }))
}

export async function patients(): Promise<Patient[]> {
  await ensureSeed()
  return (await query('SELECT * FROM hc_patients WHERE tenant_id=$1 ORDER BY last_name, first_name', [TENANT_ID])).map(toPatient)
}
export async function patient(id: string): Promise<Patient | undefined> {
  await ensureSeed()
  const [r] = await query('SELECT * FROM hc_patients WHERE tenant_id=$1 AND id=$2', [TENANT_ID, id])
  return r ? toPatient(r) : undefined
}

async function withAddenda(rows: PRow[]): Promise<Entry[]> {
  if (!rows.length) return []
  const ad = await query('SELECT * FROM hc_addenda WHERE entry_id = ANY($1) ORDER BY created_at', [rows.map((r) => r.id)])
  return rows.map((r) => toEntry(r, ad.filter((a) => a.entry_id === r.id).map((a) => ({ id: a.id, author: a.author, reason: openText(a.reason, a.id), text: openText(a.text, a.id), at: new Date(a.created_at).toISOString() }))))
}
export async function entriesOf(pid: string): Promise<Entry[]> {
  await ensureSeed()
  return withAddenda(await query('SELECT * FROM hc_entries WHERE tenant_id=$1 AND patient_id=$2 ORDER BY created_at DESC', [TENANT_ID, pid]))
}
export async function entry(id: string): Promise<Entry | undefined> {
  const [e] = await withAddenda(await query('SELECT * FROM hc_entries WHERE tenant_id=$1 AND id=$2', [TENANT_ID, id]))
  return e
}
export async function lastSigned(pid: string, code: TemplateCode): Promise<Entry | undefined> {
  return (await entriesOf(pid)).find((e) => e.templateCode === code && e.status === 'signed')
}

const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])
/** REQ-HC-008: alertas que levanta una anamnesis (A) o ficha inicial (F) al firmarse. Solo suma: nunca borra una alerta. */
export function alertsFromPayload(p: EntryPayload): Alert[] {
  const ant = arr(p.antecedentes)
  const out: Alert[] = []
  if (p.diabetes === true || ant.includes('Diabetes')) out.push('diabetes')
  if (p.ant_anticoagulantes === true || ant.includes('Trastornos de coagulación / anticoagulantes')) out.push('anticoagulantes')
  if (p.ant_antiagregados === true) out.push('antiagregados')
  if (p.ant_marcapasos === true || p.marcapasos === true) out.push('marcapasos')
  if (p.ant_alergicos === true || arr(p.alergias).length > 0) out.push('alergia')
  if (p.embarazo === 'Embarazo' || p.embarazo === 'Lactancia') out.push('embarazo')
  return out
}

export async function saveEntry(input: { id?: string; patientId: string; templateCode: TemplateCode; payload: EntryPayload; sign: boolean; author: string }): Promise<{ ok: true; entry: Entry } | { ok: false; message: string }> {
  await ensureSeed()
  let id = input.id
  if (id) {
    const e = await entry(id)
    if (!e) return { ok: false, message: 'No encontramos esa atención.' }
    // Inmutabilidad: además del chequeo, la base lo impone con un trigger (hc_entries_immutable).
    if (e.status === 'signed') return { ok: false, message: 'Esta atención ya está firmada. Para corregirla, agregá una adenda.' }
    await query(`UPDATE hc_entries SET payload=$2, status=$3, signed_at=$4 WHERE id=$1`, [id, JSON.stringify(sealJson(input.payload, id)), input.sign ? 'signed' : 'draft', input.sign ? new Date().toISOString() : null])
  } else {
    id = `${nextId('e')}-${Date.now().toString(36)}`
    await query(
      `INSERT INTO hc_entries (id, tenant_id, patient_id, template_code, payload, status, author, signed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, TENANT_ID, input.patientId, input.templateCode, JSON.stringify(sealJson(input.payload, id)), input.sign ? 'signed' : 'draft', input.author, input.sign ? new Date().toISOString() : null])
  }
  if (input.sign && (input.templateCode === 'A' || input.templateCode === 'F')) {
    const add = alertsFromPayload(input.payload)
    if (add.length) await query(`UPDATE hc_patients SET alerts = (SELECT array(SELECT DISTINCT unnest(alerts || $2::text[]))) WHERE id=$1`, [input.patientId, add])
  }
  return { ok: true, entry: (await entry(id))! }
}

export async function addAddendum(entryId: string, author: string, reason: string, text: string): Promise<{ ok: boolean; message?: string }> {
  const e = await entry(entryId)
  if (!e || e.status !== 'signed') return { ok: false, message: 'Solo se pueden agregar adendas a atenciones firmadas.' }
  const id = `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  await query('INSERT INTO hc_addenda (id, entry_id, author, reason, text) VALUES ($1,$2,$3,$4,$5)', [id, entryId, author, sealText(reason, id), sealText(text, id)])
  return { ok: true }
}

export type PatientInput = Omit<Patient, 'id' | 'alerts' | 'consent'> & { id?: string }

/** Alta o edición de los datos de la ficha (REQ-PAC-005). No toca alertas ni consentimientos de un paciente existente. */
export async function savePatient(input: PatientInput): Promise<Patient> {
  await ensureSeed()
  const clean = <T extends string | undefined>(v: T) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
  const num = (v: unknown) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? null : Number(v))
  const vals = [
    input.firstName.trim(), input.lastName.trim(), clean(input.dni) ?? null, input.birthDate || null, clean(input.phone) ?? null, clean(input.address) ?? null,
    clean(input.insurance) ?? null, clean(input.guardian) ?? null, clean(input.firstVisit) ?? null, clean(input.nationality) ?? null, clean(input.sex) ?? null,
    num(input.heightCm), num(input.weightKg), clean(input.bloodGroup) ?? null, clean(input.occupation) ?? null, clean(input.otherActivities) ?? null,
    clean(input.emergency?.name) ?? null, clean(input.emergency?.phone) ?? null,
  ]
  if (input.id) {
    await query(
      `UPDATE hc_patients SET first_name=$2, last_name=$3, dni=$4, birth_date=$5::date, phone=$6, address=$7, insurance=$8, guardian=$9, first_visit=$10::date, nationality=$11, sex=$12,
         height_cm=$13, weight_kg=$14, blood_group=$15, occupation=$16, other_activities=$17, emergency_name=$18, emergency_phone=$19 WHERE tenant_id=$20 AND id=$1`,
      [input.id, ...vals, TENANT_ID])
    return (await patient(input.id))!
  }
  const id = `p${Date.now().toString(36)}`
  await query(
    `INSERT INTO hc_patients (id, tenant_id, first_name, last_name, dni, birth_date, phone, address, insurance, guardian, first_visit, nationality, sex, height_cm, weight_kg, blood_group,
       occupation, other_activities, emergency_name, emergency_phone) VALUES ($1,$20,$2,$3,$4,$5::date,$6,$7,$8,$9,$10::date,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [id, ...vals, TENANT_ID])
  return (await patient(id))!
}

/** Suma la alerta «menor» a un paciente menor de 18. */
export async function markMinor(id: string): Promise<void> {
  await query(`UPDATE hc_patients SET alerts = (SELECT array(SELECT DISTINCT unnest(alerts || ARRAY['menor']))) WHERE id=$1`, [id])
}

/** Solo para pruebas: vacía las historias y vuelve a cargar los datos ficticios. Exige GENESIS_ALLOW_RESET=1 para que no corra por error. */
export async function resetDemo(): Promise<void> {
  if (process.env.GENESIS_ALLOW_RESET !== '1') throw new Error('resetDemo requiere GENESIS_ALLOW_RESET=1')
  await query('TRUNCATE hc_photos, hc_addenda, hc_entries, hc_patients CASCADE')
  seeded = undefined
  await ensureSeed()
}

// ---------- Fotos clínicas (REQ-FOT-001..003) ----------
export type PhotoKind = 'primera_consulta' | 'evolucion'
export type PhotoMeta = { id: string; patientId: string; entryId?: string; kind: PhotoKind; note?: string; author: string; createdAt: string }

/** Guarda la foto cifrada. Si falta el consentimiento de imagen clínica la rechaza (y la base también, por trigger). */
export async function savePhoto(i: { patientId: string; entryId?: string; kind: PhotoKind; bytes: Buffer; mime: string; note?: string; author: string }): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const p = await patient(i.patientId)
  if (!p) return { ok: false, message: 'No encontramos al paciente.' }
  if (p.consent.imageClinical !== 'vigente') return { ok: false, message: 'Falta el consentimiento de imagen clínica de este paciente. Registralo antes de subir fotos.' }
  const id = `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  await query('INSERT INTO hc_photos (id, tenant_id, patient_id, entry_id, kind, mime, bytes, note, author) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, TENANT_ID, i.patientId, i.entryId || null, i.kind, i.mime, seal(i.bytes, id), i.note || null, i.author])
  return { ok: true, id }
}

export async function photosOf(pid: string): Promise<PhotoMeta[]> {
  const rows = await query('SELECT id, patient_id, entry_id, kind, note, author, created_at FROM hc_photos WHERE tenant_id=$1 AND patient_id=$2 ORDER BY created_at', [TENANT_ID, pid])
  return rows.map((r) => ({ id: r.id, patientId: r.patient_id, entryId: r.entry_id ?? undefined, kind: r.kind, note: r.note ?? undefined, author: r.author, createdAt: new Date(r.created_at).toISOString() }))
}

export async function photo(id: string): Promise<{ bytes: Buffer; mime: string; patientId: string } | undefined> {
  const [r] = await query('SELECT bytes, mime, patient_id FROM hc_photos WHERE tenant_id=$1 AND id=$2', [TENANT_ID, id])
  return r ? { bytes: open(r.bytes, id), mime: r.mime, patientId: r.patient_id } : undefined
}

export async function grantImageConsent(pid: string): Promise<void> {
  await query(`UPDATE hc_patients SET consent = jsonb_set(consent, '{imageClinical}', '"vigente"') WHERE id=$1`, [pid])
}
