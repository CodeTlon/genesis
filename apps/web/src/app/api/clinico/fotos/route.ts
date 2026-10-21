import { revalidatePath } from 'next/cache'
import { currentUser, audit } from '@/panel/lib/auth-server'
import { addPhotoRow } from '@/panel/lib/repo'
import { MAX_PHOTO_BYTES, PhotoError, removeStored, storePhoto } from '@/panel/lib/photos'
import type { PhotoKind } from '@/panel/lib/types'

export const dynamic = 'force-dynamic'

const KINDS: PhotoKind[] = ['inicial', 'evolucion', 'final']
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

// Subida por route handler (no Server Action: el límite de 5 MB de las acciones no alcanza para fotos del celular).
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return json({ ok: false, message: 'Tu sesión venció. Volvé a ingresar.' }, 401)
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > MAX_PHOTO_BYTES + 64 * 1024) return json({ ok: false, message: 'La foto pesa más de 8 MB.' }, 413)

  const form = await req.formData().catch(() => null)
  const file = form?.get('foto')
  const patientId = String(form?.get('patientId') ?? '')
  const caseId = String(form?.get('caseId') ?? '') || undefined
  const kind = String(form?.get('kind') ?? '') as PhotoKind
  const takenAt = String(form?.get('takenAt') ?? '')
  if (!(file instanceof File) || !KINDS.includes(kind)) return json({ ok: false, message: 'Faltan datos de la foto.' }, 400)
  if (takenAt && !/^\d{4}-\d{2}-\d{2}$/.test(takenAt)) return json({ ok: false, message: 'La fecha no es válida.' }, 400)

  let keys: { storageKey: string; thumbKey: string } | null = null
  try {
    keys = await storePhoto(Buffer.from(await file.arrayBuffer()), file.type)
    const r = await addPhotoRow({ patientId, caseId, kind, takenAt: takenAt || undefined, userId: user.id, ...keys })
    if (!r.ok) { await removeStored(keys.storageKey, keys.thumbKey); return json(r, 422) }
    await audit(user.id, 'upload_photo', 'photo', r.id)
    revalidatePath(`/panel/pacientes/${patientId}`)
    return json({ ok: true, id: r.id })
  } catch (e) {
    if (keys) await removeStored(keys.storageKey, keys.thumbKey)
    if (e instanceof PhotoError) return json({ ok: false, message: e.message }, 422)
    console.error('fotos: subida fallida', e)
    return json({ ok: false, message: 'No pudimos guardar la foto. Probá de nuevo.' }, 500)
  }
}
