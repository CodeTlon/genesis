import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// REQ-SEG-004: contenido clínico cifrado en la base. AES-256-GCM con IV aleatorio por valor; el id de la fila va como dato
// autenticado (AAD), así un valor copiado a otra fila no se puede leer. Sin dependencias: lo usan la app, los scripts y los tests.

const PREFIX = 'enc:v1:'

function key(): Buffer {
  const raw = process.env.GENESIS_DATA_KEY
  if (!raw) throw new Error('Falta GENESIS_DATA_KEY (32 bytes en base64). Sin la clave no se puede guardar ni leer contenido clínico.')
  const k = Buffer.from(raw, 'base64')
  if (k.length !== 32) throw new Error('GENESIS_DATA_KEY debe ser de 32 bytes en base64.')
  return k
}

/** iv (12) | tag (16) | cifrado */
export function seal(plain: Buffer, aad: string): Buffer {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', key(), iv)
  c.setAAD(Buffer.from(aad))
  const body = Buffer.concat([c.update(plain), c.final()])
  return Buffer.concat([iv, c.getAuthTag(), body])
}

export function open(blob: Buffer, aad: string): Buffer {
  const d = createDecipheriv('aes-256-gcm', key(), blob.subarray(0, 12))
  d.setAAD(Buffer.from(aad))
  d.setAuthTag(blob.subarray(12, 28))
  return Buffer.concat([d.update(blob.subarray(28)), d.final()])
}

export const sealText = (s: string, aad: string): string => PREFIX + seal(Buffer.from(s, 'utf8'), aad).toString('base64')

/** Un texto sin el prefijo es un dato anterior al cifrado: se devuelve tal cual. */
export const openText = (s: string, aad: string): string => (s.startsWith(PREFIX) ? open(Buffer.from(s.slice(PREFIX.length), 'base64'), aad).toString('utf8') : s)

/** Lo que se guarda en una columna jsonb: { enc: "enc:v1:..." }. */
export const sealJson = (v: unknown, aad: string): { enc: string } => ({ enc: sealText(JSON.stringify(v), aad) })

export function openJson<T>(v: unknown, aad: string): T {
  if (v && typeof v === 'object' && 'enc' in v && typeof (v as { enc: unknown }).enc === 'string') return JSON.parse(openText((v as { enc: string }).enc, aad)) as T
  return v as T
}
