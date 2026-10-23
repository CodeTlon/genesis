// Esquema Drizzle (tipos para consultar). La fuente de verdad de la estructura son las migraciones SQL (migrations/*.sql):
// se aplican al arrancar y fallan cerrado; este archivo las refleja y no genera migraciones por su cuenta.
import { sql } from 'drizzle-orm'
import { bigserial, boolean, date, index, integer, jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

// ───────── Better Auth ─────────
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('profesional'),
  licenseNo: text('license_no'),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: ts('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: ts('access_token_expires_at'),
  refreshTokenExpiresAt: ts('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: ts('expires_at').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})

// ───────── Clínico ─────────
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dni: text('dni'),
  birthDate: date('birth_date'),
  phone: text('phone'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  insurance: text('insurance'),
  occupation: text('occupation'),
  firstVisit: date('first_visit'),
  nationality: text('nationality'),
  sex: text('sex'),
  heightCm: numeric('height_cm'),
  weightKg: numeric('weight_kg'),
  bloodGroup: text('blood_group'),
  otherActivities: text('other_activities'),
  guardianName: text('guardian_name'),
  alerts: text('alerts').array().notNull().default(sql`'{}'`),
  deletedAt: ts('deleted_at'),
  createdBy: text('created_by'),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const antecedentes = pgTable('patient_antecedentes', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  version: integer('version').notNull(),
  flags: jsonb('flags').$type<Record<string, unknown>>().notNull().default({}),
  notesEnc: text('notes_enc'),
  createdBy: text('created_by').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  title: text('title').notNull(),
  reasonEnc: text('reason_enc'),
  status: text('status').$type<'open' | 'closed'>().notNull().default('open'),
  openedAt: ts('opened_at').notNull().defaultNow(),
  closedAt: ts('closed_at'),
  conclusionEnc: text('conclusion_enc'),
  suggestionsEnc: text('suggestions_enc'),
  createdBy: text('created_by').notNull(),
}, (t) => [index('cases_patient_idx').on(t.patientId, t.status)])

export const entries = pgTable('clinical_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  caseId: uuid('case_id').references(() => cases.id),
  authorUserId: text('author_user_id'),
  templateCode: text('template_code'),
  templateVersion: integer('template_version').notNull().default(1),
  footType: text('foot_type').$type<'egipcio' | 'griego' | 'romano'>(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  status: text('status').$type<'draft' | 'signed'>().notNull().default('draft'),
  signedAt: ts('signed_at'),
  prevHash: text('prev_hash'),
  hash: text('hash'),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const addenda = pgTable('clinical_addenda', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => entries.id),
  authorUserId: text('author_user_id'),
  reason: text('reason').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  kind: text('kind').$type<'tratamiento' | 'fotos' | 'datos'>().notNull(),
  grantedAt: ts('granted_at').notNull().defaultNow(),
  revokedAt: ts('revoked_at'),
  documentRef: text('document_ref'),
  createdBy: text('created_by').notNull(),
})

export const photos = pgTable('clinical_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  caseId: uuid('case_id').references(() => cases.id),
  entryId: uuid('entry_id').references(() => entries.id),
  kind: text('kind').$type<'inicial' | 'evolucion' | 'final'>().notNull(),
  storageKey: text('storage_key').notNull(),
  thumbKey: text('thumb_key'),
  mime: text('mime').notNull().default('image/webp'),
  consentId: uuid('consent_id').notNull().references(() => consents.id),
  takenAt: date('taken_at'),
  deletedAt: ts('deleted_at'),
  createdBy: text('created_by').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const auditLog = pgTable('audit_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  at: ts('at').notNull().defaultNow(),
  userId: text('user_id'),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  ip: text('ip'),
})
