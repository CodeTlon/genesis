// Capa de datos clínica sobre Postgres (Drizzle). Solo se importa desde servidor.
// Toda función asume que el llamador ya validó la sesión (requireUser) y los datos de entrada (zod en actions.ts).
// Los textos clínicos libres (antecedentes, motivo, conclusión, payload de evoluciones) se guardan cifrados (crypto.ts).
import { createHash } from 'node:crypto'
import { and, asc, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm'
import { db, schema, TENANT_ID } from '@genesis/db/client'
import { decOpt, decryptJson, encOpt, encryptJson } from './crypto'
import { ANTECEDENTE_ITEMS, EMPTY_DIABETES, type DiabetesInfo, type Addendum, type Alert, type Antecedentes, type Case, type Entry, type EntryPayload, type Patient, type Photo, type PhotoKind } from './types'

const { patients: P, antecedentes: A, cases: C, entries: E, addenda: AD, photos: PH, user: U } = schema

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (s: string) => UUID.test(s)
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined)

// ───────── Pacientes ─────────
const toPatient = (r: typeof P.$inferSelect): Patient => ({
  id: r.id, firstName: r.firstName, lastName: r.lastName, dni: r.dni ?? '', birthDate: r.birthDate ?? '', phone: r.phone ?? '',
  address: r.address ?? '', occupation: r.occupation ?? '', insurance: r.insurance ?? '', emergencyContact: r.emergencyContact ?? '',
  guardian: r.guardianName ?? '', alerts: r.alerts as Alert[],
  firstVisit: r.firstVisit ?? '', nationality: r.nationality ?? '', sex: r.sex ?? '', heightCm: r.heightCm ?? '', weightKg: r.weightKg ?? '',
  bloodGroup: r.bloodGroup ?? '', otherActivities: r.otherActivities ?? '',
})

const notDeleted = and(eq(P.tenantId, TENANT_ID), isNull(P.deletedAt))

export type PatientFilters = { filter?: 'alertas' | 'caso-abierto' | 'sin-casos' | 'menores'; alert?: Alert; orden?: 'apellido' | 'recientes' }
const likeTerm = (term: string) => sql`'%' || lower(immutable_unaccent(${term})) || '%'`

const patientWhere = (q?: string, f: PatientFilters = {}) => {
  const term = q?.trim()
  return and(
    notDeleted,
    term ? sql`search_text like ${likeTerm(term)}` : undefined,
    f.filter === 'alertas' ? sql`cardinality(${P.alerts}) > 0` : undefined,
    f.filter === 'menores' ? sql`'menor' = any(${P.alerts})` : undefined,
    f.filter === 'caso-abierto' ? sql`exists (select 1 from cases c where c.patient_id = ${P.id} and c.status = 'open')` : undefined,
    f.filter === 'sin-casos' ? sql`not exists (select 1 from cases c where c.patient_id = ${P.id})` : undefined,
    f.alert ? sql`${f.alert} = any(${P.alerts})` : undefined,
  )
}

export async function listPatients(q?: string, limit = 200, offset = 0, f: PatientFilters = {}): Promise<Patient[]> {
  const order = f.orden === 'recientes' ? [desc(P.createdAt), asc(P.id)] : [asc(P.lastName), asc(P.firstName), asc(P.id)]
  const rows = await db().select().from(P).where(patientWhere(q, f)).orderBy(...order).limit(limit).offset(offset)
  return rows.map(toPatient)
}

export async function countPatients(q?: string, f: PatientFilters = {}): Promise<number> {
  const [r] = await db().select({ n: sql<number>`count(*)::int` }).from(P).where(patientWhere(q, f))
  return r?.n ?? 0
}

export async function getPatient(id: string): Promise<Patient | null> {
  if (!isUuid(id)) return null
  const [r] = await db().select().from(P).where(and(notDeleted, eq(P.id, id)))
  return r ? toPatient(r) : null
}

