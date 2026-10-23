'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { audit, requireUser } from './auth'
import { grantImageConsent, savePhoto, type PhotoKind } from './store'

const MAX = 4 * 1024 * 1024

/** REQ-FOT-001/002: sube una foto clínica. Se reduce y se re-codifica a WebP (esto también borra los metadatos EXIF, como la ubicación). */
export async function uploadPhoto(formData: FormData) {
  const u = await requireUser()
  const patientId = String(formData.get('patientId') ?? '')
  const back = (q: string) => redirect(`/pacientes/${patientId}?${q}#fotos`)
  const kind = formData.get('kind') as PhotoKind
  const file = formData.get('file')
  if (kind !== 'primera_consulta' && kind !== 'evolucion') back('foto_error=tipo')
  if (!(file instanceof File) || file.size === 0) back('foto_error=vacia')
  if ((file as File).size > MAX) back('foto_error=tamano')
  let bytes: Buffer
  try {
    bytes = await sharp(Buffer.from(await (file as File).arrayBuffer())).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
  } catch {
    return back('foto_error=invalida')
  }
  const r = await savePhoto({ patientId, entryId: String(formData.get('entryId') ?? '') || undefined, kind, bytes, mime: 'image/webp', note: String(formData.get('note') ?? '').trim() || undefined, author: u.name })
  if (!r.ok) return back('foto_error=consentimiento')
  await audit('subir_foto', { patientId, entryId: String(formData.get('entryId') ?? '') || undefined, detail: kind, user: u })
  revalidatePath(`/pacientes/${patientId}`)
  back('foto=ok')
}

export async function registerImageConsent(formData: FormData) {
  const u = await requireUser()
  const patientId = String(formData.get('patientId') ?? '')
  await grantImageConsent(patientId)
  await audit('registrar_consentimiento', { patientId, detail: 'imagen clínica', user: u })
  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}#fotos`)
}

export async function logout() {
  await audit('salida')
  ;(await cookies()).delete('gs')
  redirect('/login')
}
