import { currentUser, audit } from '@/panel/lib/auth-server'
import { getPhotoRow } from '@/panel/lib/repo'
import { readStored } from '@/panel/lib/photos'

export const dynamic = 'force-dynamic'

// Foto clínica privada: exige sesión válida, verifica que exista y no esté borrada, no se cachea y deja rastro de auditoría.
const NO_STORE = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }

export async function GET(req: Request, ctx: { params: Promise<{ photoId: string }> }) {
  const user = await currentUser()
  if (!user) return new Response('No autorizado', { status: 401, headers: NO_STORE })
  const { photoId } = await ctx.params
  const row = await getPhotoRow(photoId)
  if (!row) return new Response('No encontrada', { status: 404, headers: NO_STORE })
  const thumb = new URL(req.url).searchParams.get('t') === 'thumb' && row.thumbKey
  let data: Buffer
  try { data = await readStored(thumb ? row.thumbKey! : row.storageKey) } catch { return new Response('No encontrada', { status: 404, headers: NO_STORE }) }
  if (!thumb) await audit(user.id, 'view_photo', 'photo', row.id)
  return new Response(new Uint8Array(data), { headers: { ...NO_STORE, 'Content-Type': 'image/webp', 'Content-Length': String(data.length) } })
}