export type PatientInput = Omit<Patient, 'id' | 'alerts'>
const patientCols = (i: PatientInput) => ({
  firstName: i.firstName, lastName: i.lastName, dni: i.dni || null, birthDate: i.birthDate || null, phone: i.phone || null,
  address: i.address || null, occupation: i.occupation || null, insurance: i.insurance || null,
  emergencyContact: i.emergencyContact || null, guardianName: i.guardian || null,
  firstVisit: i.firstVisit || null, nationality: i.nationality || null, sex: i.sex || null, heightCm: i.heightCm ? i.heightCm.replace(',', '.') : null,
  weightKg: i.weightKg ? i.weightKg.replace(',', '.') : null, bloodGroup: i.bloodGroup || null, otherActivities: i.otherActivities || null,
})

export const isMinor = (birthDate: string, now = new Date()) => {
  if (!birthDate) return false
  const b = new Date(birthDate + 'T00:00:00Z')
  const age = now.getUTCFullYear() - b.getUTCFullYear() - (now.getUTCMonth() < b.getUTCMonth() || (now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() < b.getUTCDate()) ? 1 : 0)
  return age < 18
}

export function alertsFrom(flags: Record<string, boolean>, birthDate: string): Alert[] {
  const out = new Set<Alert>()
  for (const it of ANTECEDENTE_ITEMS) if (it.alert && flags[it.id]) out.add(it.alert)
  if (isMinor(birthDate)) out.add('menor')
  return [...out]
}

export async function createPatient(i: PatientInput, userId: string): Promise<string> {
  const alerts = alertsFrom({}, i.birthDate)
  const [r] = await db().insert(P).values({ tenantId: TENANT_ID, ...patientCols(i), alerts, createdBy: userId }).returning({ id: P.id })
  return r.id
}

export async function updatePatient(id: string, i: PatientInput): Promise<boolean> {
  const cur = await latestAntecedentes(id)
  const alerts = alertsFrom(cur?.flags ?? {}, i.birthDate)
  const r = await db().update(P).set({ ...patientCols(i), alerts }).where(and(notDeleted, eq(P.id, id))).returning({ id: P.id })
  return r.length > 0
}

/** Borrado lógico: los datos clínicos no se eliminan físicamente (retención). */
export async function archivePatient(id: string): Promise<boolean> {
  const r = await db().update(P).set({ deletedAt: new Date() }).where(and(notDeleted, eq(P.id, id))).returning({ id: P.id })
  return r.length > 0
}

// ───────── Antecedentes ─────────
type AntPayload = { notes: string; medication: string; footwear: string; activity: string; familiares?: string; diabetes?: DiabetesInfo }

export async function latestAntecedentes(patientId: string): Promise<Antecedentes | null> {
  if (!isUuid(patientId)) return null
  const [r] = await db().select().from(A).where(eq(A.patientId, patientId)).orderBy(desc(A.version)).limit(1)
  if (!r) return null
  const extra: AntPayload = r.notesEnc ? JSON.parse(decOpt(r.notesEnc)) : { notes: '', medication: '', footwear: '', activity: '' }
  return { version: r.version, flags: r.flags as Record<string, boolean>, createdAt: r.createdAt.toISOString(), ...extra, familiares: extra.familiares ?? '', diabetes: { ...EMPTY_DIABETES, ...extra.diabetes } }
}

/** Cada guardado crea una versión nueva (historial); las alertas del paciente se recalculan. */
export async function saveAntecedentes(patientId: string, d: { flags: Record<string, boolean>; notes: string; medication: string; footwear: string; activity: string; familiares: string; diabetes: DiabetesInfo }, userId: string): Promise<boolean> {
  const p = await getPatient(patientId)
  if (!p) return false
  await db().transaction(async (tx) => {
    const [{ v }] = await tx.select({ v: sql<number>`coalesce(max(${A.version}), 0)::int` }).from(A).where(eq(A.patientId, patientId))
    await tx.insert(A).values({
      patientId, version: v + 1, flags: d.flags, createdBy: userId,
      notesEnc: encOpt(JSON.stringify({ notes: d.notes, medication: d.medication, footwear: d.footwear, activity: d.activity, familiares: d.familiares, diabetes: d.diabetes } satisfies AntPayload)),
    })
    await tx.update(P).set({ alerts: alertsFrom(d.flags, p.birthDate) }).where(eq(P.id, patientId))
  })
  return true
}

