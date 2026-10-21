'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { audit, requireUser } from './auth-server'
import * as repo from './repo'
import { ANTECEDENTE_ITEMS, type EntryPayload, type FootMarker } from './types'
import { FOOT_FINDINGS, FOOT_ZONES } from './templates'

export type Res = { ok: true; id?: string } | { ok: false; message: string }
const fail = (message: string): Res => ({ ok: false, message })
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
const txt = (max: number) => z.string().trim().max(max)

// ───────── Pacientes ─────────
const patientSchema = z.object({
  firstName: txt(80).min(1, 'Falta el nombre.'),
  lastName: txt(80).min(1, 'Falta el apellido.'),
  dni: txt(20).regex(/^[0-9. ]*$/, 'El DNI solo lleva números.'),
  birthDate: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de nacimiento no es válida.')]),
  phone: txt(30).regex(/^[0-9 +()-]*$/, 'El teléfono no es válido.'),
  address: txt(200), occupation: txt(100), insurance: txt(100), emergencyContact: txt(200), guardian: txt(120),
})

const fromForm = (fd: FormData) => Object.fromEntries(Object.keys(patientSchema.shape).map((k) => [k, String(fd.get(k) ?? '')]))

export async function createPatient(_: unknown, fd: FormData): Promise<Res> {
  const u = await requireUser()
  const p = patientSchema.safeParse(fromForm(fd))
  if (!p.success) return fail(p.error.issues[0].message)
  if (repo.isMinor(p.data.birthDate) && !p.data.guardian) return fail('Es menor de edad: completá el nombre del responsable.')
  const id = await repo.createPatient(p.data, u.id)
  await audit(u.id, 'create_patient', 'patient', id)
  revalidatePath('/panel/pacientes')
  redirect(`/panel/pacientes/${id}`)
}

export async function updatePatient(patientId: string, _: unknown, fd: FormData): Promise<Res> {
  const u = await requireUser()
  if (!uuid.safeParse(patientId).success) return fail('Paciente no válido.')
  const p = patientSchema.safeParse(fromForm(fd))
  if (!p.success) return fail(p.error.issues[0].message)
  if (repo.isMinor(p.data.birthDate) && !p.data.guardian) return fail('Es menor de edad: completá el nombre del responsable.')
  if (!(await repo.updatePatient(patientId, p.data))) return fail('No encontramos al paciente.')
  await audit(u.id, 'update_patient', 'patient', patientId)
  revalidatePath(`/panel/pacientes/${patientId}`)
  return { ok: true }
}

export async function archivePatient(patientId: string): Promise<Res> {
  const u = await requireUser()
  if (u.role !== 'admin') return fail('Solo el administrador puede archivar pacientes.')
  if (!uuid.safeParse(patientId).success || !(await repo.archivePatient(patientId))) return fail('No encontramos al paciente.')
  await audit(u.id, 'archive_patient', 'patient', patientId)
  revalidatePath('/panel/pacientes')
  redirect('/panel/pacientes')
}

// ───────── Antecedentes ─────────
export async function saveAntecedentes(patientId: string, _: unknown, fd: FormData): Promise<Res> {
  const u = await requireUser()
  if (!uuid.safeParse(patientId).success) return fail('Paciente no válido.')
  const flags: Record<string, boolean> = {}
  for (const it of ANTECEDENTE_ITEMS) flags[it.id] = fd.get(`f_${it.id}`) === 'on'
  const d = z.object({ notes: txt(4000), medication: txt(1000), footwear: txt(500), activity: txt(500) })
    .safeParse({ notes: String(fd.get('notes') ?? ''), medication: String(fd.get('medication') ?? ''), footwear: String(fd.get('footwear') ?? ''), activity: String(fd.get('activity') ?? '') })
  if (!d.success) return fail('Alguno de los textos es demasiado largo.')
  if (!(await repo.saveAntecedentes(patientId, { flags, ...d.data }, u.id))) return fail('No encontramos al paciente.')
  await audit(u.id, 'save_antecedentes', 'patient', patientId)
  revalidatePath(`/panel/pacientes/${patientId}`)
  return { ok: true }
}

// ───────── Casos ─────────
export async function openCase(patientId: string, _: unknown, fd: FormData): Promise<Res> {
  const u = await requireUser()
  const d = z.object({ title: txt(120).min(2, 'Poné un título (ej: uñero pie derecho).'), reason: txt(2000) }).safeParse({ title: String(fd.get('title') ?? ''), reason: String(fd.get('reason') ?? '') })
  if (!d.success) return fail(d.error.issues[0].message)
  const id = uuid.safeParse(patientId).success ? await repo.openCase(patientId, d.data.title, d.data.reason, u.id) : null
  if (!id) return fail('No encontramos al paciente.')
  await audit(u.id, 'open_case', 'case', id)
  revalidatePath(`/panel/pacientes/${patientId}`)
  redirect(`/panel/pacientes/${patientId}/casos/${id}`)
}

export async function closeCase(caseId: string, _: unknown, fd: FormData): Promise<Res> {
  const u = await requireUser()
  const d = z.object({ conclusion: txt(4000).min(3, 'Escribí la conclusión.'), suggestions: txt(4000) }).safeParse({ conclusion: String(fd.get('conclusion') ?? ''), suggestions: String(fd.get('suggestions') ?? '') })
  if (!d.success) return fail(d.error.issues[0].message)
  const c = uuid.safeParse(caseId).success ? await repo.getCase(caseId) : null
  if (!c) return fail('No encontramos el caso.')
  if (!(await repo.closeCase(caseId, d.data.conclusion, d.data.suggestions))) return fail('El caso ya estaba cerrado.')
  await audit(u.id, 'close_case', 'case', caseId)
  revalidatePath(`/panel/pacientes/${c.patientId}`)
  return { ok: true }
}

