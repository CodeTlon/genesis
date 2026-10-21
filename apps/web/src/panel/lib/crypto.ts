import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * Cifrado a nivel aplicación (AES-256-GCM) de los campos de texto libre clínicos.
 * La clave (32 bytes en base64 o 64 hex) es obligatoria, distinta por entorno y se guarda fuera del repo y del backup de la base:
 * si se pierde, los datos cifrados son irrecuperables. Generar con: openssl rand -base64 32
 */
function key(): Buffer {
  const raw = process.env.CLINICAL_DATA_ENCRYPTION_KEY
  if (!raw) throw new Error('CLINICAL_DATA_ENCRYPTION_KEY no configurada')
  const k = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  if (k.length !== 32) throw new Error('CLINICAL_DATA_ENCRYPTION_KEY debe ser de 32 bytes (base64 o 64 hex)')
  return k
}

const PREFIX = 'v1'

export function encrypt(plain: string): string {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', key(), iv)
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return [PREFIX, iv.toString('base64'), c.getAuthTag().toString('base64'), ct.toString('base64')].join(':')
}

export function decrypt(blob: string): string {
  const [v, iv, tag, ct] = blob.split(':')
  if (v !== PREFIX || !iv || !tag || !ct) throw new Error('Dato cifrado con formato desconocido')
  const d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
  d.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([d.update(Buffer.from(ct, 'base64')), d.final()]).toString('utf8')
}

export const encOpt = (s: string | null | undefined): string | null => (s && s.trim() ? encrypt(s) : null)
export const decOpt = (s: string | null | undefined): string => (s ? decrypt(s) : '')

/** Payloads JSON (evoluciones): se guardan como {"enc": "..."} en la columna jsonb. */
export const encryptJson = (o: unknown): { enc: string } => ({ enc: encrypt(JSON.stringify(o)) })
export function decryptJson<T>(stored: unknown): T {
  const s = stored as { enc?: string }
  if (!s || typeof s.enc !== 'string') throw new Error('Payload clínico sin cifrar: se rechaza')
  return JSON.parse(decrypt(s.enc)) as T
}