// ───────── Casos ─────────
const toCase = (r: typeof C.$inferSelect): Case => ({
  id: r.id, patientId: r.patientId, title: r.title, reason: decOpt(r.reasonEnc), status: r.status,
  openedAt: r.openedAt.toISOString(), closedAt: iso(r.closedAt), conclusion: decOpt(r.conclusionEnc), suggestions: decOpt(r.suggestionsEnc),
})

export async function listCases(patientId: string): Promise<Case[]> {
  if (!isUuid(patientId)) return []
  const rows = await db().select().from(C).where(eq(C.patientId, patientId)).orderBy(desc(C.openedAt))
  return rows.map(toCase)
}

export async function getCase(id: string): Promise<Case | null> {
  if (!isUuid(id)) return null
  const [r] = await db().select().from(C).where(eq(C.id, id))
  return r ? toCase(r) : null
}

export async function openCase(patientId: string, title: string, reason: string, userId: string): Promise<string | null> {
  if (!(await getPatient(patientId))) return null
  const [r] = await db().insert(C).values({ patientId, title, reasonEnc: encOpt(reason), createdBy: userId }).returning({ id: C.id })
  return r.id
}

export async function closeCase(id: string, conclusion: string, suggestions: string): Promise<boolean> {
  const r = await db().update(C).set({ status: 'closed', closedAt: new Date(), conclusionEnc: encOpt(conclusion), suggestionsEnc: encOpt(suggestions) })
    .where(and(eq(C.id, id), eq(C.status, 'open'))).returning({ id: C.id })
  return r.length > 0
}

export async function reopenCase(id: string): Promise<boolean> {
  const r = await db().update(C).set({ status: 'open', closedAt: null }).where(and(eq(C.id, id), eq(C.status, 'closed'))).returning({ id: C.id })
  return r.length > 0
}

// ───────── Evoluciones ─────────
async function hydrateEntries(rows: { e: typeof E.$inferSelect; author: string | null }[]): Promise<Entry[]> {
  if (!rows.length) return []
  const ads = await db().select({ a: AD, author: U.name }).from(AD).leftJoin(U, eq(U.id, AD.authorUserId))
    .where(inArray(AD.entryId, rows.map((r) => r.e.id))).orderBy(asc(AD.createdAt))
  return rows.map(({ e, author }) => ({
    id: e.id, patientId: e.patientId, caseId: e.caseId ?? undefined, templateCode: 'B' as const, templateVersion: e.templateVersion,
    payload: decryptJson<EntryPayload>(e.payload), status: e.status, author: author ?? '—',
    createdAt: e.createdAt.toISOString(), signedAt: iso(e.signedAt),
    addenda: ads.filter((x) => x.a.entryId === e.id).map((x): Addendum => {
      const p = decryptJson<{ text: string }>(x.a.payload)
      return { id: x.a.id, author: x.author ?? '—', reason: x.a.reason, text: p.text, at: x.a.createdAt.toISOString() }
    }),
  }))
}

export async function listEntries(patientId: string, caseId?: string, page?: { limit: number; offset: number }): Promise<Entry[]> {
  if (!isUuid(patientId)) return []
  const where = caseId ? and(eq(E.patientId, patientId), eq(E.caseId, caseId)) : eq(E.patientId, patientId)
  const q = db().select({ e: E, author: U.name }).from(E).leftJoin(U, eq(U.id, E.authorUserId)).where(where).orderBy(desc(E.createdAt), desc(E.id))
  return hydrateEntries(page ? await q.limit(page.limit).offset(page.offset) : await q)
}

export async function countEntries(patientId: string, caseId: string): Promise<number> {
  if (!isUuid(patientId) || !isUuid(caseId)) return 0
  return count(db().select({ n: sql<number>`count(*)::int` }).from(E).where(and(eq(E.patientId, patientId), eq(E.caseId, caseId))))
}

export async function getEntry(id: string): Promise<Entry | null> {
  if (!isUuid(id)) return null
  const rows = await db().select({ e: E, author: U.name }).from(E).leftJoin(U, eq(U.id, E.authorUserId)).where(eq(E.id, id))
  return (await hydrateEntries(rows))[0] ?? null
}

