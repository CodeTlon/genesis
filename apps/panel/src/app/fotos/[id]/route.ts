import { audit, currentUser } from '@/lib/auth'
import { photo } from '@/lib/store'

export const dynamic = 'force-dynamic'

// REQ-FOT-003: las fotos no están en /public. Solo se sirven con sesión, descifradas al vuelo y sin caché compartida.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser()
  if (!u) return Response.redirect(new URL('/login', req.url), 307)
  const id = (await params).id
  const f = await photo(id)
  if (!f) return new Response('No encontrada', { status: 404 })
  await audit('ver_foto', { patientId: f.patientId, detail: id, user: u })
  return new Response(new Uint8Array(f.bytes), { headers: { 'Content-Type': f.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
}
