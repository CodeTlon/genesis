import sharp from 'sharp'
import { deleteMediaByUrl, saveMedia } from '@genesis/db/content'

export const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000'

/** Avisa al sitio público que cambió el contenido para que se actualice al instante (si falla, se actualiza solo en ≤ 60 s). */
export async function publishSite(): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret')
  if (!secret) return
  try {
    await fetch(`${WEB_URL}/api/revalidate`, { method: 'POST', headers: { 'x-revalidate-secret': secret }, signal: AbortSignal.timeout(3000) })
  } catch {
    /* el sitio igual se refresca por tiempo */
  }
}

/** Las rutas estáticas del sitio (/img/...) se ven desde el panel a través del sitio. */
export const previewUrl = (src: string) => (src.startsWith('/img/') ? `${WEB_URL}${src}` : src)

const MAX_BYTES = 4 * 1024 * 1024 // Vercel corta el cuerpo en ~4,5 MB
const OK_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export class UserError extends Error {}

/** Procesa y guarda una imagen: corrige orientación, la achica, la pasa a WebP y descarta los metadatos (EXIF/GPS). */
export async function uploadImage(file: File): Promise<string> {
  if (!OK_TYPES.has(file.type)) throw new UserError('Subí una imagen JPG, PNG o WebP.')
  if (file.size > MAX_BYTES) throw new UserError('La imagen pesa más de 4 MB. Probá con una más liviana.')
  const buf = Buffer.from(await file.arrayBuffer())
  let out: { data: Buffer; info: sharp.OutputInfo }
  try {
    out = await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true })
  } catch {
    throw new UserError('No pudimos leer esa imagen. Probá con otra.')
  }
  const name = file.name.replace(/\.[^.]+$/, '').slice(0, 80) || 'imagen'
  const id = await saveMedia({ filename: `${name}.webp`, mime: 'image/webp', bytes: out.data, width: out.info.width, height: out.info.height })
  return `/media/${id}`
}

/** Resuelve el valor final de un campo de imagen del formulario: archivo nuevo, quitar, o dejar la actual. */
/** Solo rutas propias (/img/... del sitio o /media/... de la base): una URL externa rompe next/image en el sitio público. */
export function safeImage(v: string): string {
  const s = v.trim()
  return s === '' || (/^\/(img|media)\/[\w./-]+$/.test(s) && !s.includes('..')) ? s : ''
}

export async function resolveImage(fd: FormData, name: string): Promise<string> {
  const current = safeImage(String(fd.get(name) ?? ''))
  const file = fd.get(`${name}__file`)
  if (file instanceof File && file.size > 0) {
    const url = await uploadImage(file)
    if (current) await deleteMediaByUrl(current)
    return url
  }
  if (fd.get(`${name}__remove`) === 'on') {
    if (current) await deleteMediaByUrl(current)
    return ''
  }
  return current
}

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()

export function jsonList<T>(fd: FormData, k: string): T[] {
  try {
    const v = JSON.parse(String(fd.get(k) ?? '[]'))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