export type SaveEntryResult = { ok: true; entry: Entry } | { ok: false; message: string }

/** Borrador editable hasta firmar. Al firmar se encadena el hash con la última evolución firmada del paciente. */
export async function saveEntry(input: { id?: string; patientId: string; caseId?: string; payload: EntryPayload; sign: boolean; userId: string }): Promise<SaveEntryResult> {
  if (!(await getPatient(input.patientId))) return { ok: false, message: 'No encontramos al paciente.' }
  if (input.caseId) {
    const c = await getCase(input.caseId)
    if (!c || c.patientId !== input.patientId) return { ok: false, message: 'El caso no corresponde a este paciente.' }
    if (c.status === 'closed') return { ok: false, message: 'El caso está cerrado. Reabrilo para agregar evoluciones.' }
  }
  const stored = encryptJson(input.payload)
  const footType = input.payload.footType ?? null
  const now = new Date()
  let id = input.id
  try {
    await db().transaction(async (tx) => {
      if (id) {
        const [cur] = await tx.select().from(E).where(and(eq(E.id, id), eq(E.patientId, input.patientId))).for('update')
        if (!cur) throw new UserErr('No encontramos esa atención.')
        if (cur.status === 'signed') throw new UserErr('Esta atención ya está firmada. Para corregirla, agregá una adenda.')
        if (cur.authorUserId !== input.userId) throw new UserErr('Solo quien empezó el borrador puede editarlo.')
        await tx.update(E).set({ payload: stored, footType, caseId: input.caseId ?? null }).where(eq(E.id, id))
      } else {
        const [r] = await tx.insert(E).values({ tenantId: TENANT_ID, patientId: input.patientId, caseId: input.caseId ?? null, authorUserId: input.userId, templateCode: 'B', payload: stored, footType }).returning({ id: E.id })
        id = r.id
      }
      if (input.sign) {
        const [prev] = await tx.select({ hash: E.hash }).from(E).where(and(eq(E.patientId, input.patientId), eq(E.status, 'signed'))).orderBy(desc(E.signedAt)).limit(1)
        const hash = createHash('sha256').update(`${prev?.hash ?? ''}|${id}|${input.patientId}|${JSON.stringify(stored)}|${now.toISOString()}`).digest('hex')
        await tx.update(E).set({ status: 'signed', signedAt: now, prevHash: prev?.hash ?? null, hash }).where(eq(E.id, id!))
      }
    })
  } catch (e) {
    if (e instanceof UserErr) return { ok: false, message: e.message }
    throw e
  }
  return { ok: true, entry: (await getEntry(id!))! }
}

class UserErr extends Error {}

export async function addAddendum(entryId: string, userId: string, reason: string, text: string): Promise<{ ok: boolean; message?: string }> {
  const e = await getEntry(entryId)
  if (!e || e.status !== 'signed') return { ok: false, message: 'Solo se pueden agregar adendas a atenciones firmadas.' }
  await db().insert(AD).values({ entryId, authorUserId: userId, reason, payload: encryptJson({ text }) })
  return { ok: true }
}

// ───────── Fotos (metadatos; el archivo vive en el volumen privado, ver photos.ts) ─────────
const toPhoto = (r: typeof PH.$inferSelect): Photo => ({
  id: r.id, createdBy: r.createdBy, patientId: r.patientId, caseId: r.caseId ?? undefined, entryId: r.entryId ?? undefined, kind: r.kind,
  takenAt: r.takenAt ?? r.createdAt.toISOString().slice(0, 10), createdAt: r.createdAt.toISOString(),
})

export async function listPhotos(patientId: string, caseId?: string): Promise<Photo[]> {
  if (!isUuid(patientId)) return []
  const where = and(eq(PH.patientId, patientId), isNull(PH.deletedAt), caseId ? eq(PH.caseId, caseId) : undefined)
  return (await db().select().from(PH).where(where).orderBy(asc(PH.takenAt), asc(PH.createdAt))).map(toPhoto)
}

export async function getPhotoRow(id: string) {
  if (!isUuid(id)) return null
  const [r] = await db().select().from(PH).where(and(eq(PH.id, id), isNull(PH.deletedAt)))
  return r ?? null
}

