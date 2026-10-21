// Almacenamiento privado de fotos clínicas. Nunca dentro de public/ ni servido por una ruta pública.
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024
// Lista cerrada de tipos de entrada. HEIC no se acepta acá: el celular lo convierte a JPEG al subir desde el navegador.
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

const root = () => path.resolve(process.env.PHOTOS_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), '.data', 'clinico'))
const fileOf = (key: string) => {
  if (!/^[0-9a-f-]{36}\.webp$/.test(key)) throw new Error('storage_key inválida')
  return path.join(/*turbopackIgnore: true*/ root(), key)
}

export class PhotoError extends Error {}

/** Valida por contenido (no por extensión ni Content-Type), re-encodea a WebP sin metadatos y genera la miniatura. */
export async function storePhoto(buf: Buffer, declaredMime: string): Promise<{ storageKey: string; thumbKey: string }> {
  if (buf.length === 0) throw new PhotoError('El archivo está vacío.')
  if (buf.length > MAX_PHOTO_BYTES) throw new PhotoError('La foto pesa más de 8 MB. Sacala con menos resolución o comprimila.')
  if (!ALLOWED.has(declaredMime)) throw new PhotoError('Solo se aceptan fotos JPG, PNG o WebP.')
  let full: Buffer, thumb: Buffer
  try {
    const img = sharp(buf, { limitInputPixels: 60_000_000 }).rotate() // aplica la orientación y descarta EXIF/GPS en la salida
    const meta = await img.metadata()
    if (!meta.format || !['jpeg', 'png', 'webp'].includes(meta.format)) throw new PhotoError('El archivo no es una foto válida.')
    full = await img.clone().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
    thumb = await img.clone().resize({ width: 360, height: 360, fit: 'cover' }).webp({ quality: 70 }).toBuffer()
  } catch (e) {
    if (e instanceof PhotoError) throw e
    throw new PhotoError('No pudimos leer la foto. Probá con otra.')
  }
  const storageKey = `${randomUUID()}.webp`
  const thumbKey = `${randomUUID()}.webp`
  await mkdir(root(), { recursive: true, mode: 0o700 })
  await writeFile(fileOf(storageKey), full, { mode: 0o600 })
  await writeFile(fileOf(thumbKey), thumb, { mode: 0o600 })
  return { storageKey, thumbKey }
}

export const readStored = (key: string) => readFile(/*turbopackIgnore: true*/ fileOf(key))
export async function removeStored(...keys: (string | null | undefined)[]) {
  for (const k of keys) if (k) await unlink(fileOf(k)).catch(() => {})
}