export async function reopenCase(caseId: string): Promise<Res> {
  const u = await requireUser()
  const c = uuid.safeParse(caseId).success ? await repo.getCase(caseId) : null
  if (!c || !(await repo.reopenCase(caseId))) return fail('No se pudo reabrir el caso.')
  await audit(u.id, 'reopen_case', 'case', caseId)
  revalidatePath(`/panel/pacientes/${c.patientId}`)
  return { ok: true }
}

// ───────── Evoluciones ─────────
const marker = z.object({
  side: z.enum(['left', 'right']), view: z.enum(['plantar', 'dorsal']),
  zone: z.string().max(40), finding: z.string().max(40), severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  state: z.enum(['a_tratar', 'tratado']), note: z.string().max(300).optional(),
})
const payloadSchema = z.object({ footType: z.enum(['egipcio', 'griego', 'romano']).optional(), markers: z.array(marker).max(60).optional() }).catchall(z.union([z.string().max(4000), z.number(), z.boolean(), z.array(z.string().max(100)).max(30)]))

export async function saveAttention(input: { id?: string; patientId: string; caseId?: string; payload: EntryPayload; sign: boolean }): Promise<{ ok: true; entryId: string; status: 'draft' | 'signed' } | { ok: false; message: string }> {
  const u = await requireUser()
  if (!uuid.safeParse(input.patientId).success || (input.id && !uuid.safeParse(input.id).success) || (input.caseId && !uuid.safeParse(input.caseId).success)) return { ok: false, message: 'Datos no válidos.' }
  const p = payloadSchema.safeParse(input.payload)
  if (!p.success) return { ok: false, message: 'Alguno de los campos no es válido o es demasiado largo.' }
  for (const m of (p.data.markers ?? []) as FootMarker[]) {
    if (!(FOOT_ZONES[m.view] as readonly string[]).includes(m.zone) || !FOOT_FINDINGS.includes(m.finding)) return { ok: false, message: 'Una marca del mapa de pies no es válida.' }
  }
  const r = await repo.saveEntry({ ...input, payload: p.data as EntryPayload, userId: u.id })
  if (!r.ok) return r
  if (input.sign) await audit(u.id, 'sign_entry', 'entry', r.entry.id)
  revalidatePath(`/panel/pacientes/${input.patientId}`)
  if (input.caseId) revalidatePath(`/panel/pacientes/${input.patientId}/casos/${input.caseId}`)
  return { ok: true, entryId: r.entry.id, status: r.entry.status }
}

export async function addendum(entryId: string, patientId: string, reason: string, text: string): Promise<Res> {
  const u = await requireUser()
  if (!uuid.safeParse(entryId).success) return fail('Atención no válida.')
  if (reason.trim().length < 3 || text.trim().length < 3) return fail('Completá el motivo y el texto de la adenda.')
  if (reason.length > 200 || text.length > 4000) return fail('El texto es demasiado largo.')
  const e = await repo.getEntry(entryId)
  if (!e || e.patientId !== patientId) return fail('No encontramos esa atención.')
  const r = await repo.addAddendum(entryId, u.id, reason.trim(), text.trim())
  if (!r.ok) return fail(r.message ?? 'No se pudo agregar la adenda.')
  await audit(u.id, 'add_addendum', 'entry', entryId)
  revalidatePath(`/panel/pacientes/${patientId}`)
  return { ok: true }
}

// ───────── Consentimientos ─────────
export async function grantConsent(patientId: string, kind: string, documentRef: string): Promise<Res> {
  const u = await requireUser()
  const k = z.enum(['tratamiento', 'fotos', 'datos']).safeParse(kind)
  if (!k.success || !uuid.safeParse(patientId).success) return fail('Datos no válidos.')
  if (!(await repo.grantConsent(patientId, k.data, documentRef.trim().slice(0, 200), u.id))) return fail('No encontramos al paciente.')
  await audit(u.id, 'grant_consent', 'patient', patientId)
  revalidatePath(`/panel/pacientes/${patientId}`)
  return { ok: true }
}

export async function revokeConsent(patientId: string, consentId: string): Promise<Res> {
  const u = await requireUser()
  if (!uuid.safeParse(patientId).success || !(await repo.revokeConsent(patientId, consentId))) return fail('No se pudo revocar.')
  await audit(u.id, 'revoke_consent', 'patient', patientId)
  revalidatePath(`/panel/pacientes/${patientId}`)
  return { ok: true }
}

// ───────── Fotos ─────────
export async function deletePhoto(photoId: string): Promise<Res> {
  const u = await requireUser()
  const row = await repo.getPhotoRow(photoId)
  if (!row) return fail('No encontramos la foto.')
  if (u.role !== 'admin' && row.createdBy !== u.id) return fail('Solo quien subió la foto o el administrador pueden borrarla.')
  await repo.deletePhotoRow(photoId) // borrado lógico: el archivo se purga con la retención, no acá
  await audit(u.id, 'delete_photo', 'photo', photoId)
  revalidatePath(`/panel/pacientes/${row.patientId}`)
  return { ok: true }
}