export async function addPhotoRow(i: { patientId: string; caseId?: string; entryId?: string; kind: PhotoKind; storageKey: string; thumbKey: string; takenAt?: string; userId: string }): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!(await getPatient(i.patientId))) return { ok: false, message: 'No encontramos al paciente.' }
  if (i.caseId) {
    const c = await getCase(i.caseId)
    if (!c || c.patientId !== i.patientId) return { ok: false, message: 'El caso no corresponde a este paciente.' }
  }
  const [r] = await db().insert(PH).values({
    patientId: i.patientId, caseId: i.caseId ?? null, entryId: i.entryId ?? null, kind: i.kind, storageKey: i.storageKey, thumbKey: i.thumbKey,
    takenAt: i.takenAt || null, createdBy: i.userId,
  }).returning({ id: PH.id })
  return { ok: true, id: r.id }
}

export async function deletePhotoRow(id: string): Promise<boolean> {
  const r = await db().update(PH).set({ deletedAt: new Date() }).where(and(eq(PH.id, id), isNull(PH.deletedAt))).returning({ id: PH.id })
  return r.length > 0
}

// ───────── Inicio (resumen) y listados globales ─────────
export type Pending = { entryId: string; patientId: string; caseId?: string; patient: string; caseTitle?: string; at: string }
export type Dashboard = { patients: number; openCases: number; drafts: number; signedThisMonth: number; pending: Pending[]; latestPatients: { id: string; name: string; createdAt: string }[] }

const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))
const count = async (q: PromiseLike<{ n: number }[]>) => (await q)[0]?.n ?? 0

export type AttentionFilters = { q?: string; periodo?: 'mes' | 'mes-pasado' | '90' | 'todas'; orden?: 'reciente' | 'antiguo' }

const attentionWhere = (status: 'draft' | 'signed', f: AttentionFilters) => {
  const term = f.q?.trim()
  const now = new Date()
  const from = f.periodo === 'mes' ? monthStart() : f.periodo === 'mes-pasado' ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)) : f.periodo === '90' ? new Date(now.getTime() - 90 * 864e5) : undefined
  const to = f.periodo === 'mes-pasado' ? monthStart() : undefined
  return and(
    eq(E.status, status), notDeleted,
    status === 'signed' && from ? gte(E.signedAt, from) : undefined,
    status === 'signed' && to ? sql`${E.signedAt} < ${to}` : undefined,
    term ? sql`(search_text like ${likeTerm(term)} or lower(immutable_unaccent(coalesce(${C.title}, ''))) like ${likeTerm(term)})` : undefined,
  )
}

/** Evoluciones de todos los pacientes, sin firmar o firmadas, con búsqueda por paciente o caso y período. Solo metadatos: no descifra nada clínico. */
export async function listAttentions(status: 'draft' | 'signed', opts: AttentionFilters & { limit?: number; offset?: number } = {}): Promise<Pending[]> {
  const at = status === 'draft' ? E.createdAt : E.signedAt
  const rows = await db().select({ id: E.id, patientId: E.patientId, caseId: E.caseId, first: P.firstName, last: P.lastName, caseTitle: C.title, at })
    .from(E).innerJoin(P, eq(P.id, E.patientId)).leftJoin(C, eq(C.id, E.caseId)).where(attentionWhere(status, opts))
    .orderBy(opts.orden === 'antiguo' ? asc(at) : desc(at), desc(E.id)).limit(opts.limit ?? 50).offset(opts.offset ?? 0)
  return rows.map((r) => ({ entryId: r.id, patientId: r.patientId, caseId: r.caseId ?? undefined, patient: `${r.first} ${r.last}`, caseTitle: r.caseTitle ?? undefined, at: (r.at ?? new Date()).toISOString() }))
}

export async function countAttentions(status: 'draft' | 'signed', f: AttentionFilters = {}): Promise<number> {
  return count(db().select({ n: sql<number>`count(*)::int` }).from(E).innerJoin(P, eq(P.id, E.patientId)).leftJoin(C, eq(C.id, E.caseId)).where(attentionWhere(status, f)))
}

export type CaseFilters = { q?: string; estado?: 'abiertos' | 'cerrados' | 'todos'; borrador?: boolean; orden?: 'reciente' | 'antiguo' }
export type CaseRow = { caseId: string; patientId: string; patient: string; title: string; status: 'open' | 'closed'; openedAt: string; lastAt: string; drafts: number }

const caseWhere = (f: CaseFilters) => {
  const term = f.q?.trim()
  return and(
    notDeleted,
    f.estado === 'cerrados' ? eq(C.status, 'closed') : f.estado === 'todos' ? undefined : eq(C.status, 'open'),
    term ? sql`(search_text like ${likeTerm(term)} or lower(immutable_unaccent(${C.title})) like ${likeTerm(term)})` : undefined,
    f.borrador ? sql`exists (select 1 from clinical_entries e where e.case_id = ${C.id} and e.status = 'draft')` : undefined,
  )
}

/** Casos de todos los pacientes (por defecto los abiertos), filtrables por texto, estado y borradores; el de actividad más reciente primero. */
export async function listAllCases(f: CaseFilters = {}, limit = 50, offset = 0): Promise<CaseRow[]> {
  const last = sql<Date>`coalesce(max(${E.createdAt}), ${C.openedAt})`
  const rows = await db().select({
    id: C.id, patientId: C.patientId, first: P.firstName, lastName: P.lastName, title: C.title, status: C.status, openedAt: C.openedAt, lastAt: last,
    drafts: sql<number>`count(${E.id}) filter (where ${E.status} = 'draft')::int`,
  }).from(C).innerJoin(P, eq(P.id, C.patientId)).leftJoin(E, eq(E.caseId, C.id))
    .where(caseWhere(f)).groupBy(C.id, P.id).orderBy(f.orden === 'antiguo' ? asc(last) : desc(last), desc(C.id)).limit(limit).offset(offset)
  return rows.map((r) => ({ caseId: r.id, patientId: r.patientId, patient: `${r.first} ${r.lastName}`, title: r.title, status: r.status, openedAt: r.openedAt.toISOString(), lastAt: new Date(r.lastAt).toISOString(), drafts: r.drafts }))
}

export async function countAllCases(f: CaseFilters = {}): Promise<number> {
  return count(db().select({ n: sql<number>`count(*)::int` }).from(C).innerJoin(P, eq(P.id, C.patientId)).where(caseWhere(f)))
}

/** Números y listas cortas para la pantalla de inicio. */
export async function dashboard(): Promise<Dashboard> {
  const [patients, openCases, drafts, signedThisMonth, pending, latest] = await Promise.all([
    count(db().select({ n: sql<number>`count(*)::int` }).from(P).where(notDeleted)),
    count(db().select({ n: sql<number>`count(*)::int` }).from(C).innerJoin(P, eq(P.id, C.patientId)).where(and(eq(C.status, 'open'), notDeleted))),
    count(db().select({ n: sql<number>`count(*)::int` }).from(E).innerJoin(P, eq(P.id, E.patientId)).where(and(eq(E.status, 'draft'), notDeleted))),
    count(db().select({ n: sql<number>`count(*)::int` }).from(E).innerJoin(P, eq(P.id, E.patientId)).where(and(eq(E.status, 'signed'), gte(E.signedAt, monthStart()), notDeleted))),
    listAttentions('draft', { limit: 5 }),
    db().select({ id: P.id, first: P.firstName, last: P.lastName, createdAt: P.createdAt }).from(P).where(notDeleted).orderBy(desc(P.createdAt)).limit(6),
  ])
  return { patients, openCases, drafts, signedThisMonth, pending, latestPatients: latest.map((r) => ({ id: r.id, name: `${r.first} ${r.last}`, createdAt: r.createdAt.toISOString() })) }
}

/** Evoluciones sin firmar (para el aviso de la barra lateral). */
export async function draftCount(): Promise<number> {
  return count(db().select({ n: sql<number>`count(*)::int` }).from(E).innerJoin(P, eq(P.id, E.patientId)).where(and(eq(E.status, 'draft'), notDeleted)))
}

